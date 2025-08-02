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
    try {
      console.log('Making API call with:', { symbol, startDate, endDate, cashAtRisk });
      
      // Use the working endpoint
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
  
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
  
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const error = await response.json();
          console.error('Backtest failed:', error);
          errorMessage = error.detail || error.message || errorMessage;
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }
  
      const data = await response.json();
      console.log('Received backtest data:', data);
      
      // Validate the response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format: expected object');
      }
      
      if (!data.statistics) {
        console.warn('No statistics found in response');
      }
      
      if (!data.performance) {
        console.warn('No performance data found in response');
      }
      
      return data;
    } catch (error) {
      console.error('Error in runBacktest:', error);
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Could not connect to backend server. Make sure it\'s running on port 8000');
      }
      
      throw error;
    }
  };