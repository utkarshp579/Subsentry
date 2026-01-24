'use client';

import React, { useState, useEffect } from 'react';
import './GmailIntegration.css';

export default function GmailIntegration() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [connectedDate, setConnectedDate] = useState('');

  useEffect(() => {
    checkConnectionStatus();
    handleOAuthCallback();
  }, []);


  const checkConnectionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/gmail/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const contentType = response.headers.get('content-type');

      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON, got HTML:', text);
        return;
      }

      const data = await response.json();

      if (data?.connected) {
        setIsConnected(true);

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserEmail(user.email || 'user@gmail.com');

        setConnectedDate(
          new Date().toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
          })
        );
      }
    } catch (error) {
      console.error('Error checking Gmail status:', error);
    }
  };

  const handleOAuthCallback = () => {
    const params = new URLSearchParams(window.location.search);

    if (params.get('gmail_status') === 'connected') {
      setIsConnected(true);
      setShowSuccess(true);

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setUserEmail(user.email || 'user@gmail.com');

      setConnectedDate(
        new Date().toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        })
      );

      
      window.history.replaceState({}, '', window.location.pathname);

      setTimeout(() => setShowSuccess(false), 3000);
    }
  };


  const connectGmail = () => {
    const token = localStorage.getItem('token');

    if (!token) {
      // you have /sign-in route
      window.location.href = '/sign-in';
      return;
    }

    window.location.href =
      `${process.env.NEXT_PUBLIC_API_URL}/api/gmail/auth?token=${token}`;
  };

  const disconnectGmail = async () => {
    if (!confirm('Are you sure you want to disconnect Gmail?')) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/gmail/disconnect`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsConnected(false);
      setUserEmail('');
      setConnectedDate('');
      setShowSuccess(false);
    } catch (error) {
      console.error('Failed to disconnect Gmail:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-card">
        <div className="integration-header">
          <h2>Gmail Integration</h2>
          <p>Connect Gmail to auto-detect subscriptions</p>
        </div>

        {showSuccess && (
          <div className="success-banner">
            Gmail connected successfully!
          </div>
        )}

        {isConnected ? (
          <div className="connected-state">
            <p><strong>Email:</strong> {userEmail}</p>
            <p><strong>Connected on:</strong> {connectedDate}</p>

            <button
              className="disconnect-button"
              onClick={disconnectGmail}
              disabled={loading}
            >
              {loading ? 'Disconnecting...' : 'Disconnect Gmail'}
            </button>
          </div>
        ) : (
          <div className="not-connected-state">
            <p>
              Connect your Gmail account to enable automatic subscription
              detection.
            </p>

            <button
              className="connect-button"
              onClick={connectGmail}
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Connect Gmail'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
