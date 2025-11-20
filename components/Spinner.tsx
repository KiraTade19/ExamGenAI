import React from 'react';

export const Spinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="text-brand-200 font-mono animate-pulse">Analyzing algorithms & synthesizing logic...</p>
  </div>
);