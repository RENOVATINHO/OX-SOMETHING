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
  macho_inteiro: "Macho",
  macho_capado:  "Macho Castrado",
  femea:         "Fêmea",
};
const faixaLabel: Record<string, string> = {
  bezerro: "Bezerro",
  garrote: "Garrote",
  boi:     "Boi",
  novilho: "Boi",   // legado → exibe como Boi
  adulto:  "Boi",   // legado → exibe como Boi
};
const faixaLabelFemea: Record<string, string> = {
  bezerro: "Bezerra",
  garrote: "Novilha",
  boi:     "Vaca",
  novilho: "Vaca",
  adulto:  "Vaca",
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

const faixaAtualLabel = (animal: Animal): string => {
  const faixa = calcularFaixaAtual(animal);
  const map = animal.sexo === "femea" ? faixaLabelFemea : faixaLabel;
  return map[faixa] ?? "—";
};

// ──────────────────────────────────────────────────────────────────────────────
// FILTER LOGIC (unchanged)
// ──────────────────────────────────────────────────────────────────────────────
const filtrarPorAba = (animais: Animal[], aba: string) => {
  const ativos = animais.filter(a => a.status === "ativo");
  switch (aba) {
    // Especiais cadastrados individualmente
    case "reprodutores": return ativos.filter(a => a.sexo === "macho_inteiro" && a.tipo_cadastro === "especial");
    case "matrizes":     return ativos.filter(a => a.sexo === "femea" && a.tipo_cadastro === "especial");
    // Machos não-especiais — usa faixa calculada dinamicamente
    case "garrotes":     return ativos.filter(a => a.sexo === "macho_inteiro" && calcularFaixaAtual(a) === "garrote" && a.tipo_cadastro !== "especial");
    case "bois":         return ativos.filter(a =>
      a.sexo === "macho_capado" ||
      (a.sexo === "macho_inteiro" && calcularFaixaAtual(a) === "boi" && a.tipo_cadastro !== "especial")
    );
    // Fêmeas não-especiais — usa faixa calculada dinamicamente
    case "novilhas":     return ativos.filter(a => a.sexo === "femea" && ["garrote", "boi"].includes(calcularFaixaAtual(a)) && a.tipo_cadastro !== "especial");
    case "bezerras":     return ativos.filter(a => a.sexo === "femea" && calcularFaixaAtual(a) === "bezerro");
    case "bezerros":     return ativos.filter(a => a.sexo !== "femea" && calcularFaixaAtual(a) === "bezerro" && a.tipo_cadastro !== "especial");
    default:             return animais;
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// PROGRESS RING — igual ao Dashboard
// ──────────────────────────────────────────────────────────────────────────────
function useCounter(target: number, duration = 700) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>();
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);
  return count;
}

interface RingProps { value: number; total: number; label: string; color: string; delay?: number; }
const ProgressRingSmall = ({ value, total, label, color, delay = 0 }: RingProps) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(false);
  const count = useCounter(total, 700);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), delay + 100);
    return () => clearTimeout(t);
  }, [delay]);
  const offset = animated ? circumference - (value / 100) * circumference : circumference;
  return (
    <div className="flex flex-col items-center gap-1.5" style={{ animationDelay: `${delay}ms` }}>
      <div className="relative">
        <svg width={84} height={84} viewBox="0 0 84 84">
          <circle cx={42} cy={42} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
          <circle cx={42} cy={42} r={radius} fill="none" stroke={color} strokeWidth={7}
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            transform="rotate(-90 42 42)"
            style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)", filter: `drop-shadow(0 0 5px ${color}80)` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black text-white font-mono leading-none">{count}</span>
          <span className="text-[9px] font-semibold" style={{ color: "var(--text-muted)" }}>{value > 0 ? `${value}%` : "—"}</span>
        </div>
      </div>
      <span className="text-[10px] font-semibold text-center leading-tight" style={{ color: "var(--text-secondary)" }}>{label}</span>
    </div>
  );
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
              <td className="px-5 py-4 text-white">{faixaAtualLabel(animal)}</td>
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
  const [editCastrado, setEditCastrado] = useState(false);
  const [erroEditar, setErroEditar] = useState("");
  const [loadingEditar, setLoadingEditar] = useState(false);

  // Modal: venda
  const [modalVenda, setModalVenda] = useState(false);
  const [animalVenda, setAnimalVenda] = useState<Animal | null>(null);
  const [valorVenda, setValorVenda] = useState("");
  const [dataVenda, setDataVenda] = useState(new Date().toISOString().split("T")[0]);
  const [compradorVenda, setCompradorVenda] = useState("");
  const [gtaSaida, setGtaSaida] = useState("");
  const [finalidadeVenda, setFinalidadeVenda] = useState("");
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
    setEditCastrado(a.sexo === "macho_capado");
    setErroEditar(""); setModalEditar(true);
  };

  const handleEditar = async () => {
    setLoadingEditar(true);
    const sexoAtualizado = animalSel?.sexo !== "femea"
      ? (editCastrado ? "macho_capado" : "macho_inteiro")
      : "femea";
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/animais/${animalSel?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ brinco: editBrinco, peso_entrada: Number(editPeso) || null, observacao: editObs, status: editStatus, sexo: sexoAtualizado }),
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
        body: JSON.stringify({ valor_venda: Number(valorVenda), data_saida: dataVenda, comprador_nome: compradorVenda, numero_gta_saida: gtaSaida, finalidade_venda: finalidadeVenda }),
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
    bezerros:     filtrarPorAba(animais, "bezerros").length,
  };
  const totalAtivo = ativos.length || 1;

  // Composição com anéis — igual ao Dashboard
  const ringData = [
    { label: "Reprodutores", value: Math.round((cnt.reprodutores / totalAtivo) * 100), total: cnt.reprodutores, color: "#fbbf24" },
    { label: "Garrotes",     value: Math.round((cnt.garrotes     / totalAtivo) * 100), total: cnt.garrotes,     color: "#ff6b35" },
    { label: "Bois",         value: Math.round((cnt.bois         / totalAtivo) * 100), total: cnt.bois,         color: "#7c3aed" },
    { label: "Matrizes",     value: Math.round((cnt.matrizes     / totalAtivo) * 100), total: cnt.matrizes,     color: "#e040fb" },
    { label: "Novilhas",     value: Math.round((cnt.novilhas     / totalAtivo) * 100), total: cnt.novilhas,     color: "#c084fc" },
    { label: "Bezerros/as",  value: Math.round(((cnt.bezerros + cnt.bezerras) / totalAtivo) * 100), total: cnt.bezerros + cnt.bezerras, color: "#00e5ff" },
  ];

  const calcularValorCategoria = (lista: Animal[]) =>
    lista.reduce((acc, a) => {
      const v = a.tipo_cadastro === "especial"
        ? (a.valor_total || 0)
        : (a.peso_entrada || 0) * (a.valor_kg || 0);
      return acc + v;
    }, 0);

  const valorTotalRebanho =
    calcularValorCategoria(filtrarPorAba(animais, "reprodutores")) +
    calcularValorCategoria(filtrarPorAba(animais, "garrotes")) +
    calcularValorCategoria(filtrarPorAba(animais, "bois")) +
    calcularValorCategoria(filtrarPorAba(animais, "matrizes")) +
    calcularValorCategoria(filtrarPorAba(animais, "novilhas")) +
    calcularValorCategoria(filtrarPorAba(animais, "bezerras")) +
    calcularValorCategoria(filtrarPorAba(animais, "bezerros"));

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
          <div className="flex-1 grid grid-cols-4 grid-rows-2 gap-3">
            <CatCard label="Reprodutores" count={cnt.reprodutores} sub="Macho especial"        color="#fbbf24" borderColor="#fbbf24" />
            <CatCard label="Garrotes"     count={cnt.garrotes}     sub="Machos 12–25m"         color="#ff6b35" borderColor="#ff6b35" />
            <CatCard label="Bois"         count={cnt.bois}         sub="Machos 25m+ / capados"  color="#7c3aed" borderColor="#7c3aed" />
            <CatCard label="Bezerros"     count={cnt.bezerros}     sub="Machos 0–12m"           color="#00e5ff" borderColor="#00e5ff" />
            <CatCard label="Matrizes"     count={cnt.matrizes}     sub="Fêmea especial"         color="#e040fb" borderColor="#e040fb" />
            <CatCard label="Novilhas"     count={cnt.novilhas}     sub="Fêmeas 12m+"            color="#c084fc" borderColor="#c084fc" />
            <CatCard label="Bezerras"     count={cnt.bezerras}     sub="Fêmeas 0–12m"           color="#a78bfa" borderColor="#a78bfa" />
            <CatCard label="Valor Total"  count={0}                sub={valorTotalRebanho > 0 ? valorTotalRebanho.toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}) : "—"} color="#34d399" borderColor="#34d399" />
          </div>
        </div>

        {/* ── Composição com anéis (igual ao Dashboard) ─────────────────────── */}
        {showDashboard && (
          <div className="dash-card mb-6 animate-enter">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-base font-bold text-white font-exo2">Composição do Rebanho</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  Distribuição por categoria · faixa calculada pela data atual
                  {valorTotalRebanho > 0 && (
                    <span className="ml-2 font-bold" style={{ color: "#34d399" }}>
                      · Valor estimado: {valorTotalRebanho.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                    </span>
                  )}
                </p>
              </div>
            </div>
            {ativos.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                {ringData.map((ring, i) => (
                  <ProgressRingSmall key={ring.label} {...ring} delay={i * 100} />
                ))}
              </div>
            ) : (
              <div className="py-10 text-center" style={{ color: "var(--text-secondary)" }}>
                Nenhum animal ativo cadastrado.
              </div>
            )}
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
                  { value: "bezerros",     label: `Bezerros (${cnt.bezerros})` },
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

              {["todos", "reprodutores", "garrotes", "bois", "bezerros", "matrizes", "novilhas", "bezerras"].map(aba => (
                <TabsContent key={aba} value={aba}>
                  <TabelaAnimais
                    animais={filtrarPorAba(animais, aba)}
                    search={search}
                    onEditar={abrirEditar}
                    onVenda={a => { setAnimalVenda(a); setValorVenda(""); setDataVenda(new Date().toISOString().split("T")[0]); setCompradorVenda(""); setGtaSaida(""); setFinalidadeVenda(""); setErroVenda(""); setModalVenda(true); }}
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
            Compra #{animalSel.numero_compra} — {sexoLabel[animalSel.sexo]} — {faixaAtualLabel(animalSel)}
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
            {animalSel.sexo !== "femea" && (
              <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer"
                style={{ background: "hsl(228,35%,14%)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <input
                  type="checkbox"
                  checked={editCastrado}
                  onChange={e => setEditCastrado(e.target.checked)}
                  className="w-4 h-4 accent-[#ff6b35] cursor-pointer"
                />
                <span className="text-sm text-white">Animal castrado</span>
              </label>
            )}
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
            <input type="text" placeholder="Nome do comprador (opcional)" value={compradorVenda} onChange={e => setCompradorVenda(e.target.value)} className="input-dark" />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Nº GTA de saída" value={gtaSaida} onChange={e => setGtaSaida(e.target.value)} className="input-dark" />
              <input type="date" value={dataVenda} onChange={e => setDataVenda(e.target.value)} className="input-dark" />
            </div>
            <select value={finalidadeVenda} onChange={e => setFinalidadeVenda(e.target.value)}
              className="input-dark" style={{ background: "hsl(228,35%,14%)", color: finalidadeVenda ? "#fff" : "#4a5568" }}>
              <option value="">Finalidade (opcional)</option>
              {["Abate","Cria","Recria","Engorda","Reprodução","Exposição","Leilão"].map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <input type="number" placeholder="Valor da venda (R$) *" value={valorVenda} onChange={e => setValorVenda(e.target.value)} className="input-dark" />
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
