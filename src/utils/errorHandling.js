// Enhanced error handling and logging utilities

class Logger {
  static logLevel = 'info'; // 'debug', 'info', 'warn', 'error'

  static debug(message, ...args) {
    if (this.logLevel === 'debug') {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  static info(message, ...args) {
    if (['debug', 'info'].includes(this.logLevel)) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  static warn(message, ...args) {
    if (['debug', 'info', 'warn'].includes(this.logLevel)) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  static error(message, error, ...args) {
    console.error(`[ERROR] ${message}`, error, ...args);
    
    // In production, send to error reporting service
    if (import.meta.env.PROD) {
      this.reportError(message, error, ...args);
    }
  }

  static reportError(message, error, metadata = {}) {
    // Integrate with error reporting service (Sentry, LogRocket, etc.)
    // For now, just store in localStorage for debugging
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        message,
        error: error?.message || error,
        stack: error?.stack,
        metadata,
        url: window.location.href,
        userAgent: navigator.userAgent
      };

      const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      logs.push(errorLog);
      
      // Keep only last 50 errors
      if (logs.length > 50) logs.splice(0, logs.length - 50);
      
      localStorage.setItem('error_logs', JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }
}

class AppError extends Error {
  constructor(message, code, originalError = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

// Error codes for better categorization
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  SUPABASE_CONFIG: 'SUPABASE_CONFIG',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// Enhanced error handler with retry logic
export class ErrorHandler {
  static async withRetry(operation, retries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        Logger.warn(`Attempt ${attempt} failed:`, error);
        
        if (attempt === retries) {
          throw new AppError(
            `Operation failed after ${retries} attempts`,
            ERROR_CODES.NETWORK_ERROR,
            error
          );
        }
        
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }

  static categorizeError(error) {
    if (!error) return ERROR_CODES.UNKNOWN_ERROR;

    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('network') || message.includes('fetch')) {
      return ERROR_CODES.NETWORK_ERROR;
    }
    if (message.includes('supabase not configured')) {
      return ERROR_CODES.SUPABASE_CONFIG;
    }
    if (message.includes('permission') || message.includes('unauthorized')) {
      return ERROR_CODES.PERMISSION_ERROR;
    }
    if (message.includes('not found') || error.status === 404) {
      return ERROR_CODES.NOT_FOUND;
    }
    if (error.status >= 500) {
      return ERROR_CODES.SERVER_ERROR;
    }
    if (message.includes('validation') || error.status === 400) {
      return ERROR_CODES.VALIDATION_ERROR;
    }
    
    return ERROR_CODES.UNKNOWN_ERROR;
  }

  static getUserFriendlyMessage(error) {
    const code = this.categorizeError(error);
    
    const messages = {
      [ERROR_CODES.NETWORK_ERROR]: 'Problema de conexão. Verifique sua internet e tente novamente.',
      [ERROR_CODES.SUPABASE_CONFIG]: 'Sistema não configurado. Entre em contato com o administrador.',
      [ERROR_CODES.PERMISSION_ERROR]: 'Você não tem permissão para realizar esta ação.',
      [ERROR_CODES.NOT_FOUND]: 'Item não encontrado.',
      [ERROR_CODES.SERVER_ERROR]: 'Erro interno do servidor. Tente novamente em alguns minutos.',
      [ERROR_CODES.VALIDATION_ERROR]: 'Dados inválidos. Verifique as informações e tente novamente.',
      [ERROR_CODES.UNKNOWN_ERROR]: 'Erro inesperado. Tente novamente.'
    };

    return messages[code] || messages[ERROR_CODES.UNKNOWN_ERROR];
  }
}

// Enhanced toast notifications with error categorization
export const enhancedToast = {
  success: (message) => {
    Logger.info('Success:', message);
    toast.success(message);
  },
  
  error: (error, customMessage = null) => {
    const errorCode = ErrorHandler.categorizeError(error);
    const userMessage = customMessage || ErrorHandler.getUserFriendlyMessage(error);
    
    Logger.error('Error occurred:', error, { errorCode });
    toast.error(userMessage);
    
    return { errorCode, userMessage };
  },
  
  warning: (message) => {
    Logger.warn('Warning:', message);
    toast(message, { icon: '⚠️' });
  },
  
  info: (message) => {
    Logger.info('Info:', message);
    toast(message, { icon: 'ℹ️' });
  }
};

// Performance monitoring
export class PerformanceMonitor {
  static startTiming(label) {
    performance.mark(`${label}-start`);
  }

  static endTiming(label) {
    try {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      
      const measure = performance.getEntriesByName(label)[0];
      if (measure) {
        Logger.debug(`Performance: ${label} took ${measure.duration.toFixed(2)}ms`);
        
        // Log slow operations
        if (measure.duration > 1000) {
          Logger.warn(`Slow operation detected: ${label} took ${measure.duration.toFixed(2)}ms`);
        }
      }
    } catch (error) {
      Logger.error('Performance monitoring error:', error);
    }
  }

  static async measureAsync(label, operation) {
    this.startTiming(label);
    try {
      const result = await operation();
      this.endTiming(label);
      return result;
    } catch (error) {
      this.endTiming(label);
      throw error;
    }
  }
}

export { Logger, AppError };