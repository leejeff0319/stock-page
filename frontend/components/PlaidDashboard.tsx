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
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null); // Add error state

  // Fetch link token
  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/plaid/create_link_token');
        if (!response.ok) throw new Error('Failed to fetch link token');
        const data = await response.json();
        setLinkToken(data.link_token);
        setError(null);
      } catch (err) {
        console.error('Error fetching link token:', err);
        setError('Failed to connect to Plaid. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchLinkToken();
  }, []);

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    if (!accessToken) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/plaid/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken }),
      });
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data.transactions?.slice(0, 5) || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please reconnect your bank.');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const onSuccess = useCallback(async (public_token: string) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/plaid/exchange_public_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_token }),
      });
      if (!response.ok) throw new Error('Failed to exchange token');
      const { access_token } = await response.json();
      setAccessToken(access_token);
      setError(null);
    } catch (err) {
      console.error('Error exchanging token:', err);
      setError('Failed to connect bank account. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const onEvent = useCallback((eventName: string, metadata: any) => {
    console.log('Plaid Event:', eventName, metadata);
    if (eventName === 'ERROR') {
      setError(metadata.error_message || 'Connection error');
    }
  }, []);

  const onExit = useCallback((err: any, metadata: any) => {
    console.log('Plaid Exit:', err, metadata);
    if (err) {
      setError(err.display_message || 'Connection cancelled');
    }
  }, []);

  const config = {
    token: linkToken,
    onSuccess,
    onEvent,
    onExit
  };

  const { open, ready } = usePlaidLink(config);

  return (
    <DashboardCard
      title={transactions.length > 0 ? "Recent Spending" : "Connect Your Bank"}
      subtitle={transactions.length > 0 
        ? `${transactions.length} transactions this month` 
        : "View your transaction history"}
      content={
        <div className="space-y-3">
          {transactions.length > 0 ? (
            <>
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
            </>
          ) : (
            <button
              onClick={() => open()}
              disabled={!ready || !linkToken || loading}
              className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Connect with Plaid'}
            </button>
          )}
          {error && (
            <div className="mt-2 p-2 bg-red-50 text-red-600 text-sm rounded">
              <p>Error: {error}</p>
              {error.includes('credentials') && (
                <p className="mt-1">Sandbox Tip: Use username 'user_good' and password 'pass_good'</p>
              )}
            </div>
          )}
        </div>
      }
    />
  );
};

export default PlaidIntegrationCard;