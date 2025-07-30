'use client';

import { useState } from 'react';
import { runBacktest } from '../../components/BacktestService';
import { format } from 'date-fns';

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

export default function BacktestPage() {
    const [formData, setFormData] = useState({
      symbol: 'SPY',
      startDate: new Date('2020-01-01'),
      endDate: new Date('2023-12-31'),
      cashAtRisk: 0.5,
    });
    const [results, setResults] = useState<BacktestResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);
  
      try {
        const data = await runBacktest(
          formData.symbol,
          format(formData.startDate, 'yyyy-MM-dd'),
          format(formData.endDate, 'yyyy-MM-dd'),
          formData.cashAtRisk
        );
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to run backtest');
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Trading Strategy Backtest</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div>
            <label htmlFor="symbol" className="block mb-2 font-medium">
              Symbol
            </label>
            <select
              id="symbol"
              value={formData.symbol}
              onChange={(e) => setFormData({...formData, symbol: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="SPY">SPY</option>
              <option value="QQQ">QQQ</option>
              <option value="AAPL">AAPL</option>
              <option value="MSFT">MSFT</option>
            </select>
          </div>
  
          <div>
            <label htmlFor="startDate" className="block mb-2 font-medium">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={format(formData.startDate, 'yyyy-MM-dd')}
              onChange={(e) => {
                const date = e.target.valueAsDate;
                if (date) setFormData({...formData, startDate: date});
              }}
              max={format(formData.endDate, 'yyyy-MM-dd')}
              className="w-full p-2 border rounded"
            />
          </div>
  
          <div>
            <label htmlFor="endDate" className="block mb-2 font-medium">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={format(formData.endDate, 'yyyy-MM-dd')}
              onChange={(e) => {
                const date = e.target.valueAsDate;
                if (date) setFormData({...formData, endDate: date});
              }}
              min={format(formData.startDate, 'yyyy-MM-dd')}
              className="w-full p-2 border rounded"
            />
          </div>
  
          <div>
            <label htmlFor="cashAtRisk" className="block mb-2 font-medium">
              Cash at Risk (0.1 to 1.0)
            </label>
            <input
              type="number"
              id="cashAtRisk"
              min="0.1"
              max="1.0"
              step="0.1"
              value={formData.cashAtRisk}
              onChange={(e) => setFormData({...formData, cashAtRisk: parseFloat(e.target.value)})}
              className="w-full p-2 border rounded"
            />
          </div>
  
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Running Backtest...' : 'Run Backtest'}
          </button>
        </form>
  
        {error && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 rounded">
            Error: {error}
          </div>
        )}
  
        {isLoading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
  
        {results && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Backtest Results</h2>
            
            <div className="mb-6">
              <h3 className="font-bold mb-2">Performance Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-100 rounded">
                  <p className="text-sm text-gray-600">Total Return</p>
                  <p className="font-bold">{(results.statistics.total_return * 100).toFixed(2)}%</p>
                </div>
                <div className="p-3 bg-gray-100 rounded">
                  <p className="text-sm text-gray-600">Annual Return</p>
                  <p className="font-bold">{(results.statistics.annual_return * 100).toFixed(2)}%</p>
                </div>
                <div className="p-3 bg-gray-100 rounded">
                  <p className="text-sm text-gray-600">Sharpe Ratio</p>
                  <p className="font-bold">{results.statistics.sharpe_ratio.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-gray-100 rounded">
                  <p className="text-sm text-gray-600">Max Drawdown</p>
                  <p className="font-bold">{(results.statistics.max_drawdown * 100).toFixed(2)}%</p>
                </div>
              </div>
            </div>
  
            {results.orders && (
              <div>
                <h3 className="font-bold mb-2">Recent Orders</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-4 border">Date</th>
                        <th className="py-2 px-4 border">Side</th>
                        <th className="py-2 px-4 border text-right">Quantity</th>
                        <th className="py-2 px-4 border text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.orders.slice(0, 5).map((order, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-4 border">{order.side}</td>
                          <td className="py-2 px-4 border text-right">{order.quantity}</td>
                          <td className="py-2 px-4 border text-right">
                            {order.price?.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }