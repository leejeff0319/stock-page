import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from mlPipeline import MLPipeline
from trading.service import TradingService

class Fruit(BaseModel):
    name: str

class Fruits(BaseModel):
    fruits: List[Fruit]

class TrainRequest(BaseModel):
    target_column: str
    test_size: float = 0.2
    random_state: int = 42

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