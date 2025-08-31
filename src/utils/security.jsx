// Security utilities and authentication framework
import React from 'react';
import { supabase } from '../lib/supabase';

export class SecurityUtils {
  // Input sanitization
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+=/gi, ''); // Remove event handlers
  }

  // SQL injection prevention (client-side validation only)
  static validateSQLInput(input) {
    if (typeof input !== 'string') return true;
    
    const sqlPatterns = [
      /(\b(ALTER|CREATE|DELETE|DROP|EXEC|EXECUTE|INSERT|MERGE|SELECT|UPDATE|UNION|TRUNCATE)\b)/i,
      /(--|\*\/|\/\*)/,
      /(\b(OR|AND)\b.*=.*)/i
    ];
    
    return !sqlPatterns.some(pattern => pattern.test(input));
  }

  // XSS prevention
  static escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Generate secure random string
  static generateSecureToken(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Validate file uploads
  static validateFileUpload(file, options = {}) {
    const {
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
      maxSize = 5 * 1024 * 1024, // 5MB
      maxFileNameLength = 255
    } = options;

    const errors = [];

    if (!file) {
      errors.push('Nenhum arquivo selecionado');
      return { isValid: false, errors };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`);
    }

    // Check file size
    if (file.size > maxSize) {
      errors.push(`Arquivo muito grande. Tamanho máximo: ${this.formatFileSize(maxSize)}`);
    }

    // Check filename length
    if (file.name.length > maxFileNameLength) {
      errors.push(`Nome do arquivo muito longo. Máximo: ${maxFileNameLength} caracteres`);
    }

    // Check for suspicious file names
    const suspiciousPatterns = [
      /\.exe$/i,
      /\.scr$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.com$/i,
      /\.pif$/i,
      /\.vbs$/i,
      /\.js$/i,
      /\.jar$/i
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
      errors.push('Tipo de arquivo não permitido por motivos de segurança');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Rate limiting (client-side helper)
  static createRateLimiter(maxRequests = 10, windowMs = 60000) {
    const requests = new Map();

    return (key = 'default') => {
      const now = Date.now();
      const windowStart = now - windowMs;

      // Clean old entries
      for (const [reqKey, times] of requests.entries()) {
        requests.set(reqKey, times.filter(time => time > windowStart));
        if (requests.get(reqKey).length === 0) {
          requests.delete(reqKey);
        }
      }

      // Check current key
      const keyRequests = requests.get(key) || [];
      
      if (keyRequests.length >= maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: Math.min(...keyRequests) + windowMs
        };
      }

      // Add current request
      keyRequests.push(now);
      requests.set(key, keyRequests);

      return {
        allowed: true,
        remaining: maxRequests - keyRequests.length,
        resetTime: now + windowMs
      };
    };
  }
}

// Authentication context and utilities
export class AuthManager {
  static currentUser = null;
  static permissions = new Set();
  static authStateListeners = new Set();

  // Auth state change listener
  static onAuthStateChange(callback) {
    this.authStateListeners.add(callback);
    return () => this.authStateListeners.delete(callback);
  }

  static notifyAuthStateChange(user) {
    this.authStateListeners.forEach(callback => callback(user));
  }

  // Initialize authentication
  static async initialize() {
    try {
      // Check for existing session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session?.user) {
        this.currentUser = session.user;
        await this.loadUserPermissions();
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          this.currentUser = session.user;
          await this.loadUserPermissions();
          this.notifyAuthStateChange(session.user);
        } else if (event === 'SIGNED_OUT') {
          this.currentUser = null;
          this.permissions.clear();
          this.notifyAuthStateChange(null);
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Auth initialization failed:', error);
      return { success: false, error };
    }
  }

  static async signIn(email, password) {
    try {
      // Lista de emails autorizados
      const authorizedEmails = [
        'denise2025@reability.com',
        'karen2025@reability.com'
      ];
      
      // Verificar se o email está na lista autorizada
      if (!authorizedEmails.includes(email)) {
        return { success: false, error: 'Email não autorizado para acesso ao sistema' };
      }
      
      // Verificar senha específica
      const correctPassword = 'admin220817*';
      if (password !== correctPassword) {
        return { success: false, error: 'Senha incorreta' };
      }
      
      // Simular usuário autenticado
      this.currentUser = {
        id: email.split('@')[0], // denise2025 ou karen2025
        email: email,
        user_metadata: { 
          role: 'admin',
          name: email === 'denise2025@reability.com' ? 'Denise' : 'Karen'
        }
      };
      
      // Definir permissões completas para usuários autorizados
      this.permissions = new Set(['read', 'create', 'update', 'delete', 'export', 'admin']);
      this.notifyAuthStateChange(this.currentUser);

      return { success: true, user: this.currentUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      this.currentUser = null;
      this.permissions.clear();
      this.notifyAuthStateChange(null);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async loadUserPermissions() {
    if (!this.currentUser) return;

    try {
      // Load user permissions from database
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission')
        .eq('user_id', this.currentUser.id);

      if (error) throw error;

      this.permissions = new Set(data.map(p => p.permission));
    } catch (error) {
      console.error('Failed to load permissions:', error);
      // Set default permissions for demo
      this.permissions = new Set(['read', 'create', 'update', 'delete']);
    }
  }

  static hasPermission(permission) {
    return this.permissions.has(permission);
  }

  static requirePermission(permission) {
    if (!this.hasPermission(permission)) {
      throw new Error(`Permission required: ${permission}`);
    }
  }

  static isAuthenticated() {
    return !!this.currentUser;
  }

  static requireAuth() {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required');
    }
  }
}

// Role-based access control
export const PERMISSIONS = {
  // Asset permissions
  ASSETS_READ: 'assets:read',
  ASSETS_CREATE: 'assets:create',
  ASSETS_UPDATE: 'assets:update',
  ASSETS_DELETE: 'assets:delete',
  
  // Movement permissions
  MOVEMENTS_READ: 'movements:read',
  MOVEMENTS_CREATE: 'movements:create',
  
  // Report permissions
  REPORTS_READ: 'reports:read',
  REPORTS_EXPORT: 'reports:export',
  
  // Admin permissions
  ADMIN_USERS: 'admin:users',
  ADMIN_SETTINGS: 'admin:settings'
};

// Define base roles first
const VIEWER_PERMISSIONS = [
  PERMISSIONS.ASSETS_READ,
  PERMISSIONS.MOVEMENTS_READ,
  PERMISSIONS.REPORTS_READ
];

const OPERATOR_PERMISSIONS = [
  PERMISSIONS.ASSETS_READ,
  PERMISSIONS.ASSETS_CREATE,
  PERMISSIONS.ASSETS_UPDATE,
  PERMISSIONS.MOVEMENTS_READ,
  PERMISSIONS.MOVEMENTS_CREATE,
  PERMISSIONS.REPORTS_READ,
  PERMISSIONS.REPORTS_EXPORT
];

const MANAGER_PERMISSIONS = [
  ...OPERATOR_PERMISSIONS,
  PERMISSIONS.ASSETS_DELETE
];

const ADMIN_PERMISSIONS = [
  ...MANAGER_PERMISSIONS,
  PERMISSIONS.ADMIN_USERS,
  PERMISSIONS.ADMIN_SETTINGS
];

export const ROLES = {
  VIEWER: VIEWER_PERMISSIONS,
  OPERATOR: OPERATOR_PERMISSIONS,
  MANAGER: MANAGER_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS
};

// Permission-based component wrapper
export const withPermission = (permission, fallback = null) => (Component) => {
  return (props) => {
    if (AuthManager.hasPermission(permission)) {
      return <Component {...props} />;
    }
    
    return fallback || <div className="text-gray-500">Acesso negado</div>;
  };
};

// Audit logging
export class AuditLogger {
  static async log(action, entityType, entityId, details = {}) {
    try {
      const auditEntry = {
        user_id: AuthManager.currentUser?.id || 'anonymous',
        action,
        entity_type: entityType,
        entity_id: entityId,
        details: JSON.stringify(details),
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };

      const { error } = await supabase
        .from('audit_logs')
        .insert([auditEntry]);

      if (error) throw error;

      console.info('Audit log:', auditEntry);
    } catch (error) {
      console.error('Failed to log audit entry:', error);
    }
  }

  static async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }
}

// Data encryption utilities (for sensitive data)
export class EncryptionUtils {
  static async generateKey() {
    return await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  static async encryptData(data, key) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      dataBuffer
    );

    return {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted))
    };
  }

  static async decryptData(encryptedData, key) {
    const iv = new Uint8Array(encryptedData.iv);
    const data = new Uint8Array(encryptedData.data);
    
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      data
    );

    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decrypted));
  }
}