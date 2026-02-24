
-- Tabela para armazenar os pastos demarcados no mapa
CREATE TABLE public.pastos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  coordenadas JSONB NOT NULL, -- Array de {lat, lng} representando os vértices do polígono
  area_hectares NUMERIC NOT NULL, -- Área calculada em hectares
  area_m2 NUMERIC NOT NULL, -- Área calculada em metros quadrados
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.pastos ENABLE ROW LEVEL SECURITY;

-- Política de acesso público (sem autenticação por enquanto)
CREATE POLICY "Allow all access to pastos"
ON public.pastos
FOR ALL
USING (true)
WITH CHECK (true);
