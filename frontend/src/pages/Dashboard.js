import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useEmail } from '../contexts/EmailContext';
import { 
  Mail, 
  BarChart3, 
  Clock, 
  Server, 
  TrendingUp,
  Filter,
  RefreshCw
} from 'lucide-react';
import EspBadge from '../components/EspBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

const Dashboard = () => {
  const { 
    emails, 
    stats, 
    loading, 
    error, 
    fetchAllEmails, 
    fetchStats, 
    clearError 
  } = useEmail();

  const [selectedESP, setSelectedESP] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchAllEmails();
    fetchStats();
  }, [fetchAllEmails, fetchStats]);

  const handleRefresh = () => {
    clearError();
    fetchAllEmails();
    fetchStats();
  };

  const handleESPFilter = (esp) => {
    setSelectedESP(esp);
    if (esp === 'all') {
      fetchAllEmails();
    } else {
      // Note: This would need to be implemented in the context
      // For now, we'll filter client-side
    }
  };

  const filteredEmails = emails.filter(email => 
    selectedESP === 'all' || email.esp === selectedESP
  );

  const sortedEmails = [...filteredEmails].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.timestamp) - new Date(a.timestamp);
    } else if (sortBy === 'oldest') {
      return new Date(a.timestamp) - new Date(b.timestamp);
    } else if (sortBy === 'esp') {
      return a.esp.localeCompare(b.esp);
    }
    return 0;
  });

  const uniqueESPs = [...new Set(emails.map(email => email.esp))];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor and analyze all processed emails
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="btn btn-primary flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <ErrorAlert 
          message={error} 
          onClose={clearError}
        />
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Emails</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEmails}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Last 24h</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentEmails}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                <Server className="w-6 h-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ESP Types</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.espBreakdown).length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-danger-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Most Common</p>
                <p className="text-lg font-bold text-gray-900">
                  {Object.entries(stats.espBreakdown).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ESP Breakdown */}
      {stats && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">ESP Breakdown</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.espBreakdown)
              .sort(([,a], [,b]) => b - a)
              .map(([esp, count]) => (
                <div key={esp} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <EspBadge esp={esp} espInfo={{ name: esp, logo: '📧', color: '#6B7280' }} size="sm" />
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by ESP:</span>
            </div>
            <select
              value={selectedESP}
              onChange={(e) => handleESPFilter(e.target.value)}
              className="input w-auto"
            >
              <option value="all">All ESPs</option>
              {uniqueESPs.map(esp => (
                <option key={esp} value={esp}>{esp}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input w-auto"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="esp">ESP Type</option>
            </select>
          </div>
        </div>
      </div>

      {/* Email List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Email Analysis Results
          </h2>
          <span className="text-sm text-gray-500">
            {filteredEmails.length} of {emails.length} emails
          </span>
        </div>

        {loading && (
          <div className="py-12">
            <LoadingSpinner size="lg" text="Loading emails..." />
          </div>
        )}

        {!loading && sortedEmails.length === 0 && (
          <div className="text-center py-12">
            <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Emails Found</h3>
            <p className="text-gray-600 mb-6">
              {selectedESP === 'all' 
                ? 'No emails have been processed yet. Send a test email to get started.'
                : `No emails found for ${selectedESP}. Try selecting a different ESP or "All ESPs".`
              }
            </p>
            <Link to="/" className="btn btn-primary">
              <Mail className="w-4 h-4 mr-2" />
              Send Test Email
            </Link>
          </div>
        )}

        {!loading && sortedEmails.length > 0 && (
          <div className="space-y-4">
            {sortedEmails.map((email) => (
              <div key={email.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {email.subject}
                      </h3>
                      <EspBadge esp={email.esp} espInfo={email.espInfo} size="sm" />
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>From:</strong> {email.from}</p>
                      <p><strong>To:</strong> {email.to}</p>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(email.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Server className="w-4 h-4" />
                          <span>{email.receivingChain.length} hops</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex-shrink-0">
                    <Link 
                      to={`/email/${email.id}`}
                      className="btn btn-primary"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
