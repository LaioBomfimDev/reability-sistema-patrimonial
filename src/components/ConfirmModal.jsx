import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ 
  title, 
  message, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar',
  confirmButtonClass = 'btn-primary bg-red-600 hover:bg-red-700',
  onConfirm, 
  onCancel 
}) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md bg-white rounded-lg shadow-lg">
        <div className="mt-3 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {title}
          </h3>
          
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              {message}
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-3 mt-6">
            <button
              onClick={onCancel}
              className="btn-secondary"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={confirmButtonClass}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;