import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";

const NovoAnimalPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tipo: "", identificacao: "", sexo: "", dataNascimento: "",
    observacao: "", lote: "", proprietario: "", matrizMae: "", touroPai: "",
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/animais");
  };

  const fieldClass = "w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";
  const labelClass = "text-sm font-semibold text-foreground mb-1.5 block";

  return (
    <AppLayout title="Novo Animal">
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Tipo *</label>
              <select value={form.tipo} onChange={(e) => update("tipo", e.target.value)} className={fieldClass}>
                <option value="">Selecione o tipo</option>
                <option value="bovino">Bovino</option>
                <option value="equino">Equino</option>
                <option value="suino">Suíno</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Identificação *</label>
              <input placeholder="Ex: Brinco 001" value={form.identificacao} onChange={(e) => update("identificacao", e.target.value)} className={fieldClass} />
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
              <label className={labelClass}>Data de nascimento</label>
              <input type="date" value={form.dataNascimento} onChange={(e) => update("dataNascimento", e.target.value)} className={fieldClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Observação</label>
            <textarea placeholder="Observações sobre o animal" value={form.observacao} onChange={(e) => update("observacao", e.target.value)} className={`${fieldClass} min-h-[80px] resize-none`} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Lote</label>
              <input placeholder="Nome do lote" value={form.lote} onChange={(e) => update("lote", e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Proprietário (opcional)</label>
              <select value={form.proprietario} onChange={(e) => update("proprietario", e.target.value)} className={fieldClass}>
                <option value="">Selecione o proprietário</option>
              </select>
            </div>
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
