import React from 'react';

interface LoadingScreenProps {
  show: boolean;
}

export function LoadingScreen({ show }: LoadingScreenProps) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg">Đang mở camera...</p>
      </div>
    </div>
  );
}

interface ErrorScreenProps {
  error: string | null;
  onRetry: () => void;
}

export function ErrorScreen({ error, onRetry }: ErrorScreenProps) {
  if (!error) return null;

  return (
    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="text-center max-w-sm px-8">
        <p className="text-red-400 text-lg mb-6">{error}</p>
        <button
          onClick={onRetry}
          className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-2xl font-medium"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}
