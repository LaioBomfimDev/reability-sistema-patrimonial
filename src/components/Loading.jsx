import React from 'react';

const Loading = ({ message = 'Carregando...' }) => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
};

export default Loading;