import React, { useState, useEffect } from 'react';
import { X, History, ArrowRight, Clock } from 'lucide-react';
import { useMovements } from '../hooks/useMovements';
import { formatDateTime } from '../utils/helpers';

const MovementHistoryModal = ({ asset, onClose }) => {
  const { movements, loading, fetchAssetMovements } = useMovements();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (asset?.id) {
      fetchAssetMovements(asset.id);
    }
  }, [asset?.id]);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div className="flex items-center">
            <History className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Histórico de Movimentações
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Asset Info */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Código:</span> {asset.codigo}
            </div>
            <div>
              <span className="font-medium text-gray-700">Descrição:</span> {asset.descricao}
            </div>
            <div>
              <span className="font-medium text-gray-700">Localização Atual:</span> {asset.localizacao_atual || 'Não informado'}
            </div>
          </div>
        </div>

        {/* Movement History Content */}
        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Carregando histórico...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Erro ao carregar o histórico: {error}</p>
              <button
                onClick={() => fetchAssetMovements(asset.id)}
                className="mt-2 btn-primary"
              >
                Tentar novamente
              </button>
            </div>
          ) : movements.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Este item ainda não possui movimentações registradas.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {movements.map((movement, index) => (
                <div
                  key={movement.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="bg-blue-100 rounded-full p-2 mr-3">
                        <ArrowRight className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Movimentação #{movements.length - index}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(movement.data_movimentacao)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {/* From */}
                    <div className="bg-red-50 p-3 rounded-lg">
                      <h5 className="font-medium text-red-800 mb-2">Origem</h5>
                      <div className="space-y-1 text-red-700">
                        <div>
                          <span className="font-medium">Localização:</span>{' '}
                          {movement.localizacao_origem || 'Não informado'}
                        </div>
                        <div>
                          <span className="font-medium">Responsável:</span>{' '}
                          {movement.responsavel_origem || 'Não informado'}
                        </div>
                      </div>
                    </div>

                    {/* To */}
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h5 className="font-medium text-green-800 mb-2">Destino</h5>
                      <div className="space-y-1 text-green-700">
                        <div>
                          <span className="font-medium">Localização:</span>{' '}
                          {movement.localizacao_destino}
                        </div>
                        <div>
                          <span className="font-medium">Responsável:</span>{' '}
                          {movement.responsavel_destino}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Observations */}
                  {movement.observacoes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-800 mb-1">Observações</h5>
                      <p className="text-sm text-gray-700">{movement.observacoes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovementHistoryModal;