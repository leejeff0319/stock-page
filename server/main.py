import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from trading.service import TradingService
from plaid_client import client
from pydantic import BaseModel

app = FastAPI(title="Trading API", version="1.0.0")
trading_service = TradingService()

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
class LinkTokenRequest(BaseModel):
    user_id: str  # Optional, if you need user-specific tokens

# Plaid Endpoints
@app.post("/api/plaid/create_link_token")
async def create_link_token(request: LinkTokenRequest):
    try:
        response = client.link_token_create(
            LinkTokenCreateRequest(
                user=LinkTokenCreateRequestUser(client_user_id=request.user_id),
                client_name="Your App",
                products=["transactions"],
                country_codes=["US"],
                language="en",
            )
        )
        return {"link_token": response.link_token}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/plaid/exchange_public_token")
async def exchange_public_token(public_token: str):
    try:
        response = client.item_public_token_exchange(
            ItemPublicTokenExchangeRequest(public_token=public_token)
        )
        return {"access_token": response.access_token}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/plaid/transactions")
async def get_transactions(access_token: str):
    try:
        response = client.transactions_get(
            TransactionsGetRequest(
                access_token=access_token,
                start_date="2020-01-01",  # Adjust as needed
                end_date="2025-12-31",
            )
        )
        return response.to_dict()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)