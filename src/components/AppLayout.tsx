// ==============================
// AppLayout.tsx — Layout principal (dark analytics dashboard)
//
// Desktop: sidebar fixa 68px icon-only à esquerda + header com breadcrumb
// Mobile:  sidebar oculta → hamburger abre overlay drawer completo
// ==============================

import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home, PawPrint, ShoppingCart, BarChart3, User, LogOut,
  TrendingUp, Edit, Lock, ArrowLeft, Boxes, Skull,
  Settings, Menu, X, Search, Bell,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import mascotImg from "@/assets/mascot.png";

// ── Nav items ──────────────────────────────────────────────────────────────
const navItems = [
  { icon: Home,         label: "Dashboard",          route: "/dashboard" },
  { icon: PawPrint,     label: "Animais",             route: "/animais" },
  { icon: ShoppingCart, label: "Compras",             route: "/cadastros" },
  { icon: BarChart3,    label: "Relatórios",          route: "/relatorios" },
];

const secondaryItems = [
  { icon: Boxes,    label: "Estoque de Insumos", route: "/insumos/estoque" },
  { icon: TrendingUp, label: "Animais Vendidos", route: "/nova-venda" },
  { icon: User,     label: "Novo Vendedor",      route: "/cadastros/novo-vendedor" },
  { icon: Edit,     label: "Editar Cadastro",    route: "/editar-cadastro" },
];

// ── Breadcrumb helper ──────────────────────────────────────────────────────
const ROUTE_LABELS: Record<string, string> = {
  "/dashboard":               "Dashboard",
  "/animais":                 "Animais",
  "/animais/novo":            "Novo Animal",
  "/animais/nova-compra":     "Nova Compra",
  "/animais/cadastro-especial":"Cadastro Especial",
  "/cadastros":               "Compras",
  "/cadastros/novo-vendedor": "Novo Vendedor",
  "/cadastros/novo-pasto":    "Novo Pasto",
  "/compras-animais":         "Compras",
  "/relatorios":              "Relatórios",
  "/insumos":                 "Insumos",
  "/insumos/novo":            "Novo Insumo",
  "/insumos/estoque":         "Estoque",
  "/editar-cadastro":         "Editar Cadastro",
};

const SECTION_LABEL: Record<string, string> = {
  "/animais":     "Animais",
  "/cadastros":   "Compras",
  "/relatorios":  "Relatórios",
  "/insumos":     "Insumos",
  "/compras":     "Compras",
  "/editar":      "Configurações",
};

function getBreadcrumb(pathname: string, title: string) {
  const first = Object.keys(SECTION_LABEL).find(k => pathname.startsWith(k));
  const section = first ? SECTION_LABEL[first] : null;
  if (pathname === "/dashboard") return ["Home", "Dashboard"];
  if (section && section !== title) return ["Home", section, title];
  return ["Home", title];
}

// ── NavIcon — shared icon button for desktop sidebar ──────────────────────
interface NavIconProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}
const NavIcon = ({ icon: Icon, label, isActive, onClick }: NavIconProps) => (
  <button
    onClick={onClick}
    title={label}
    className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 group
      ${isActive
        ? "sidebar-active-glow text-[#ff6b35]"
        : "text-[#8892b0] hover:text-white hover:bg-white/5"
      }`}
  >
    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
    {/* Tooltip */}
    <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-[#1f2b4a] text-white text-xs font-semibold
      px-2.5 py-1 rounded-lg border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100
      pointer-events-none transition-opacity duration-150 z-50 shadow-xl">
      {label}
    </span>
  </button>
);

// ── MobileDrawerItem — full row item for mobile overlay ───────────────────
interface DrawerItemProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}
const DrawerItem = ({ icon: Icon, label, isActive, onClick }: DrawerItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
      ${isActive
        ? "bg-[#ff6b35]/10 text-[#ff6b35] shadow-[inset_3px_0_0_#ff6b35]"
        : "text-[#8892b0] hover:text-white hover:bg-white/5"
      }`}
  >
    <Icon size={18} />
    <span>{label}</span>
  </button>
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

const AppLayout = ({ children, title }: AppLayoutProps) => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { user, logout } = useAuth();
  const isMobile   = useIsMobile();

  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [modalLimpar, setModalLimpar]   = useState(false);
  const [confirmTexto, setConfirmTexto] = useState("");
  const [loadingLimpar, setLoadingLimpar] = useState(false);
  const [sucesso, setSucesso]           = useState(false);

  const isDashboard = location.pathname === "/dashboard";
  const breadcrumb  = getBreadcrumb(location.pathname, title);

  const isActive = (route: string) =>
    location.pathname === route || location.pathname.startsWith(route + "/");

  const handleNav = (route: string) => {
    navigate(route);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleLimparBanco = async () => {
    setLoadingLimpar(true);
    const token = localStorage.getItem("easy_cattle_token");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/dev/limpar-tudo`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSucesso(true);
        setTimeout(() => {
          setModalLimpar(false);
          setConfirmTexto("");
          setSucesso(false);
          navigate("/dashboard");
        }, 1500);
      }
    } catch { console.error("Erro ao limpar."); }
    finally { setLoadingLimpar(false); }
  };

  // ── User initials for avatar ─────────────────────────────────────────────
  const initials = (user?.nome || "U")
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background flex">

      {/* ══════════════════════════════════════════════════════════════════
          DESKTOP SIDEBAR — 68px, icon-only, sticky
      ═══════════════════════════════════════════════════════════════════ */}
      {!isMobile && (
        <aside
          className="w-[68px] flex-shrink-0 sticky top-0 h-screen flex flex-col items-center py-4 gap-2 z-40"
          style={{ background: "hsl(var(--sidebar-background))", borderRight: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Logo / Avatar */}
          <div className="mb-4 mt-1">
            <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-[#7c3aed]/60 ring-offset-2 ring-offset-[#16213e]">
              <img src={mascotImg} alt="Easy Cattle" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Divider */}
          <div className="w-8 h-px bg-white/8 mb-2" />

          {/* Primary nav */}
          <nav className="flex flex-col items-center gap-1.5 flex-1">
            {navItems.map(item => (
              <NavIcon
                key={item.route}
                icon={item.icon}
                label={item.label}
                isActive={isActive(item.route)}
                onClick={() => handleNav(item.route)}
              />
            ))}

            <div className="w-8 h-px bg-white/8 my-2" />

            {/* Secondary nav */}
            {secondaryItems.map(item => (
              <NavIcon
                key={item.label}
                icon={item.icon}
                label={item.label}
                isActive={isActive(item.route) && item.route !== "/dashboard"}
                onClick={() => handleNav(item.route)}
              />
            ))}

          </nav>

          {/* Bottom: settings + logout */}
          <div className="flex flex-col items-center gap-1.5 mt-auto">
            <div className="w-8 h-px bg-white/8 mb-1" />
            <button
              title="Configurações"
              onClick={() => handleNav("/configuracoes")}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                isActive("/configuracoes") ? "text-[#ff6b35]" : "text-[#8892b0] hover:text-white hover:bg-white/5"
              }`}
            >
              <Settings size={18} />
            </button>
            <button
              onClick={handleLogout}
              title="Sair"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-[#8892b0] hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={18} />
            </button>
            {/* User avatar */}
            <div className="mt-2 w-8 h-8 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#e040fb] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">{initials}</span>
            </div>
          </div>
        </aside>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MOBILE OVERLAY DRAWER
      ═══════════════════════════════════════════════════════════════════ */}
      {isMobile && drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-40 animate-fade-in"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer panel */}
          <div className="fixed inset-y-0 left-0 w-72 z-50 flex flex-col py-6 px-4 animate-slide-in-left"
            style={{ background: "hsl(var(--sidebar-background))", borderRight: "1px solid rgba(255,255,255,0.08)" }}>

            {/* Header */}
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-3">
                <img src={mascotImg} alt="Easy Cattle" className="w-9 h-9 rounded-full ring-2 ring-[#7c3aed]/60" />
                <div>
                  <p className="text-sm font-bold text-white font-exo2">Easy Cattle</p>
                  <p className="text-[10px] text-[#8892b0]">{user?.nomePropriedade || "Propriedade"}</p>
                </div>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="text-[#8892b0] hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
              <p className="px-2 text-[10px] uppercase tracking-widest text-[#4a5568] font-semibold mb-1">Menu</p>
              {navItems.map(item => (
                <DrawerItem key={item.route} icon={item.icon} label={item.label}
                  isActive={isActive(item.route)} onClick={() => handleNav(item.route)} />
              ))}
              <div className="h-px bg-white/8 my-3" />
              <p className="px-2 text-[10px] uppercase tracking-widest text-[#4a5568] font-semibold mb-1">Outros</p>
              {secondaryItems.map(item => (
                <DrawerItem key={item.label} icon={item.icon} label={item.label}
                  isActive={isActive(item.route) && item.route !== "/dashboard"} onClick={() => handleNav(item.route)} />
              ))}
            </nav>

            {/* Footer */}
            <div className="border-t border-white/8 pt-4 mt-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#e040fb] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.nome || "Usuário"}</p>
                <p className="text-xs text-[#8892b0] truncate">{user?.nomePropriedade || "Propriedade"}</p>
              </div>
              <button onClick={handleLogout} className="text-[#8892b0] hover:text-red-400 p-1 transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MAIN CONTENT AREA
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">

        {/* ── Top Header ──────────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 flex flex-col"
          style={{ background: "hsl(var(--card))", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>

          {/* Main row */}
          <div className="h-14 px-6 flex items-center gap-3">
            {/* Mobile hamburger */}
            {isMobile && (
              <button onClick={() => setDrawerOpen(true)} className="text-[#8892b0] hover:text-white mr-1 transition-colors">
                <Menu size={22} />
              </button>
            )}

            {/* Back button (non-dashboard) */}
            {!isDashboard && (
              <button onClick={() => navigate(-1)} className="text-[#8892b0] hover:text-white transition-colors p-1 -ml-1">
                <ArrowLeft size={18} />
              </button>
            )}

            {/* Page title */}
            <h2 className="text-lg font-bold text-white font-exo2 tracking-wide">{title}</h2>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Search bar */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-sm"
              style={{ background: "hsl(var(--background))", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Search size={14} className="text-[#8892b0]" />
              <span className="text-[#4a5568] text-xs">Buscar...</span>
            </div>

            {/* Notifications */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-full text-[#8892b0] hover:text-white hover:bg-white/5 transition-all">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#ff6b35] rounded-full" />
            </button>

            {/* User chip (desktop) */}
            {!isMobile && (
              <div className="flex items-center gap-2 ml-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#e040fb] flex items-center justify-center">
                  <span className="text-white text-[11px] font-bold">{initials}</span>
                </div>
              </div>
            )}
          </div>

          {/* Breadcrumb row */}
          <div className="px-6 pb-2 flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="opacity-40">›</span>}
                <span className={i === breadcrumb.length - 1 ? "text-[#8892b0]" : "text-[#4a5568]"}>
                  {crumb}
                </span>
              </span>
            ))}
          </div>
        </header>

        {/* ── Page Content ────────────────────────────────────────────── */}
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MODAL: Limpar banco de dados
      ═══════════════════════════════════════════════════════════════════ */}
      {modalLimpar && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl p-6 relative gradient-border-top"
            style={{ background: "hsl(var(--card))", border: "1px solid rgba(255,255,255,0.08)" }}>
            {sucesso ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-bold text-white font-exo2">Banco limpo com sucesso!</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                    <Skull size={20} className="text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-exo2">Limpar banco de dados</h3>
                    <p className="text-xs text-[#8892b0]">Apaga animais, compras, insumos e vendedores</p>
                  </div>
                </div>
                <p className="text-sm text-[#8892b0] mb-3">
                  Digite <strong className="text-red-400">LIMPAR</strong> para confirmar:
                </p>
                <input
                  type="text"
                  placeholder="Digite LIMPAR"
                  value={confirmTexto}
                  onChange={(e) => setConfirmTexto(e.target.value)}
                  className="input-dark mb-4"
                />
                <div className="flex gap-3">
                  <button onClick={() => setModalLimpar(false)} className="btn-outline-dim flex-1">
                    Cancelar
                  </button>
                  <button
                    onClick={handleLimparBanco}
                    disabled={confirmTexto !== "LIMPAR" || loadingLimpar}
                    className="flex-1 bg-red-600 text-white rounded-lg py-2.5 text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-40"
                  >
                    {loadingLimpar ? "Limpando..." : "Confirmar"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
