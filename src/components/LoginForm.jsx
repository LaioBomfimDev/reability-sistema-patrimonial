import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, Shield } from 'lucide-react';
import { AuthManager } from '../utils/security';
import { useFormValidation } from '../utils/validation';
import ValidatedInput from './ValidatedInput';
import toast from 'react-hot-toast';

const LoginForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validationRules = {
    email: [
      (value) => !value || value.trim() === '' ? 'E-mail é obrigatório' : null,
      (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return value && !emailRegex.test(value) ? 'E-mail inválido' : null;
      }
    ],
    password: [
      (value) => !value || value.trim() === '' ? 'Senha é obrigatória' : null,
      (value) => value && value.length < 6 ? 'Senha deve ter pelo menos 6 caracteres' : null
    ]
  };

  const {
    values,
    errors,
    isValid,
    handleChange,
    handleBlur,
    reset
  } = useFormValidation({
    email: '',
    password: ''
  }, validationRules);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isValid) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);

    try {
      const result = await AuthManager.signIn(values.email, values.password);
      
      if (result.success) {
        toast.success('Login realizado com sucesso!');
        reset();
        if (onSuccess) onSuccess(result.user);
      } else {
        toast.error(result.error || 'Erro ao fazer login');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Erro inesperado ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  // Função de demo removida - acesso restrito apenas aos emails autorizados

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Reability Logo" 
              className="h-16 w-16"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reability
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Gestão Patrimonial - Faça login para acessar o sistema
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <ValidatedInput
              label="E-mail"
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              placeholder="seu@email.com"
              className="w-full"
              disabled={loading}
              autoComplete="email"
              required
            />

            <div className="relative">
              <ValidatedInput
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
                placeholder="Sua senha"
                className="w-full pr-10"
                disabled={loading}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                style={{ top: '24px' }}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading || !isValid}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Entrar
                </>
              )}
            </button>

            {/* Botão de demonstração removido - acesso restrito */}
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Acesso restrito - Apenas usuários autorizados
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;