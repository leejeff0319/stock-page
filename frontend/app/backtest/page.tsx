"use client";

import { useState } from "react";
import { runBacktest } from "../../components/BacktestService";
import { format } from "date-fns";

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
    symbol: "SPY",
    startDate: new Date("2020-01-01"),
    endDate: new Date("2023-12-31"),
    cashAtRisk: 0.5,
  });
  const [results, setResults] = useState<BacktestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults(null); // Clear previous results

    try {
      console.log('Submitting backtest with:', formData);
      const data = await runBacktest(
        formData.symbol,
        format(formData.startDate, "yyyy-MM-dd"),
        format(formData.endDate, "yyyy-MM-dd"),
        formData.cashAtRisk
      );
      console.log('Received results:', data);
      setResults(data);
    } catch (err) {
      console.error('Backtest error:', err);
      setError(err instanceof Error ? err.message : "Failed to run backtest");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPercentage = (value: number | undefined): string => {
    return value !== undefined ? `${(value * 100).toFixed(2)}%` : "N/A";
  };

  const formatNumber = (value: number | undefined): string => {
    return value !== undefined ? value.toFixed(4) : "N/A";
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Trading Strategy Backtest</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label htmlFor="symbol" className="block mb-2 font-medium">
            Symbol
          </label>
          <select
            id="symbol"
            value={formData.symbol}
            onChange={(e) =>
              setFormData({ ...formData, symbol: e.target.value })
            }
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
            value={format(formData.startDate, "yyyy-MM-dd")}
            onChange={(e) => {
              const date = e.target.valueAsDate;
              if (date) setFormData({ ...formData, startDate: date });
            }}
            max={format(formData.endDate, "yyyy-MM-dd")}
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
            value={format(formData.endDate, "yyyy-MM-dd")}
            onChange={(e) => {
              const date = e.target.valueAsDate;
              if (date) setFormData({ ...formData, endDate: date });
            }}
            min={format(formData.startDate, "yyyy-MM-dd")}
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
            onChange={(e) =>
              setFormData({
                ...formData,
                cashAtRisk: parseFloat(e.target.value),
              })
            }
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Running Backtest..." : "Run Backtest"}
        </button>
      </form>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded">
          <strong>Error:</strong> {error}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-gray-100 rounded">
                <p className="text-sm text-gray-600">Total Return</p>
                <p className="font-bold">
                  {formatPercentage(results.statistics?.total_return)}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded">
                <p className="text-sm text-gray-600">Annual Return</p>
                <p className="font-bold">
                  {formatPercentage(results.statistics?.annual_return)}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded">
                <p className="text-sm text-gray-600">Sharpe Ratio</p>
                <p className="font-bold">
                  {formatNumber(results.statistics?.sharpe_ratio)}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded">
                <p className="text-sm text-gray-600">Max Drawdown</p>
                <p className="font-bold">
                  {formatPercentage(results.statistics?.max_drawdown)}
                </p>
              </div>
            </div>
          </div>

          {results.orders && results.orders.length > 0 ? (
            <div className="mb-6">
              <h3 className="font-bold mb-2">Recent Orders (Last 10)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-2 px-4 border text-left">Date</th>
                      <th className="py-2 px-4 border text-left">Side</th>
                      <th className="py-2 px-4 border text-right">Quantity</th>
                      <th className="py-2 px-4 border text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.orders.slice(0, 10).map((order, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-4 border">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            order.side === 'buy' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {order.side.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2 px-4 border text-right">
                          {order.quantity}
                        </td>
                        <td className="py-2 px-4 border text-right">
                          ${order.price?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <h3 className="font-bold mb-2">Orders</h3>
              <p className="text-gray-500">
                No orders were executed during this backtest period
              </p>
            </div>
          )}

          {/* Debug section */}
          <div className="mt-8 p-4 bg-gray-100 rounded">
            <h3 className="font-bold mb-2">Raw Data (Debug)</h3>
            <pre className="text-xs overflow-auto max-h-60 bg-white p-2 rounded">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}