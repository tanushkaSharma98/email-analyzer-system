import React from 'react';

const EspBadge = ({ esp, espInfo, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={`inline-flex items-center space-x-2 rounded-full font-medium ${sizeClasses[size]}`}
      style={{ backgroundColor: `${espInfo.color}15`, color: espInfo.color }}
    >
      <span className={iconSizes[size]}>{espInfo.logo}</span>
      <span>{espInfo.name}</span>
    </div>
  );
};

export default EspBadge;
