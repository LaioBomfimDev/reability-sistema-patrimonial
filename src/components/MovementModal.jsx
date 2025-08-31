import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { useAssets } from '../hooks/useAssets';
import { validateRequiredFields } from '../utils/helpers';
import { TOAST_MESSAGES } from '../utils/constants';
import toast from 'react-hot-toast';

const MovementModal = ({ asset, onSave, onCancel }) => {
  const { moveAsset, loading } = useAssets();

  const [formData, setFormData] = useState({
    localizacao_destino: '',
    responsavel_destino: '',
    observacoes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    const { isValid: requiredValid, errors: requiredErrors } = validateRequiredFields(
      formData,
      ['localizacao_destino', 'responsavel_destino']
    );

    if (!requiredValid) {
      Object.assign(newErrors, requiredErrors);
    }

    // Check if destination is different from origin
    if (formData.localizacao_destino && 
        formData.localizacao_destino.trim() === (asset.localizacao_atual || '').trim()) {
      newErrors.localizacao_destino = 'Nova localização deve ser diferente da atual';
    }

    if (formData.responsavel_destino && 
        formData.responsavel_destino.trim() === (asset.responsavel_atual || '').trim()) {
      newErrors.responsavel_destino = 'Novo responsável deve ser diferente do atual';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error(TOAST_MESSAGES.ERROR.VALIDATION);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare movement data
      const movementData = {
        localizacao_origem: asset.localizacao_atual,
        localizacao_destino: formData.localizacao_destino.trim(),
        responsavel_origem: asset.responsavel_atual,
        responsavel_destino: formData.responsavel_destino.trim(),
        observacoes: formData.observacoes.trim() || null
      };

      await moveAsset(asset.id, movementData);
      onSave();
    } catch (error) {
      // Error handling is done in the hook
      console.error('Error moving asset:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Movimentar Item de Estoque
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Asset Info */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Item Selecionado</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Código:</span> {asset.codigo}
            </div>
            <div>
              <span className="font-medium text-gray-700">Descrição:</span> {asset.descricao}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Current Location and Responsible */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-3">Situação Atual</h5>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Localização Atual
                  </label>
                  <input
                    type="text"
                    value={asset.localizacao_atual || 'Não informado'}
                    disabled
                    className="input-field bg-gray-100 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Responsável Atual
                  </label>
                  <input
                    type="text"
                    value={asset.responsavel_atual || 'Não informado'}
                    disabled
                    className="input-field bg-gray-100 text-gray-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-3">Nova Situação</h5>
              <div className="space-y-3">
                <div>
                  <label htmlFor="localizacao_destino" className="block text-sm font-medium text-gray-700 mb-1">
                    Nova Localização *
                  </label>
                  <input
                    type="text"
                    id="localizacao_destino"
                    name="localizacao_destino"
                    value={formData.localizacao_destino}
                    onChange={handleInputChange}
                    className={`input-field ${errors.localizacao_destino ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                    placeholder="Ex: Sala 205, Almoxarifado"
                  />
                  {errors.localizacao_destino && (
                    <p className="mt-1 text-sm text-red-600">{errors.localizacao_destino}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="responsavel_destino" className="block text-sm font-medium text-gray-700 mb-1">
                    Novo Responsável *
                  </label>
                  <input
                    type="text"
                    id="responsavel_destino"
                    name="responsavel_destino"
                    value={formData.responsavel_destino}
                    onChange={handleInputChange}
                    className={`input-field ${errors.responsavel_destino ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                    placeholder="Ex: Maria Santos"
                  />
                  {errors.responsavel_destino && (
                    <p className="mt-1 text-sm text-red-600">{errors.responsavel_destino}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Movement Summary */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
              <ArrowRight className="h-4 w-4 mr-2" />
              Resumo da Movimentação
            </h5>
            <div className="text-sm text-blue-800">
              <div className="flex items-center justify-between">
                <span>
                  <strong>De:</strong> {asset.localizacao_atual || 'Não informado'} 
                  ({asset.responsavel_atual || 'Não informado'})
                </span>
                <ArrowRight className="h-4 w-4 mx-2 text-blue-600" />
                <span>
                  <strong>Para:</strong> {formData.localizacao_destino || '___'} 
                  ({formData.responsavel_destino || '___'})
                </span>
              </div>
            </div>
          </div>

          {/* Observations */}
          <div>
            <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">
              Observações da Movimentação
            </label>
            <textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleInputChange}
              rows={3}
              className="input-field"
              placeholder="Motivo da transferência, condições do item, etc..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="btn-primary flex items-center bg-green-600 hover:bg-green-700"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              Confirmar Transferência
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovementModal;