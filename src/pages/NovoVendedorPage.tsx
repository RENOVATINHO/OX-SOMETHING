import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";

const NovoVendedorPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    tipo: "empresa" as "empresa" | "pessoa",
    documento: "",
    cidade: "",
    estado: "",
    telefone: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.nome.trim()) {
      toast({ title: "Erro", description: "Nome é obrigatório", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("vendedores").insert({
      nome: form.nome.trim(),
      tipo: form.tipo,
      documento: form.documento.trim() || null,
      cidade: form.cidade.trim() || null,
      estado: form.estado.trim() || null,
      telefone: form.telefone.trim() || null,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Erro ao cadastrar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Vendedor cadastrado com sucesso!" });
      navigate("/cadastros");
    }
  };

  const fieldClass =
    "w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";
  const labelClass = "text-sm font-semibold text-foreground mb-1.5 block";

  return (
    <AppLayout title="Novo Vendedor">
      <div className="max-w-2xl">
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <div>
            <label className={labelClass}>Tipo *</label>
            <div className="flex gap-3">
              {(["empresa", "pessoa"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => update("tipo", t)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                    form.tipo === t
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {t === "empresa" ? "Empresa" : "Pessoa Física"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>
              {form.tipo === "empresa" ? "Nome da Empresa" : "Nome da Pessoa"} *
            </label>
            <input
              placeholder={form.tipo === "empresa" ? "Razão social" : "Nome completo"}
              value={form.nome}
              onChange={(e) => update("nome", e.target.value)}
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              {form.tipo === "empresa" ? "CNPJ" : "CPF"}
            </label>
            <input
              placeholder={form.tipo === "empresa" ? "00.000.000/0000-00" : "000.000.000-00"}
              value={form.documento}
              onChange={(e) => update("documento", e.target.value)}
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Cidade</label>
              <input
                placeholder="Cidade"
                value={form.cidade}
                onChange={(e) => update("cidade", e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Estado</label>
              <input
                placeholder="UF"
                value={form.estado}
                onChange={(e) => update("estado", e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Telefone</label>
            <input
              placeholder="(00) 00000-0000"
              value={form.telefone}
              onChange={(e) => update("telefone", e.target.value)}
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
            {loading ? "Salvando..." : "Cadastrar vendedor"}
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default NovoVendedorPage;
