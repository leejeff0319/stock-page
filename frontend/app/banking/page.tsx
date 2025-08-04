'use client';

import PlaidLink from '@/components/PlaidLink';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PortfolioPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  // Calculate net worth from accounts
  const netWorth = accounts.reduce((total, account) => {
    return total + (account.balances.current || 0);
  }, 0);

  // This would be called after successful Plaid connection
  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/plaid/transactions');
      const data = await response.json();
      setTransactions(data.transactions.slice(0, 5)); // Show 5 most recent
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/auth/check", {
          credentials: 'include'
        });
        if (!res.ok) {
          // Redirect to login if not authenticated
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Financial Portfolio</h1>
          <p className="text-gray-600">Track your connected accounts</p>
        </div>

        {/* Net Worth Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Net Worth</h2>
          <p className="text-3xl font-bold">
            ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="mt-4">
            <PlaidLink 
              user={{ id: 'current-user-id' }} 
              variant="primary" 
              className="w-full md:w-auto"
            />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Recent Transactions</h2>
            {transactions.length > 0 && (
              <button 
                onClick={fetchTransactions}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                Refresh
              </button>
            )}
          </div>

          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((txn) => (
                <div key={txn.transaction_id} className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium">{txn.name || 'Unknown Transaction'}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(txn.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className={`font-medium ${txn.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {txn.amount > 0 ? '+' : ''}${Math.abs(txn.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No transactions yet. Connect your bank account to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}