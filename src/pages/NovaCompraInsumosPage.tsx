import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";

type Vendedor = { id: string; nome: string };

const NovaCompraInsumosPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [form, setForm] = useState({
    vendedor_id: "",
    produto: "",
    quantidade: "",
    valor: "",
    notaFiscal: "",
  });

  useEffect(() => {
    supabase
      .from("vendedores")
      .select("id, nome")
      .order("nome")
      .then(({ data }) => {
        if (data) setVendedores(data);
      });
  }, []);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.vendedor_id || !form.produto.trim() || !form.quantidade || !form.valor) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("compras_insumos").insert({
      vendedor_id: form.vendedor_id,
      produto: form.produto.trim(),
      quantidade: parseInt(form.quantidade),
      valor: parseFloat(form.valor),
      nota_fiscal: form.notaFiscal.trim() || null,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Erro ao cadastrar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Compra de insumo registrada com sucesso!" });
      navigate("/cadastros");
    }
  };

  const fieldClass =
    "w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";
  const labelClass = "text-sm font-semibold text-foreground mb-1.5 block";

  return (
    <AppLayout title="Nova Compra de Insumo">
      <div className="max-w-2xl">
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <div>
            <label className={labelClass}>Nome da empresa *</label>
            {vendedores.length > 0 ? (
              <select
                value={form.vendedor_id}
                onChange={(e) => update("vendedor_id", e.target.value)}
                className={fieldClass}
              >
                <option value="">Selecione uma empresa</option>
                {vendedores.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nome}
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Nenhuma empresa cadastrada.</p>
                <button
                  type="button"
                  onClick={() => navigate("/cadastros/novo-vendedor")}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  + Cadastrar nova empresa
                </button>
              </div>
            )}
            {vendedores.length > 0 && (
              <button
                type="button"
                onClick={() => navigate("/cadastros/novo-vendedor")}
                className="text-xs text-primary hover:underline mt-1.5 inline-block"
              >
                + Cadastrar nova empresa
              </button>
            )}
          </div>

          <div>
            <label className={labelClass}>Produto *</label>
            <input
              placeholder="Nome do produto"
              value={form.produto}
              onChange={(e) => update("produto", e.target.value)}
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Quantidade (sacos) *</label>
              <input
                placeholder="0"
                type="number"
                min="0"
                value={form.quantidade}
                onChange={(e) => update("quantidade", e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Valor *</label>
              <input
                placeholder="R$ 0,00"
                type="number"
                step="0.01"
                min="0"
                value={form.valor}
                onChange={(e) => update("valor", e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Nº Nota Fiscal</label>
            <input
              placeholder="Número"
              value={form.notaFiscal}
              onChange={(e) => update("notaFiscal", e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={() => navigate("/cadastros")}
            className="px-6 py-3 rounded-lg border border-border text-foreground font-semibold hover:bg-muted transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-primary text-primary-foreground rounded-lg px-8 py-3 text-sm font-bold hover:bg-accent transition-colors disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Cadastrar compra"}
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default NovaCompraInsumosPage;
