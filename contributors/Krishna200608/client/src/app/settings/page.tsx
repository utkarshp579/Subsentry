'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type GmailStatus = {
  connected: boolean;
  email?: string;
  connectedAt?: string;
  message?: string;
};

type EmailPreview = {
  messageId: string;
  subject?: string;
  sender?: string;
  timestamp?: string;
  snippet?: string;
};

export default function SettingsPage() {
  const { getToken } = useAuth();
  const [gmailBanner, setGmailBanner] = useState<string | null>(null);
  const [status, setStatus] = useState<GmailStatus | null>(null);
  const [emails, setEmails] = useState<EmailPreview[]>([]);
  const [parsedCount, setParsedCount] = useState<number | null>(null);
  const [saveResult, setSaveResult] = useState<{
    saved: number;
    skipped: number;
    errors: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const state = params.get('gmail');
    if (state === 'success') {
      setGmailBanner('Gmail connected successfully.');
    } else if (state === 'denied') {
      setGmailBanner('Gmail access was denied.');
    } else if (state === 'error') {
      setGmailBanner('Gmail connection failed. Try again.');
    } else {
      setGmailBanner(null);
    }
  }, []);

  const fetchStatus = async () => {
    setError(null);
    setBusy('status');
    try {
      const token = await getToken?.();
      if (!token) {
        setStatus(null);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/gmail/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to fetch Gmail status');
      }

      setStatus({
        connected: Boolean(data.connected),
        email: data.email,
        connectedAt: data.connectedAt,
        message: data.message,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch Gmail status'
      );
    } finally {
      setBusy(null);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [getToken]);

  const connectGmail = async () => {
    setError(null);
    setBusy('connect');
    try {
      const token = await getToken?.();
      if (!token) {
        throw new Error('Sign in to connect Gmail.');
      }

      const res = await fetch(`${API_BASE_URL}/api/gmail/auth`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok || !data?.authUrl) {
        throw new Error(data?.error || 'Failed to start OAuth flow');
      }

      window.location.href = data.authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect Gmail');
    } finally {
      setBusy(null);
    }
  };

  const disconnectGmail = async () => {
    setError(null);
    setBusy('disconnect');
    try {
      const token = await getToken?.();
      if (!token) {
        throw new Error('Sign in to disconnect Gmail.');
      }

      const res = await fetch(`${API_BASE_URL}/api/gmail/disconnect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to disconnect Gmail');
      }

      setStatus({ connected: false });
      setEmails([]);
      setParsedCount(null);
      setSaveResult(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to disconnect Gmail'
      );
    } finally {
      setBusy(null);
    }
  };

  const fetchEmails = async () => {
    setError(null);
    setBusy('fetch');
    try {
      const token = await getToken?.();
      if (!token) {
        throw new Error('Sign in to fetch emails.');
      }

      const res = await fetch(`${API_BASE_URL}/api/gmail/emails?limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to fetch emails');
      }

      setEmails(Array.isArray(data.emails) ? data.emails : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch emails');
    } finally {
      setBusy(null);
    }
  };

  const parseEmails = async () => {
    setError(null);
    setBusy('parse');
    try {
      const token = await getToken?.();
      if (!token) {
        throw new Error('Sign in to parse emails.');
      }

      const res = await fetch(`${API_BASE_URL}/api/gmail/parse?limit=50`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to parse emails');
      }

      setParsedCount(Array.isArray(data.parsed) ? data.parsed.length : 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse emails');
    } finally {
      setBusy(null);
    }
  };

  const saveSubscriptions = async () => {
    setError(null);
    setBusy('save');
    try {
      const token = await getToken?.();
      if (!token) {
        throw new Error('Sign in to save subscriptions.');
      }

      const res = await fetch(`${API_BASE_URL}/api/gmail/save?limit=50`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to save subscriptions');
      }

      setSaveResult({
        saved: data.saved ?? 0,
        skipped: data.skipped ?? 0,
        errors: data.errors ?? 0,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save subscriptions'
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <DashboardLayout title="Settings" subtitle="Gmail ingestion controls">
      <div className="space-y-6">
        {gmailBanner && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {gmailBanner}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-[#0b0f14] p-5">
          <h2 className="text-lg font-semibold text-white">Gmail Connection</h2>
          <p className="text-sm text-gray-400 mt-1">
            Connect your Gmail (read-only) to auto-detect subscriptions.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold disabled:opacity-60"
              onClick={connectGmail}
              disabled={busy === 'connect'}
            >
              {busy === 'connect' ? 'Connecting...' : 'Connect Gmail'}
            </button>

            <button
              className="px-4 py-2 rounded-lg border border-white/20 text-white text-sm disabled:opacity-50"
              onClick={disconnectGmail}
              disabled={busy === 'disconnect' || !status?.connected}
            >
              {busy === 'disconnect' ? 'Disconnecting...' : 'Disconnect'}
            </button>

            <button
              className="px-4 py-2 rounded-lg border border-white/20 text-white text-sm disabled:opacity-50"
              onClick={fetchStatus}
              disabled={busy === 'status'}
            >
              {busy === 'status' ? 'Refreshing...' : 'Refresh Status'}
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-300">
            Status:{' '}
            <span className="font-semibold">
              {status?.connected ? 'Connected' : 'Not connected'}
            </span>
            {status?.email && (
              <span className="text-gray-400"> · {status.email}</span>
            )}
            {status?.message && (
              <span className="text-gray-400"> · {status.message}</span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0b0f14] p-5">
          <h2 className="text-lg font-semibold text-white">
            Email Ingestion
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Fetch, parse, and save subscription candidates from Gmail.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              className="px-4 py-2 rounded-lg border border-white/20 text-white text-sm disabled:opacity-50"
              onClick={fetchEmails}
              disabled={busy === 'fetch' || !status?.connected}
            >
              {busy === 'fetch' ? 'Fetching...' : 'Fetch Emails'}
            </button>
            <button
              className="px-4 py-2 rounded-lg border border-white/20 text-white text-sm disabled:opacity-50"
              onClick={parseEmails}
              disabled={busy === 'parse' || !status?.connected}
            >
              {busy === 'parse' ? 'Parsing...' : 'Parse Emails'}
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-emerald-500 text-black text-sm font-semibold disabled:opacity-60"
              onClick={saveSubscriptions}
              disabled={busy === 'save' || !status?.connected}
            >
              {busy === 'save' ? 'Saving...' : 'Save Subscriptions'}
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-300 space-y-1">
            <div>Fetched emails: {emails.length}</div>
            <div>Parsed candidates: {parsedCount ?? '-'}</div>
            {saveResult && (
              <div>
                Saved: {saveResult.saved} · Skipped: {saveResult.skipped} ·
                Errors: {saveResult.errors}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
