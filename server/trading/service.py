from datetime import datetime
from lumibot.brokers import Alpaca
from lumibot.backtesting import YahooDataBacktesting
from .strategies import MLTrader
import os
from dotenv import load_dotenv

load_dotenv()

class TradingService:
    def __init__(self):
        self.broker = Alpaca({
            "API_KEY": os.getenv("API_KEY"),
            "API_SECRET": os.getenv("API_SECRET"),
            "PAPER": True
        })
        self.last_results = None
        
    def run_backtest(self, symbol, start_date, end_date, cash_at_risk=0.5):
        strategy = MLTrader(
            name=f'mlstrat_{symbol}',
            broker=self.broker,
            parameters={"symbol": symbol, "cash_at_risk": cash_at_risk}
        )
        
        # Run backtest
        results = strategy.backtest(
            YahooDataBacktesting,
            datetime.strptime(start_date, "%Y-%m-%d"),
            datetime.strptime(end_date, "%Y-%m-%d"),
            parameters={"symbol": symbol, "cash_at_risk": cash_at_risk}
        )
        
        # Store raw results for debugging
        self.last_results = {
            "raw_results": str(dir(results)),  # Show available attributes
            "portfolio_value": str(results.portfolio_value)[:100] + "...",
            "statistics": {
                "total_return": getattr(results, 'total_return', 0),
                "annual_return": getattr(results, 'annual_return', 0),
                "sharpe_ratio": getattr(results, 'sharpe_ratio', 0),
                "max_drawdown": getattr(results, 'max_drawdown', 0),
            },
            "orders": results.order_list if hasattr(results, 'order_list') else []
        }
        
        # SAFELY extract results without any method assumptions
        response = {
            "performance": {},
            "statistics": {},
            "orders": []
        }
        
        # Handle portfolio value
        if hasattr(results, 'portfolio_value'):
            response["performance"]["portfolio_value"] = dict(results.portfolio_value)
        
        # Handle statistics - access attributes directly
        response["statistics"]["total_return"] = getattr(results, 'total_return', 0)
        response["statistics"]["annual_return"] = getattr(results, 'annual_return', 0)
        response["statistics"]["sharpe_ratio"] = getattr(results, 'sharpe_ratio', 0)
        response["statistics"]["max_drawdown"] = getattr(results, 'max_drawdown', 0)
        response["statistics"]["win_rate"] = getattr(results, 'win_rate', None)
        
        # Handle orders
        if hasattr(results, 'order_list'):
            response["orders"] = list(results.order_list)
        elif hasattr(results, 'orders'):
            response["orders"] = list(results.orders)
            
        return response