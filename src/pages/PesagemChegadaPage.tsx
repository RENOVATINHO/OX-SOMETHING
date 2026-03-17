// PesagemChegadaPage.tsx — Pesagem individual de animais na chegada
// UX focada em mobile: 2 campos grandes + 1 botão, mínimo de scrolling

import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle, Clock, Scale, Plus, ChevronRight } from "lucide-react";
import AppLayout from "@/components/AppLayout";

interface Compra {
  id: number;
  numero_compra: string;
  vendedor_nome: string | null;
  quantidade: number;
  peso_total: number | null;
  valor_kg: number;
  status_chegada: string;
}

interface Animal {
  id: number;
  brinco: string | null;
  peso_chegada: number | null;
  custo_real: number | null;
}

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const PesagemChegadaPage = () => {
  const { compraId } = useParams<{ compraId: string }>();
  const navigate = useNavigate();

  const [compra, setCompra] = useState<Compra | null>(null);
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [brinco, setBrinco] = useState("");
  const [peso, setPeso] = useState("");

  const pesoRef = useRef<HTMLInputElement>(null);
  const brincoRef = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem("easy_cattle_token");

  const carregarDados = () => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/compras-animais/${compraId}/animais`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.compra) setCompra(data.compra);
        if (Array.isArray(data.animais)) setAnimais(data.animais);
      })
      .catch(() => setError("Erro ao carregar dados."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregarDados(); }, [compraId]);

  const pesados = animais.filter(a => a.peso_chegada !== null);
  const totalAnimais = compra?.quantidade || 0;
  const progresso = totalAnimais > 0 ? (pesados.length / totalAnimais) * 100 : 0;

  const handleAdicionarPesagem = async () => {
    if (!peso || Number(peso) <= 0) {
      setError("Informe um peso válido.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/compras-animais/${compraId}/pesagem`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ brinco: brinco || null, peso: Number(peso) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erro ao registrar pesagem."); return; }
      setBrinco("");
      setPeso("");
      carregarDados();
      // Foca no campo brinco para o próximo animal
      setTimeout(() => brincoRef.current?.focus(), 100);
    } catch {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setSaving(false);
    }
  };

  const handleFinalizar = async (status: "pesagem_completa" | "pesagem_parcial") => {
    setSaving(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/compras-animais/${compraId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status_chegada: status }),
      });
      navigate("/compras-animais");
    } catch {
      setError("Erro ao atualizar status.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Pesagem — Chegada">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#ff6b35] border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!compra) {
    return (
      <AppLayout title="Pesagem — Chegada">
        <div className="text-center py-20">
          <p className="text-[#8892b0]">Compra não encontrada.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Pesagem — Chegada">
      <div className="max-w-lg mx-auto space-y-4">

        {/* Resumo da compra */}
        <div className="dash-card animate-enter">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[#8892b0] mb-0.5">Compra</p>
              <p className="text-lg font-black text-white font-exo2">
                #{compra.numero_compra}
                {compra.vendedor_nome && (
                  <span className="text-sm font-normal text-[#8892b0] ml-2">— {compra.vendedor_nome}</span>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-[#8892b0] mb-0.5">Total</p>
              <p className="text-base font-black font-mono" style={{ color: "#ff6b35" }}>
                {compra.peso_total
                  ? formatCurrency(compra.peso_total * compra.valor_kg)
                  : `${compra.quantidade} animais`}
              </p>
            </div>
          </div>
          {compra.peso_total && (
            <p className="text-xs text-[#8892b0] mt-2">
              Peso declarado: <span className="text-white font-mono">{compra.peso_total.toLocaleString("pt-BR")} kg</span>
              {" · "}R$ {compra.valor_kg.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/kg
            </p>
          )}
        </div>

        {/* Barra de progresso */}
        <div className="dash-card animate-enter stagger-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-white">
              Pesados: <span style={{ color: "#00e5ff" }}>{pesados.length}</span> / {totalAnimais}
            </span>
            <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
              {Math.round(progresso)}%
            </span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progresso}%`,
                background: progresso === 100
                  ? "linear-gradient(90deg, #4ade80, #22c55e)"
                  : "linear-gradient(90deg, #00e5ff, #7c3aed)",
              }}
            />
          </div>
        </div>

        {/* Formulário de pesagem — campos grandes para uso no curral */}
        {pesados.length < totalAnimais && (
          <div className="dash-card animate-enter stagger-2">
            <p className="text-xs font-semibold text-[#8892b0] mb-3 uppercase tracking-wider">
              Animal {pesados.length + 1} de {totalAnimais}
            </p>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs font-semibold text-[#8892b0] block mb-1.5">Brinco</label>
                <input
                  ref={brincoRef}
                  type="text"
                  value={brinco}
                  onChange={e => setBrinco(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && pesoRef.current?.focus()}
                  placeholder="Ex: 001"
                  className="w-full rounded-xl px-4 py-4 text-lg font-mono text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  autoFocus
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-[#8892b0] block mb-1.5">Peso (kg) *</label>
                <input
                  ref={pesoRef}
                  type="number"
                  value={peso}
                  onChange={e => setPeso(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAdicionarPesagem()}
                  placeholder="0"
                  min="1"
                  step="0.1"
                  className="w-full rounded-xl px-4 py-4 text-lg font-mono text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,229,255,0.25)" }}
                  inputMode="decimal"
                />
              </div>
              <button
                onClick={handleAdicionarPesagem}
                disabled={saving || !peso}
                className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #00e5ff22, #7c3aed22)", border: "1px solid #00e5ff44" }}
              >
                {saving
                  ? <div className="w-5 h-5 border-2 border-[#00e5ff] border-t-transparent rounded-full animate-spin" />
                  : <Plus size={24} className="text-[#00e5ff]" />
                }
              </button>
            </div>
            {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
            {compra.peso_total && peso && (
              <p className="text-xs mt-2" style={{ color: "var(--accent-teal)" }}>
                Custo estimado: {formatCurrency((Number(peso) / compra.peso_total) * (compra.peso_total * compra.valor_kg))}
              </p>
            )}
          </div>
        )}

        {/* Lista de animais pesados */}
        {pesados.length > 0 && (
          <div className="dash-card animate-enter stagger-3">
            <p className="text-xs font-semibold text-[#8892b0] mb-3 uppercase tracking-wider flex items-center gap-2">
              <Scale size={13} /> Animais pesados
            </p>
            <div className="space-y-1">
              {pesados.map((a, i) => (
                <div key={a.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[#8892b0] w-5 text-right">{i + 1}</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {a.brinco || <span className="text-[#4a5568] text-xs">Sem brinco</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm font-bold" style={{ color: "#00e5ff" }}>
                      {a.peso_chegada?.toLocaleString("pt-BR")} kg
                    </span>
                    {a.custo_real && (
                      <span className="font-mono text-sm" style={{ color: "#ff6b35" }}>
                        {formatCurrency(a.custo_real)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botões de ação */}
        {pesados.length > 0 && (
          <div className="space-y-3 animate-enter stagger-4 pb-6">
            <button
              onClick={() => handleFinalizar("pesagem_completa")}
              disabled={saving}
              className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #4ade80, #16a34a)" }}
            >
              <CheckCircle size={18} />
              Finalizar pesagem ({pesados.length}/{totalAnimais})
            </button>
            {pesados.length < totalAnimais && (
              <button
                onClick={() => handleFinalizar("pesagem_parcial")}
                disabled={saving}
                className="w-full py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#8892b0",
                }}
              >
                <Clock size={18} />
                Pesar restantes depois
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        )}

        {pesados.length === 0 && !loading && (
          <div className="text-center py-8 animate-enter stagger-3">
            <Scale size={36} className="mx-auto mb-3 opacity-20" style={{ color: "#00e5ff" }} />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Pese o primeiro animal para começar.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default PesagemChegadaPage;
