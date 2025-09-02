import React from 'react';
import { ArrowRight, Server, Clock } from 'lucide-react';

const ReceivingChain = ({ chain, timestamp }) => {
  if (!chain || chain.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Server className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No receiving chain data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Receiving Chain</h3>
        {timestamp && (
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{new Date(timestamp).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Chain Steps */}
      <div className="space-y-3">
        {chain.map((step, index) => (
          <div key={index} className="flex items-center space-x-4">
            {/* Step Number */}
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium">
              {step.step}
            </div>

            {/* Server Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-900 truncate">
                  {step.server}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {step.description}
              </p>
            </div>

            {/* Arrow (except for last item) */}
            {index < chain.length - 1 && (
              <div className="flex-shrink-0">
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Hops:</span>
          <span className="font-medium text-gray-900">{chain.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-gray-600">Origin:</span>
          <span className="font-medium text-gray-900">{chain[0]?.server || 'Unknown'}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-gray-600">Destination:</span>
          <span className="font-medium text-gray-900">{chain[chain.length - 1]?.server || 'Unknown'}</span>
        </div>
      </div>
    </div>
  );
};

export default ReceivingChain;
