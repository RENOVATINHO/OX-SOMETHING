// ==============================
// DashboardPage.tsx — Dark analytics dashboard
// Visual overhaul: gradient banner, KPI cards, SVG progress rings, quick actions
// All API calls and business logic are unchanged
// ==============================

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PawPrint, ShoppingCart, Package, BarChart3, TrendingUp, ArrowUpRight } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/context/AuthContext";
import GraficoRoscaInsumos from "@/components/GraficoRoscaInsumos";
import celeiroIcon from "@/assets/celeiro.png";

interface AnimalStats {
  total: number;
  matrizes: number;
  reprodutores: number;
  bezerros: number;
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
      // ease-out cubic
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
  value: number;   // 0-100 percentage
  total: number;   // raw number to display
  label: string;
  color: string;   // stroke color
  delay?: number;  // animation delay in ms
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
          {/* Background track */}
          <circle
            cx={50} cy={50} r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={8}
          />
          {/* Progress arc */}
          <circle
            cx={50} cy={50} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)" }}
          />
          {/* Glow effect */}
          <circle
            cx={50} cy={50} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
            style={{
              filter: `drop-shadow(0 0 6px ${color})`,
              opacity: 0.4,
              transition: "stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
        </svg>
        {/* Center text */}
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
}

const KpiCard = ({ label, value, icon: Icon, color, gradient, delay = 0 }: KpiCardProps) => {
  const count = useCounter(value, 900);

  return (
    <div className="dash-card relative overflow-hidden animate-enter" style={{ animationDelay: `${delay}ms` }}>
      {/* Subtle radial glow */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)`, transform: "translate(30%, -30%)" }} />

      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20` }}>
          <Icon size={20} style={{ color }} />
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
          <ArrowUpRight size={13} />
          <span>+2.4%</span>
        </div>
      </div>

      <p className="text-3xl font-black text-white font-mono mb-1">{count.toLocaleString("pt-BR")}</p>
      <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>{label}</p>

      {/* Progress bar */}
      <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full" style={{ width: `${Math.min((value / 200) * 100, 100)}%`, background: gradient }} />
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
  <button
    onClick={onClick}
    className="dash-card text-left w-full animate-enter group"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-200 group-hover:scale-110"
      style={{ background: `${color}18` }}>
      <Icon size={20} style={{ color }} />
    </div>
    <p className="font-bold text-white text-sm font-exo2">{label}</p>
    <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{desc}</p>
  </button>
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [animalStats, setAnimalStats] = useState<AnimalStats>({
    total: 0, matrizes: 0, reprodutores: 0, bezerros: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("easy_cattle_token");
    fetch(`${import.meta.env.VITE_API_URL}/api/animais/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setAnimalStats({
        total: data.total || 0,
        matrizes: data.matrizes || 0,
        reprodutores: data.reprodutores || 0,
        bezerros: data.bezerros || 0,
      }))
      .catch(() => {});
  }, []);

  const maxVal = Math.max(animalStats.total, 1);
  const ringData = [
    { label: "Total",        value: 100,                                           total: animalStats.total,        color: "#ff6b35" },
    { label: "Matrizes",     value: Math.round((animalStats.matrizes / maxVal) * 100),     total: animalStats.matrizes,     color: "#e040fb" },
    { label: "Reprodutores", value: Math.round((animalStats.reprodutores / maxVal) * 100), total: animalStats.reprodutores, color: "#7c3aed" },
    { label: "Bezerros",     value: Math.round((animalStats.bezerros / maxVal) * 100),     total: animalStats.bezerros,     color: "#00e5ff" },
  ];

  const kpiCards = [
    { label: "Total de Animais",  value: animalStats.total,        icon: PawPrint,     color: "#ff6b35", gradient: "linear-gradient(90deg, #ff6b35, transparent)" },
    { label: "Matrizes",          value: animalStats.matrizes,     icon: TrendingUp,   color: "#e040fb", gradient: "linear-gradient(90deg, #e040fb, transparent)" },
    { label: "Reprodutores",      value: animalStats.reprodutores, icon: BarChart3,    color: "#7c3aed", gradient: "linear-gradient(90deg, #7c3aed, transparent)" },
    { label: "Bezerros",          value: animalStats.bezerros,     icon: Package,      color: "#00e5ff", gradient: "linear-gradient(90deg, #00e5ff, transparent)" },
  ];

  const quickActions = [
    { icon: PawPrint,     label: "Nova Compra Animal", desc: "Registrar compra de animais", color: "#ff6b35", route: "/animais/nova-compra" },
    { icon: ShoppingCart, label: "Cadastros",           desc: "Acessar todos os cadastros", color: "#7c3aed", route: "/cadastros" },
    { icon: Package,      label: "Estoque Insumos",     desc: "Ver e movimentar estoque",   color: "#00e5ff", route: "/insumos/estoque" },
    { icon: BarChart3,    label: "Relatórios",          desc: "Acessar relatórios",         color: "#e040fb", route: "/relatorios" },
  ];

  return (
    <AppLayout title="Dashboard">

      {/* ── Gradient property banner ──────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden mb-8 p-6 animate-enter"
        style={{ background: "linear-gradient(135deg, #ff6b35 0%, #e040fb 60%, #7c3aed 100%)" }}>
        {/* Noise overlay */}
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
        {/* Decorative circles */}
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
          <div className="grid grid-cols-4 gap-2">
            {ringData.map((ring, i) => (
              <ProgressRing key={ring.label} {...ring} delay={i * 150} />
            ))}
          </div>
        </div>

        {/* Insumos donut */}
        <div className="animate-enter stagger-4">
          <GraficoRoscaInsumos />
        </div>
      </div>


    </AppLayout>
  );
};

export default DashboardPage;
