import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, PawPrint, ShoppingCart, Package, BarChart3, User, LogOut, TrendingUp, Skull, Edit, Lock } from "lucide-react";
import mascotImg from "@/assets/mascot.png";

const navItems = [
  { icon: Home, label: "Dashboard", route: "/dashboard" },
  { icon: PawPrint, label: "Animais", route: "/animais" },
  { icon: ShoppingCart, label: "Cadastros", route: "/cadastros" },
  { icon: BarChart3, label: "Relatórios", route: "/relatorios" },
];

const secondaryItems = [
  { icon: TrendingUp, label: "Animais Vendidos", route: "/dashboard" },
  { icon: Skull, label: "Animais Mortos", route: "/dashboard" },
  { icon: Edit, label: "Editar Cadastro", route: "/dashboard" },
  { icon: Lock, label: "Alterar Senha", route: "/dashboard" },
];

interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

const AppLayout = ({ children, title }: AppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col flex-shrink-0 sticky top-0 h-screen">
        {/* Logo */}
        <div className="p-5 border-b border-border flex items-center gap-3">
          <img src={mascotImg} alt="Rebanho Fácil" className="w-10 h-10 rounded-full object-cover" />
          <h1 className="text-lg font-extrabold text-primary tracking-wide">Easy Cattle</h1>
        </div>

        {/* Property */}
        <div className="px-5 py-3 border-b border-border bg-muted/50">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Propriedade</p>
          <p className="text-sm font-bold text-foreground">Fazenda Minas Gerais</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto">
          <p className="px-5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Menu Principal</p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.route || location.pathname.startsWith(item.route + "/");
            return (
              <button
                key={item.route}
                onClick={() => navigate(item.route)}
                className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary border-r-2 border-primary"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4">
            <p className="px-5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Outros</p>
            {secondaryItems.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.route)}
                className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* User footer */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <User size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">Guilherme Renovato</p>
              <p className="text-[11px] text-muted-foreground truncate">guilherme@email.com</p>
            </div>
            <button onClick={() => navigate("/")} className="text-destructive hover:text-destructive/80 p-1">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-card px-8 flex items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
        </header>

        {/* Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
