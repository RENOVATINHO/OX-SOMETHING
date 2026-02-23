import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";

type Lote = { lote: string; sexo: string; faixa_etaria: string };

const NovoAnimalPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [selectedLote, setSelectedLote] = useState("");
  const [form, setForm] = useState({
    identificacao: "", observacao: "",
    proprietario: "", matrizMae: "", touroPai: "",
  });

  useEffect(() => {
    supabase.from("compras_animais").select("lote, sexo, faixa_etaria").then(({ data }) => {
      if (data) {
        const unique = data.reduce((acc: Lote[], item) => {
          if (!acc.find(l => l.lote === item.lote)) acc.push(item);
          return acc;
        }, []);
        setLotes(unique);
      }
    });
  }, []);

  const loteData = lotes.find(l => l.lote === selectedLote);

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLote || !form.identificacao.trim()) {
      toast({ title: "Erro", description: "Lote e identificação são obrigatórios", variant: "destructive" });
      return;
    }
    toast({ title: "Animal cadastrado com sucesso!" });
    navigate("/animais");
  };

  const faixaLabel = (f: string) => {
    if (f === "0-12") return "0 a 12 meses";
    if (f === "12-24") return "12 a 24 meses";
    if (f === "24+") return "24 meses em diante";
    return f;
  };

  const fieldClass = "w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";
  const labelClass = "text-sm font-semibold text-foreground mb-1.5 block";
  const readonlyClass = "w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm text-foreground cursor-not-allowed";

  return (
    <AppLayout title="Novo Animal">
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <div>
            <label className={labelClass}>Lote *</label>
            {lotes.length > 0 ? (
              <select value={selectedLote} onChange={(e) => setSelectedLote(e.target.value)} className={fieldClass}>
                <option value="">Selecione o lote</option>
                {lotes.map((l) => (
                  <option key={l.lote} value={l.lote}>{l.lote}</option>
                ))}
              </select>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Nenhum lote cadastrado. Cadastre uma compra de animal primeiro.</p>
                <button type="button" onClick={() => navigate("/compras-animais/nova")} className="text-sm font-semibold text-primary hover:underline">
                  + Nova compra de animal
                </button>
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>Identificação *</label>
            <input placeholder="Ex: Brinco 001" value={form.identificacao} onChange={(e) => update("identificacao", e.target.value)} className={fieldClass} />
          </div>

          {loteData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Sexo</label>
                <input value={loteData.sexo === "macho" ? "Macho" : "Fêmea"} readOnly className={readonlyClass} />
              </div>
              <div>
                <label className={labelClass}>Idade</label>
                <input value={faixaLabel(loteData.faixa_etaria)} readOnly className={readonlyClass} />
              </div>
            </div>
          )}

          <div>
            <label className={labelClass}>Observação</label>
            <textarea placeholder="Observações sobre o animal" value={form.observacao} onChange={(e) => update("observacao", e.target.value)} className={`${fieldClass} min-h-[80px] resize-none`} />
          </div>

          <div>
            <label className={labelClass}>Proprietário (opcional)</label>
            <select value={form.proprietario} onChange={(e) => update("proprietario", e.target.value)} className={fieldClass}>
              <option value="">Selecione o proprietário</option>
            </select>
          </div>

          <div className="border-t border-border pt-5">
            <h3 className="text-sm font-bold text-foreground mb-4">Família (opcional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Matriz (Mãe)</label>
                <input placeholder="Identificação da mãe" value={form.matrizMae} onChange={(e) => update("matrizMae", e.target.value)} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Touro (Pai)</label>
                <input placeholder="Identificação do pai" value={form.touroPai} onChange={(e) => update("touroPai", e.target.value)} className={fieldClass} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={() => navigate("/animais")} className="px-6 py-3 rounded-lg border border-border text-foreground font-semibold hover:bg-muted transition-colors text-sm">
            Cancelar
          </button>
          <button type="submit" className="bg-primary text-primary-foreground rounded-lg px-8 py-3 text-sm font-bold hover:bg-accent transition-colors">
            Cadastrar Animal
          </button>
        </div>
      </form>
    </AppLayout>
  );
};

export default NovoAnimalPage;
