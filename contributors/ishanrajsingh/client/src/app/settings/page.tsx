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
  const [gmailNotice, setGmailNotice] = useState<{
    message: string;
    tone: 'success' | 'warning' | 'error';
  } | null>(null);
  const [status, setStatus] = useState<GmailStatus | null>(null);
  const [emails, setEmails] = useState<EmailPreview[]>([]);
  const [verifiedEmails, setVerifiedEmails] = useState<string[]>([]);
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
      setGmailNotice({ message: 'Gmail connected successfully.', tone: 'success' });
    } else if (state === 'denied') {
      setGmailNotice({ message: 'Gmail access was denied.', tone: 'error' });
    } else if (state === 'error') {
      setGmailNotice({ message: 'Gmail connection failed. Try again.', tone: 'error' });
    } else {
      setGmailNotice(null);
    }
  }, []);

  const handleInvalidToken = (message: string) => {
    const normalized = message.toLowerCase();
    const isInvalid =
      normalized.includes('token is invalid') ||
      normalized.includes('invalid encrypted token') ||
      normalized.includes('unsupported state');

    if (isInvalid) {
      setGmailNotice({
        message: 'Gmail token invalid or expired. Please disconnect and reconnect Gmail.',
        tone: 'warning',
      });
      setStatus({ connected: false });
      setEmails([]);
      setParsedCount(null);
      setSaveResult(null);
      return true;
    }

    return false;
  };

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
      const message =
        err instanceof Error ? err.message : 'Failed to fetch Gmail status';
      setError(message);
      handleInvalidToken(message);
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
      const message =
        err instanceof Error ? err.message : 'Failed to connect Gmail';
      setError(message);
      handleInvalidToken(message);
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
      const message =
        err instanceof Error ? err.message : 'Failed to disconnect Gmail';
      setError(message);
      handleInvalidToken(message);
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
      setVerifiedEmails([]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch emails';
      setError(message);
      handleInvalidToken(message);
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
      const message =
        err instanceof Error ? err.message : 'Failed to parse emails';
      setError(message);
      handleInvalidToken(message);
    } finally {
      setBusy(null);
    }
  };

  const toggleVerified = (id: string) => {
    setVerifiedEmails((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const markAllVerified = () => {
    setVerifiedEmails(emails.map((email) => email.messageId));
  };

  const clearVerified = () => {
    setVerifiedEmails([]);
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
      const message =
        err instanceof Error ? err.message : 'Failed to save subscriptions';
      setError(message);
      handleInvalidToken(message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <DashboardLayout title="Settings" subtitle="Gmail ingestion controls">
      <div className="space-y-6">
        {gmailNotice && (
          <div
            className={
              gmailNotice.tone === 'success'
                ? 'rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200'
                : gmailNotice.tone === 'warning'
                  ? 'rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200'
                  : 'rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200'
            }
          >
            {gmailNotice.message}
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

        {emails.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#0b0f14] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Verify fetched emails</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Review the messages fetched from Gmail before parsing.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllVerified}
                  className="px-3 py-1.5 rounded-lg border border-white/20 text-white text-xs disabled:opacity-50"
                  disabled={!emails.length}
                >
                  Select all
                </button>
                <button
                  onClick={clearVerified}
                  className="px-3 py-1.5 rounded-lg border border-white/20 text-white text-xs disabled:opacity-50"
                  disabled={!verifiedEmails.length}
                >
                  Clear
                </button>
                <span className="text-xs text-gray-400">
                  Verified: {verifiedEmails.length}/{emails.length}
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {emails.map((email) => {
                const isVerified = verifiedEmails.includes(email.messageId);
                return (
                  <label
                    key={email.messageId}
                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                      isVerified
                        ? 'border-emerald-500/40 bg-emerald-500/10'
                        : 'border-white/10 bg-[#0f1319] hover:border-white/20'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isVerified}
                      onChange={() => toggleVerified(email.messageId)}
                      className="mt-1 accent-emerald-400"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-white truncate">
                          {email.subject || 'Untitled'}
                        </span>
                        {isVerified && (
                          <span className="text-xs text-emerald-300">Verified</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {email.sender || 'Unknown sender'} ·{' '}
                        {email.timestamp ? new Date(email.timestamp).toLocaleString() : 'Unknown date'}
                      </div>
                      {email.snippet && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                          {email.snippet}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
