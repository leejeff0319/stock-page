import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from trading.service import TradingService

app = FastAPI()
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

@app.post("/api/trading/backtest", response_model=BacktestResult)
async def run_backtest(request: BacktestRequest):
    try:
        return trading_service.run_backtest(
            request.symbol,
            request.start_date,
            request.end_date,
            request.cash_at_risk
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/api/trading/debug_last_result")
async def debug_last_result():
    try:
        if hasattr(trading_service, 'last_results'):
            return trading_service.last_results
        return {"error": "No results available"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)