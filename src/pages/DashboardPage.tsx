// ==============================
// DashboardPage.tsx — Dark analytics dashboard
// ==============================

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PawPrint, ShoppingCart, Package, BarChart3, TrendingUp, DollarSign } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer,
} from "recharts";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/context/AuthContext";
import GraficoRoscaInsumos from "@/components/GraficoRoscaInsumos";
import celeiroIcon from "@/assets/celeiro.png";

interface AnimalStats {
  total: number;
  reprodutores: number;
  matrizes: number;
  garrotes: number;
  bois: number;
  novilhas: number;
  bezerros: number;
  valorTotal: number;
}

// ── Animated counter hook ────────────────────────────────────────────────────
function useCounter(target: number, duration = 800) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return count;
}

// ── SVG Progress Ring ────────────────────────────────────────────────────────
interface RingProps {
  value: number;
  total: number;
  label: string;
  color: string;
  delay?: number;
}

const ProgressRing = ({ value, total, label, color, delay = 0 }: RingProps) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(false);
  const count = useCounter(total, 800);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), delay + 100);
    return () => clearTimeout(t);
  }, [delay]);

  const offset = animated
    ? circumference - (value / 100) * circumference
    : circumference;

  return (
    <div className="flex flex-col items-center gap-2 animate-enter" style={{ animationDelay: `${delay}ms` }}>
      <div className="relative">
        <svg width={100} height={100} viewBox="0 0 100 100">
          <circle cx={50} cy={50} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
          <circle
            cx={50} cy={50} r={radius} fill="none" stroke={color} strokeWidth={8}
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)" }}
          />
          <circle
            cx={50} cy={50} r={radius} fill="none" stroke={color} strokeWidth={2}
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
            style={{ filter: `drop-shadow(0 0 6px ${color})`, opacity: 0.4, transition: "stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white font-mono leading-none">{count}</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-center" style={{ color: "var(--text-secondary)" }}>
        {label}
      </span>
    </div>
  );
};

// ── KPI Card ─────────────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  gradient: string;
  delay?: number;
  pct?: number | null;
  isCurrency?: boolean;
  progressPct?: number;
}

const KpiCard = ({ label, value, icon: Icon, color, gradient, delay = 0, pct, isCurrency = false, progressPct }: KpiCardProps) => {
  const count = useCounter(value, 900);
  const barWidth = progressPct != null ? progressPct : Math.min((value / 200) * 100, 100);

  return (
    <div className="dash-card relative overflow-hidden animate-enter" style={{ animationDelay: `${delay}ms` }}>
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)`, transform: "translate(30%, -30%)" }} />

      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon size={20} style={{ color }} />
        </div>
        {pct != null && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
            style={{ background: `${color}18`, color }}>
            <span>{pct}% do total</span>
          </div>
        )}
      </div>

      <p className={`font-black text-white font-mono mb-1 ${isCurrency ? "text-xl sm:text-2xl" : "text-3xl"} truncate`}>
        {isCurrency
          ? count.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
          : count.toLocaleString("pt-BR")}
      </p>
      <p className="text-xs font-semibold mb-3 truncate" style={{ color: "var(--text-secondary)" }}>{label}</p>

      <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full" style={{ width: `${barWidth}%`, background: gradient }} />
      </div>
    </div>
  );
};

// ── Quick Action Card ─────────────────────────────────────────────────────────
interface QuickActionProps {
  icon: React.ElementType;
  label: string;
  desc: string;
  color: string;
  onClick: () => void;
  delay?: number;
}

const QuickAction = ({ icon: Icon, label, desc, color, onClick, delay = 0 }: QuickActionProps) => (
  <button onClick={onClick} className="dash-card text-left w-full animate-enter group" style={{ animationDelay: `${delay}ms` }}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-200 group-hover:scale-110"
      style={{ background: `${color}18` }}>
      <Icon size={20} style={{ color }} />
    </div>
    <p className="font-bold text-white text-sm font-exo2">{label}</p>
    <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{desc}</p>
  </button>
);

// ── Herd Value Evolution Chart ────────────────────────────────────────────────
const GraficoEvolucaoValor = ({ data }: { data: { mes: string; valor: number }[] }) => {
  if (data.length === 0) return (
    <div className="dash-card animate-enter flex items-center justify-center" style={{ minHeight: 260 }}>
      <p style={{ color: "var(--text-secondary)" }} className="text-sm text-center">
        Cadastre animais com peso e valor/kg<br />para ver a evolução do rebanho.
      </p>
    </div>
  );

  return (
    <div className="dash-card animate-enter">
      <div className="mb-6">
        <p className="text-base font-bold text-white font-exo2">Evolução do Valor do Rebanho</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>Valor estimado acumulado por mês</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="valorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="mes" tick={{ fill: "#8892b0", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: "#8892b0", fontSize: 11 }} axisLine={false} tickLine={false}
            tickFormatter={v => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`}
          />
          <RTooltip
            contentStyle={{ background: "hsl(224,42%,20%)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 13 }}
            formatter={(v: number) => [v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), "Valor acumulado"]}
          />
          <Area type="monotone" dataKey="valor" stroke="#ff6b35" strokeWidth={2}
            fill="url(#valorGradient)" dot={false} activeDot={{ r: 5, fill: "#ff6b35" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [animalStats, setAnimalStats] = useState<AnimalStats>({
    total: 0, reprodutores: 0, matrizes: 0, garrotes: 0, bois: 0, novilhas: 0, bezerros: 0, valorTotal: 0,
  });
  const [historicoValor, setHistoricoValor] = useState<{ mes: string; valor: number }[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("easy_cattle_token");
    const headers = { Authorization: `Bearer ${token}` };

    fetch(`${import.meta.env.VITE_API_URL}/api/animais/stats`, { headers })
      .then(r => r.json())
      .then(data => setAnimalStats({
        total: data.total || 0,
        reprodutores: data.reprodutores || 0,
        matrizes: data.matrizes || 0,
        garrotes: data.garrotes || 0,
        bois: data.bois || 0,
        novilhas: data.novilhas || 0,
        bezerros: data.bezerros || 0,
        valorTotal: Math.round(data.valor_total_rebanho || 0),
      }))
      .catch(() => {});

    fetch(`${import.meta.env.VITE_API_URL}/api/animais/historico-valor`, { headers })
      .then(r => r.json())
      .then(data => Array.isArray(data) && setHistoricoValor(data))
      .catch(() => {});
  }, []);

  const total = Math.max(animalStats.total, 1);

  // 6 anéis — composição completa do rebanho
  const ringData = [
    { label: "Total",        value: 100,                                                           total: animalStats.total,        color: "#ff6b35" },
    { label: "Reprodutores", value: Math.round((animalStats.reprodutores / total) * 100),          total: animalStats.reprodutores, color: "#fbbf24" },
    { label: "Matrizes",     value: Math.round((animalStats.matrizes     / total) * 100),          total: animalStats.matrizes,     color: "#e040fb" },
    { label: "Garrotes",     value: Math.round((animalStats.garrotes     / total) * 100),          total: animalStats.garrotes,     color: "#00e5ff" },
    { label: "Bois",         value: Math.round((animalStats.bois         / total) * 100),          total: animalStats.bois,         color: "#7c3aed" },
    { label: "Bezerros/as",  value: Math.round((animalStats.bezerros     / total) * 100),          total: animalStats.bezerros,     color: "#34d399" },
  ];

  const kpiCards = [
    {
      label: "Rebanho Total", value: animalStats.total,
      icon: PawPrint, color: "#ff6b35", gradient: "linear-gradient(90deg, #ff6b35, transparent)",
      pct: null, progressPct: 100,
    },
    {
      label: "Reprodutores + Matrizes", value: animalStats.reprodutores + animalStats.matrizes,
      icon: TrendingUp, color: "#fbbf24", gradient: "linear-gradient(90deg, #fbbf24, transparent)",
      pct: animalStats.total > 0 ? Math.round(((animalStats.reprodutores + animalStats.matrizes) / animalStats.total) * 100) : null,
      progressPct: animalStats.total > 0 ? Math.round(((animalStats.reprodutores + animalStats.matrizes) / animalStats.total) * 100) : 0,
    },
    {
      label: "Bois + Garrotes", value: animalStats.bois + animalStats.garrotes,
      icon: BarChart3, color: "#7c3aed", gradient: "linear-gradient(90deg, #7c3aed, transparent)",
      pct: animalStats.total > 0 ? Math.round(((animalStats.bois + animalStats.garrotes) / animalStats.total) * 100) : null,
      progressPct: animalStats.total > 0 ? Math.round(((animalStats.bois + animalStats.garrotes) / animalStats.total) * 100) : 0,
    },
    {
      label: "Valor do Rebanho", value: animalStats.valorTotal,
      icon: DollarSign, color: "#34d399", gradient: "linear-gradient(90deg, #34d399, transparent)",
      pct: null, isCurrency: true, progressPct: animalStats.valorTotal > 0 ? 100 : 0,
    },
  ];

  const quickActions = [
    { icon: PawPrint,     label: "Nova Compra",     desc: "Registrar compra de rebanho", color: "#ff6b35", route: "/animais/nova-compra" },
    { icon: ShoppingCart, label: "Cadastros",        desc: "Acessar todos os cadastros",  color: "#7c3aed", route: "/cadastros" },
    { icon: Package,      label: "Estoque Insumos",  desc: "Ver e movimentar estoque",    color: "#00e5ff", route: "/insumos/estoque" },
    { icon: BarChart3,    label: "Relatórios",       desc: "Acessar relatórios",          color: "#e040fb", route: "/relatorios" },
  ];

  return (
    <AppLayout title="Dashboard">

      {/* ── Gradient property banner ──────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden mb-8 p-6 animate-enter"
        style={{ background: "linear-gradient(135deg, #ff6b35 0%, #e040fb 60%, #7c3aed 100%)" }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")", backgroundSize: "128px" }} />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/20 flex-shrink-0">
            <img src={celeiroIcon} alt="Propriedade" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Propriedade Ativa</p>
            <p className="text-white text-3xl font-black font-exo2">
              {user?.nomePropriedade || "Minha Propriedade"}
            </p>
          </div>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute right-16 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/5" />
      </div>

      {/* ── KPI Cards grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((card, i) => (
          <KpiCard key={card.label} {...card} delay={i * 60} />
        ))}
      </div>

      {/* ── Progress Rings + Inventory Chart ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Rings card */}
        <div className="dash-card animate-enter stagger-3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-base font-bold text-white font-exo2">Composição do Rebanho</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>Distribuição por categoria</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {ringData.map((ring, i) => (
              <ProgressRing key={ring.label} {...ring} delay={i * 120} />
            ))}
          </div>
        </div>

        {/* Insumos donut */}
        <div className="animate-enter stagger-4">
          <GraficoRoscaInsumos />
        </div>
      </div>

      {/* ── Evolução do Valor do Rebanho ──────────────────────────────────── */}
      <div className="mb-8">
        <GraficoEvolucaoValor data={historicoValor} />
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, i) => (
          <QuickAction
            key={action.label}
            {...action}
            onClick={() => navigate(action.route)}
            delay={i * 60}
          />
        ))}
      </div>

    </AppLayout>
  );
};

export default DashboardPage;
