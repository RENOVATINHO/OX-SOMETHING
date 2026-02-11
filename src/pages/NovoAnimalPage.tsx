import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import PageHeader from "@/components/PageHeader";

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader title="Novo animal" variant="blue" />

      <form onSubmit={handleSubmit} className="flex-1 px-4 py-4 space-y-3">
        <div className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
          <span className="text-muted-foreground">{form.tipo || "Tipo *"}</span>
          <select value={form.tipo} onChange={(e) => update("tipo", e.target.value)} className="absolute opacity-0 w-full h-full cursor-pointer" style={{ position: "relative" }}>
            <option value="">Selecione</option>
            <option value="bovino">Bovino</option>
            <option value="equino">Equino</option>
            <option value="suino">Suíno</option>
          </select>
          <ChevronDown size={18} className="text-muted-foreground" />
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <input placeholder="Identificação *" value={form.identificacao} onChange={(e) => update("identificacao", e.target.value)} className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
            <select value={form.sexo} onChange={(e) => update("sexo", e.target.value)} className="w-full bg-transparent outline-none text-foreground">
              <option value="">Sexo *</option>
              <option value="macho">Macho</option>
              <option value="femea">Fêmea</option>
            </select>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <input type="date" placeholder="Data de nascimento" value={form.dataNascimento} onChange={(e) => update("dataNascimento", e.target.value)} className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <input placeholder="Observação" value={form.observacao} onChange={(e) => update("observacao", e.target.value)} className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <input placeholder="Lote" value={form.lote} onChange={(e) => update("lote", e.target.value)} className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
        </div>

        <div className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Proprietário (opcional):</p>
            <select value={form.proprietario} onChange={(e) => update("proprietario", e.target.value)} className="w-full bg-transparent outline-none text-foreground">
              <option value="">Selecione o proprietário</option>
            </select>
          </div>
        </div>

        <h3 className="font-bold text-foreground pt-2">Vacinas (opcional)</h3>

        <h3 className="font-bold text-foreground">Família (opcional)</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl border border-border p-4">
            <input placeholder="Matriz (Mãe)" value={form.matrizMae} onChange={(e) => update("matrizMae", e.target.value)} className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <input placeholder="Touro (Pai)" value={form.touroPai} onChange={(e) => update("touroPai", e.target.value)} className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
          </div>
        </div>
      </form>

      <div className="p-4">
        <button
          onClick={handleSubmit as any}
          className="w-full bg-primary text-primary-foreground rounded-full py-4 text-lg font-bold hover:bg-accent transition-colors"
        >
          Cadastrar Animal
        </button>
      </div>
    </div>
  );
};

export default NovoAnimalPage;
