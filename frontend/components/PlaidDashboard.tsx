'use client';

import { usePlaidLink } from 'react-plaid-link';
import { useState, useEffect, useCallback } from 'react';
import DashboardCard from './DashboardCard';

interface PlaidIntegrationCardProps {
  asCard?: boolean;
  className?: string;
}

const PlaidIntegrationCard = ({ asCard = false, className }: PlaidIntegrationCardProps) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch link token from your API
  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        const response = await fetch('/api/plaid/create_link_token');
        const data = await response.json();
        setLinkToken(data.link_token);
      } catch (error) {
        console.error('Error fetching link token:', error);
      }
    };
    fetchLinkToken();
  }, []);

  // Fetch transactions after connecting
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/plaid/transactions');
      const data = await response.json();
      setTransactions(data.transactions.slice(0, 5)); // Show only 5 most recent
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSuccess = useCallback(async (public_token: string) => {
    await fetch('/api/plaid/exchange_public_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ public_token }),
    });
    await fetchTransactions();
  }, []);

  const config = {
    token: linkToken,
    onSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  if (transactions.length > 0) {
    return (
      <DashboardCard
        title="Recent Spending"
        subtitle={`${transactions.length} transactions this month`}
        content={
          <div className="space-y-3">
            {transactions.map((txn) => (
              <div key={txn.transaction_id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{txn.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(txn.date).toLocaleDateString()}
                  </p>
                </div>
                <p className={`text-sm ${txn.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${Math.abs(txn.amount).toFixed(2)}
                </p>
              </div>
            ))}
            <button 
              onClick={fetchTransactions}
              disabled={loading}
              className="text-xs text-blue-500 hover:text-blue-700 mt-2 disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh transactions'}
            </button>
          </div>
        }
      />
    );
  }

  return (
    <DashboardCard
      title="Connect Your Bank"
      subtitle="View your transaction history"
      content={
        <button
          onClick={() => open()}
          disabled={!ready}
          className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50"
        >
          Connect with Plaid
        </button>
      }
    />
  );
};

export default PlaidIntegrationCard;