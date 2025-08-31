-- Script para corrigir o problema da coluna 'categoria'
-- Execute este script no Supabase SQL Editor

-- 1. VERIFICAR E REMOVER COLUNA 'categoria' SE EXISTIR
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
            AND table_name = 'bens_patrimoniais' 
            AND column_name = 'categoria'
    ) THEN
        ALTER TABLE public.bens_patrimoniais DROP COLUMN categoria;
        RAISE NOTICE 'Coluna categoria removida com sucesso';
    ELSE
        RAISE NOTICE 'Coluna categoria não existe';
    END IF;
END $$;

-- 2. REMOVER GATILHOS EXISTENTES (se existirem)
DROP TRIGGER IF EXISTS update_bens_patrimoniais_updated_at ON public.bens_patrimoniais;
DROP TRIGGER IF EXISTS auto_generate_codigo_trigger ON public.bens_patrimoniais;

-- 3. REMOVER FUNÇÕES EXISTENTES (se existirem)
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS generate_patrimony_code();
DROP FUNCTION IF EXISTS auto_generate_codigo();

-- 4. GARANTIR QUE OS NOVOS CAMPOS EXISTAM
ALTER TABLE public.bens_patrimoniais 
ADD COLUMN IF NOT EXISTS tipo TEXT;

ALTER TABLE public.bens_patrimoniais 
ADD COLUMN IF NOT EXISTS conteudo TEXT;

ALTER TABLE public.bens_patrimoniais 
ADD COLUMN IF NOT EXISTS quantidade INTEGER DEFAULT 1;

ALTER TABLE public.bens_patrimoniais 
ADD COLUMN IF NOT EXISTS unidade TEXT;

-- 5. ATUALIZAR CONSTRAINTS
ALTER TABLE public.bens_patrimoniais 
DROP CONSTRAINT IF EXISTS bens_patrimoniais_tipo_check;

ALTER TABLE public.bens_patrimoniais 
ADD CONSTRAINT bens_patrimoniais_tipo_check 
CHECK (tipo IN (
    'Brinquedos em Caixa',
    'Brinquedos Soltos',
    'Escritório',
    'Decoração'
));

ALTER TABLE public.bens_patrimoniais 
DROP CONSTRAINT IF EXISTS bens_patrimoniais_unidade_check;

ALTER TABLE public.bens_patrimoniais 
ADD CONSTRAINT bens_patrimoniais_unidade_check 
CHECK (unidade IN (
    'Caixa',
    'Kit',
    'Unidade',
    'Pacote',
    'Tubo',
    'Pote'
));

-- 6. RECRIAR FUNÇÕES
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION generate_patrimony_code()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    max_number INTEGER;
    new_code TEXT;
BEGIN
    current_year := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Get the highest number for current year
    SELECT COALESCE(MAX(CAST(SUBSTRING(codigo FROM 5 FOR 4) AS INTEGER)), 0)
    INTO max_number
    FROM public.bens_patrimoniais 
    WHERE codigo LIKE current_year || '%';
    
    -- Generate new code
    new_code := current_year || LPAD((max_number + 1)::TEXT, 4, '0');
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auto_generate_codigo()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codigo IS NULL OR NEW.codigo = '' THEN
        NEW.codigo := generate_patrimony_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. RECRIAR GATILHOS
CREATE TRIGGER update_bens_patrimoniais_updated_at 
    BEFORE UPDATE ON public.bens_patrimoniais 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER auto_generate_codigo_trigger
    BEFORE INSERT ON public.bens_patrimoniais
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_codigo();

-- 8. LIMPAR DADOS ANTIGOS
DELETE FROM public.bens_patrimoniais;

-- 9. INSERIR DADOS DE TESTE PARA VERIFICAR SE FUNCIONA
INSERT INTO public.bens_patrimoniais (
    tipo, conteudo, descricao, quantidade, unidade, 
    localizacao_atual, responsavel_atual, status
) VALUES 
    ('Brinquedos em Caixa', 'Teste Areia Divertida', 'Areia, moldes e ferramentas', 1, 'Caixa', 'Sala de Brinquedos 1', 'Ana Terapia', 'Ativo');

-- 10. VERIFICAR SE A INSERÇÃO FUNCIONOU
SELECT 
    'Teste de inserção bem-sucedido' as resultado,
    COUNT(*) as registros_inseridos
FROM public.bens_patrimoniais;

-- 11. MOSTRAR ESTRUTURA FINAL DA TABELA
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'bens_patrimoniais'
ORDER BY ordinal_position;

-- Script concluído!