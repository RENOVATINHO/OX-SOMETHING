// ==============================
// NovoAnimalPage.tsx — Formulário para cadastrar um animal individual
// Regra de negócio principal: o animal DEVE ser vinculado a um lote existente (criado em Compra de Animais)
// Os campos de Sexo e Idade são preenchidos automaticamente e ficam em modo leitura,
// pois são herdados dos dados do lote selecionado
// ==============================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PawPrint, Tag, Hash, AlignLeft, User, Lock } from "lucide-react";
import AppLayout from "@/components/AppLayout";

// Tipo que representa os dados de um lote — obtidos da tabela compras_animais
type Lote = { lote: string; sexo: string; faixa_etaria: string };

const NovoAnimalPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [selectedLote, setSelectedLote] = useState("");

  const [form, setForm] = useState({
    identificacao: "",
    observacao: "",
    proprietario: "",
    matrizMae: "",
    touroPai: "",
  });

  // Carrega lotes únicos da tabela compras_animais ao montar o componente
  useEffect(() => {
    const token = localStorage.getItem("easy_cattle_token");
    fetch(`${import.meta.env.VITE_API_URL}/api/compras-animais`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then((data: Record<string, unknown>[]) => {
        if (Array.isArray(data)) {
          const unique = data.reduce((acc: Lote[], c) => {
            const key = String(c.numero_compra ?? "");
            if (!acc.find(l => l.lote === key))
              acc.push({ lote: key, sexo: c.sexo as string, faixa_etaria: c.faixa_etaria as string });
            return acc;
          }, []);
          setLotes(unique);
        }
      })
      .catch(() => {});
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

  // Converte o código da faixa etária para texto legível
  const faixaLabel = (f: string) => {
    if (f === "0-12") return "0 a 12 meses";
    if (f === "12-24") return "12 a 24 meses";
    if (f === "24+") return "24 meses em diante";
    return f;
  };

  return (
    <AppLayout title="Novo Animal">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#22c55e18" }}>
            <PawPrint size={18} className="text-[#22c55e]" />
          </div>
          <h2 className="text-base font-bold text-white font-exo2">Cadastrar Animal</h2>
        </div>

        <form onSubmit={handleSubmit} className="dash-card space-y-0 divide-y divide-white/[0.06]">

          {/* Lote */}
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Lote *</label>
              {lotes.length > 0 ? (
                <select
                  value={selectedLote}
                  onChange={(e) => setSelectedLote(e.target.value)}
                  className="w-full bg-transparent text-white text-sm outline-none appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#1a2332]">Selecione o lote</option>
                  {lotes.map(l => (
                    <option key={l.lote} value={l.lote} className="bg-[#1a2332]">{l.lote}</option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#4a5568]">Nenhum lote cadastrado.</span>
                  <button
                    type="button"
                    onClick={() => navigate("/animais/nova-compra")}
                    className="text-sm font-semibold text-[#7c3aed] hover:underline"
                  >
                    + Nova compra
                  </button>
                </div>
              )}
            </div>
            <Tag size={20} className="text-[#8892b0] flex-shrink-0" />
          </div>

          {/* Identificação */}
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Identificação *</label>
              <input
                value={form.identificacao}
                onChange={(e) => update("identificacao", e.target.value)}
                placeholder="Ex: Brinco 001"
                className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
              />
            </div>
            <Hash size={20} className="text-[#8892b0] flex-shrink-0" />
          </div>

          {/* Sexo | Faixa etária (condicional, somente leitura) */}
          {loteData && (
            <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
              <div className="px-5 py-4">
                <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Sexo</label>
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-[#4a5568]" />
                  <span className="text-sm text-[#4a5568]">{loteData.sexo === "macho" ? "Macho" : "Fêmea"}</span>
                </div>
              </div>
              <div className="px-5 py-4">
                <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Faixa etária</label>
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-[#4a5568]" />
                  <span className="text-sm text-[#4a5568]">{faixaLabel(loteData.faixa_etaria)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Observação */}
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Observação</label>
              <input
                value={form.observacao}
                onChange={(e) => update("observacao", e.target.value)}
                placeholder="Opcional"
                className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
              />
            </div>
            <AlignLeft size={20} className="text-[#8892b0] flex-shrink-0" />
          </div>

          {/* Proprietário */}
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Proprietário</label>
              <select
                value={form.proprietario}
                onChange={(e) => update("proprietario", e.target.value)}
                className="w-full bg-transparent text-white text-sm outline-none appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#1a2332]">Selecione o proprietário</option>
              </select>
            </div>
            <User size={20} className="text-[#8892b0] flex-shrink-0" />
          </div>

          {/* Separador Família */}
          <div className="px-5 py-3">
            <p className="text-[10px] uppercase tracking-widest text-[#4a5568] font-semibold">Família (opcional)</p>
          </div>

          {/* Matriz (Mãe) | Touro (Pai) */}
          <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
            <div className="px-5 py-4">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Matriz (Mãe)</label>
              <input
                value={form.matrizMae}
                onChange={(e) => update("matrizMae", e.target.value)}
                placeholder="Identificação da mãe"
                className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
              />
            </div>
            <div className="px-5 py-4">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Touro (Pai)</label>
              <input
                value={form.touroPai}
                onChange={(e) => update("touroPai", e.target.value)}
                placeholder="Identificação do pai"
                className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
              />
            </div>
          </div>

        </form>

        <button
          onClick={handleSubmit as any}
          disabled={!selectedLote || !form.identificacao.trim()}
          className="w-full mt-4 py-3.5 rounded-2xl text-white font-bold text-sm transition-all disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
        >
          Cadastrar Animal
        </button>

      </div>
    </AppLayout>
  );
};

export default NovoAnimalPage;
