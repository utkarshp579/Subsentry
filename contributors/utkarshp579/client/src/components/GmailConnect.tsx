"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useGmailStatus } from "../lib/useGmailStatus";

interface GmailConnectProps {
  gmailParam?: string | null;
}

const GmailConnect = ({ gmailParam }: GmailConnectProps) => {
  const { getToken } = useAuth();
  const { status, loading, refetch } = useGmailStatus();
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleConnect = async () => {
    setConnecting(true);

    try {
      const token = await getToken();

      const res = await fetch(`${apiUrl}/api/gmail/connect`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to start Gmail connection");
      }

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Failed to connect Gmail:", err);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);

    try {
      const token = await getToken();

      const res = await fetch(`${apiUrl}/api/gmail/disconnect`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to disconnect Gmail");
      }

      await refetch();
    } catch (err) {
      console.error("Failed to disconnect Gmail:", err);
    } finally {
      setDisconnecting(false);
    }
  };

  const getMessage = () => {
    switch (gmailParam) {
      case "success":
        return { type: "success", text: "Gmail connected successfully!" };
      case "denied":
        return {
          type: "error",
          text: "Permission denied. Please allow access to connect Gmail.",
        };
      case "invalid_state":
        return { type: "error", text: "Invalid request. Please try again." };
      case "token_error":
        return {
          type: "error",
          text: "Failed to authenticate. Please try again.",
        };
      case "callback_failed":
        return { type: "error", text: "Connection failed. Please try again." };
      default:
        return null;
    }
  };

  const message = getMessage();

  if (loading) {
    return (
      <div className="p-6 bg-zinc-900 rounded-lg border border-zinc-800">
        <div className="animate-pulse">
          <div className="h-4 bg-zinc-700 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-zinc-700 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-zinc-900 rounded-lg border border-zinc-800">
      <h3 className="text-lg font-semibold text-white mb-4">
        Gmail Connection
      </h3>

      {message && (
        <div
          className={`mb-4 p-3 rounded-md ${
            message.type === "success"
              ? "bg-green-900/50 text-green-300 border border-green-700"
              : "bg-red-900/50 text-red-300 border border-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {status?.connected ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-zinc-300">Connected to</span>
            <span className="text-white font-medium">{status.email}</span>
          </div>

          {status.connectedOn && (
            <p className="text-sm text-zinc-500">
              Connected on {new Date(status.connectedOn).toLocaleDateString()}
            </p>
          )}

          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="px-4 py-2 text-sm font-medium text-red-400 border border-red-600 rounded-md hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {disconnecting ? "Disconnecting..." : "Disconnect Gmail"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-zinc-400">
            Connect your Gmail account to automatically detect subscriptions
            from your emails.
          </p>

          <p className="text-sm text-zinc-500">
            We only request read-only access. We cannot send, delete, or modify
            your emails.
          </p>

          <button
            onClick={handleConnect}
            disabled={connecting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {connecting ? "Connecting..." : "Connect Gmail"}
          </button>
        </div>
      )}
    </div>
  );
};

export default GmailConnect;
