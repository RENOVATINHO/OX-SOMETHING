// LoteDetalhePage.tsx — Dashboard do lote com animais, pesagens e custos

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layers, Scale, DollarSign, PawPrint, Plus, TrendingUp, Receipt, X } from "lucide-react";
import AppLayout from "@/components/AppLayout";

interface AnimalLote {
  id: number;
  brinco: string | null;
  peso_chegada: number | null;
  custo_real: number | null;
  sexo: string;
  faixa_etaria: string;
  numero_compra: string;
}

interface Lote {
  id: number;
  nome: string;
  tipo: string;
  local_pasto: string | null;
  animais: AnimalLote[];
}

interface Custo {
  id: number;
  tipo: string;
  descricao: string | null;
  valor: number;
  data: string;
}

const tipoLabel: Record<string, string> = {
  engorda:     "Engorda",
  cria_recria: "Cria/Recria",
  descarte:    "Descarte",
  outro:       "Outro",
};

const tipoColor: Record<string, string> = {
  engorda:     "#ff6b35",
  cria_recria: "#00e5ff",
  descarte:    "#e040fb",
  outro:       "#8892b0",
};

const sexoLabel: Record<string, string> = {
  macho_inteiro: "Macho",
  macho_capado:  "Boi",
  femea:         "Fêmea",
};

const faixaLabel: Record<string, string> = {
  bezerro: "Bezerro",
  garrote: "Garrote",
  boi:     "Boi",
  adulto:  "Adulto",
};

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("pt-BR");

const LoteDetalhePage = () => {
  const { loteId } = useParams<{ loteId: string }>();
  const navigate = useNavigate();

  const [lote, setLote] = useState<Lote | null>(null);
  const [custos, setCustos] = useState<Custo[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal: nova pesagem de acompanhamento
  const [modalPesagem, setModalPesagem] = useState(false);
  const [pesAnimalId, setPesAnimalId] = useState("");
  const [pesPeso, setPesPeso] = useState("");
  const [pesData, setPesData] = useState(new Date().toISOString().split("T")[0]);
  const [pesObs, setPesObs] = useState("");
  const [salvandoPes, setSalvandoPes] = useState(false);

  // Modal: novo custo
  const [modalCusto, setModalCusto] = useState(false);
  const [custoTipo, setCustoTipo] = useState("");
  const [custoDesc, setCustoDesc] = useState("");
  const [custoValor, setCustoValor] = useState("");
  const [custoData, setCustoData] = useState(new Date().toISOString().split("T")[0]);
  const [salvandoCusto, setSalvandoCusto] = useState(false);

  const [formError, setFormError] = useState("");

  const token = localStorage.getItem("easy_cattle_token");

  const carregarLote = () =>
    fetch(`${import.meta.env.VITE_API_URL}/api/lotes/${loteId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { if (data.id) setLote(data); });

  const carregarCustos = () =>
    fetch(`${import.meta.env.VITE_API_URL}/api/lotes/${loteId}/custos`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCustos(data); });

  useEffect(() => {
    setLoading(true);
    Promise.all([carregarLote(), carregarCustos()])
      .finally(() => setLoading(false));
  }, [loteId]);

  // Stats calculados
  const totalAnimais = lote?.animais.length || 0;
  const animaisComPeso = lote?.animais.filter(a => a.peso_chegada) || [];
  const pesoMedio = animaisComPeso.length > 0
    ? animaisComPeso.reduce((s, a) => s + Number(a.peso_chegada), 0) / animaisComPeso.length
    : 0;
  const investimentoAnimais = lote?.animais.reduce((s, a) => s + Number(a.custo_real || 0), 0) || 0;
  const investimentoCustos = custos.reduce((s, c) => s + Number(c.valor), 0);
  const investimentoTotal = investimentoAnimais + investimentoCustos;
  const custoMedio = totalAnimais > 0 ? investimentoTotal / totalAnimais : 0;

  const handleSalvarPesagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pesAnimalId || !pesPeso || !pesData) { setFormError("Preencha todos os campos."); return; }
    setFormError("");
    setSalvandoPes(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pesagens`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ animal_id: Number(pesAnimalId), peso: Number(pesPeso), data: pesData, observacao: pesObs || null }),
      });
      if (res.ok) {
        setModalPesagem(false);
        setPesAnimalId("");
        setPesPeso("");
        setPesObs("");
      } else {
        const d = await res.json();
        setFormError(d.error || "Erro ao salvar.");
      }
    } catch { setFormError("Erro de conexão."); }
    finally { setSalvandoPes(false); }
  };

  const handleSalvarCusto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custoTipo || !custoValor || !custoData) { setFormError("Preencha todos os campos."); return; }
    setFormError("");
    setSalvandoCusto(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/custos-lote`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lote_id: Number(loteId), tipo: custoTipo, descricao: custoDesc || null, valor: Number(custoValor), data: custoData }),
      });
      if (res.ok) {
        setModalCusto(false);
        setCustoTipo("");
        setCustoDesc("");
        setCustoValor("");
        carregarCustos();
      } else {
        const d = await res.json();
        setFormError(d.error || "Erro ao salvar.");
      }
    } catch { setFormError("Erro de conexão."); }
    finally { setSalvandoCusto(false); }
  };

  if (loading) {
    return (
      <AppLayout title="Detalhes do Lote">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!lote) {
    return (
      <AppLayout title="Detalhes do Lote">
        <div className="text-center py-20">
          <p className="text-[#8892b0]">Lote não encontrado.</p>
          <button onClick={() => navigate("/lotes")} className="btn-outline-dim mt-4">
            Voltar para lotes
          </button>
        </div>
      </AppLayout>
    );
  }

  const tc = tipoColor[lote.tipo] || "#8892b0";

  return (
    <AppLayout title={lote.nome}>
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Header do lote */}
        <div className="dash-card gradient-border-top animate-enter">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${tc}18` }}>
                <Layers size={22} style={{ color: tc }} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white font-exo2">{lote.nome}</h2>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                    style={{ color: tc, background: `${tc}18` }}>
                    {tipoLabel[lote.tipo] || lote.tipo}
                  </span>
                  {lote.local_pasto && (
                    <span className="text-xs text-[#8892b0]">{lote.local_pasto}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setFormError(""); setModalPesagem(true); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={{ background: "rgba(0,229,255,0.10)", color: "#00e5ff", border: "1px solid rgba(0,229,255,0.2)" }}
              >
                <Scale size={13} /> Registrar pesagem
              </button>
              <button
                onClick={() => { setFormError(""); setModalCusto(true); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={{ background: "rgba(255,107,53,0.10)", color: "#ff6b35", border: "1px solid rgba(255,107,53,0.2)" }}
              >
                <DollarSign size={13} /> Adicionar custo
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-enter stagger-1">
          {[
            { label: "Total animais", value: totalAnimais, mono: String(totalAnimais), color: "var(--text-secondary)", icon: PawPrint },
            { label: "Peso médio", value: pesoMedio, mono: pesoMedio ? `${pesoMedio.toFixed(1)} kg` : "—", color: "#00e5ff", icon: Scale },
            { label: "Investimento", value: investimentoTotal, mono: investimentoTotal ? formatCurrency(investimentoTotal) : "—", color: "#ff6b35", icon: TrendingUp },
            { label: "Custo/cabeça", value: custoMedio, mono: custoMedio ? formatCurrency(custoMedio) : "—", color: "#a78bfa", icon: Receipt },
          ].map(s => (
            <div key={s.label} className="dash-card">
              <p className="text-[10px] font-semibold text-[#8892b0] uppercase tracking-wider mb-1">{s.label}</p>
              <p className="text-xl font-black font-mono" style={{ color: s.color }}>{s.mono}</p>
            </div>
          ))}
        </div>

        {/* Lista de animais */}
        <div className="dash-card animate-enter stagger-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,107,53,0.12)" }}>
              <PawPrint size={16} style={{ color: "#ff6b35" }} />
            </div>
            <p className="font-bold text-white font-exo2">Animais no lote</p>
            <span className="ml-auto text-xs text-[#8892b0]">{totalAnimais} animais</span>
          </div>

          {lote.animais.length === 0 ? (
            <p className="text-sm text-center py-6 text-[#8892b0]">Nenhum animal neste lote ainda.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
                    {["Brinco", "Compra", "Categoria", "Peso entrada", "Custo"].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider"
                        style={{ color: "var(--text-secondary)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lote.animais.map((a, i) => (
                    <tr key={a.id}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        background: i % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent",
                      }}>
                      <td className="px-4 py-3 font-mono font-bold text-white">
                        {a.brinco || <span className="text-[#4a5568] font-normal text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--accent-orange)" }}>
                        #{a.numero_compra}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#8892b0]">
                        {sexoLabel[a.sexo] || a.sexo} · {faixaLabel[a.faixa_etaria] || a.faixa_etaria}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm" style={{ color: "#00e5ff" }}>
                        {a.peso_chegada ? `${Number(a.peso_chegada).toLocaleString("pt-BR")} kg` : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm" style={{ color: "#ff6b35" }}>
                        {a.custo_real ? formatCurrency(Number(a.custo_real)) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Custos do lote */}
        {custos.length > 0 && (
          <div className="dash-card animate-enter stagger-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(224,64,251,0.12)" }}>
                <Receipt size={16} style={{ color: "#e040fb" }} />
              </div>
              <p className="font-bold text-white font-exo2">Custos adicionais</p>
              <span className="ml-auto font-mono font-bold text-sm" style={{ color: "#e040fb" }}>
                {formatCurrency(investimentoCustos)}
              </span>
            </div>
            <div className="space-y-1">
              {custos.map(c => (
                <div key={c.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div>
                    <p className="text-sm font-semibold text-white">{c.tipo}</p>
                    {c.descricao && <p className="text-xs text-[#8892b0]">{c.descricao}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-sm" style={{ color: "#e040fb" }}>
                      {formatCurrency(Number(c.valor))}
                    </p>
                    <p className="text-xs text-[#4a5568]">{formatDate(c.data)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Registrar pesagem de acompanhamento */}
      {modalPesagem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-enter">
          <div className="w-full max-w-sm rounded-2xl p-6 gradient-border-top"
            style={{ background: "hsl(var(--card))", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white font-exo2">Registrar pesagem</h3>
              <button onClick={() => setModalPesagem(false)} className="text-[#8892b0] hover:text-white p-1">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSalvarPesagem} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#8892b0] block mb-1">Animal *</label>
                <select
                  value={pesAnimalId}
                  onChange={e => setPesAnimalId(e.target.value)}
                  className="input-dark"
                >
                  <option value="" className="bg-[#1a2332]">Selecione o animal</option>
                  {lote.animais.map(a => (
                    <option key={a.id} value={a.id} className="bg-[#1a2332]">
                      {a.brinco || `Animal #${a.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8892b0] block mb-1">Peso (kg) *</label>
                <input type="number" value={pesPeso} onChange={e => setPesPeso(e.target.value)}
                  placeholder="0" min="1" step="0.1" className="input-dark" inputMode="decimal" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8892b0] block mb-1">Data *</label>
                <input type="date" value={pesData} onChange={e => setPesData(e.target.value)} className="input-dark" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8892b0] block mb-1">Observação</label>
                <input type="text" value={pesObs} onChange={e => setPesObs(e.target.value)}
                  placeholder="Opcional" className="input-dark" />
              </div>
              {formError && <p className="text-sm text-red-400">{formError}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModalPesagem(false)} className="btn-outline-dim flex-1">
                  Cancelar
                </button>
                <button type="submit" disabled={salvandoPes} className="btn-gradient flex-1 disabled:opacity-40">
                  {salvandoPes ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adicionar custo */}
      {modalCusto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-enter">
          <div className="w-full max-w-sm rounded-2xl p-6 gradient-border-top"
            style={{ background: "hsl(var(--card))", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white font-exo2">Adicionar custo</h3>
              <button onClick={() => setModalCusto(false)} className="text-[#8892b0] hover:text-white p-1">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSalvarCusto} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#8892b0] block mb-1">Tipo *</label>
                <select
                  value={custoTipo}
                  onChange={e => setCustoTipo(e.target.value)}
                  className="input-dark"
                >
                  <option value="" className="bg-[#1a2332]">Selecione</option>
                  {["Ração", "Vacina", "Medicamento", "Sal mineral", "Pasto/Arrendamento", "Mão de obra", "Transporte", "Outro"].map(t => (
                    <option key={t} value={t} className="bg-[#1a2332]">{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8892b0] block mb-1">Descrição</label>
                <input type="text" value={custoDesc} onChange={e => setCustoDesc(e.target.value)}
                  placeholder="Detalhe (opcional)" className="input-dark" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8892b0] block mb-1">Valor (R$) *</label>
                <input type="number" value={custoValor} onChange={e => setCustoValor(e.target.value)}
                  placeholder="0,00" min="0" step="0.01" className="input-dark" inputMode="decimal" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#8892b0] block mb-1">Data *</label>
                <input type="date" value={custoData} onChange={e => setCustoData(e.target.value)} className="input-dark" />
              </div>
              {formError && <p className="text-sm text-red-400">{formError}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModalCusto(false)} className="btn-outline-dim flex-1">
                  Cancelar
                </button>
                <button type="submit" disabled={salvandoCusto} className="btn-gradient flex-1 disabled:opacity-40">
                  {salvandoCusto ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default LoteDetalhePage;
