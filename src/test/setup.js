import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Clean up after each test case
afterEach(() => {
  cleanup();
});

// Mock Supabase for testing
const mockSupabase = {
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
    eq: function() { return this; },
    or: function() { return this; },
    ilike: function() { return this; },
    not: function() { return this; },
    order: function() { return this; },
    range: function() { return this; },
    single: function() { return this; }
  }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  }
};

// Mock modules
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb;
  }
  observe() {
    this.cb([{ borderBoxSize: { inlineSize: 0, blockSize: 0 } }], this);
  }
  unobserve() {}
  disconnect() {}
};

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-key'
  }
});

// Global test utilities
global.testUtils = {
  mockSupabase,
  
  // Create mock asset data
  createMockAsset: (overrides = {}) => ({
    id: '123e4567-e89b-12d3-a456-426614174000',
    codigo: '20250001',
    descricao: 'Test Asset',
    categoria: 'Móveis e Utensílios',
    valor_aquisicao: 100.00,
    data_aquisicao: '2025-01-01',
    localizacao_atual: 'Test Location',
    responsavel_atual: 'Test User',
    status: 'Ativo',
    observacoes: 'Test observations',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }),

  // Create mock movement data
  createMockMovement: (overrides = {}) => ({
    id: '123e4567-e89b-12d3-a456-426614174001',
    bem_id: '123e4567-e89b-12d3-a456-426614174000',
    localizacao_origem: 'Origin Location',
    localizacao_destino: 'Destination Location',
    responsavel_origem: 'Origin User',
    responsavel_destino: 'Destination User',
    data_movimentacao: new Date().toISOString(),
    observacoes: 'Test movement',
    created_at: new Date().toISOString(),
    ...overrides
  }),

  // Wait for async operations
  waitFor: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms))
};