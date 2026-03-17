// LotesPage.tsx — Gestão de lotes do produtor

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, Plus, Trash2, ChevronRight, PawPrint } from "lucide-react";
import AppLayout from "@/components/AppLayout";

interface Lote {
  id: number;
  nome: string;
  tipo: string;
  local_pasto: string | null;
  total_animais: number;
  peso_medio: number | null;
  investimento_total: number | null;
  created_at: string;
}

const tipoLabel: Record<string, string> = {
  engorda:     "Engorda",
  cria_recria: "Cria/Recria",
  descarte:    "Descarte",
  outro:       "Outro",
};

const tipoColor: Record<string, { color: string; bg: string }> = {
  engorda:     { color: "#ff6b35", bg: "rgba(255,107,53,0.12)" },
  cria_recria: { color: "#00e5ff", bg: "rgba(0,229,255,0.10)" },
  descarte:    { color: "#e040fb", bg: "rgba(224,64,251,0.10)" },
  outro:       { color: "#8892b0", bg: "rgba(136,146,176,0.08)" },
};

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const LotesPage = () => {
  const navigate = useNavigate();

  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletandoId, setDeletandoId] = useState<number | null>(null);

  // Form novo lote
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("engorda");
  const [localPasto, setLocalPasto] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [formError, setFormError] = useState("");

  const token = localStorage.getItem("easy_cattle_token");

  const carregar = () => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/lotes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setLotes(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) { setFormError("Informe o nome do lote."); return; }
    setFormError("");
    setSalvando(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/lotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nome, tipo, local_pasto: localPasto || null }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Erro ao criar lote."); return; }
      setModalOpen(false);
      setNome("");
      setTipo("engorda");
      setLocalPasto("");
      carregar();
    } catch {
      setFormError("Não foi possível conectar ao servidor.");
    } finally {
      setSalvando(false);
    }
  };

  const handleDeletar = async (id: number) => {
    if (!confirm("Excluir este lote? Os animais serão desassociados mas não excluídos.")) return;
    setDeletandoId(id);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/lotes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setLotes(prev => prev.filter(l => l.id !== id));
    } catch { /* silently fail */ }
    finally { setDeletandoId(null); }
  };

  return (
    <AppLayout title="Lotes">
      <div className="max-w-3xl mx-auto">

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-[#8892b0]">{lotes.length} lote(s) cadastrado(s)</p>
          </div>
          <button onClick={() => setModalOpen(true)} className="btn-gradient flex items-center gap-2">
            <Plus size={14} /> Novo Lote
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p style={{ color: "var(--text-secondary)" }}>Carregando lotes...</p>
          </div>
        ) : lotes.length === 0 ? (
          <div className="dash-card text-center py-16 animate-enter">
            <Layers size={44} className="mx-auto mb-4 opacity-20" style={{ color: "#7c3aed" }} />
            <p className="font-bold text-white font-exo2 mb-1">Nenhum lote criado ainda</p>
            <p className="text-sm text-[#8892b0] mb-5">
              Crie lotes para organizar os animais por finalidade ou pasto.
            </p>
            <button onClick={() => setModalOpen(true)} className="btn-gradient inline-flex items-center gap-2">
              <Plus size={14} /> Criar primeiro lote
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {lotes.map((l, i) => {
              const tc = tipoColor[l.tipo] || tipoColor.outro;
              return (
                <div
                  key={l.id}
                  className={`dash-card gradient-border-top cursor-pointer transition-all hover:scale-[1.01] animate-enter stagger-${Math.min(i + 1, 6)}`}
                  onClick={() => navigate(`/lotes/${l.id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: type badge + info */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: tc.bg }}>
                        <Layers size={18} style={{ color: tc.color }} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="font-bold text-white font-exo2 text-base">{l.nome}</p>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ color: tc.color, background: tc.bg }}>
                            {tipoLabel[l.tipo] || l.tipo}
                          </span>
                        </div>
                        {l.local_pasto && (
                          <p className="text-xs text-[#8892b0] truncate">{l.local_pasto}</p>
                        )}
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={e => { e.stopPropagation(); handleDeletar(l.id); }}
                        disabled={deletandoId === l.id}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8892b0] hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
                      >
                        <Trash2 size={14} />
                      </button>
                      <ChevronRight size={16} className="text-[#4a5568]" />
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-6 mt-4 pt-4"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <div>
                      <p className="text-[10px] font-semibold text-[#8892b0] uppercase tracking-wider mb-0.5">Animais</p>
                      <p className="text-lg font-black font-mono text-white">{l.total_animais || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-[#8892b0] uppercase tracking-wider mb-0.5">Peso médio</p>
                      <p className="text-lg font-black font-mono" style={{ color: "#00e5ff" }}>
                        {l.peso_medio ? `${Number(l.peso_medio).toFixed(0)} kg` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-[#8892b0] uppercase tracking-wider mb-0.5">Investimento</p>
                      <p className="text-lg font-black font-mono" style={{ color: "#ff6b35" }}>
                        {l.investimento_total ? formatCurrency(Number(l.investimento_total)) : "—"}
                      </p>
                    </div>
                    {l.total_animais > 0 && (
                      <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-[#8892b0]">
                        <PawPrint size={12} />
                        Ver animais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Novo Lote */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-enter">
          <div className="w-full max-w-sm rounded-2xl p-6 gradient-border-top"
            style={{ background: "hsl(var(--card))", border: "1px solid rgba(255,255,255,0.08)" }}>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(124,58,237,0.15)" }}>
                <Layers size={18} style={{ color: "#a78bfa" }} />
              </div>
              <h3 className="text-base font-bold text-white font-exo2">Novo Lote</h3>
            </div>

            <form onSubmit={handleCriar} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#8892b0] block mb-1">Nome do lote *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Ex: Engorda Pasto 2"
                  className="input-dark"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8892b0] block mb-1">Tipo *</label>
                <select
                  value={tipo}
                  onChange={e => setTipo(e.target.value)}
                  className="input-dark"
                >
                  <option value="engorda" className="bg-[#1a2332]">Engorda</option>
                  <option value="cria_recria" className="bg-[#1a2332]">Cria/Recria</option>
                  <option value="descarte" className="bg-[#1a2332]">Descarte</option>
                  <option value="outro" className="bg-[#1a2332]">Outro</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8892b0] block mb-1">Pasto / Local</label>
                <input
                  type="text"
                  value={localPasto}
                  onChange={e => setLocalPasto(e.target.value)}
                  placeholder="Ex: Pasto Norte (opcional)"
                  className="input-dark"
                />
              </div>

              {formError && <p className="text-sm text-red-400">{formError}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); setFormError(""); }}
                  className="btn-outline-dim flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!nome || salvando}
                  className="btn-gradient flex-1 disabled:opacity-40"
                >
                  {salvando ? "Criando..." : "Criar lote"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default LotesPage;
