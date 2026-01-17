import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const SuspenseFallback: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <LoadingSpinner size="lg" message="加载中..." />
    </div>
  );
};

export default SuspenseFallback;