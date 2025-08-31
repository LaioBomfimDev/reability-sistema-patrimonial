// Application constants

export const ASSET_TYPES = [
  'Brinquedos em Caixa',
  'Brinquedos Soltos',
  'Escritório',
  'Decoração'
];

export const LOCATIONS = [
  'banheiro',
  'recepção',
  'cozinha',
  'almoxarifado',
  'Sala 1',
  'sala 2',
  'sala 3',
  'sala de brinquedo'
];

export const ASSET_UNITS = [
  'Caixa',
  'Kit',
  'Unidade',
  'Pacote',
  'Tubo',
  'Pote'
];

export const ASSET_STATUSES = [
  'Ativo',
  'em falta',
  'manutenção',
  'quebrado'
];

export const PAGINATION_LIMIT = 20;

export const TABLE_HEADERS = {
  ASSETS: [
    { key: 'codigo', label: 'Código' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'conteudo', label: 'Conteúdo' },
    { key: 'descricao', label: 'Descrição' },
    { key: 'quantidade', label: 'Qtd' },
    { key: 'unidade', label: 'Unidade' },
    { key: 'localizacao_atual', label: 'Localização' },
    { key: 'responsavel_atual', label: 'Responsável' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Ações' }
  ],
  MOVEMENTS: [
    { key: 'data_movimentacao', label: 'Data/Hora' },
    { key: 'localizacao_origem', label: 'Origem' },
    { key: 'localizacao_destino', label: 'Destino' },
    { key: 'responsavel_origem', label: 'Resp. Origem' },
    { key: 'responsavel_destino', label: 'Resp. Destino' },
    { key: 'observacoes', label: 'Observações' }
  ]
};

export const CSV_HEADERS = {
  ASSETS: [
    { key: 'codigo', label: 'Código' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'conteudo', label: 'Conteúdo' },
    { key: 'descricao', label: 'Descrição' },
    { key: 'quantidade', label: 'Quantidade' },
    { key: 'unidade', label: 'Unidade' },
    { key: 'valor_aquisicao', label: 'Valor de Aquisição' },
    { key: 'data_aquisicao', label: 'Data de Aquisição' },
    { key: 'localizacao_atual', label: 'Localização Atual' },
    { key: 'responsavel_atual', label: 'Responsável Atual' },
    { key: 'status', label: 'Status' },
    { key: 'observacoes', label: 'Observações' },
    { key: 'created_at', label: 'Data de Cadastro' }
  ],
  MOVEMENTS: [
    { key: 'bem_codigo', label: 'Código do Bem' },
    { key: 'bem_descricao', label: 'Descrição do Bem' },
    { key: 'data_movimentacao', label: 'Data/Hora da Movimentação' },
    { key: 'localizacao_origem', label: 'Localização de Origem' },
    { key: 'localizacao_destino', label: 'Localização de Destino' },
    { key: 'responsavel_origem', label: 'Responsável de Origem' },
    { key: 'responsavel_destino', label: 'Responsável de Destino' },
    { key: 'observacoes', label: 'Observações' }
  ],
  INVENTORY_BY_LOCATION: [
    { key: 'localizacao', label: 'Localização' },
    { key: 'quantidade', label: 'Quantidade' },
    { key: 'valor_total', label: 'Valor Total' }
  ],
  ASSETS_BY_RESPONSIBLE: [
    { key: 'responsavel', label: 'Responsável' },
    { key: 'quantidade', label: 'Quantidade' },
    { key: 'valor_total', label: 'Valor Total' }
  ],
  SUMMARY_BY_TYPE: [
    { key: 'tipo', label: 'Tipo' },
    { key: 'quantidade', label: 'Quantidade' },
    { key: 'valor_total', label: 'Valor Total' }
  ],
  ASSETS_BY_STATUS: [
    { key: 'status', label: 'Status' },
    { key: 'quantidade', label: 'Quantidade' },
    { key: 'valor_total', label: 'Valor Total' }
  ]
};

export const FORM_VALIDATION_RULES = {
  REQUIRED_FIELDS: ['tipo', 'conteudo', 'quantidade', 'unidade'],
  MAX_LENGTHS: {
    tipo: 100,
    conteudo: 255,
    descricao: 500,
    localizacao_atual: 255,
    responsavel_atual: 255,
    observacoes: 1000
  }
};

export const TOAST_MESSAGES = {
  SUCCESS: {
    ASSET_CREATED: 'Item de estoque cadastrado com sucesso!',
    ASSET_UPDATED: 'Item de estoque atualizado com sucesso!',
    ASSET_DELETED: 'Item de estoque excluído com sucesso!',
    MOVEMENT_CREATED: 'Movimentação registrada com sucesso!',
    CSV_EXPORTED: 'Relatório exportado com sucesso!'
  },
  ERROR: {
    GENERIC: 'Ocorreu um erro inesperado. Tente novamente.',
    LOAD_ASSETS: 'Erro ao carregar os itens de estoque.',
    SAVE_ASSET: 'Erro ao salvar o item de estoque.',
    DELETE_ASSET: 'Erro ao excluir o item de estoque.',
    LOAD_MOVEMENTS: 'Erro ao carregar as movimentações.',
    SAVE_MOVEMENT: 'Erro ao registrar a movimentação.',
    EXPORT_CSV: 'Erro ao exportar o relatório.',
    VALIDATION: 'Por favor, corrija os erros no formulário.',
    NETWORK: 'Erro de conexão. Verifique sua internet.'
  }
};

export const SEARCH_PLACEHOLDER = 'Buscar por código, tipo, conteúdo, descrição, localização ou responsável...';