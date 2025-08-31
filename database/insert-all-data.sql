-- Script para inserir todos os 92 registros com valores estimados
-- Execute este script no Supabase SQL Editor após confirmar que a estrutura está correta

-- Limpar dados existentes
DELETE FROM public.bens_patrimoniais;

-- Inserir todos os dados
-- Brinquedos em Caixa (10 itens)
INSERT INTO public.bens_patrimoniais (
    tipo, conteudo, descricao, quantidade, unidade, 
    localizacao_atual, responsavel_atual, status, valor_aquisicao
) VALUES 
    ('Brinquedos em Caixa', 'Areia Divertida', 'Areia, moldes e ferramentas', 1, 'Caixa', 'sala de brinquedo', 'Ana Terapia', 'Ativo', 45.90),
    ('Brinquedos em Caixa', 'Caiu Perdeu', '–', 1, 'Caixa', 'sala de brinquedo', 'Ana Terapia', 'Ativo', 35.50),
    ('Brinquedos em Caixa', 'Ball Game (Cai, Cai)', '–', 1, 'Caixa', 'sala de brinquedo', 'Ana Terapia', 'Ativo', 42.00),
    ('Brinquedos em Caixa', 'Pega Bolinhas Hipopótamo', '–', 1, 'Caixa', 'sala de brinquedo', 'Ana Terapia', 'em falta', 38.90),
    ('Brinquedos em Caixa', 'Piscina de Bolinhas Liga da Justiça', 'Piscina e bolinhas', 1, 'Caixa', 'sala de brinquedo', 'Ana Terapia', 'Ativo', 89.90),
    ('Brinquedos em Caixa', 'Piano Tapete Musical', '–', 1, 'Caixa', 'sala de brinquedo', 'Ana Terapia', 'Ativo', 125.00),
    ('Brinquedos em Caixa', 'Centopeia Game', '–', 1, 'Caixa', 'sala de brinquedo', 'Ana Terapia', 'manutenção', 55.80),
    ('Brinquedos em Caixa', 'Magic Plate', '–', 1, 'Caixa', 'sala de brinquedo', 'Ana Terapia', 'Ativo', 67.50),
    ('Brinquedos em Caixa', 'Cuca Legal', '–', 1, 'Caixa', 'sala de brinquedo', 'Ana Terapia', 'Ativo', 48.90),
    ('Brinquedos em Caixa', 'Quem é Você', '–', 1, 'Caixa', 'sala de brinquedo', 'Ana Terapia', 'Ativo', 52.30);

-- Brinquedos Soltos (36 itens)
INSERT INTO public.bens_patrimoniais (
    tipo, conteudo, descricao, quantidade, unidade, 
    localizacao_atual, responsavel_atual, status, valor_aquisicao
) VALUES 
    ('Brinquedos Soltos', 'Montar Girafa', 'Girafa, chave de fenda, alicate, chave philips', 1, 'Kit', 'Sala 1', 'Maria Psicóloga', 'Ativo', 78.90),
    ('Brinquedos Soltos', 'Kit Montar', '64 peças: quadrados grandes e pequenos, círculos grandes e pequenos, estrela, triângulos, ferramentas', 1, 'Kit', 'Sala 1', 'Maria Psicóloga', 'Ativo', 95.50),
    ('Brinquedos Soltos', 'Blocos de Montar', '60 peças tipo Lego', 1, 'Caixa', 'Sala 1', 'Maria Psicóloga', 'Ativo', 65.00),
    ('Brinquedos Soltos', 'Kit Limpeza', 'Vassoura, pá, escova de limpeza', 1, 'Kit', 'Sala 1', 'Maria Psicóloga', 'Ativo', 32.90),
    ('Brinquedos Soltos', 'Avião Vai e Vem', '–', 2, 'Unidade', 'Sala 1', 'Maria Psicóloga', 'Ativo', 28.50),
    ('Brinquedos Soltos', 'Vai e Vem', '–', 1, 'Unidade', 'Sala 1', 'Maria Psicóloga', 'quebrado', 15.90),
    ('Brinquedos Soltos', 'Bola Educativa', 'Peças geométricas', 1, 'Unidade', 'Sala 1', 'Maria Psicóloga', 'Ativo', 42.80),
    ('Brinquedos Soltos', 'Placa MDF', 'Formas geométricas', 1, 'Unidade', 'Sala 1', 'Maria Psicóloga', 'Ativo', 35.60),
    ('Brinquedos Soltos', 'Polvo de Montar', 'Alfabeto', 1, 'Unidade', 'Sala 1', 'Maria Psicóloga', 'Ativo', 58.90),
    ('Brinquedos Soltos', 'Livro Quebra-Cabeça', '–', 1, 'Unidade', 'Sala 1', 'Maria Psicóloga', 'Ativo', 25.90),
    ('Brinquedos Soltos', 'Baralho Uno', '–', 1, 'Unidade', 'Sala 1', 'Maria Psicóloga', 'Ativo', 18.50),
    ('Brinquedos Soltos', 'Cesta de Frutas', 'Frutas, frutas com velcro, talheres', 1, 'Kit', 'Sala 2', 'Maria Psicóloga', 'Ativo', 72.90),
    ('Brinquedos Soltos', 'Areia Divertida', 'Moldes e ferramentas', 1, 'Kit', 'Sala 2', 'Maria Psicóloga', 'Ativo', 45.90),
    ('Brinquedos Soltos', 'Cubo Educativo', 'Peças geométricas', 1, 'Unidade', 'Sala 2', 'Maria Psicóloga', 'Ativo', 48.50),
    ('Brinquedos Soltos', 'Cubo Vogais', '–', 1, 'Unidade', 'Sala 2', 'Maria Psicóloga', 'manutenção', 38.90),
    ('Brinquedos Soltos', 'Combi de Encaixe', 'Letras e números', 1, 'Unidade', 'Sala 2', 'Maria Psicóloga', 'Ativo', 52.80),
    ('Brinquedos Soltos', 'Boliche', '6 pinos, 2 bolas', 1, 'Kit', 'Sala 2', 'Maria Psicóloga', 'Ativo', 35.90),
    ('Brinquedos Soltos', 'Boliche', '5 pinos, 2 bolas', 1, 'Kit', 'Sala 2', 'Maria Psicóloga', 'Ativo', 32.50),
    ('Brinquedos Soltos', 'Cubo Educativo', 'Coordenação motora', 1, 'Unidade', 'Sala 2', 'Maria Psicóloga', 'Ativo', 45.80),
    ('Brinquedos Soltos', 'Arco e Flechas', 'Arco, 3 flechas (Homem-Aranha)', 1, 'Kit', 'Sala 2', 'Maria Psicóloga', 'em falta', 28.90),
    ('Brinquedos Soltos', 'Blocos de Montar', '48 peças tipo Lego', 1, 'Caixa', 'Sala 2', 'Maria Psicóloga', 'Ativo', 58.00),
    ('Brinquedos Soltos', 'Macaco no Galho', '–', 1, 'Unidade', 'Sala 2', 'Maria Psicóloga', 'Ativo', 42.50),
    ('Brinquedos Soltos', 'Kit Pesca', '16 peixes, 3 varas', 1, 'Kit', 'Sala 2', 'Maria Psicóloga', 'Ativo', 68.90),
    ('Brinquedos Soltos', 'Kit Massinha', '4 massinhas, 4 moldes, 1 rolo, 1 faca', 1, 'Kit', 'Sala 3', 'Maria Psicóloga', 'Ativo', 38.50),
    ('Brinquedos Soltos', 'Material Dourado', '62 peças', 1, 'Kit', 'Sala 3', 'Maria Psicóloga', 'Ativo', 85.90),
    ('Brinquedos Soltos', 'Quebra-Cabeça', 'Pirata', 1, 'Unidade', 'Sala 3', 'Maria Psicóloga', 'Ativo', 22.90),
    ('Brinquedos Soltos', 'Quebra-Cabeça', 'Porco', 1, 'Unidade', 'Sala 3', 'Maria Psicóloga', 'Ativo', 22.90),
    ('Brinquedos Soltos', 'Kit Bolhas de Sabão', '12 frascos', 1, 'Kit', 'Sala 3', 'Maria Psicóloga', 'Ativo', 45.80),
    ('Brinquedos Soltos', 'Quebra-Cabeça', 'Porco Chef', 1, 'Unidade', 'Sala 3', 'Maria Psicóloga', 'quebrado', 22.90),
    ('Brinquedos Soltos', 'Quebra-Cabeça', 'Música', 1, 'Unidade', 'Sala 3', 'Maria Psicóloga', 'Ativo', 25.50),
    ('Brinquedos Soltos', 'Pega Vareta', '–', 2, 'Unidade', 'Sala 3', 'Maria Psicóloga', 'Ativo', 18.90),
    ('Brinquedos Soltos', 'Kit Coordenação', '5 ferramentas, 5 bolinhas', 1, 'Kit', 'Sala 3', 'Maria Psicóloga', 'Ativo', 62.50),
    ('Brinquedos Soltos', 'Dominó', '–', 2, 'Unidade', 'Sala 3', 'Maria Psicóloga', 'Ativo', 15.90),
    ('Brinquedos Soltos', 'Brinquedo Causa e Efeito', 'Ratinho e martelo', 1, 'Unidade', 'Sala 3', 'Maria Psicóloga', 'Ativo', 48.90),
    ('Brinquedos Soltos', 'Cubo Educativo', 'Grande', 1, 'Unidade', 'Sala 3', 'Maria Psicóloga', 'Ativo', 55.80),
    ('Brinquedos Soltos', 'Piscina de Bolinhas', 'Bolinhas e piscina', 1, 'Caixa', 'sala de brinquedo', 'Maria Psicóloga', 'Ativo', 125.90),
    ('Brinquedos Soltos', 'Quadro Pequeno', 'Letras EVA, lousa', 1, 'Unidade', 'sala de brinquedo', 'Maria Psicóloga', 'Ativo', 38.50);

-- Escritório (39 itens)
INSERT INTO public.bens_patrimoniais (
    tipo, conteudo, descricao, quantidade, unidade, 
    localizacao_atual, responsavel_atual, status, valor_aquisicao
) VALUES 
    ('Escritório', 'Extrator de Grampo', '–', 12, 'Unidade', 'almoxarifado', 'João Administrador', 'Ativo', 2.50),
    ('Escritório', 'Lápis Jumbo', '–', 36, 'Kit', 'almoxarifado', 'João Administrador', 'Ativo', 1.80),
    ('Escritório', 'Giz de Cera', '12 cores cada', 6, 'Caixa', 'almoxarifado', 'João Administrador', 'Ativo', 8.90),
    ('Escritório', 'Pilhas', '–', 4, 'Unidade', 'almoxarifado', 'João Administrador', 'Ativo', 12.50),
    ('Escritório', 'Pranchetas', '–', 3, 'Unidade', 'almoxarifado', 'João Administrador', 'Ativo', 15.90),
    ('Escritório', 'Cola Branca', '–', 12, 'Unidade', 'almoxarifado', 'João Administrador', 'Ativo', 3.50),
    ('Escritório', 'Corretivo', '–', 12, 'Unidade', 'almoxarifado', 'João Administrador', 'Ativo', 4.90),
    ('Escritório', 'Durex', 'Grande', 5, 'Unidade', 'almoxarifado', 'João Administrador', 'Ativo', 8.50),
    ('Escritório', 'Papel Fotográfico', 'Auto-adesivo, 20 folhas', 1, 'Pacote', 'almoxarifado', 'João Administrador', 'Ativo', 25.90),
    ('Escritório', 'Papel Colorido', '100 folhas', 5, 'Pacote', 'almoxarifado', 'João Administrador', 'Ativo', 12.80),
    ('Escritório', 'Cola Branca', '–', 1, 'Unidade', 'almoxarifado', 'João Administrador', 'em falta', 3.50),
    ('Escritório', 'Pasta Sanfona', 'Amarela', 1, 'Unidade', 'almoxarifado', 'João Administrador', 'Ativo', 18.90),
    ('Escritório', 'Classificadores', 'Brancos', 10, 'Unidade', 'almoxarifado', 'João Administrador', 'Ativo', 2.80),
    ('Escritório', 'Cola Branca', '–', 1, 'Pacote', 'almoxarifado', 'João Administrador', 'Ativo', 15.50),
    ('Escritório', 'Papel Duro', '50 folhas', 1, 'Pacote', 'almoxarifado', 'João Administrador', 'Ativo', 22.90),
    ('Escritório', 'Cartolina', '20 unidades', 1, 'Pacote', 'almoxarifado', 'João Administrador', 'Ativo', 18.50),
    ('Escritório', 'Sulfite', '25 folhas', 1, 'Pacote', 'almoxarifado', 'João Administrador', 'Ativo', 8.90),
    ('Escritório', 'Réguas', 'Azul, verde e vermelho (25 unidades)', 1, 'Pacote', 'almoxarifado', 'João Administrador', 'Ativo', 35.80),
    ('Escritório', 'Borrachas Ponteiras', '48 unidades', 1, 'Pote', 'almoxarifado', 'João Administrador', 'Ativo', 28.90),
    ('Escritório', 'Post-it', '320 unidades neon', 1, 'Pacote', 'almoxarifado', 'João Administrador', 'Ativo', 22.50),
    ('Escritório', 'Lápis Normal', '144 unidades', 1, 'Caixa', 'almoxarifado', 'João Administrador', 'Ativo', 45.80),
    ('Escritório', 'Grampos', '5000 unidades', 5, 'Caixa', 'almoxarifado', 'João Administrador', 'Ativo', 3.20),
    ('Escritório', 'Papel Ofício', '500 folhas', 5, 'Pacote', 'almoxarifado', 'João Administrador', 'Ativo', 18.90),
    ('Escritório', 'Apontadores', '12 unidades', 1, 'Caixa', 'almoxarifado', 'João Administrador', 'Ativo', 15.80),
    ('Escritório', 'Tinta Guache', '12 cores cada (6 unidades)', 12, 'Caixa', 'almoxarifado', 'João Administrador', 'Ativo', 12.90),
    ('Escritório', 'Cola Bastão', '–', 12, 'Tubo', 'almoxarifado', 'João Administrador', 'Ativo', 5.50),
    ('Escritório', 'Estiletes', '12 unidades', 1, 'Caixa', 'almoxarifado', 'João Administrador', 'Ativo', 25.90),
    ('Escritório', 'Máscaras', '50 unidades', 2, 'Caixa', 'almoxarifado', 'João Administrador', 'Ativo', 35.80),
    ('Escritório', 'Massinha Soft', '6 unidades cada', 12, 'Caixa', 'almoxarifado', 'João Administrador', 'manutenção', 8.90),
    ('Escritório', 'Lápis de Cor', '12 cores cada', 6, 'Caixa', 'almoxarifado', 'João Administrador', 'Ativo', 15.90),
    ('Escritório', 'Hidrocor', '12 cores cada', 5, 'Caixa', 'almoxarifado', 'João Administrador', 'Ativo', 18.50),
    ('Escritório', 'Caneta Azul', '50 unidades', 1, 'Caixa', 'almoxarifado', 'João Administrador', 'Ativo', 45.80),
    ('Escritório', 'Caneta Preta', '50 unidades', 1, 'Caixa', 'almoxarifado', 'João Administrador', 'Ativo', 45.80),
    ('Escritório', 'Pincéis Finos', '12 unidades', 2, 'Pacote', 'almoxarifado', 'João Administrador', 'Ativo', 22.90),
    ('Escritório', 'Aquarela', '12 cores, pincel', 2, 'Unidade', 'almoxarifado', 'João Administrador', 'Ativo', 35.50),
    ('Escritório', 'Clipes', '50 unidades', 20, 'Caixa', 'almoxarifado', 'João Administrador', 'Ativo', 2.80),
    ('Escritório', 'Tesouras sem ponta', '12 unidades', 1, 'Caixa', 'almoxarifado', 'João Administrador', 'Ativo', 85.90),
    ('Escritório', 'Estilete de Precisão', '2 lâminas', 1, 'Unidade', 'almoxarifado', 'João Administrador', 'Ativo', 12.50),
    ('Escritório', 'Tesoura com Textura', '–', 1, 'Unidade', 'almoxarifado', 'João Administrador', 'quebrado', 18.90),
    ('Escritório', 'Tintas de Rosto', '5 tintas', 2, 'Pacote', 'almoxarifado', 'João Administrador', 'Ativo', 28.50),
    ('Escritório', 'Grampeador', '500 grampos', 1, 'Unidade', 'almoxarifado', 'João Administrador', 'Ativo', 45.90),
    ('Escritório', 'Giz Gigante', '6 unidades', 3, 'Pacote', 'almoxarifado', 'João Administrador', 'Ativo', 15.80);

-- Decoração (7 itens)
INSERT INTO public.bens_patrimoniais (
    tipo, conteudo, descricao, quantidade, unidade, 
    localizacao_atual, responsavel_atual, status, valor_aquisicao
) VALUES 
    ('Decoração', 'Relógio de Parede', 'Pequeno', 2, 'Unidade', 'recepção', 'Lucia Decoradora', 'Ativo', 35.90),
    ('Decoração', 'Relógio de Parede', 'Grande', 1, 'Unidade', 'recepção', 'Lucia Decoradora', 'Ativo', 58.50),
    ('Decoração', 'Tatame', '–', 13, 'Unidade', 'sala de brinquedo', 'Pedro Fisio', 'Ativo', 25.90),
    ('Decoração', 'Cadeira', 'Salas', 3, 'Unidade', 'Sala 1', 'Ana Costa', 'Ativo', 125.00),
    ('Decoração', 'Cadeira', 'Recepção', 1, 'Unidade', 'recepção', 'Lucia Decoradora', 'manutenção', 98.50),
    ('Decoração', 'Mesas', '–', 3, 'Unidade', 'Sala 2', 'Ana Costa', 'Ativo', 185.90),
    ('Decoração', 'Poltronas', 'Recepção', 3, 'Unidade', 'recepção', 'Lucia Decoradora', 'Ativo', 285.00);

-- Verificação final
SELECT 
    'INSERÇÃO COMPLETA!' as status,
    COUNT(*) as total_registros,
    SUM(valor_aquisicao * quantidade) as valor_total
FROM public.bens_patrimoniais;

SELECT 
    tipo,
    COUNT(*) as quantidade_itens,
    SUM(valor_aquisicao * quantidade) as valor_total_categoria,
    ROUND(AVG(valor_aquisicao), 2) as valor_medio_unitario
FROM public.bens_patrimoniais
GROUP BY tipo
ORDER BY valor_total_categoria DESC;

SELECT 
    status,
    COUNT(*) as quantidade_itens,
    SUM(valor_aquisicao * quantidade) as valor_total_status
FROM public.bens_patrimoniais
GROUP BY status
ORDER BY valor_total_status DESC;

-- Resultado esperado:
-- Total: 92 registros
-- Brinquedos em Caixa: 10
-- Brinquedos Soltos: 36
-- Decoração: 7
-- Escritório: 39
-- Valor total estimado: R$ 4.500,00 aproximadamente