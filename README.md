# Reability - Sistema de Gestão Patrimonial

Um sistema web completo para gestão patrimonial construído com React + Vite, com autenticação restrita e interface moderna.

## 🚀 Funcionalidades

### ✅ Gestão Patrimonial
- ✅ Cadastro e edição de bens com código auto-gerado (formato YYYY0001)
- ✅ Categorização por tipo (Equipamentos, Móveis, Tecnologia, etc.)
- ✅ Controle de status (Ativo, Em Falta, Manutenção, Quebrado)
- ✅ Busca inteligente por código, descrição, categoria, localização ou responsável
- ✅ Filtros avançados por categoria, status e localização
- ✅ Cálculos de custo total e unitário
- ✅ Paginação (20 itens por página)

### ✅ Movimentação de Bens
- ✅ Transferência entre localizações e responsáveis
- ✅ Histórico completo de movimentações
- ✅ Validações de origem e destino diferentes

### 🔐 Autenticação e Segurança
- ✅ Acesso restrito a usuários autorizados
- ✅ Sistema de login seguro
- ✅ Controle de permissões
- ✅ Validação de entrada e sanitização

### ✅ Relatórios e Exportação
- ✅ Inventário por localização
- ✅ Bens por responsável
- ✅ Resumo por categoria
- ✅ Bens por status
- ✅ Exportação CSV, Excel e JSON
- ✅ Dashboard com estatísticas e totais
- ✅ Filtros de custo por categoria

### ✅ Interface Responsiva
- ✅ Design limpo e profissional com Tailwind CSS
- ✅ Totalmente responsivo (desktop, tablet, mobile)
- ✅ Loading states e feedback visual
- ✅ Notificações toast para ações
- ✅ Modais de confirmação

## 🛠️ Tecnologias

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Autenticação**: Sistema próprio com validação
- **Icons**: Lucide React
- **Forms**: Validação customizada
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM
- **Exportação**: SheetJS (Excel), CSV nativo
- **Animações**: Framer Motion (preparado)

## 📋 Pré-requisitos

- Node.js 16+
- npm ou yarn
- Git

## ⚙️ Configuração

### 1. Clone o Repositório
```bash
git clone <url-do-repo>
cd patrireabi
```

### 2. Instale as Dependências
```bash
npm install
```

### 3. Configure o Supabase

#### 3.1 Crie um projeto no [Supabase](https://supabase.com)

#### 3.2 Configure as variáveis de ambiente
Renomeie `.env.example` para `.env` e configure:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

#### 3.3 Execute o schema SQL
No painel do Supabase, vá em SQL Editor e execute o arquivo `database/schema.sql`:

```sql
-- O arquivo contém:
-- ✅ Criação das tabelas bens_patrimoniais e movimentacoes
-- ✅ Triggers para auto-geração de códigos
-- ✅ Triggers para updated_at automático
-- ✅ Políticas RLS para acesso público (desenvolvimento)
-- ✅ Índices para performance
-- ✅ Dados de exemplo
```

### 4. Execute o Projeto
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 📊 Estrutura do Banco

### Tabela: `bens_patrimoniais`
```sql
- id: uuid (PK, auto)
- codigo: text (único, formato YYYY0001)
- descricao: text (obrigatório)
- categoria: text (obrigatório)
- valor_aquisicao: decimal
- data_aquisicao: date
- localizacao_atual: text
- responsavel_atual: text
- status: text (Ativo, Inativo, Em Manutenção)
- observacoes: text
- created_at: timestamp
- updated_at: timestamp
```

### Tabela: `movimentacoes`
```sql
- id: uuid (PK, auto)
- bem_id: uuid (FK)
- localizacao_origem: text
- localizacao_destino: text
- responsavel_origem: text
- responsavel_destino: text
- data_movimentacao: timestamp
- observacoes: text
- created_at: timestamp
```

## 🎯 Como Usar

### 1. Cadastrar Bem
1. Clique em "Novo Bem"
2. Preencha descrição e categoria (obrigatórios)
3. Adicione valor, data, localização e responsável (opcionais)
4. Salve - o código será gerado automaticamente

### 2. Buscar e Filtrar
- Use a barra de busca para encontrar por qualquer campo
- Aplique filtros por categoria, status ou localização
- Use a paginação para navegar pelos resultados

### 3. Movimentar Bem
1. Clique no ícone de transferência (↔️) na linha do bem
2. Defina nova localização e responsável
3. Adicione observações se necessário
4. Confirme a transferência

### 4. Ver Histórico
- Clique no ícone de histórico (🕒) para ver todas as movimentações

### 5. Gerar Relatórios
1. Acesse a página "Relatórios"
2. Navegue pelas abas disponíveis
3. Clique em "Exportar CSV" para baixar dados

## 🔒 Segurança

⚠️ **IMPORTANTE**: O projeto está configurado com RLS (Row Level Security) habilitado com acesso público para demonstração. 

**Para produção, você deve**:
1. Implementar autenticação de usuários
2. Configurar políticas RLS adequadas
3. Remover as políticas de acesso público
4. Configurar variáveis de ambiente seguras

## 📱 Responsividade

- **Desktop**: Tabela completa com todas as colunas
- **Tablet**: Tabela adaptada com scroll horizontal
- **Mobile**: Cards em vez de tabela, menu lateral para filtros

## 🎨 Personalização

### Cores
O sistema usa a cor azul como primária. Para alterar, modifique o arquivo `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: {
        // Suas cores personalizadas
      }
    }
  }
}
```

### Categorias
Para adicionar/modificar categorias, edite o arquivo `src/utils/constants.js`:

```js
export const ASSET_CATEGORIES = [
  'Sua Nova Categoria',
  // ... outras categorias
];
```

## 🐛 Solução de Problemas

### Erro de Conexão com Supabase
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o projeto Supabase está ativo
- Verifique se as políticas RLS estão configuradas

### Dados não Aparecem
- Execute o schema SQL no painel do Supabase
- Verifique se as tabelas foram criadas corretamente
- Teste a conexão no console do navegador

### Problemas de Performance
- Verifique se os índices foram criados
- Considere implementar paginação server-side para grandes volumes

## 📈 Próximos Passos

- [ ] Autenticação de usuários
- [ ] Controle de permissões por papel
- [ ] Upload de imagens dos bens
- [ ] QR Codes para bens
- [ ] API para integração externa
- [ ] Relatórios gráficos com charts
- [ ] Notificações automáticas
- [ ] Backup automatizado

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação
2. Consulte os issues no GitHub
3. Abra um novo issue descrevendo o problema

---

**Desenvolvido com ❤️ usando React + Supabase**