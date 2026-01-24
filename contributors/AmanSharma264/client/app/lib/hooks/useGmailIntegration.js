'use client';

import { useState, useCallback } from 'react';
import { gmailAPI } from '../gmail-api';

export const useGmailIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);

  const checkStatus = useCallback(async () => {
    try {
      const data = await gmailAPI.getStatus();
      setIsConnected(data.connected);
      if (data.connected) {
        setTokenInfo(data.tokenInfo);
      }
    } catch (err) {
      console.error('Failed to check status:', err);
    }
  }, []);

  const connect = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await gmailAPI.getAuthUrl();
      window.location.href = data.authUrl;
    } catch (err) {
      setError('Failed to initiate connection');
      setLoading(false);
    }
  };

  const disconnect = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await gmailAPI.disconnect();
      setIsConnected(false);
      setTokenInfo(null);
      setSuccess('Gmail disconnected successfully');
    } catch (err) {
      setError('Failed to disconnect');
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const data = await gmailAPI.refreshToken();
      setTokenInfo(prev => ({ ...prev, expiresAt: data.expiresAt }));
      setSuccess('Token refreshed successfully');
    } catch (err) {
      setError('Failed to refresh token');
    } finally {
      setLoading(false);
    }
  };

  return {
    isConnected,
    loading,
    error,
    success,
    tokenInfo,
    connect,
    disconnect,
    refresh,
    checkStatus
  };
};