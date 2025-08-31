-- Asset Management System - Quick Setup Script
-- Execute this in your Supabase SQL Editor: https://lynyhnqoyfuiiofcurig.supabase.co/project/sql

-- Create bens_patrimoniais table
CREATE TABLE IF NOT EXISTS public.bens_patrimoniais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo TEXT UNIQUE NOT NULL,
    descricao TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN (
        'Móveis e Utensílios',
        'Equipamentos de Informática',
        'Veículos',
        'Máquinas e Equipamentos',
        'Instalações',
        'Outros'
    )),
    valor_aquisicao DECIMAL(12,2),
    data_aquisicao DATE,
    localizacao_atual TEXT,
    responsavel_atual TEXT,
    status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo', 'Em Manutenção')),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create movimentacoes table
CREATE TABLE IF NOT EXISTS public.movimentacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bem_id UUID NOT NULL REFERENCES public.bens_patrimoniais(id) ON DELETE CASCADE,
    localizacao_origem TEXT,
    localizacao_destino TEXT NOT NULL,
    responsavel_origem TEXT,
    responsavel_destino TEXT NOT NULL,
    data_movimentacao TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at on bens_patrimoniais
DROP TRIGGER IF EXISTS update_bens_patrimoniais_updated_at ON public.bens_patrimoniais;
CREATE TRIGGER update_bens_patrimoniais_updated_at 
    BEFORE UPDATE ON public.bens_patrimoniais 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate patrimony code
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

-- Create trigger function to auto-generate codigo
CREATE OR REPLACE FUNCTION auto_generate_codigo()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codigo IS NULL OR NEW.codigo = '' THEN
        NEW.codigo := generate_patrimony_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating codigo
DROP TRIGGER IF EXISTS auto_generate_codigo_trigger ON public.bens_patrimoniais;
CREATE TRIGGER auto_generate_codigo_trigger
    BEFORE INSERT ON public.bens_patrimoniais
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_codigo();

-- Enable RLS (Row Level Security)
ALTER TABLE public.bens_patrimoniais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacoes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (development/demo purposes)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.bens_patrimoniais;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.bens_patrimoniais;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.bens_patrimoniais;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.bens_patrimoniais;

CREATE POLICY "Enable read access for all users" ON public.bens_patrimoniais
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.bens_patrimoniais
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.bens_patrimoniais
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON public.bens_patrimoniais
    FOR DELETE USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.movimentacoes;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.movimentacoes;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.movimentacoes;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.movimentacoes;

CREATE POLICY "Enable read access for all users" ON public.movimentacoes
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.movimentacoes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.movimentacoes
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON public.movimentacoes
    FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bens_patrimoniais_codigo ON public.bens_patrimoniais(codigo);
CREATE INDEX IF NOT EXISTS idx_bens_patrimoniais_categoria ON public.bens_patrimoniais(categoria);
CREATE INDEX IF NOT EXISTS idx_bens_patrimoniais_status ON public.bens_patrimoniais(status);
CREATE INDEX IF NOT EXISTS idx_bens_patrimoniais_localizacao ON public.bens_patrimoniais(localizacao_atual);
CREATE INDEX IF NOT EXISTS idx_bens_patrimoniais_responsavel ON public.bens_patrimoniais(responsavel_atual);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_bem_id ON public.movimentacoes(bem_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data ON public.movimentacoes(data_movimentacao);

-- Insert sample data for demonstration
INSERT INTO public.bens_patrimoniais (
    descricao, categoria, valor_aquisicao, data_aquisicao, 
    localizacao_atual, responsavel_atual, status, observacoes
) VALUES 
    ('Mesa de Escritório Executiva', 'Móveis e Utensílios', 450.00, '2024-01-15', 'Sala 101', 'João Silva', 'Ativo', 'Mesa executiva em madeira'),
    ('Notebook Dell Inspiron 15', 'Equipamentos de Informática', 2500.00, '2024-02-20', 'TI - Sala 205', 'Maria Santos', 'Ativo', 'Intel i5, 8GB RAM, 256GB SSD'),
    ('Cadeira Ergonômica Presidente', 'Móveis e Utensílios', 320.00, '2024-01-15', 'Sala 101', 'João Silva', 'Ativo', 'Cadeira presidente com apoio lombar'),
    ('Impressora HP LaserJet Pro', 'Equipamentos de Informática', 800.00, '2024-03-10', 'Recepção', 'Ana Costa', 'Ativo', 'Impressora laser monocromática'),
    ('Ar Condicionado Split 12000 BTUs', 'Instalações', 1200.00, '2024-01-05', 'Sala 102', 'Pedro Oliveira', 'Em Manutenção', 'Necessita limpeza do filtro'),
    ('Monitor Samsung 24" Full HD', 'Equipamentos de Informática', 600.00, '2024-02-25', 'TI - Sala 205', 'Carlos Mendes', 'Ativo', 'Monitor Full HD LED'),
    ('Arquivo de Aço 4 Gavetas', 'Móveis e Utensílios', 280.00, '2024-01-10', 'Arquivo Morto', 'Lucia Ferreira', 'Ativo', 'Arquivo 4 gavetas cor cinza'),
    ('Telefone IP Cisco', 'Equipamentos de Informática', 150.00, '2024-02-15', 'Sala 103', 'Roberto Lima', 'Ativo', 'Telefone VoIP Cisco'),
    ('Projetor Epson 3000 Lumens', 'Equipamentos de Informática', 1800.00, '2024-03-01', 'Sala de Reuniões', 'Fernanda Rocha', 'Ativo', 'Projetor 3000 lumens'),
    ('Mesa de Reunião Oval', 'Móveis e Utensílios', 950.00, '2024-01-20', 'Sala de Reuniões', 'Fernanda Rocha', 'Ativo', 'Mesa oval para 8 pessoas')
ON CONFLICT (codigo) DO NOTHING;

-- Confirmation message
SELECT 'Database setup completed successfully! Your asset management system is ready to use.' as message;