interface BacktestRequest {
    symbol: string;
    start_date: string;
    end_date: string;
    cash_at_risk: number;
}

interface BacktestResult {
    performance: {
      portfolio_value: Record<string, number>;
    };
    statistics: {
      total_return: number;
      annual_return: number;
      sharpe_ratio: number;
      max_drawdown: number;
      win_rate?: number;
    };
    orders?: Array<{
      created_at: string;
      side: string;
      quantity: number;
      price: number;
    }>;
  }
  
  export const runBacktest = async (
    symbol: string,
    startDate: string,
    endDate: string,
    cashAtRisk: number
  ): Promise<BacktestResult> => {
    const response = await fetch('http://localhost:8000/api/trading/backtest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol,
        start_date: startDate,
        end_date: endDate,
        cash_at_risk: cashAtRisk,
      }),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Backtest failed');
    }
  
    return await response.json();
  };