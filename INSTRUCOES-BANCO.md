# 🎯 INSTRUÇÕES PARA ATUALIZAR O BANCO SUPABASE

## ⚠️ PROBLEMA IDENTIFICADO
O erro indica que existe uma coluna 'categoria' na tabela que não deveria existir, causando conflito com a nova estrutura.

**Erro específico:** `null value in column "categoria" violates not-null constraint`

## 📋 PASSO A PASSO ATUALIZADO

### 1️⃣ ACESSE O SUPABASE
- Vá para [supabase.com](https://supabase.com)
- Faça login na sua conta
- Selecione seu projeto
- Clique em **"SQL Editor"** no menu lateral

### 2️⃣ EXECUTE O SCRIPT DE CORREÇÃO
- Abra o arquivo `database/fix-categoria-issue.sql`
- **COPIE TODO O CONTEÚDO** do arquivo
- **COLE** no SQL Editor do Supabase
- Clique em **"RUN"** (botão verde)

### 3️⃣ VERIFIQUE O RESULTADO
Após executar, você deve ver:
```
Teste de inserção bem-sucedido: 1 registro
```

E a estrutura da tabela corrigida sem a coluna 'categoria'.

### 4️⃣ INSERIR TODOS OS DADOS
Se o teste funcionou, execute o script `database/update-schema.sql` para inserir todos os 92 registros.

### 5️⃣ TESTE NO SISTEMA
- Volte para o sistema (http://localhost:3001)
- Atualize a página (F5)
- Verifique se os 92 itens aparecem na listagem

## 🔧 O QUE O SCRIPT FAZ

✅ **Remove gatilhos existentes** (evita erro de duplicação)
✅ **Remove funções antigas** (limpa conflitos)
✅ **Adiciona novos campos** (tipo, conteudo, quantidade, unidade)
✅ **Atualiza constraints** (validações)
✅ **Recria funções e gatilhos** (funcionalidades)
✅ **Limpa dados antigos** (remove registros obsoletos)
✅ **Insere 92 novos registros** (dados completos)
✅ **Verifica resultado** (contagem final)

## 🚨 SE DER ERRO

### Erro de Permissão:
```sql
-- Execute este comando primeiro:
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
```

### Erro de RLS (Row Level Security):
```sql
-- Execute para desabilitar temporariamente:
ALTER TABLE public.bens_patrimoniais DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacoes DISABLE ROW LEVEL SECURITY;
```

### Erro de Schema:
```sql
-- Verifique se a tabela existe:
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

## ✅ SOLUÇÃO FINAL

### ✨ ESTRUTURA CONFIRMADA!
A estrutura da tabela `bens_patrimoniais` está CORRETA! ✅

### 🚀 INSERIR TODOS OS DADOS
Execute o arquivo `database/insert-all-data.sql` no Supabase SQL Editor.

Este script irá:
- Limpar dados existentes
- Inserir todos os 92 registros:
  - 10 Brinquedos em Caixa
  - 36 Brinquedos Soltos  
  - 39 Itens de Escritório
  - 7 Itens de Decoração

### 🏢 LOCALIZAÇÕES ATUALIZADAS
O sistema agora inclui as seguintes localizações:
- **banheiro**
- **recepção** 
- **cozinha**
- **almoxarifado**
- **Sala 1**
- **sala 2**
- **sala 3**
- **sala de brinquedo**

### 🔍 VERIFICAÇÃO
Após executar, você verá:
```
status: INSERÇÃO COMPLETA!
total_registros: 92
```

### 🎯 RESULTADO ESPERADO
O sistema carregará automaticamente os 92 itens no frontend com as novas localizações!

## ✅ CONFIRMAÇÃO FINAL

Após executar com sucesso:
1. **92 registros** devem estar inseridos
2. **Sistema carrega** sem erros
3. **Novos campos** aparecem no formulário
4. **Filtros por tipo** funcionam
5. **Relatórios** incluem novos dados

## 📞 SUPORTE

Se ainda houver problemas:
1. Copie a mensagem de erro completa
2. Informe qual passo deu erro
3. Verifique se está usando o arquivo `update-schema.sql` (não o `schema.sql`)

---

**🎉 Após executar este script, seu sistema estará 100% funcional com todos os 92 itens carregados!**