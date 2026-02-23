
CREATE TABLE public.compras_animais (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendedor_id uuid REFERENCES public.vendedores(id),
  numero_gta text,
  lote text NOT NULL,
  sexo text NOT NULL,
  faixa_etaria text NOT NULL,
  quantidade integer NOT NULL,
  valor_unitario numeric NOT NULL,
  observacao text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.compras_animais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to compras_animais"
ON public.compras_animais
FOR ALL
USING (true)
WITH CHECK (true);
