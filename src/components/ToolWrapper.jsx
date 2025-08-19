// src/components/ToolWrapper.jsx
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center p-8">
      <h2 className="text-2xl font-bold text-red-500 mb-4">
        Oops! L'outil a rencontré un problème
      </h2>
      <p className="text-gray-400 mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg"
      >
        Réessayer
      </button>
    </div>
  </div>
);

export const ToolWrapper = ({ children }) => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    {children}
  </ErrorBoundary>
);