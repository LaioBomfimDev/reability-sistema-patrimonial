import React from 'react';
import { Database, ExternalLink, CheckCircle, Package } from 'lucide-react';

const WelcomeScreen = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center p-8">
        {/* Header */}
        <div className="mb-8">
          <img 
            src="/logo.png" 
            alt="Reability Logo" 
            className="h-20 w-20 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reability - Gestão Patrimonial
          </h1>
          <p className="text-lg text-gray-600">
            Bem-vindo! Seu sistema de gestão patrimonial está pronto para uso.
          </p>
        </div>

        {/* Status */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center mb-4">
            <Database className="h-8 w-8 text-yellow-600 mr-3" />
            <h2 className="text-xl font-semibold text-yellow-800">
              Configure o Supabase para Funcionalidade Completa
            </h2>
          </div>
          <p className="text-yellow-700 mb-4">
            A interface está totalmente funcional, mas você precisa configurar o Supabase para salvar e carregar dados.
          </p>
        </div>

        {/* Features Available */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              ✅ Disponível Agora
            </h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Interface responsiva completa</li>
              <li>• Navegação entre páginas</li>
              <li>• Modais e formulários</li>
              <li>• Design profissional</li>
              <li>• Todos os componentes funcionais</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
              <Database className="h-5 w-5 mr-2" />
              🔧 Após Configurar Supabase
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Cadastro e edição de itens</li>
              <li>• Busca e filtros</li>
              <li>• Movimentação de estoque</li>
              <li>• Histórico de transferências</li>
              <li>• Relatórios e exportação CSV</li>
            </ul>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-left">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <ExternalLink className="h-5 w-5 mr-2" />
            Como Configurar (5 minutos)
          </h3>
          <ol className="space-y-3 text-sm text-gray-700">
            <li>
              <strong>1. Crie um projeto no Supabase:</strong>
              <br />
              <a 
                href="https://supabase.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                https://supabase.com
              </a>
            </li>
            <li>
              <strong>2. Execute o SQL Schema:</strong>
              <br />
              No painel do Supabase, vá em "SQL Editor" e execute o arquivo <code className="bg-gray-100 px-1 rounded">database/schema.sql</code>
            </li>
            <li>
              <strong>3. Configure as variáveis de ambiente:</strong>
              <br />
              Edite o arquivo <code className="bg-gray-100 px-1 rounded">.env</code> com suas credenciais do Supabase
            </li>
            <li>
              <strong>4. Recarregue a página</strong> e todos os recursos estarão disponíveis!
            </li>
          </ol>
        </div>

        {/* Try Interface */}
        <div className="mt-8">
          <p className="text-gray-600 mb-4">
            Enquanto isso, você pode explorar a interface:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button 
              onClick={() => {
                // Simulate opening the new asset modal
                const event = new CustomEvent('open-asset-form');
                window.dispatchEvent(event);
              }}
              className="btn-primary"
            >
              Testar Formulário
            </button>
            <button 
              onClick={() => window.location.href = '/reports'}
              className="btn-secondary"
            >
              Ver Relatórios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;