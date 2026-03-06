// ==============================
// AnimaisPage.tsx — Dark analytics redesign
// Visual overhaul: gradient cards, dark table, updated modals
// All business logic, API calls, and filtering are unchanged
// ==============================

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Pencil, PawPrint, DollarSign, Skull, Plus, TrendingUp, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AppLayout from "@/components/AppLayout";

// ──────────────────────────────────────────────────────────────────────────────
// TYPES (unchanged)
// ──────────────────────────────────────────────────────────────────────────────
interface Animal {
  id: number;
  compra_id: number;
  brinco: string | null;
  peso_entrada: number | null;
  observacao: string | null;
  status: "ativo" | "vendido" | "morto";
  numero_compra: string;
  sexo: "macho_inteiro" | "macho_capado" | "femea";
  faixa_etaria: "bezerro" | "garrote" | "boi" | "novilho" | "adulto"; // novilho/adulto: legado
  valor_kg: number | null;
  valor_total: number | null;
  numero_gta: string | null;
  vendedor_nome: string | null;
  nome_pai: string | null;
  nome_mae: string | null;
  raca: string | null;
  data_nascimento: string | null;
  data_compra: string | null;
  tipo_cadastro: "compra" | "especial";
  finalidade: string | null;
}

// ──────────────────────────────────────────────────────────────────────────────
// LABEL MAPS (unchanged)
// ──────────────────────────────────────────────────────────────────────────────
const sexoLabel: Record<string, string> = {
  macho_inteiro: "Macho Inteiro",
  macho_capado:  "Boi",
  femea:         "Fêmea",
};
const faixaLabel: Record<string, string> = {
  bezerro: "Bezerro",
  garrote: "Garrote",
  boi:     "Boi",
  novilho: "Boi",   // legado → exibe como Boi
  adulto:  "Boi",   // legado → exibe como Boi
};

// ──────────────────────────────────────────────────────────────────────────────
// FAIXA ETÁRIA DINÂMICA — calcula categoria atual com base na data
// ──────────────────────────────────────────────────────────────────────────────
const calcularFaixaAtual = (animal: Animal): string => {
  // Se for especial, não muda a categoria (reprodutor/matriz permanece)
  if (animal.tipo_cadastro === "especial") return animal.faixa_etaria;

  // Referência: data de nascimento ou data de compra + estimativa de idade na compra
  let dataNascimento: Date | null = null;

  if (animal.data_nascimento) {
    dataNascimento = new Date(animal.data_nascimento);
  } else if (animal.data_compra) {
    // Estima data de nascimento com base na faixa na época da compra
    const idadeEstimadaMeses: Record<string, number> = {
      bezerro: 6,
      garrote: 18,
      boi: 30,
      novilho: 30,
      adulto: 42,
    };
    const mesesNaCompra = idadeEstimadaMeses[animal.faixa_etaria] ?? 12;
    const dataCompra = new Date(animal.data_compra);
    dataNascimento = new Date(dataCompra);
    dataNascimento.setMonth(dataNascimento.getMonth() - mesesNaCompra);
  }

  if (!dataNascimento) return animal.faixa_etaria;

  const now = new Date();
  const meses =
    (now.getFullYear() - dataNascimento.getFullYear()) * 12 +
    (now.getMonth() - dataNascimento.getMonth());

  if (meses <= 12) return "bezerro";
  if (meses <= 25) return "garrote";
  return "boi";
};

const faixaAtualLabel = (animal: Animal): string => faixaLabel[calcularFaixaAtual(animal)] ?? "—";

// ──────────────────────────────────────────────────────────────────────────────
// FILTER LOGIC (unchanged)
// ──────────────────────────────────────────────────────────────────────────────
const filtrarPorAba = (animais: Animal[], aba: string) => {
  const ativos = animais.filter(a => a.status === "ativo");
  switch (aba) {
    case "reprodutores": return ativos.filter(a => a.sexo === "macho_inteiro" && a.faixa_etaria === "adulto" && a.tipo_cadastro === "especial");
    case "garrotes":     return ativos.filter(a => a.sexo === "macho_inteiro" && a.faixa_etaria !== "adulto");
    case "bois":         return ativos.filter(a => a.sexo === "macho_capado");
    case "matrizes":     return ativos.filter(a => a.sexo === "femea" && a.faixa_etaria === "adulto");
    case "novilhas":     return ativos.filter(a => a.sexo === "femea" && ["garrote", "novilho"].includes(a.faixa_etaria));
    case "bezerras":     return ativos.filter(a => a.sexo === "femea" && a.faixa_etaria === "bezerro");
    default:             return animais;
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// PIE CHART HELPERS (unchanged)
// ──────────────────────────────────────────────────────────────────────────────
const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "hsl(224,42%,20%)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 14px", color: "#fff", fontSize: 13 }}>
        <p style={{ fontWeight: 700 }}>{payload[0].name}</p>
        <p style={{ color: "#8892b0" }}>{payload[0].value} animais</p>
      </div>
    );
  }
  return null;
};

const CustomTooltipValor = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "hsl(224,42%,20%)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 14px", color: "#fff", fontSize: 13 }}>
        <p style={{ fontWeight: 700 }}>{payload[0].name}</p>
        <p style={{ color: "#8892b0" }}>{payload[0].value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
      </div>
    );
  }
  return null;
};

// ──────────────────────────────────────────────────────────────────────────────
// STATUS BADGE
// ──────────────────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, { bg: string; color: string }> = {
    ativo:   { bg: "rgba(52,211,153,0.12)", color: "#34d399" },
    vendido: { bg: "rgba(96,165,250,0.12)", color: "#60a5fa" },
    morto:   { bg: "rgba(248,113,113,0.12)", color: "#f87171" },
  };
  const s = styles[status] || styles.ativo;
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, textTransform: "capitalize" }}>
      {status}
    </span>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// TABELA ANIMAIS — dark analytics style
// ──────────────────────────────────────────────────────────────────────────────
const TabelaAnimais = ({ animais, search, onEditar, onVenda, onMorte }: {
  animais: Animal[]; search: string;
  onEditar: (a: Animal) => void; onVenda: (a: Animal) => void; onMorte: (a: Animal) => void;
}) => {
  const filtrados = animais.filter(a =>
    (a.brinco || "").toLowerCase().includes(search.toLowerCase()) ||
    (a.numero_compra || "").includes(search) ||
    (a.vendedor_nome || "").toLowerCase().includes(search.toLowerCase())
  );

  if (filtrados.length === 0) return (
    <div className="text-center py-16">
      <PawPrint size={40} className="mx-auto mb-3 opacity-30" style={{ color: "var(--accent-orange)" }} />
      <p style={{ color: "var(--text-secondary)" }} className="font-semibold">Nenhum animal nesta categoria.</p>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
            {["Brinco", "Nº Compra", "Sexo", "Faixa", "Peso", "Vendedor", "Status", "Ações"].map(h => (
              <th key={h} className={`px-5 py-3.5 font-semibold text-xs uppercase tracking-wider ${h === "Ações" ? "text-right" : "text-left"}`}
                style={{ color: "var(--text-secondary)" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtrados.map((animal, index) => (
            <tr
              key={animal.id}
              className="transition-colors duration-150"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                background: index % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,107,53,0.04)")}
              onMouseLeave={e => (e.currentTarget.style.background = index % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent")}
            >
              <td className="px-5 py-4 font-semibold text-white">
                {animal.brinco || <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: 11 }}>Sem brinco</span>}
              </td>
              <td className="px-5 py-4 font-mono font-bold" style={{ color: "var(--accent-orange)" }}>
                #{animal.numero_compra}
              </td>
              <td className="px-5 py-4 text-white">{sexoLabel[animal.sexo]}</td>
              <td className="px-5 py-4 text-white">{faixaLabel[animal.faixa_etaria]}</td>
              <td className="px-5 py-4 font-mono" style={{ color: "var(--text-secondary)" }}>
                {animal.peso_entrada ? `${animal.peso_entrada} kg` : <span style={{ fontStyle: "italic", fontSize: 11 }}>—</span>}
              </td>
              <td className="px-5 py-4" style={{ color: "var(--text-secondary)" }}>{animal.vendedor_nome || "—"}</td>
              <td className="px-5 py-4"><StatusBadge status={animal.status} /></td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-1.5">
                  <button onClick={() => onEditar(animal)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: "rgba(255,107,53,0.1)", color: "#ff6b35", border: "1px solid rgba(255,107,53,0.2)" }}>
                    <Pencil size={11} /> Editar
                  </button>
                  {animal.status === "ativo" && (
                    <>
                      <button onClick={() => onVenda(animal)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)" }}>
                        <DollarSign size={11} /> Venda
                      </button>
                      <button onClick={() => onMorte(animal)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
                        <Skull size={11} /> Morte
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// MODAL WRAPPER
// ──────────────────────────────────────────────────────────────────────────────
const Modal = ({ onClose, children }: { onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
    <div className="w-full max-w-md relative rounded-2xl p-6 gradient-border-top"
      style={{ background: "hsl(224,42%,20%)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
      <button onClick={onClose} className="absolute top-4 right-4 text-[#8892b0] hover:text-white transition-colors">
        <X size={16} />
      </button>
      {children}
    </div>
  </div>
);

// ──────────────────────────────────────────────────────────────────────────────
// CATEGORY SUMMARY CARD
// ──────────────────────────────────────────────────────────────────────────────
interface CatCardProps {
  label: string;
  count: number;
  sub: string;
  color: string;
  borderColor: string;
}
const CatCard = ({ label, count, sub, color, borderColor }: CatCardProps) => (
  <div className="rounded-xl p-4 animate-enter"
    style={{ background: "hsl(224,42%,20%)", border: "1px solid rgba(255,255,255,0.08)", borderLeft: `3px solid ${borderColor}` }}>
    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>{label}</p>
    <p className="text-3xl font-black font-mono" style={{ color }}>{count}</p>
    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{sub}</p>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const AnimaisPage = () => {
  const navigate = useNavigate();
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);

  // Modal: edit
  const [modalEditar, setModalEditar] = useState(false);
  const [animalSel, setAnimalSel] = useState<Animal | null>(null);
  const [editBrinco, setEditBrinco] = useState("");
  const [editPeso, setEditPeso] = useState("");
  const [editObs, setEditObs] = useState("");
  const [editStatus, setEditStatus] = useState("ativo");
  const [erroEditar, setErroEditar] = useState("");
  const [loadingEditar, setLoadingEditar] = useState(false);

  // Modal: venda
  const [modalVenda, setModalVenda] = useState(false);
  const [animalVenda, setAnimalVenda] = useState<Animal | null>(null);
  const [valorVenda, setValorVenda] = useState("");
  const [dataVenda, setDataVenda] = useState(new Date().toISOString().split("T")[0]);
  const [erroVenda, setErroVenda] = useState("");
  const [loadingVenda, setLoadingVenda] = useState(false);

  // Modal: morte
  const [modalMorte, setModalMorte] = useState(false);
  const [animalMorte, setAnimalMorte] = useState<Animal | null>(null);
  const [causaMorte, setCausaMorte] = useState("");
  const [dataMorte, setDataMorte] = useState(new Date().toISOString().split("T")[0]);
  const [erroMorte, setErroMorte] = useState("");
  const [loadingMorte, setLoadingMorte] = useState(false);

  const token = localStorage.getItem("easy_cattle_token");

  const carregarAnimais = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/animais`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setAnimais(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Erro ao carregar animais:", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { carregarAnimais(); }, []);

  const abrirEditar = (a: Animal) => {
    setAnimalSel(a); setEditBrinco(a.brinco || "");
    setEditPeso(a.peso_entrada ? String(a.peso_entrada) : "");
    setEditObs(a.observacao || ""); setEditStatus(a.status);
    setErroEditar(""); setModalEditar(true);
  };

  const handleEditar = async () => {
    setLoadingEditar(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/animais/${animalSel?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ brinco: editBrinco, peso_entrada: Number(editPeso) || null, observacao: editObs, status: editStatus }),
      });
      const data = await res.json();
      if (!res.ok) { setErroEditar(data.error || "Erro."); return; }
      setModalEditar(false);
      carregarAnimais();
    } catch { setErroEditar("Não foi possível conectar."); }
    finally { setLoadingEditar(false); }
  };

  const handleVenda = async () => {
    if (!valorVenda) { setErroVenda("Informe o valor da venda."); return; }
    setLoadingVenda(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/animais/${animalVenda?.id}/venda`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ valor_venda: Number(valorVenda), data_saida: dataVenda }),
      });
      const data = await res.json();
      if (!res.ok) { setErroVenda(data.error || "Erro."); return; }
      setModalVenda(false); carregarAnimais();
    } catch { setErroVenda("Não foi possível conectar."); }
    finally { setLoadingVenda(false); }
  };

  const handleMorte = async () => {
    setLoadingMorte(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/animais/${animalMorte?.id}/morte`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ causa_morte: causaMorte, data_saida: dataMorte }),
      });
      const data = await res.json();
      if (!res.ok) { setErroMorte(data.error || "Erro."); return; }
      setModalMorte(false); carregarAnimais();
    } catch { setErroMorte("Não foi possível conectar."); }
    finally { setLoadingMorte(false); }
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const ativos = animais.filter(a => a.status === "ativo");
  const cnt = {
    reprodutores: filtrarPorAba(animais, "reprodutores").length,
    garrotes:     filtrarPorAba(animais, "garrotes").length,
    bois:         filtrarPorAba(animais, "bois").length,
    matrizes:     filtrarPorAba(animais, "matrizes").length,
    novilhas:     filtrarPorAba(animais, "novilhas").length,
    bezerras:     filtrarPorAba(animais, "bezerras").length,
  };

  const CORES_PIZZA = ["#ff6b35", "#e040fb", "#84cc16", "#7c3aed", "#00e5ff", "#fbbf24"];

  const dadosPizza = [
    { name: "Reprodutores", value: cnt.reprodutores },
    { name: "Garrotes",     value: cnt.garrotes },
    { name: "Bois",         value: cnt.bois },
    { name: "Matrizes",     value: cnt.matrizes },
    { name: "Novilhas",     value: cnt.novilhas },
    { name: "Bezerras",     value: cnt.bezerras },
  ].filter(d => d.value > 0);

  const calcularValorCategoria = (lista: Animal[]) =>
    lista.reduce((acc, a) => acc + (a.peso_entrada || 0) * (a.valor_kg || 0), 0);

  const dadosValor = [
    { name: "Reprodutores", value: calcularValorCategoria(filtrarPorAba(animais, "reprodutores")) },
    { name: "Garrotes",     value: calcularValorCategoria(filtrarPorAba(animais, "garrotes")) },
    { name: "Bois",         value: calcularValorCategoria(filtrarPorAba(animais, "bois")) },
    { name: "Matrizes",     value: calcularValorCategoria(filtrarPorAba(animais, "matrizes")) },
    { name: "Novilhas",     value: calcularValorCategoria(filtrarPorAba(animais, "novilhas")) },
    { name: "Bezerras",     value: calcularValorCategoria(filtrarPorAba(animais, "bezerras")) },
  ].filter(d => d.value > 0);

  const valorTotalRebanho = dadosValor.reduce((acc, d) => acc + d.value, 0);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <AppLayout title="Rebanho">
      <div className="max-w-7xl mx-auto">

        {/* ── Toolbar ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {/* Search */}
          <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-full min-w-48"
            style={{ background: "hsl(224,42%,20%)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Search size={16} style={{ color: "var(--text-secondary)" }} />
            <input
              placeholder="Buscar por brinco, nº compra ou vendedor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-[#4a5568]"
            />
          </div>

          {/* Dashboard toggle */}
          <button
            onClick={() => setShowDashboard(v => !v)}
            className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all"
            style={{
              background: showDashboard ? "rgba(255,107,53,0.15)" : "hsl(224,42%,20%)",
              color: showDashboard ? "var(--accent-orange)" : "var(--text-secondary)",
              border: `1px solid ${showDashboard ? "rgba(255,107,53,0.3)" : "rgba(255,255,255,0.08)"}`,
            }}>
            <TrendingUp size={15} /> Dashboard
          </button>

          {/* Action buttons */}
          <button onClick={() => navigate("/animais/nova-compra")} className="btn-gradient flex items-center gap-2">
            <Plus size={14} /> Nova Compra
          </button>
          <button onClick={() => navigate("/animais/cadastro-especial?sexo=macho_inteiro")}
            className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all"
            style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
            <Plus size={14} /> 🐂 Reprodutor
          </button>
          <button onClick={() => navigate("/animais/cadastro-especial?sexo=femea")}
            className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all"
            style={{ background: "rgba(224,64,251,0.12)", color: "#e040fb", border: "1px solid rgba(224,64,251,0.25)" }}>
            <Plus size={14} /> 🐄 Matriz
          </button>
        </div>

        {/* ── Summary cards ──────────────────────────────────────────────────── */}
        <div className="flex gap-4 mb-6 items-stretch">
          {/* Total */}
          <div className="rounded-2xl w-44 flex-shrink-0 flex flex-col items-center justify-center gap-2 py-6 px-4 animate-enter"
            style={{ background: "hsl(224,42%,20%)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-center" style={{ color: "var(--text-secondary)" }}>Total Ativo</p>
            <p className="text-6xl font-black font-mono" style={{ color: "var(--accent-orange)" }}>{ativos.length}</p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>animais</p>
          </div>

          {/* Category grid */}
          <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-3">
            <CatCard label="Reprodutores" count={cnt.reprodutores} sub="Macho inteiro adulto" color="#fbbf24" borderColor="#fbbf24" />
            <CatCard label="Garrotes"     count={cnt.garrotes}     sub="Inteiros jovens"      color="#ff6b35" borderColor="#ff6b35" />
            <CatCard label="Bois"         count={cnt.bois}         sub="Machos castrados"     color="#fb923c" borderColor="#fb923c" />
            <CatCard label="Matrizes"     count={cnt.matrizes}     sub="Fêmea acima 36m"      color="#e040fb" borderColor="#e040fb" />
            <CatCard label="Novilhas"     count={cnt.novilhas}     sub="Fêmea 13 a 36m"       color="#c084fc" borderColor="#c084fc" />
            <CatCard label="Bezerras"     count={cnt.bezerras}     sub="Fêmea 0 a 12m"        color="#a78bfa" borderColor="#a78bfa" />
          </div>
        </div>

        {/* ── Dashboard charts ──────────────────────────────────────────────── */}
        {showDashboard && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 animate-enter">
            {/* Pizza: composição */}
            <div className="dash-card">
              <p className="text-sm font-bold text-white font-exo2 mb-1">Composição do Rebanho</p>
              <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>Distribuição por categoria (ativos)</p>
              {dadosPizza.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={dadosPizza} cx="50%" cy="50%" labelLine={false} label={renderCustomLabel} outerRadius={100} dataKey="value">
                      {dadosPizza.map((_, i) => <Cell key={i} fill={CORES_PIZZA[i % CORES_PIZZA.length]} stroke="none" />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend formatter={v => <span style={{ color: "#8892b0", fontSize: 12 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[260px] flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>
                  Nenhum animal ativo cadastrado.
                </div>
              )}
            </div>

            {/* Pizza: valor */}
            <div className="dash-card">
              <p className="text-sm font-bold text-white font-exo2 mb-1">Valor Estimado do Rebanho</p>
              <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
                Peso de entrada × valor/kg
                {valorTotalRebanho > 0 && (
                  <span className="ml-2 font-bold" style={{ color: "var(--accent-orange)" }}>
                    Total: {valorTotalRebanho.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                )}
              </p>
              {dadosValor.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={dadosValor} cx="50%" cy="50%" labelLine={false} label={renderCustomLabel} outerRadius={100} dataKey="value">
                      {dadosValor.map((_, i) => <Cell key={i} fill={CORES_PIZZA[i % CORES_PIZZA.length]} stroke="none" />)}
                    </Pie>
                    <Tooltip content={<CustomTooltipValor />} />
                    <Legend formatter={v => <span style={{ color: "#8892b0", fontSize: 12 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[260px] flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>
                  Cadastre peso e valor/kg para visualizar.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tabela com abas ────────────────────────────────────────────────── */}
        {loading ? (
          <div className="dash-card text-center py-16">
            <div className="w-8 h-8 border-2 border-[#ff6b35] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p style={{ color: "var(--text-secondary)" }}>Carregando animais...</p>
          </div>
        ) : (
          <div className="dash-card">
            <Tabs defaultValue="todos">
              <TabsList className="mb-6 flex-wrap h-auto gap-1 bg-transparent p-0">
                {[
                  { value: "todos",        label: `Todos (${animais.length})` },
                  { value: "reprodutores", label: `Reprodutores (${cnt.reprodutores})` },
                  { value: "garrotes",     label: `Garrotes (${cnt.garrotes})` },
                  { value: "bois",         label: `Bois (${cnt.bois})` },
                  { value: "matrizes",     label: `Matrizes (${cnt.matrizes})` },
                  { value: "novilhas",     label: `Novilhas (${cnt.novilhas})` },
                  { value: "bezerras",     label: `Bezerras (${cnt.bezerras})` },
                ].map(tab => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="rounded-lg px-3 py-2 text-xs font-semibold transition-all
                      data-[state=active]:bg-[#ff6b35]/15 data-[state=active]:text-[#ff6b35]
                      data-[state=inactive]:text-[#8892b0] data-[state=inactive]:bg-transparent
                      data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-white/5"
                    style={{ border: "none", outline: "none", boxShadow: "none" }}
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {["todos", "reprodutores", "garrotes", "bois", "matrizes", "novilhas", "bezerras"].map(aba => (
                <TabsContent key={aba} value={aba}>
                  <TabelaAnimais
                    animais={filtrarPorAba(animais, aba)}
                    search={search}
                    onEditar={abrirEditar}
                    onVenda={a => { setAnimalVenda(a); setValorVenda(""); setDataVenda(new Date().toISOString().split("T")[0]); setErroVenda(""); setModalVenda(true); }}
                    onMorte={a => { setAnimalMorte(a); setCausaMorte(""); setDataMorte(new Date().toISOString().split("T")[0]); setErroMorte(""); setModalMorte(true); }}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </div>

      {/* ── Modal: Editar ────────────────────────────────────────────────────── */}
      {modalEditar && animalSel && (
        <Modal onClose={() => setModalEditar(false)}>
          <h3 className="text-lg font-bold text-white font-exo2 mb-1">Editar Animal</h3>
          <p className="text-xs mb-5" style={{ color: "var(--text-secondary)" }}>
            Compra #{animalSel.numero_compra} — {sexoLabel[animalSel.sexo]} — {faixaLabel[animalSel.faixa_etaria]}
          </p>
          <div className="flex flex-col gap-3">
            <input type="text" placeholder="Número do brinco" value={editBrinco} onChange={e => setEditBrinco(e.target.value)} className="input-dark" />
            <input type="number" placeholder="Peso de entrada (kg)" value={editPeso} onChange={e => setEditPeso(e.target.value)} className="input-dark" />
            <input type="text" placeholder="Observação" value={editObs} onChange={e => setEditObs(e.target.value)} className="input-dark" />
            <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
              className="input-dark" style={{ background: "hsl(228,35%,14%)", color: "#fff" }}>
              <option value="ativo">Ativo</option>
              <option value="vendido">Vendido</option>
              <option value="morto">Morto</option>
            </select>
            {erroEditar && <p className="text-sm text-red-400 text-center">{erroEditar}</p>}
            <div className="flex gap-3 mt-2">
              <button onClick={() => setModalEditar(false)} className="btn-outline-dim flex-1">Cancelar</button>
              <button onClick={handleEditar} disabled={loadingEditar} className="btn-gradient flex-1">
                {loadingEditar ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal: Venda ─────────────────────────────────────────────────────── */}
      {modalVenda && animalVenda && (
        <Modal onClose={() => setModalVenda(false)}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(96,165,250,0.12)" }}>
              <DollarSign size={20} style={{ color: "#60a5fa" }} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-exo2">Registrar Venda</h3>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {animalVenda.brinco || "Sem brinco"} — Compra #{animalVenda.numero_compra}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <input type="number" placeholder="Valor da venda (R$)" value={valorVenda} onChange={e => setValorVenda(e.target.value)} className="input-dark" />
            <input type="date" value={dataVenda} onChange={e => setDataVenda(e.target.value)} className="input-dark" />
            {erroVenda && <p className="text-sm text-red-400 text-center">{erroVenda}</p>}
            <div className="flex gap-3 mt-2">
              <button onClick={() => setModalVenda(false)} className="btn-outline-dim flex-1">Cancelar</button>
              <button onClick={handleVenda} disabled={loadingVenda}
                className="flex-1 text-white rounded-lg py-2.5 text-sm font-bold transition-all disabled:opacity-50"
                style={{ background: "#2563eb" }}>
                {loadingVenda ? "Salvando..." : "Confirmar venda"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal: Morte ─────────────────────────────────────────────────────── */}
      {modalMorte && animalMorte && (
        <Modal onClose={() => setModalMorte(false)}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(248,113,113,0.12)" }}>
              <Skull size={20} style={{ color: "#f87171" }} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-exo2">Registrar Morte</h3>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {animalMorte.brinco || "Sem brinco"} — Compra #{animalMorte.numero_compra}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <input type="text" placeholder="Causa da morte (opcional)" value={causaMorte} onChange={e => setCausaMorte(e.target.value)} className="input-dark" />
            <input type="date" value={dataMorte} onChange={e => setDataMorte(e.target.value)} className="input-dark" />
            {erroMorte && <p className="text-sm text-red-400 text-center">{erroMorte}</p>}
            <div className="flex gap-3 mt-2">
              <button onClick={() => setModalMorte(false)} className="btn-outline-dim flex-1">Cancelar</button>
              <button onClick={handleMorte} disabled={loadingMorte}
                className="flex-1 text-white rounded-lg py-2.5 text-sm font-bold transition-all disabled:opacity-50"
                style={{ background: "#dc2626" }}>
                {loadingMorte ? "Salvando..." : "Confirmar morte"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
};

export default AnimaisPage;
