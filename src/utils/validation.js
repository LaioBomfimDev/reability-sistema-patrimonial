import { useState, useCallback } from 'react';

// Advanced validation rules
const ValidationRules = {
  required: (message = 'Este campo é obrigatório') => (value) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return message;
    }
    return null;
  },

  minLength: (min, message) => (value) => {
    if (value && value.length < min) {
      return message || `Mínimo de ${min} caracteres`;
    }
    return null;
  },

  maxLength: (max, message) => (value) => {
    if (value && value.length > max) {
      return message || `Máximo de ${max} caracteres`;
    }
    return null;
  },

  pattern: (regex, message) => (value) => {
    if (value && !regex.test(value)) {
      return message || 'Formato inválido';
    }
    return null;
  },

  email: (message = 'Email inválido') => (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return message;
    }
    return null;
  },

  positiveNumber: (message = 'Deve ser um número positivo') => (value) => {
    if (value !== '' && value !== null && value !== undefined) {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        return message;
      }
    }
    return null;
  },

  pastDate: (message = 'Data não pode ser no futuro') => (value) => {
    if (value) {
      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (inputDate > today) {
        return message;
      }
    }
    return null;
  },

  custom: (validatorFn, message) => (value) => {
    if (!validatorFn(value)) {
      return message || 'Valor inválido';
    }
    return null;
  }
};

// Enhanced form validation hook
const useFormValidation = (initialValues = {}, validationSchema = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name, value) => {
    const fieldRules = validationSchema[name];
    if (!fieldRules) return null;

    // Run all validation rules for the field
    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) return error;
    }
    return null;
  }, [validationSchema]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationSchema).forEach(field => {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField, validationSchema]);

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    setValue(name, fieldValue);
  }, [setValue]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setFieldTouched(name, true);
    
    // Validate on blur
    const error = validateField(name, value);
    if (error !== errors[name]) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [validateField, errors, setFieldTouched]);

  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const submitForm = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(validationSchema).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    try {
      const isValid = validateForm();
      if (isValid) {
        await onSubmit(values);
        return { success: true };
      } else {
        return { success: false, errors };
      }
    } catch (error) {
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, values, errors, validationSchema]);

  // Helper to get field props for form inputs
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: handleChange,
    onBlur: handleBlur,
    error: touched[name] ? errors[name] : null,
    'aria-invalid': touched[name] && errors[name] ? 'true' : 'false'
  }), [values, handleChange, handleBlur, touched, errors]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    submitForm,
    getFieldProps,
    isValid: Object.keys(errors).length === 0
  };
};

// Asset-specific validation schemas
const AssetValidationSchema = {
  tipo: [
    ValidationRules.required('Tipo é obrigatório')
  ],
  conteudo: [
    ValidationRules.required('Conteúdo é obrigatório'),
    ValidationRules.minLength(2, 'Conteúdo deve ter pelo menos 2 caracteres'),
    ValidationRules.maxLength(255, 'Conteúdo deve ter no máximo 255 caracteres')
  ],
  descricao: [
    ValidationRules.maxLength(500, 'Descrição deve ter no máximo 500 caracteres')
  ],
  quantidade: [
    ValidationRules.required('Quantidade é obrigatória'),
    ValidationRules.custom(
      (value) => {
        const num = parseInt(value);
        return !isNaN(num) && num > 0;
      },
      'Quantidade deve ser um número inteiro positivo'
    )
  ],
  unidade: [
    ValidationRules.required('Unidade é obrigatória')
  ],
  valor_aquisicao: [
    ValidationRules.positiveNumber('Valor deve ser um número positivo')
  ],
  data_aquisicao: [
    ValidationRules.pastDate('Data de aquisição não pode ser no futuro')
  ],
  localizacao_atual: [
    ValidationRules.maxLength(255, 'Localização deve ter no máximo 255 caracteres')
  ],
  responsavel_atual: [
    ValidationRules.maxLength(255, 'Responsável deve ter no máximo 255 caracteres')
  ],
  observacoes: [
    ValidationRules.maxLength(1000, 'Observações devem ter no máximo 1000 caracteres')
  ]
};

const MovementValidationSchema = {
  localizacao_destino: [
    ValidationRules.required('Nova localização é obrigatória'),
    ValidationRules.maxLength(255, 'Localização deve ter no máximo 255 caracteres')
  ],
  responsavel_destino: [
    ValidationRules.required('Novo responsável é obrigatório'),
    ValidationRules.maxLength(255, 'Responsável deve ter no máximo 255 caracteres')
  ],
  observacoes: [
    ValidationRules.maxLength(1000, 'Observações devem ter no máximo 1000 caracteres')
  ]
};

// Note: ValidatedInput component moved to components/ValidatedInput.jsx
// Export validation utilities only from this file
export { ValidationRules, useFormValidation, AssetValidationSchema, MovementValidationSchema };