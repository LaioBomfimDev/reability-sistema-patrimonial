import React from 'react';

// Real-time validation component
export const ValidatedInput = ({ 
  label, 
  name, 
  type = 'text', 
  placeholder, 
  required = false,
  className = '',
  ...fieldProps 
}) => {
  const { error, ...inputProps } = fieldProps;
  
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        className={`input-field ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''} ${className}`}
        {...inputProps}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default ValidatedInput;