import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useEmail } from '../contexts/EmailContext';
import { Mail, Send, BarChart3, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import EspBadge from '../components/EspBadge';
import ReceivingChain from '../components/ReceivingChain';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { emailAPI } from '../services/api';

const Home = () => {
  const { latestEmail, loading, error, fetchLatestEmail, clearError, retryCount, manualRefresh, config } = useEmail();
  const [rescanLoading, setRescanLoading] = useState(false);
  const [rescanMsg, setRescanMsg] = useState('');

  useEffect(() => {
    fetchLatestEmail();
  }, [fetchLatestEmail]); // Include fetchLatestEmail as dependency

  const handleRescan = async () => {
    try {
      setRescanMsg('');
      setRescanLoading(true);
      await emailAPI.triggerRescan();
      // brief delay to allow processing
      setTimeout(() => {
        fetchLatestEmail();
        setRescanLoading(false);
        setRescanMsg('Rescan triggered');
        setTimeout(() => setRescanMsg(''), 2000);
      }, 1500);
    } catch (e) {
      setRescanLoading(false);
      setRescanMsg('Rescan failed');
      setTimeout(() => setRescanMsg(''), 3000);
    }
  };



  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Email Analyzer System
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Automatically analyze incoming emails to identify receiving chains and ESP types. 
          Send a test email to see the magic happen!
        </p>
      </div>

      {/* Status Indicator */}
      {retryCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-yellow-800">
            <Clock className="w-5 h-5" />
            <span className="font-medium">
              API Connection Issues (Attempt {retryCount}/3)
            </span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            {retryCount >= 3 ? 'Max retries reached. Click refresh to try again.' : 'Retrying automatically...'}
          </p>
          {retryCount >= 3 && (
            <button
              onClick={manualRefresh}
              className="mt-2 btn btn-secondary btn-sm"
            >
              Try Again
            </button>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="card">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <Send className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              How to Test
            </h2>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success-500" />
                <span>Send an email to: <code className="bg-gray-100 px-2 py-1 rounded">{config.mailbox || 'your-mailbox@example.com'}</code></span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success-500" />
                <span>Use subject line: <code className="bg-gray-100 px-2 py-1 rounded">{config.testSubject || 'Test'}</code></span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success-500" />
                <span>Results will appear below automatically</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Email Results */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center space-x-2">
            <Mail className="w-6 h-6" />
            <span>Latest Email Analysis</span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={manualRefresh}
              disabled={loading}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <Clock className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleRescan}
              disabled={rescanLoading}
              className="btn btn-primary flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${rescanLoading ? 'animate-spin' : ''}`} />
              <span>{rescanLoading ? 'Rescanning…' : 'Rescan Now'}</span>
            </button>
          </div>
        </div>
        {rescanMsg && (
          <div className="text-sm text-gray-600 mb-2">{rescanMsg}</div>
        )}

        {error && (
          <ErrorAlert 
            message={error} 
            onClose={clearError}
            className="mb-6"
          />
        )}

        {loading && (
          <div className="py-12">
            <LoadingSpinner size="lg" text="Analyzing latest email..." />
          </div>
        )}

        {!loading && !error && !latestEmail && (
          <div className="text-center py-12">
            <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Emails Yet</h3>
            <p className="text-gray-600 mb-6">
              Send a test email to see the analysis results here.
            </p>
            <Link to="/dashboard" className="btn btn-primary">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Dashboard
            </Link>
          </div>
        )}

        {!loading && !error && latestEmail && (
          <div className="space-y-6">
            {/* Email Header */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {latestEmail.subject}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>From:</strong> {latestEmail.from}</p>
                    <p><strong>To:</strong> {latestEmail.to}</p>
                    <p><strong>Time:</strong> {new Date(latestEmail.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <div className="ml-4">
                  <EspBadge esp={latestEmail.esp} espInfo={latestEmail.espInfo} size="lg" />
                </div>
              </div>
            </div>

            {/* Receiving Chain */}
            <ReceivingChain 
              chain={latestEmail.receivingChain} 
              timestamp={latestEmail.timestamp}
            />

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Link 
                to={`/email/${latestEmail.id}`}
                className="btn btn-primary"
              >
                View Details
              </Link>
              <Link 
                to="/dashboard"
                className="btn btn-secondary"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View All Emails
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">IMAP Integration</h3>
          <p className="text-gray-600">
            Automatically monitors your inbox for test emails and processes them in real-time.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-6 h-6 text-success-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">ESP Detection</h3>
          <p className="text-gray-600">
            Identifies email service providers like Gmail, Outlook, Yahoo, and more.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-warning-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Receiving Chain</h3>
          <p className="text-gray-600">
            Visualizes the complete path your email took from sender to recipient.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
