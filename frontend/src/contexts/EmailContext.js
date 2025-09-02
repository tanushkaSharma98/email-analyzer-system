import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import { emailAPI } from '../services/api';

const EmailContext = createContext();

const initialState = {
  emails: [],
  latestEmail: null,
  stats: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

const emailReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_EMAILS':
      return { 
        ...state, 
        emails: action.payload, 
        loading: false, 
        error: null,
        lastUpdated: new Date()
      };
    
    case 'SET_LATEST_EMAIL':
      return { 
        ...state, 
        latestEmail: action.payload, 
        loading: false, 
        error: null,
        lastUpdated: new Date()
      };
    
    case 'SET_STATS':
      return { 
        ...state, 
        stats: action.payload, 
        loading: false, 
        error: null 
      };
    
    case 'ADD_EMAIL':
      return { 
        ...state, 
        emails: [action.payload, ...state.emails],
        latestEmail: action.payload,
        lastUpdated: new Date()
      };
    
    case 'REMOVE_EMAIL':
      return { 
        ...state, 
        emails: state.emails.filter(email => email.id !== action.payload),
        latestEmail: state.latestEmail?.id === action.payload ? null : state.latestEmail
      };
    
    default:
      return state;
  }
};

export const EmailProvider = ({ children }) => {
  const [state, dispatch] = useReducer(emailReducer, initialState);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [statsFetched, setStatsFetched] = useState(false);
  const [config, setConfig] = useState({ mailbox: '', testSubject: 'Test', imapHost: '' });

  // Fetch latest email
  const fetchLatestEmail = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (state.loading) {
      console.log('Skipping fetch - already loading');
      return;
    }

    // Stop if max retries reached
    if (retryCount >= 3) {
      console.log('Skipping fetch - max retries reached');
      return;
    }

    // Debounce: prevent fetching if last fetch was less than 60 seconds ago
    const now = Date.now();
    if (now - lastFetchTime < 60000) {
      console.log('Skipping fetch - too soon since last request');
      return;
    }

    try {
      setLastFetchTime(now);
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await emailAPI.getLatestEmail();
      dispatch({ type: 'SET_LATEST_EMAIL', payload: response.data });
      // Reset retry count on successful request
      setRetryCount(0);
    } catch (error) {
      // Increment retry count and check if we should stop
      setRetryCount(prev => {
        const newCount = prev + 1;
        
        // Stop retrying after 3 attempts
        if (newCount >= 3) {
          console.warn('Max retry attempts reached, stopping API calls');
        }
        
        return newCount;
      });
      
      // Only set error if it's not a timeout or connection error
      if (!error.code || (error.code !== 'ECONNABORTED' && error.code !== 'ECONNREFUSED')) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
      // For timeout/connection errors, just log and continue
      console.warn(`API request failed, will retry:`, error.message);
    }
  }, [state.loading, retryCount, lastFetchTime, dispatch]);

  // Fetch all emails
  const fetchAllEmails = useCallback(async (limit = 50) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await emailAPI.getAllEmails(limit);
      dispatch({ type: 'SET_EMAILS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [dispatch]);

  // Fetch email by ID
  const fetchEmailById = useCallback(async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await emailAPI.getEmailById(id);
      // API shape: { message, data }
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      // Ensure loading state is cleared for EmailDetails page
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);

  // Fetch emails by ESP
  const fetchEmailsByESP = useCallback(async (esp) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await emailAPI.getEmailsByESP(esp);
      dispatch({ type: 'SET_EMAILS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [dispatch]);

  // Fetch email statistics
  const fetchStats = useCallback(async () => {
    // Only fetch stats once
    if (statsFetched) {
      return;
    }
    
    try {
      setStatsFetched(true);
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await emailAPI.getEmailStats();
      dispatch({ type: 'SET_STATS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [dispatch, statsFetched]);

  // Fetch backend config (mailbox and subject)
  const fetchConfig = useCallback(async () => {
    try {
      const response = await emailAPI.getConfig();
      setConfig(response.data || { mailbox: '', testSubject: 'Test', imapHost: '' });
    } catch (error) {
      // Non-fatal for UI
      console.warn('Failed to load config:', error.message);
    }
  }, []);

  // Delete email
  const deleteEmail = useCallback(async (id) => {
    try {
      await emailAPI.deleteEmail(id);
      dispatch({ type: 'REMOVE_EMAIL', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [dispatch]);

  // Add email (for real-time updates)
  const addEmail = useCallback((email) => {
    dispatch({ type: 'ADD_EMAIL', payload: email });
  }, [dispatch]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, [dispatch]);

  // Manual refresh function
  const manualRefresh = useCallback(() => {
    setRetryCount(0);
    setStatsFetched(false); // Reset stats flag to allow fresh fetch
    fetchLatestEmail();
    fetchStats();
  }, [fetchLatestEmail, fetchStats]);

  // Auto-refresh latest email every 5 minutes
  useEffect(() => {
    // Initial fetch
    fetchLatestEmail();
    
    // Only fetch stats once on mount, not continuously
    fetchStats();
    // Load config once
    fetchConfig();
    
    const interval = setInterval(() => {
      // Only fetch if not currently loading to avoid overlapping requests
      if (!state.loading) {
        fetchLatestEmail();
      }
    }, 300000); // Reduced frequency to every 5 minutes (300 seconds)

    return () => clearInterval(interval);
  }, [state.loading, fetchLatestEmail, fetchConfig]); // Removed fetchStats from deps; keep config

  const value = {
    ...state,
    fetchLatestEmail,
    fetchAllEmails,
    fetchEmailById,
    fetchEmailsByESP,
    fetchStats,
    deleteEmail,
    addEmail,
    clearError,
    retryCount,
    manualRefresh,
    config,
    fetchConfig,
  };

  return (
    <EmailContext.Provider value={value}>
      {children}
    </EmailContext.Provider>
  );
};

export const useEmail = () => {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error('useEmail must be used within an EmailProvider');
  }
  return context;
};
