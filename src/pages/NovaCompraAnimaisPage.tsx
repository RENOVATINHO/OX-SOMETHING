import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";

type Vendedor = { id: string; nome: string };

const NovaCompraAnimaisPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [form, setForm] = useState({
    vendedor_id: "", numeroGta: "", sexo: "",
    quantidade: "", valorUnitario: "", observacao: "",
    lote: "", faixaEtaria: "",
  });

  useEffect(() => {
    supabase.from("vendedores").select("id, nome").order("nome").then(({ data }) => {
      if (data) setVendedores(data);
    });
  }, []);

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.vendedor_id || !form.sexo || !form.quantidade || !form.valorUnitario || !form.lote || !form.faixaEtaria) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("compras_animais").insert({
      vendedor_id: form.vendedor_id,
      numero_gta: form.numeroGta.trim() || null,
      sexo: form.sexo,
      quantidade: parseInt(form.quantidade),
      valor_unitario: parseFloat(form.valorUnitario),
      observacao: form.observacao.trim() || null,
      lote: form.lote.trim(),
      faixa_etaria: form.faixaEtaria,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Erro ao cadastrar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Compra de animal registrada com sucesso!" });
      navigate("/compras-animais");
    }
  };

  const fieldClass = "w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";
  const labelClass = "text-sm font-semibold text-foreground mb-1.5 block";

  return (
    <AppLayout title="Nova Compra de Animal">
      <div className="max-w-2xl">
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <div>
            <label className={labelClass}>Selecionar empresa *</label>
            {vendedores.length > 0 ? (
              <select value={form.vendedor_id} onChange={(e) => update("vendedor_id", e.target.value)} className={fieldClass}>
                <option value="">Selecione uma empresa</option>
                {vendedores.map((v) => (
                  <option key={v.id} value={v.id}>{v.nome}</option>
                ))}
              </select>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Nenhuma empresa cadastrada.</p>
                <button type="button" onClick={() => navigate("/cadastros/novo-vendedor")} className="text-sm font-semibold text-primary hover:underline">
                  + Cadastrar nova empresa
                </button>
              </div>
            )}
            {vendedores.length > 0 && (
              <button type="button" onClick={() => navigate("/cadastros/novo-vendedor")} className="text-xs text-primary hover:underline mt-1.5 inline-block">
                + Cadastrar nova empresa
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Nº da GTA</label>
              <input placeholder="Número da GTA" value={form.numeroGta} onChange={(e) => update("numeroGta", e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Lote *</label>
              <input placeholder="Nome do lote" value={form.lote} onChange={(e) => update("lote", e.target.value)} className={fieldClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Sexo *</label>
              <select value={form.sexo} onChange={(e) => update("sexo", e.target.value)} className={fieldClass}>
                <option value="">Selecione</option>
                <option value="macho">Macho</option>
                <option value="femea">Fêmea</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Faixa etária *</label>
              <select value={form.faixaEtaria} onChange={(e) => update("faixaEtaria", e.target.value)} className={fieldClass}>
                <option value="">Selecione</option>
                <option value="0-12">0 a 12 meses</option>
                <option value="12-24">12 a 24 meses</option>
                <option value="24+">24 meses em diante</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Quantidade *</label>
              <input placeholder="0" type="number" value={form.quantidade} onChange={(e) => update("quantidade", e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Valor unitário R$ *</label>
              <input placeholder="R$ 0,00" type="number" step="0.01" value={form.valorUnitario} onChange={(e) => update("valorUnitario", e.target.value)} className={fieldClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Observação</label>
            <textarea placeholder="Observações adicionais" value={form.observacao} onChange={(e) => update("observacao", e.target.value)} className={`${fieldClass} min-h-[80px] resize-none`} />
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Para o controle de animais é necessário fazer o cadastro na página de Animais.
        </p>

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={() => navigate("/compras-animais")} className="px-6 py-3 rounded-lg border border-border text-foreground font-semibold hover:bg-muted transition-colors text-sm">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={loading} className="bg-primary text-primary-foreground rounded-lg px-8 py-3 text-sm font-bold hover:bg-accent transition-colors disabled:opacity-50">
            {loading ? "Salvando..." : "Cadastrar compra"}
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default NovaCompraAnimaisPage;
