import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useAssets } from '../hooks/useAssets';
import { useFormValidation, AssetValidationSchema } from '../utils/validation';
import ValidatedInput from './ValidatedInput';
import { ASSET_TYPES, ASSET_STATUSES, ASSET_UNITS } from '../utils/constants';
import toast from 'react-hot-toast';

const AssetForm = ({ asset, onSave, onCancel }) => {
  const { createAsset, updateAsset, loading } = useAssets();
  const isEditing = !!asset;

  const initialValues = {
    tipo: asset?.tipo || '',
    conteudo: asset?.conteudo || '',
    descricao: asset?.descricao || '',
    quantidade: asset?.quantidade || '',
    unidade: asset?.unidade || '',
    valor_aquisicao: asset?.valor_aquisicao || '',
    data_aquisicao: asset?.data_aquisicao || '',
    localizacao_atual: asset?.localizacao_atual || '',
    responsavel_atual: asset?.responsavel_atual || '',
    status: asset?.status || 'Ativo',
    observacoes: asset?.observacoes || ''
  };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    submitForm,
    getFieldProps,
    resetForm
  } = useFormValidation(initialValues, AssetValidationSchema);

  // Reset form when asset changes
  useEffect(() => {
    if (asset) {
      resetForm(initialValues);
    }
  }, [asset]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await submitForm(async (formData) => {
      // Prepare data for submission
      const submitData = {
        ...formData,
        valor_aquisicao: formData.valor_aquisicao ? parseFloat(formData.valor_aquisicao) : null,
        data_aquisicao: formData.data_aquisicao || null
      };

      if (isEditing) {
        await updateAsset(asset.id, submitData);
      } else {
        await createAsset(submitData);
      }

      onSave();
    });

    if (!result.success && result.error) {
      toast.error('Erro ao salvar item de estoque');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Editar Item de Estoque' : 'Novo Item de Estoque'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo */}
            <div>
              <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo *
              </label>
              <select
                id="tipo"
                name="tipo"
                value={values.tipo}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`input-field ${errors.tipo ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
              >
                <option value="">Selecione um tipo</option>
                {ASSET_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {touched.tipo && errors.tipo && (
                <p className="mt-1 text-sm text-red-600">{errors.tipo}</p>
              )}
            </div>

            {/* Conteúdo */}
            <div>
              <ValidatedInput
                label="Conteúdo"
                name="conteudo"
                placeholder="Ex: Areia, moldes e ferramentas"
                required
                {...getFieldProps('conteudo')}
              />
            </div>

            {/* Descrição */}
            <div className="md:col-span-2">
              <ValidatedInput
                label="Descrição"
                name="descricao"
                placeholder="Ex: Informações adicionais sobre o item"
                {...getFieldProps('descricao')}
              />
            </div>

            {/* Quantidade */}
            <div>
              <ValidatedInput
                label="Quantidade"
                name="quantidade"
                type="number"
                min="1"
                placeholder="1"
                required
                {...getFieldProps('quantidade')}
              />
            </div>

            {/* Unidade */}
            <div>
              <label htmlFor="unidade" className="block text-sm font-medium text-gray-700 mb-1">
                Unidade *
              </label>
              <select
                id="unidade"
                name="unidade"
                value={values.unidade}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`input-field ${errors.unidade ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
              >
                <option value="">Selecione uma unidade</option>
                {ASSET_UNITS.map(unit => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              {touched.unidade && errors.unidade && (
                <p className="mt-1 text-sm text-red-600">{errors.unidade}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={values.status}
                onChange={handleChange}
                onBlur={handleBlur}
                className="input-field"
              >
                {ASSET_STATUSES.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Valor de Aquisição */}
            <div>
              <ValidatedInput
                label="Valor de Aquisição"
                name="valor_aquisicao"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...getFieldProps('valor_aquisicao')}
              />
            </div>

            {/* Data de Aquisição */}
            <div>
              <ValidatedInput
                label="Data de Aquisição"
                name="data_aquisicao"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                {...getFieldProps('data_aquisicao')}
              />
            </div>

            {/* Localização Atual */}
            <div>
              <ValidatedInput
                label="Localização Atual"
                name="localizacao_atual"
                placeholder="Ex: Sala 101, TI - Andar 2"
                {...getFieldProps('localizacao_atual')}
              />
            </div>

            {/* Responsável Atual */}
            <div>
              <ValidatedInput
                label="Responsável Atual"
                name="responsavel_atual"
                placeholder="Ex: João Silva"
                {...getFieldProps('responsavel_atual')}
              />
            </div>

            {/* Observações */}
            <div className="md:col-span-2">
              <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                id="observacoes"
                name="observacoes"
                value={values.observacoes}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={3}
                className={`input-field ${errors.observacoes ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                placeholder="Informações adicionais sobre o item..."
              />
              {touched.observacoes && errors.observacoes && (
                <p className="mt-1 text-sm text-red-600">{errors.observacoes}</p>
              )}
            </div>
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
              className="btn-primary flex items-center"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {isEditing ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetForm;