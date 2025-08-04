'use client';
import { useState, useEffect } from 'react';

interface Account {
  name: string;
  balance: number;
}

interface NetWorthData {
  accounts: Account[];
  total_assets: number;
  total_debts: number;
  net_worth: number;
  currency: string;
  last_updated: string;
}

export default function NetWorthCard() {
  const [data, setData] = useState<NetWorthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNetWorth = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/net-worth');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching net worth:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNetWorth();
  }, []);

  if (loading) {
    return <div className="p-4">Loading net worth...</div>;
  }

  if (!data) {
    return <div className="p-4">Failed to load net worth data</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Net Worth</h2>
      
      <div className="mb-4">
        <p className="text-2xl font-bold">
          {data.net_worth.toLocaleString('en-US', {
            style: 'currency',
            currency: data.currency
          })}
        </p>
        <p className="text-sm text-gray-500">Last updated: {data.last_updated}</p>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span>Assets</span>
          <span className="font-medium">
            {data.total_assets.toLocaleString('en-US', {
              style: 'currency',
              currency: data.currency
            })}
          </span>
        </div>
        
        <div className="flex justify-between text-red-600">
          <span>Debts</span>
          <span className="font-medium">
            {data.total_debts.toLocaleString('en-US', {
              style: 'currency',
              currency: data.currency
            })}
          </span>
        </div>
        
        <div className="pt-3 border-t">
          {data.accounts.map((account) => (
            <div key={account.name} className="flex justify-between py-1">
              <span>{account.name}</span>
              <span>
                {account.balance.toLocaleString('en-US', {
                  style: 'currency',
                  currency: data.currency
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}