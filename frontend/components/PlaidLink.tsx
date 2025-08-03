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
  children?: React.ReactNode;
  className?: string;
}

const PlaidLink = ({ user, variant = "primary" }: PlaidLinkProps) => {
  const router = useRouter();
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const getLinkToken = async () => {
      try {
        const response = await fetch('/api/plaid/create_link_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: user.id }), // Make sure user.id exists
        });
        
        if (!response.ok) {
          throw new Error('Failed to create link token');
        }
        
        const data = await response.json();
        setToken(data.link_token);
      } catch (error) {
        console.error('Error:', error);
      }
    };
  
    getLinkToken();
  }, [user.id]);

  const onSuccess = useCallback<PlaidLinkOnSuccess>(
    async (public_token: string) => {
      try {
        const response = await fetch("/api/plaid/exchange_public_token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ public_token }),
        });

        if (!response.ok) {
          throw new Error("Failed to exchange public token");
        }

        // You might want to store the access token in your database here
        const { access_token } = await response.json();

        // Optionally: Send access_token to your backend to associate with user
        await fetch("/api/plaid/store_access_token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            access_token,
          }),
        });

        router.push("/dashboard");
      } catch (error) {
        console.error("Error exchanging public token:", error);
      }
    },
    [user.id, router]
  );

  const config: PlaidLinkOptions = {
    token,
    onSuccess,
    // Optional: Add other Plaid Link configuration options
    onExit: (err, metadata) => {
      console.log("Plaid Link exit:", err, metadata);
    },
    onEvent: (eventName, metadata) => {
      console.log("Plaid Link event:", eventName, metadata);
    },
  };

  const { open, ready } = usePlaidLink(config);

  return (
    <>
      {variant === "primary" ? (
        <Button
          onClick={() => open()}
          disabled={!ready}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Connect Bank
        </Button>
      ) : variant === "ghost" ? (
        <Button onClick={() => open()} disabled={!ready} variant="ghost">
          Connect Bank
        </Button>
      ) : (
        <Button onClick={() => open()} disabled={!ready} variant="default">
          Connect Bank
        </Button>
      )}
    </>
  );
};

export default PlaidLink;
