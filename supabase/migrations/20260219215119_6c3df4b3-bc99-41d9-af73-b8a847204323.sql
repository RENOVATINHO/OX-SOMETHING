
-- Tabela de vendedores/empresas
CREATE TABLE public.vendedores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('empresa', 'pessoa')),
  documento TEXT,
  cidade TEXT,
  estado TEXT,
  telefone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vendedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to vendedores" ON public.vendedores FOR ALL USING (true) WITH CHECK (true);

-- Tabela de compras de insumos
CREATE TABLE public.compras_insumos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendedor_id UUID REFERENCES public.vendedores(id),
  produto TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  nota_fiscal TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.compras_insumos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to compras_insumos" ON public.compras_insumos FOR ALL USING (true) WITH CHECK (true);
