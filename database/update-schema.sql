-- Script de Atualização do Schema - Evita conflitos com objetos existentes
-- Execute este script no Supabase SQL Editor

-- 1. REMOVER GATILHOS EXISTENTES (se existirem)
DROP TRIGGER IF EXISTS update_bens_patrimoniais_updated_at ON public.bens_patrimoniais;
DROP TRIGGER IF EXISTS auto_generate_codigo_trigger ON public.bens_patrimoniais;

-- 2. REMOVER FUNÇÕES EXISTENTES (se existirem)
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS generate_patrimony_code();
DROP FUNCTION IF EXISTS auto_generate_codigo();

-- 3. ADICIONAR NOVOS CAMPOS (se não existirem)
ALTER TABLE public.bens_patrimoniais 
ADD COLUMN IF NOT EXISTS tipo TEXT;

ALTER TABLE public.bens_patrimoniais 
ADD COLUMN IF NOT EXISTS conteudo TEXT;

ALTER TABLE public.bens_patrimoniais 
ADD COLUMN IF NOT EXISTS quantidade INTEGER DEFAULT 1;

ALTER TABLE public.bens_patrimoniais 
ADD COLUMN IF NOT EXISTS unidade TEXT;

-- 4. ATUALIZAR CONSTRAINTS
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

-- 5. RECRIAR FUNÇÕES
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

-- 6. RECRIAR GATILHOS
CREATE TRIGGER update_bens_patrimoniais_updated_at 
    BEFORE UPDATE ON public.bens_patrimoniais 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER auto_generate_codigo_trigger
    BEFORE INSERT ON public.bens_patrimoniais
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_codigo();

-- 7. CRIAR ÍNDICES (se não existirem)
CREATE INDEX IF NOT EXISTS idx_bens_patrimoniais_tipo ON public.bens_patrimoniais(tipo);
CREATE INDEX IF NOT EXISTS idx_bens_patrimoniais_conteudo ON public.bens_patrimoniais(conteudo);
CREATE INDEX IF NOT EXISTS idx_bens_patrimoniais_unidade ON public.bens_patrimoniais(unidade);

-- 8. LIMPAR DADOS ANTIGOS
DELETE FROM public.bens_patrimoniais;

-- 9. INSERIR NOVOS DADOS
-- Brinquedos em Caixa
INSERT INTO public.bens_patrimoniais (
    tipo, conteudo, descricao, quantidade, unidade, 
    localizacao_atual, responsavel_atual, status
) VALUES 
    ('Brinquedos em Caixa', 'Areia Divertida', 'Areia, moldes e ferramentas', 1, 'Caixa', 'Sala de Brinquedos 1', 'Ana Terapia', 'Ativo'),
    ('Brinquedos em Caixa', 'Caiu Perdeu', '–', 1, 'Caixa', 'Sala de Brinquedos 1', 'Ana Terapia', 'Ativo'),
    ('Brinquedos em Caixa', 'Ball Game (Cai, Cai)', '–', 1, 'Caixa', 'Sala de Brinquedos 1', 'Ana Terapia', 'Ativo'),
    ('Brinquedos em Caixa', 'Pega Bolinhas Hipopótamo', '–', 1, 'Caixa', 'Sala de Brinquedos 1', 'Ana Terapia', 'Ativo'),
    ('Brinquedos em Caixa', 'Piscina de Bolinhas Liga da Justiça', 'Piscina e bolinhas', 1, 'Caixa', 'Sala de Brinquedos 1', 'Ana Terapia', 'Ativo'),
    ('Brinquedos em Caixa', 'Piano Tapete Musical', '–', 1, 'Caixa', 'Sala de Brinquedos 1', 'Ana Terapia', 'Ativo'),
    ('Brinquedos em Caixa', 'Centopeia Game', '–', 1, 'Caixa', 'Sala de Brinquedos 1', 'Ana Terapia', 'Ativo'),
    ('Brinquedos em Caixa', 'Magic Plate', '–', 1, 'Caixa', 'Sala de Brinquedos 1', 'Ana Terapia', 'Ativo'),
    ('Brinquedos em Caixa', 'Cuca Legal', '–', 1, 'Caixa', 'Sala de Brinquedos 1', 'Ana Terapia', 'Ativo'),
    ('Brinquedos em Caixa', 'Quem é Você', '–', 1, 'Caixa', 'Sala de Brinquedos 1', 'Ana Terapia', 'Ativo');

-- Brinquedos Soltos
INSERT INTO public.bens_patrimoniais (
    tipo, conteudo, descricao, quantidade, unidade, 
    localizacao_atual, responsavel_atual, status
) VALUES 
    ('Brinquedos Soltos', 'Montar Girafa', 'Girafa, chave de fenda, alicate, chave philips', 1, 'Kit', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Kit Montar', '64 peças: quadrados grandes e pequenos, círculos grandes e pequenos, estrela, triângulos, ferramentas', 1, 'Kit', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Blocos de Montar', '60 peças tipo Lego', 1, 'Caixa', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Kit Limpeza', 'Vassoura, pá, escova de limpeza', 1, 'Kit', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Avião Vai e Vem', '–', 2, 'Unidade', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Vai e Vem', '–', 1, 'Unidade', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Bola Educativa', 'Peças geométricas', 1, 'Unidade', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Placa MDF', 'Formas geométricas', 1, 'Unidade', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Polvo de Montar', 'Alfabeto', 1, 'Unidade', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Livro Quebra-Cabeça', '–', 1, 'Unidade', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Baralho Uno', '–', 1, 'Unidade', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Cesta de Frutas', 'Frutas, frutas com velcro, talheres', 1, 'Kit', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Areia Divertida', 'Moldes e ferramentas', 1, 'Kit', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Cubo Educativo', 'Peças geométricas', 1, 'Unidade', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Cubo Vogais', '–', 1, 'Unidade', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Combi de Encaixe', 'Letras e números', 1, 'Unidade', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Boliche', '6 pinos, 2 bolas', 1, 'Kit', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Boliche', '5 pinos, 2 bolas', 1, 'Kit', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Cubo Educativo', 'Coordenação motora', 1, 'Unidade', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Arco e Flechas', 'Arco, 3 flechas (Homem-Aranha)', 1, 'Kit', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Blocos de Montar', '48 peças tipo Lego', 1, 'Caixa', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Macaco no Galho', '–', 1, 'Unidade', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Kit Pesca', '16 peixes, 3 varas', 1, 'Kit', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Kit Massinha', '4 massinhas, 4 moldes, 1 rolo, 1 faca', 1, 'Kit', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Material Dourado', '62 peças', 1, 'Kit', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Quebra-Cabeça', 'Pirata', 1, 'Unidade', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Quebra-Cabeça', 'Porco', 1, 'Unidade', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Kit Bolhas de Sabão', '12 frascos', 1, 'Kit', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Quebra-Cabeça', 'Porco Chef', 1, 'Unidade', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Quebra-Cabeça', 'Música', 1, 'Unidade', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Pega Vareta', '–', 2, 'Unidade', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Kit Coordenação', '5 ferramentas, 5 bolinhas', 1, 'Kit', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Dominó', '–', 2, 'Unidade', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Brinquedo Causa e Efeito', 'Ratinho e martelo', 1, 'Unidade', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Cubo Educativo', 'Grande', 1, 'Unidade', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Piscina de Bolinhas', 'Bolinhas e piscina', 1, 'Caixa', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo'),
    ('Brinquedos Soltos', 'Quadro Pequeno', 'Letras EVA, lousa', 1, 'Unidade', 'Sala de Brinquedos 2', 'Maria Psicóloga', 'Ativo');

-- Escritório
INSERT INTO public.bens_patrimoniais (
    tipo, conteudo, descricao, quantidade, unidade, 
    localizacao_atual, responsavel_atual, status
) VALUES 
    ('Escritório', 'Extrator de Grampo', '–', 12, 'Unidade', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Lápis Jumbo', '–', 36, 'Kit', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Giz de Cera', '12 cores cada', 6, 'Caixa', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Pilhas', '–', 4, 'Unidade', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Pranchetas', '–', 3, 'Unidade', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Cola Branca', '–', 12, 'Unidade', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Corretivo', '–', 12, 'Unidade', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Durex', 'Grande', 5, 'Unidade', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Papel Fotográfico', 'Auto-adesivo, 20 folhas', 1, 'Pacote', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Papel Colorido', '100 folhas', 5, 'Pacote', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Cola Branca', '–', 1, 'Unidade', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Pasta Sanfona', 'Amarela', 1, 'Unidade', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Classificadores', 'Brancos', 10, 'Unidade', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Cola Branca', '–', 1, 'Pacote', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Papel Duro', '50 folhas', 1, 'Pacote', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Cartolina', '20 unidades', 1, 'Pacote', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Sulfite', '25 folhas', 1, 'Pacote', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Réguas', 'Azul, verde e vermelho (25 unidades)', 1, 'Pacote', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Borrachas Ponteiras', '48 unidades', 1, 'Pote', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Post-it', '320 unidades neon', 1, 'Pacote', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Lápis Normal', '144 unidades', 1, 'Caixa', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Grampos', '5000 unidades', 5, 'Caixa', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Papel Ofício', '500 folhas', 5, 'Pacote', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Apontadores', '12 unidades', 1, 'Caixa', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Tinta Guache', '12 cores cada (6 unidades)', 12, 'Caixa', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Cola Bastão', '–', 12, 'Tubo', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Estiletes', '12 unidades', 1, 'Caixa', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Máscaras', '50 unidades', 2, 'Caixa', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Massinha Soft', '6 unidades cada', 12, 'Caixa', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Lápis de Cor', '12 cores cada', 6, 'Caixa', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Hidrocor', '12 cores cada', 5, 'Caixa', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Caneta Azul', '50 unidades', 1, 'Caixa', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Caneta Preta', '50 unidades', 1, 'Caixa', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Pincéis Finos', '12 unidades', 2, 'Pacote', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Aquarela', '12 cores, pincel', 2, 'Unidade', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Clipes', '50 unidades', 20, 'Caixa', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Tesouras sem ponta', '12 unidades', 1, 'Caixa', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Estilete de Precisão', '2 lâminas', 1, 'Unidade', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Tesoura com Textura', '–', 1, 'Unidade', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Tintas de Rosto', '5 tintas', 2, 'Pacote', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Grampeador', '500 grampos', 1, 'Unidade', 'Almoxarifado', 'João Administrador', 'Ativo'),
    ('Escritório', 'Giz Gigante', '6 unidades', 3, 'Pacote', 'Almoxarifado', 'João Administrador', 'Ativo');

-- Decoração
INSERT INTO public.bens_patrimoniais (
    tipo, conteudo, descricao, quantidade, unidade, 
    localizacao_atual, responsavel_atual, status
) VALUES 
    ('Decoração', 'Relógio de Parede', 'Pequeno', 2, 'Unidade', 'Recepção', 'Lucia Decoradora', 'Ativo'),
    ('Decoração', 'Relógio de Parede', 'Grande', 1, 'Unidade', 'Sala Principal', 'Lucia Decoradora', 'Ativo'),
    ('Decoração', 'Tatame', '–', 13, 'Unidade', 'Sala de Atividades', 'Pedro Fisio', 'Ativo'),
    ('Decoração', 'Cadeira', 'Salas', 3, 'Unidade', 'Salas de Atendimento', 'Ana Costa', 'Ativo'),
    ('Decoração', 'Cadeira', 'Recepção', 1, 'Unidade', 'Recepção', 'Lucia Decoradora', 'Ativo'),
    ('Decoração', 'Mesas', '–', 3, 'Unidade', 'Salas de Atendimento', 'Ana Costa', 'Ativo'),
    ('Decoração', 'Poltronas', 'Recepção', 3, 'Unidade', 'Recepção', 'Lucia Decoradora', 'Ativo');

-- 10. VERIFICAÇÃO FINAL
SELECT 
    'Total de registros inseridos:' as info,
    COUNT(*) as quantidade
FROM public.bens_patrimoniais;

SELECT 
    'Registros por tipo:' as info,
    tipo,
    COUNT(*) as quantidade
FROM public.bens_patrimoniais
GROUP BY tipo
ORDER BY tipo;

-- Script concluído com sucesso!