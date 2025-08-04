import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import {
  PlaidLinkOptions,
  usePlaidLink,
  PlaidLinkOnSuccess,
} from "react-plaid-link";
import { Button } from "@/components/Button";

interface PlaidLinkProps {
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  variant?: "primary" | "ghost" | "default";
  className?: string;
}

interface TokenResponse {
  link_token: string;
}

interface ExchangeResponse {
  access_token: string;
}

const PlaidLink = ({ user, variant = "primary" }: PlaidLinkProps) => {
  const router = useRouter();
  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLinkToken = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8000/api/plaid/create_link_token",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.id }),
        }
      );

      if (!response.ok) throw new Error("Failed to create link token");

      const data: TokenResponse = await response.json();
      setToken(data.link_token);
      setError(null);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to connect to Plaid. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    if (!token) getLinkToken();
  }, [token, getLinkToken]);

  const onSuccess = useCallback<PlaidLinkOnSuccess>(
    async (public_token, metadata) => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Exchange public token
        const exchangeResponse = await fetch("http://localhost:8000/api/plaid/exchange_public_token", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ 
            public_token,
            institution_id: metadata.institution?.institution_id,
            user_id: user.id
          }),
          credentials: 'include'  // Important for cookies
        });

        if (!exchangeResponse.ok) {
          throw new Error("Failed to exchange token");
        }

        const { access_token, item_id } = await exchangeResponse.json();
        
        // 2. Store access token
        const storeResponse = await fetch("http://localhost:8000/api/plaid/store_access_token", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            user_id: user.id,
            access_token,
            item_id,
            institution_id: metadata.institution?.institution_id,
          }),
          credentials: 'include'  // Important for cookies
        });

        if (!storeResponse.ok) {
          throw new Error("Failed to store access token");
        }

        // 3. Verify authentication before redirect
        const authCheck = await fetch("http://localhost:8000/api/auth/check", {
          credentials: 'include'
        });
        
        if (authCheck.ok) {
          router.push("/dashboard");
        } else {
          throw new Error("Authentication failed after connection");
        }
      } catch (err) {
        console.error("Bank connection failed:", err);
        setError(
          err instanceof Error ? 
          err.message : 
          "Failed to complete bank connection"
        );
      } finally {
        setLoading(false);
      }
    },
    [user.id, router]
);
  const config: PlaidLinkOptions = {
    token,
    onSuccess,
    onExit: (err, metadata) => {
      console.log("Plaid Link exit:", err, metadata);
      if (err) setError("Connection cancelled or failed");
    },
    onEvent: (eventName, metadata) => {
      if (process.env.NODE_ENV === "development") {
        console.log("Plaid Link event:", eventName, metadata);
      }
    },
  };

  const { open, ready } = usePlaidLink(config);

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={() => open()}
        disabled={!ready || loading}
        variant={variant}
        className={
          variant === "primary"
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : undefined
        }
      >
        {loading ? "Loading..." : "Connect Bank"}
      </Button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default PlaidLink;
