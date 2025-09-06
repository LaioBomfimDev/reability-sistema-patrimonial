import React from 'react';

// Real-time validation component
export const ValidatedInput = ({ 
  label, 
  name, 
  type = 'text', 
  placeholder, 
  required = false,
  className = '',
  value,
  onChange,
  onBlur,
  error,
  ...otherProps 
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`input-field ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''} ${className}`}
        {...otherProps}
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