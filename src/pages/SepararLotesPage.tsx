// SepararLotesPage.tsx — Alocação de animais pesados em lotes

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle, Plus, Layers, SquareCheckBig, Square } from "lucide-react";
import AppLayout from "@/components/AppLayout";

interface Animal {
  id: number;
  brinco: string | null;
  peso_chegada: number | null;
  custo_real: number | null;
}

interface Lote {
  id: number;
  nome: string;
  tipo: string;
  local_pasto: string | null;
  total_animais: number;
}

const tipoLabel: Record<string, string> = {
  engorda:    "Engorda",
  cria_recria: "Cria/Recria",
  descarte:   "Descarte",
  outro:      "Outro",
};

const tipoColor: Record<string, string> = {
  engorda:    "#ff6b35",
  cria_recria: "#00e5ff",
  descarte:   "#e040fb",
  outro:      "#8892b0",
};

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const SepararLotesPage = () => {
  const { compraId } = useParams<{ compraId: string }>();
  const navigate = useNavigate();

  const [animais, setAnimais] = useState<Animal[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [selecionados, setSelecionados] = useState<Set<number>>(new Set());
  const [loteDestino, setLoteDestino] = useState<number | null>(null);

  // Modal novo lote
  const [modalLote, setModalLote] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoTipo, setNovoTipo] = useState<string>("engorda");
  const [novoPasto, setNovoPasto] = useState("");
  const [criandoLote, setCriandoLote] = useState(false);

  const token = localStorage.getItem("easy_cattle_token");

  const carregarLotes = () =>
    fetch(`${import.meta.env.VITE_API_URL}/api/lotes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setLotes(data); });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/compras-animais/${compraId}/animais`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/lotes`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
    ])
      .then(([compraData, lotesData]) => {
        if (compraData.animais) {
          // Só mostra animais pesados (com peso_chegada) e sem lote
          setAnimais(compraData.animais.filter((a: Animal & { lote_id?: number | null }) =>
            a.peso_chegada !== null && !a.lote_id
          ));
        }
        if (Array.isArray(lotesData)) setLotes(lotesData);
      })
      .catch(() => setError("Erro ao carregar dados."))
      .finally(() => setLoading(false));
  }, [compraId]);

  const toggleAnimal = (id: number) => {
    setSelecionados(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleTodos = () => {
    if (selecionados.size === animais.length) {
      setSelecionados(new Set());
    } else {
      setSelecionados(new Set(animais.map(a => a.id)));
    }
  };

  const handleConfirmar = async () => {
    if (selecionados.size === 0) { setError("Selecione pelo menos um animal."); return; }
    if (!loteDestino) { setError("Escolha o lote de destino."); return; }
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/animais/mover-lote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ animal_ids: Array.from(selecionados), lote_id: loteDestino }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erro ao mover animais."); return; }

      // Remove os animais movidos da lista e limpa seleção
      setAnimais(prev => prev.filter(a => !selecionados.has(a.id)));
      setSelecionados(new Set());
      setLoteDestino(null);
      carregarLotes();

      // Se não há mais animais sem lote, atualiza status e vai para lista
      if (animais.length - selecionados.size === 0) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/compras-animais/${compraId}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status_chegada: "lotes_definidos" }),
        });
        navigate("/lotes");
      }
    } catch {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setSaving(false);
    }
  };

  const handleCriarLote = async () => {
    if (!novoNome) return;
    setCriandoLote(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/lotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nome: novoNome, tipo: novoTipo, local_pasto: novoPasto || null }),
      });
      const data = await res.json();
      if (res.ok) {
        await carregarLotes();
        setLoteDestino(data.id);
        setModalLote(false);
        setNovoNome("");
        setNovoPasto("");
        setNovoTipo("engorda");
      }
    } catch { /* silently fail */ }
    finally { setCriandoLote(false); }
  };

  if (loading) {
    return (
      <AppLayout title="Separar em Lotes">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Separar em Lotes">
      <div className="max-w-lg mx-auto space-y-4">

        {animais.length === 0 ? (
          <div className="dash-card text-center py-12 animate-enter">
            <CheckCircle size={40} className="mx-auto mb-3" style={{ color: "#4ade80" }} />
            <p className="font-bold text-white font-exo2 mb-1">Todos os animais já estão em lotes!</p>
            <button onClick={() => navigate("/lotes")} className="btn-gradient mt-4 inline-flex items-center gap-2">
              <Layers size={14} /> Ver lotes
            </button>
          </div>
        ) : (
          <>
            {/* Lista de animais */}
            <div className="dash-card animate-enter">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-white">
                  {selecionados.size > 0
                    ? <span style={{ color: "#7c3aed" }}>{selecionados.size} selecionados</span>
                    : <span className="text-[#8892b0]">Selecione os animais</span>
                  }
                </p>
                <button
                  onClick={toggleTodos}
                  className="text-xs font-bold transition-colors"
                  style={{ color: selecionados.size === animais.length ? "#8892b0" : "#a78bfa" }}
                >
                  {selecionados.size === animais.length ? "Desselecionar todos" : "Selecionar todos"}
                </button>
              </div>

              <div className="space-y-1 max-h-64 overflow-y-auto">
                {animais.map(a => {
                  const sel = selecionados.has(a.id);
                  return (
                    <button
                      key={a.id}
                      onClick={() => toggleAnimal(a.id)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left"
                      style={{
                        background: sel ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${sel ? "rgba(124,58,237,0.3)" : "transparent"}`,
                      }}
                    >
                      {sel
                        ? <SquareCheckBig size={18} style={{ color: "#a78bfa", flexShrink: 0 }} />
                        : <Square size={18} style={{ color: "#4a5568", flexShrink: 0 }} />
                      }
                      <span className="font-mono font-bold text-white text-sm flex-1">
                        {a.brinco || <span className="text-[#4a5568] font-normal">Sem brinco</span>}
                      </span>
                      <span className="font-mono text-xs" style={{ color: "#00e5ff" }}>
                        {a.peso_chegada?.toLocaleString("pt-BR")} kg
                      </span>
                      {a.custo_real && (
                        <span className="font-mono text-xs" style={{ color: "#ff6b35" }}>
                          {formatCurrency(a.custo_real)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seleção do lote destino */}
            {selecionados.size > 0 && (
              <div className="dash-card animate-enter space-y-2">
                <p className="text-xs font-semibold text-[#8892b0] uppercase tracking-wider mb-3">
                  Mover {selecionados.size} animal(is) para:
                </p>

                {lotes.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setLoteDestino(l.id)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-left"
                    style={{
                      background: loteDestino === l.id ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${loteDestino === l.id ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.06)"}`,
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                      style={{ background: tipoColor[l.tipo] || "#8892b0" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm">{l.nome}</p>
                      <p className="text-xs text-[#8892b0]">
                        {tipoLabel[l.tipo] || l.tipo}
                        {l.local_pasto ? ` · ${l.local_pasto}` : ""}
                        {" · "}{l.total_animais} animais
                      </p>
                    </div>
                    {loteDestino === l.id && <CheckCircle size={16} style={{ color: "#a78bfa" }} />}
                  </button>
                ))}

                {/* Criar novo lote */}
                <button
                  onClick={() => setModalLote(true)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}
                >
                  <Plus size={16} style={{ color: "#8892b0" }} />
                  <span className="text-sm font-semibold" style={{ color: "#8892b0" }}>Criar novo lote</span>
                </button>
              </div>
            )}

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            {/* Botão confirmar */}
            {selecionados.size > 0 && loteDestino && (
              <button
                onClick={handleConfirmar}
                disabled={saving}
                className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all flex items-center justify-center gap-2 animate-enter disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}
              >
                {saving
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><CheckCircle size={18} /> Confirmar alocação</>
                }
              </button>
            )}
          </>
        )}
      </div>

      {/* Modal: criar novo lote */}
      {modalLote && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-enter">
          <div className="w-full max-w-sm rounded-2xl p-6 gradient-border-top"
            style={{ background: "hsl(var(--card))", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 className="text-base font-bold text-white font-exo2 mb-4">Novo Lote</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#8892b0] block mb-1">Nome *</label>
                <input
                  type="text"
                  value={novoNome}
                  onChange={e => setNovoNome(e.target.value)}
                  placeholder="Ex: Engorda Pasto 2"
                  className="input-dark"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8892b0] block mb-1">Tipo *</label>
                <select
                  value={novoTipo}
                  onChange={e => setNovoTipo(e.target.value)}
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
                  value={novoPasto}
                  onChange={e => setNovoPasto(e.target.value)}
                  placeholder="Ex: Pasto Norte (opcional)"
                  className="input-dark"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setModalLote(false)} className="btn-outline-dim flex-1">
                Cancelar
              </button>
              <button
                onClick={handleCriarLote}
                disabled={!novoNome || criandoLote}
                className="btn-gradient flex-1 disabled:opacity-40"
              >
                {criandoLote ? "Criando..." : "Criar lote"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default SepararLotesPage;
