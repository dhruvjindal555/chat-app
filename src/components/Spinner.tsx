'use client';

import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-transparent dark:border-white dark:border-t-transparent"></div>
    </div>
  );
};

export default Spinner;
