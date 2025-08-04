import json
import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from mlPipeline import MLPipeline
from trading.service import TradingService
from plaid.api import plaid_api
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.transactions_get_request import TransactionsGetRequest
import os
import plaid
from plaid.exceptions import ApiException
from plaid.model.country_code import CountryCode 
from plaid.model.products import Products  
from fastapi.encoders import jsonable_encoder
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
import secrets

security = HTTPBearer()

# Plaid configuration
configuration = plaid.Configuration(
    host=plaid.Environment.Sandbox,
    api_key={
        'clientId': os.getenv('PLAID_CLIENT_ID'),
        'secret': os.getenv('PLAID_SECRET'),
    }
)

api_client = plaid.ApiClient(configuration)
client = plaid_api.PlaidApi(api_client)

class StoreAccessTokenRequest(BaseModel):
    user_id: str
    access_token: str
    item_id: str
    institution_id: str

app = FastAPI(title="Trading API", version="1.0.0")
trading_service = TradingService()
ml_pipeline = MLPipeline()

origins = [
    "http://localhost:3000",
    "http://localhost:8000", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trading Models
class BacktestRequest(BaseModel):
    symbol: str = "SPY"
    start_date: str
    end_date: str
    cash_at_risk: float = 0.5

class BacktestResult(BaseModel):
    performance: dict
    statistics: dict
    orders: Optional[List[dict]] = None

class TrainRequest(BaseModel):
    target_column: str
    test_size: float = 0.2
    random_state: int = 42

class LinkTokenRequest(BaseModel):
    user_id: str

@app.post("/api/trading/backtest")
async def backtest(request: BacktestRequest):
    """Main backtest endpoint"""
    try:
        print(f"Received backtest request: {request}")
        results = trading_service.run_backtest(
            request.symbol,
            request.start_date,
            request.end_date,
            request.cash_at_risk
        )
        print("Sending to frontend:", results)
        return results
    except Exception as e:
        print(f"Backtest error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/trading/debug_backtest")
async def debug_backtest(request: BacktestRequest):
    """Debug backtest endpoint with extra logging"""
    try:
        print(f"DEBUG: Received backtest request: {request}")
        results = trading_service.run_backtest(
            request.symbol,
            request.start_date,
            request.end_date,
            request.cash_at_risk
        )
        print("DEBUG: Sending to frontend:", results)
        return results
    except Exception as e:
        print(f"DEBUG: Backtest error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/api/trading/debug_last_result")
async def debug_last_result():
    """Get the last backtest result for debugging"""
    try:
        if hasattr(trading_service, 'last_results'):
            return trading_service.last_results
        return {"error": "No results available"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Trading API is running"}


# Plaid Implementation 

def create_session_token(user_id: str):
    return f"session_{secrets.token_hex(16)}_{user_id}"

@app.post("/api/plaid/create_link_token")
async def create_link_token(request: LinkTokenRequest):
    try:
        # Create properly typed lists
        country_codes = [CountryCode('US')]
        products = [Products('transactions')]  # Using Products enum
        
        link_request = LinkTokenCreateRequest(
            user=LinkTokenCreateRequestUser(client_user_id=request.user_id),
            client_name="Stock Trading App",
            products=products,  # Now using proper enum values
            country_codes=country_codes,
            language="en"
        )
        response = client.link_token_create(link_request)
        return {"link_token": response.link_token}
    except ApiException as e:
        body = e.body if hasattr(e, 'body') else str(e)
        print(f"Plaid API error: {body}")
        raise HTTPException(status_code=400, detail=body)
    except Exception as e:
        print(f"Error creating link token: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/plaid/exchange_public_token")
async def exchange_public_token(request: Request):
    try:
        # Get raw request body to debug
        body_bytes = await request.body()
        print("Raw request body:", body_bytes.decode())
        
        data = await request.json()
        print("Parsed JSON data:", data)
        
        if 'public_token' not in data:
            raise HTTPException(
                status_code=422,
                detail=jsonable_encoder({"error": "public_token is required"})
            )
        
        # Exchange token
        exchange_request = ItemPublicTokenExchangeRequest(
            public_token=data['public_token']
        )
        response = client.item_public_token_exchange(exchange_request)
        
        return {
            "access_token": response.access_token,
            "item_id": response.item_id
        }
        
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail=jsonable_encoder({"error": "Invalid JSON format"})
        )
    except ApiException as e:
        print("Plaid API Error:", e.body)
        raise HTTPException(
            status_code=400,
            detail=jsonable_encoder({"error": "Plaid API error", "details": e.body})
        )
    except Exception as e:
        print("Unexpected Error:", str(e))
        raise HTTPException(
            status_code=500,
            detail=jsonable_encoder({"error": "Internal server error"})
        )

@app.post("/api/plaid/transactions")
async def get_transactions(access_token: str):
    try:
        start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        end_date = datetime.now().strftime('%Y-%m-%d')
        
        request = TransactionsGetRequest(
            access_token=access_token,
            start_date=start_date,
            end_date=end_date
        )
        response = client.transactions_get(request)
        return response.to_dict()
    except ApiException as e:
        raise HTTPException(status_code=400, detail=e.body)
    
@app.post("/api/plaid/store_access_token")
async def store_access_token(
    request: StoreAccessTokenRequest,
    response: Response
):
    try:
        # Store the access token (in a real app, save to database)
        print(f"Storing access token for user: {request.user_id}")
        
        # Create and set session cookie
        session_token = create_session_token(request.user_id)
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            max_age=3600,  # 1 hour expiration
            secure=False,  # Set to True in production with HTTPS
            samesite="lax"
        )
        
        return {
            "status": "success",
            "message": "Access token stored",
            "user_id": request.user_id
        }
        
    except Exception as e:
        print(f"Error storing access token: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to store access token"}
        )

@app.get("/api/auth/check")
async def check_auth():
    return {"status": "authenticated"}


@app.post("/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):
    return await ml_pipeline.upload_dataset(file)

@app.post("/train-model")
async def train_model(request: TrainRequest):
    return await ml_pipeline.train_model(
        target_column=request.target_column,
        test_size=request.test_size,
        random_state=request.random_state
    )

@app.get("/download-model")
async def download_model():
    return await ml_pipeline.download_model()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)