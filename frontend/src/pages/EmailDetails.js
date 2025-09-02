import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEmail } from '../contexts/EmailContext';
import { 
  ArrowLeft, 
  Mail, 
  Clock, 
  Server, 
  User, 
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import EspBadge from '../components/EspBadge';
import ReceivingChain from '../components/ReceivingChain';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

const EmailDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchEmailById, deleteEmail, loading, error, clearError } = useEmail();
  const [email, setEmail] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadEmail = async () => {
      try {
        const emailData = await fetchEmailById(id);
        setEmail(emailData);
      } catch (error) {
        console.error('Error loading email:', error);
      }
    };

    if (id) {
      loadEmail();
    }
  }, [id, fetchEmailById]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this email? This action cannot be undone.')) {
      try {
        await deleteEmail(id);
        navigate('/dashboard');
      } catch (error) {
        console.error('Error deleting email:', error);
      }
    }
  };

  const handleCopyHeaders = async () => {
    if (email?.rawHeaders) {
      try {
        await navigator.clipboard.writeText(email.rawHeaders);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Error copying headers:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="py-12">
          <LoadingSpinner size="lg" text="Loading email details..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <ErrorAlert message={error} onClose={clearError} />
      </div>
    );
  }

  if (!email) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Email Not Found</h3>
          <p className="text-gray-600 mb-6">
            The email you're looking for doesn't exist or has been deleted.
          </p>
          <Link to="/dashboard" className="btn btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link 
          to="/dashboard" 
          className="btn btn-secondary flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        
        <button
          onClick={handleDelete}
          className="btn btn-danger flex items-center space-x-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      </div>

      {/* Email Header */}
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {email.subject}
            </h1>
            <div className="space-y-2 text-gray-600">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span><strong>From:</strong> {email.from}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span><strong>To:</strong> {email.to}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span><strong>Received:</strong> {new Date(email.timestamp).toLocaleString()}</span>
              </div>
              {email.messageId && (
                <div className="flex items-center space-x-2">
                  <Server className="w-4 h-4" />
                  <span><strong>Message ID:</strong> {email.messageId}</span>
                </div>
              )}
            </div>
          </div>
          <div className="ml-6">
            <EspBadge esp={email.esp} espInfo={email.espInfo} size="lg" />
          </div>
        </div>
      </div>

      {/* Receiving Chain */}
      <div className="card">
        <ReceivingChain 
          chain={email.receivingChain} 
          timestamp={email.timestamp}
        />
      </div>

      {/* Raw Headers */}
      {email.rawHeaders && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Raw Email Headers</h2>
            <button
              onClick={handleCopyHeaders}
              className="btn btn-secondary flex items-center space-x-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Headers</span>
                </>
              )}
            </button>
          </div>
          
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm whitespace-pre-wrap font-mono">
              {email.rawHeaders}
            </pre>
          </div>
        </div>
      )}

      {/* Additional Headers */}
      {email.additionalHeaders && Object.keys(email.additionalHeaders).length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Headers</h2>
          <div className="space-y-2">
            {Object.entries(email.additionalHeaders)
              .filter(([key]) => !['subject', 'from', 'to', 'date', 'message-id', 'received'].includes(key))
              .map(([key, value]) => (
                <div key={key} className="flex items-start space-x-4 py-2 border-b border-gray-100 last:border-b-0">
                  <div className="w-32 flex-shrink-0">
                    <span className="text-sm font-medium text-gray-600 capitalize">
                      {key.replace(/-/g, ' ')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-900 break-all">
                      {value}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ESP Analysis */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">ESP Analysis</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Detected ESP</h3>
            <EspBadge esp={email.esp} espInfo={email.espInfo} size="lg" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analysis Summary</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Email processed successfully</p>
              <p>• {email.receivingChain.length} server hops detected</p>
              <p>• ESP type identified as {email.esp}</p>
              <p>• Headers parsed and stored</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailDetails;
