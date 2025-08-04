'use client';
import { useState, useEffect } from 'react';

interface Transaction {
  id: string;
  date: string;
  name: string;
  amount: number;
  category: string;
  pending: boolean;
}

export default function TransactionsCard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/transactions');
        const data = await response.json();
        setTransactions(data.transactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, []);

  if (loading) {
    return <div className="p-4">Loading transactions...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
      <div className="space-y-3">
        {transactions.slice(0, 5).map((txn) => (
          <div key={txn.id} className="flex justify-between items-center border-b pb-2">
            <div className="flex-1">
              <p className="font-medium">{txn.name}</p>
              <p className="text-sm text-gray-500">
                {new Date(txn.date).toLocaleDateString()} • {txn.category}
                {txn.pending && <span className="ml-2 text-yellow-500">Pending</span>}
              </p>
            </div>
            <p className={`font-medium ${txn.amount < 0 ? 'text-green-600' : 'text-red-600'}`}>
              {txn.amount < 0 ? '+' : ''}{(-txn.amount).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
              })}
            </p>
          </div>
        ))}
      </div>
      {transactions.length > 5 && (
        <button className="mt-3 text-blue-600 text-sm hover:underline">
          View all transactions
        </button>
      )}
    </div>
  );
}