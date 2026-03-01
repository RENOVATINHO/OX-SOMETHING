// ==============================
// AppLayout.tsx — Layout principal da aplicação
// ==============================

import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, PawPrint, ShoppingCart, BarChart3, User, LogOut, TrendingUp, Edit, Lock, ArrowLeft, Boxes, Trash2, Skull } from "lucide-react";
import mascotImg from "@/assets/mascot.png";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { icon: Home, label: "Dashboard", route: "/dashboard" },
  { icon: PawPrint, label: "Animais", route: "/animais" },
  { icon: ShoppingCart, label: "Cadastros", route: "/cadastros" },
  { icon: BarChart3, label: "Relatórios", route: "/relatorios" },
];

const secondaryItems = [
  { icon: Boxes, label: "Estoque de Insumos", route: "/insumos/estoque" },
  { icon: TrendingUp, label: "Animais Vendidos", route: "/dashboard" },
  { icon: Edit, label: "Editar Cadastro", route: "/editar-cadastro" },
  { icon: Lock, label: "Alterar Senha", route: "/dashboard" },
];

interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

const AppLayout = ({ children, title }: AppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [modalLimpar, setModalLimpar] = useState(false);
  const [confirmTexto, setConfirmTexto] = useState("");
  const [loadingLimpar, setLoadingLimpar] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const isDashboard = location.pathname === "/dashboard";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleLimparBanco = async () => {
    setLoadingLimpar(true);
    const token = localStorage.getItem("easy_cattle_token");
    try {
      const res = await fetch("http://localhost:3001/api/dev/limpar-tudo", {
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

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-card border-r border-border flex flex-col flex-shrink-0 sticky top-0 h-screen">

        <div className="p-5 border-b border-border flex items-center gap-3">
          <img src={mascotImg} alt="Easy Cattle" className="w-10 h-10 rounded-full object-cover" />
          <h1 className="text-lg font-extrabold text-primary tracking-wide">Easy Cattle</h1>
        </div>

        <div className="px-5 py-3 border-b border-border bg-muted/50">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Propriedade Ativa</p>
          <p className="text-sm font-bold text-foreground">{user?.nomePropriedade || "Propriedade"}</p>
        </div>

        <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto">
          <p className="px-5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Menu Principal</p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.route || location.pathname.startsWith(item.route + "/");
            return (
              <button
                key={item.route}
                onClick={() => navigate(item.route)}
                className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm font-semibold transition-colors ${
                  isActive ? "bg-primary/10 text-primary border-r-2 border-primary" : "text-foreground/70 hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4">
            <p className="px-5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Outros</p>
            {secondaryItems.map((item) => {
              const isActive = location.pathname === item.route;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.route)}
                  className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                    isActive ? "bg-primary/10 text-primary border-r-2 border-primary font-semibold" : "text-foreground/70 hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Limpar banco */}
            <button
              onClick={() => { setModalLimpar(true); setConfirmTexto(""); setSucesso(false); }}
              className="w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors text-red-500 hover:bg-red-500/10 mt-1"
            >
              <Trash2 size={18} />
              <span>Limpar banco</span>
            </button>
          </div>
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <User size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user?.nome || "Usuário"}</p>
            </div>
            <button onClick={handleLogout} className="text-destructive hover:text-destructive/80 p-1">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 border-b border-border bg-card px-8 flex items-center gap-3 sticky top-0 z-10">
          {!isDashboard && (
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>

      {/* Modal limpar banco */}
      {modalLimpar && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-red-600/30 p-6 w-full max-w-sm">
            {sucesso ? (
              <div className="text-center py-4">
                <p className="text-2xl mb-2">✅</p>
                <p className="font-bold text-foreground">Banco limpo com sucesso!</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
                    <Skull size={20} className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Limpar banco de dados</h3>
                    <p className="text-xs text-muted-foreground">Apaga animais, compras, insumos e vendedores</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Digite <strong className="text-red-500">LIMPAR</strong> para confirmar:
                </p>
                <input
                  type="text"
                  placeholder="Digite LIMPAR"
                  value={confirmTexto}
                  onChange={(e) => setConfirmTexto(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none mb-3"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setModalLimpar(false)}
                    className="flex-1 border border-border rounded-lg py-2.5 text-sm font-semibold hover:bg-muted transition-colors">
                    Cancelar
                  </button>
                  <button
                    onClick={handleLimparBanco}
                    disabled={confirmTexto !== "LIMPAR" || loadingLimpar}
                    className="flex-1 bg-red-600 text-white rounded-lg py-2.5 text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-40">
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