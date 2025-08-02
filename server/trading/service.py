from datetime import datetime
from lumibot.brokers import Alpaca
from lumibot.backtesting import YahooDataBacktesting
from .strategies import MLTrader
import os
from dotenv import load_dotenv
import numpy as np
import json
import pandas as pd

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
        print(f"Starting backtest for {symbol} from {start_date} to {end_date}")
        
        strategy = MLTrader(
            name=f'mlstrat_{symbol}',
            broker=self.broker,
            parameters={"symbol": symbol, "cash_at_risk": cash_at_risk}
        )
        
        # Run backtest and get the results
        backtest = strategy.backtest(
            YahooDataBacktesting,
            datetime.strptime(start_date, "%Y-%m-%d"),
            datetime.strptime(end_date, "%Y-%m-%d"),
            parameters={"symbol": symbol, "cash_at_risk": cash_at_risk}
        )
        
        # Extract proper statistics from the backtest results
        try:
            # Get the portfolio values over time
            portfolio_values = backtest.get_portfolio_values()
            final_value = backtest.get_portfolio_value()
            initial_value = portfolio_values.iloc[0] if len(portfolio_values) > 0 else 0
            
            # Calculate total return
            total_return = (final_value - initial_value) / initial_value if initial_value != 0 else 0
            
            # Get other statistics
            stats = backtest.get_stats()
            
            response = {
                "performance": {
                    "portfolio_value": portfolio_values.to_dict(),
                    "final_value": final_value,
                    "initial_value": initial_value,
                },
                "statistics": {
                    "total_return": total_return,
                    "annual_return": stats.get('Annual Return', 0),
                    "sharpe_ratio": stats.get('Sharpe Ratio', 0),
                    "max_drawdown": stats.get('Max Drawdown', 0),
                    "win_rate": stats.get('Win Rate', None),
                },
                "orders": self._extract_orders(backtest),
                "debug_info": {
                    "stats_available": list(stats.keys()),
                    "backtest_type": str(type(backtest))
                }
            }
            
        except Exception as e:
            print(f"Error processing backtest results: {str(e)}")
            response = {
                "performance": {},
                "statistics": {
                    "total_return": 0,
                    "annual_return": 0,
                    "sharpe_ratio": 0,
                    "max_drawdown": 0,
                    "win_rate": None,
                },
                "orders": [],
                "error": str(e)
            }
        
        self.last_results = response
        return response

    def _extract_orders(self, backtest):
        """Helper method to extract orders from backtest results"""
        try:
            orders = []
            for trade in backtest.get_trades():
                orders.append({
                    "created_at": trade.get_time().strftime("%Y-%m-%d %H:%M:%S"),
                    "side": trade.get_side(),
                    "quantity": trade.get_quantity(),
                    "price": trade.get_price()
                })
            return orders
        except Exception as e:
            print(f"Error extracting orders: {e}")
            return []