import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Home, ChevronRight, ShoppingCart, TrendingUp, BarChart3, PawPrint, X, User, Skull, Edit, Lock, MessageCircle, LogOut } from "lucide-react";

const menuCards = [
  { icon: Home, label: "fazenda minas gerais", route: "/dashboard", color: "text-primary" },
  { icon: PawPrint, label: "Cadastro de Animais", route: "/animais", color: "text-primary" },
];

const gridCards = [
  { icon: ShoppingCart, label: "Compra Animais", route: "/compras-animais", color: "text-primary" },
  { icon: TrendingUp, label: "Venda Animais", route: "/dashboard", color: "text-primary" },
  { icon: ShoppingCart, label: "Compra Insumos", route: "/compras-insumos", color: "text-primary" },
  { icon: BarChart3, label: "Relatórios", route: "/relatorios", color: "text-primary" },
];

const sidebarItems = [
  { icon: TrendingUp, label: "Animais Vendidos", route: "/dashboard" },
  { icon: Skull, label: "Animais Mortos", route: "/dashboard" },
  { icon: User, label: "Editar Cadastro", route: "/dashboard" },
  { icon: Edit, label: "Alterar Senha", route: "/dashboard" },
  { icon: MessageCircle, label: "Planos", route: "/dashboard" },
  { icon: MessageCircle, label: "Whatsapp Desenvolvedores", route: "/dashboard" },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = [
    { label: "TOTAL", value: 1 },
    { label: "MATRIZES", value: 0 },
    { label: "REPRODUTORES", value: 1 },
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-72 bg-card shadow-2xl flex flex-col animate-in slide-in-from-left">
            <div className="bg-primary p-6 text-primary-foreground">
              <div className="flex items-center gap-3">
                <User size={32} />
                <div>
                  <p className="font-bold">guilherme renovato</p>
                  <p className="text-xs opacity-80">guilhermerenovs@gmail.com</p>
                </div>
              </div>
            </div>
            <div className="flex-1 py-4">
              {sidebarItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => { setSidebarOpen(false); navigate(item.route); }}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-muted text-foreground"
                >
                  <item.icon size={20} className="text-foreground" />
                  <span className="flex-1 text-left font-semibold">{item.label}</span>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              ))}
              <button
                onClick={() => { setSidebarOpen(false); navigate("/"); }}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-muted text-destructive"
              >
                <LogOut size={20} />
                <span className="font-semibold">Sair</span>
              </button>
            </div>
          </div>
          <div className="flex-1 bg-foreground/30" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-4 flex items-center">
        <button onClick={() => setSidebarOpen(true)} className="p-1">
          <Menu size={28} />
        </button>
        <h1 className="flex-1 text-center text-xl font-extrabold tracking-widest">Rebanho Fácil</h1>
      </div>

      {/* Property bar */}
      <div className="bg-accent text-accent-foreground px-4 py-3 flex items-center gap-3">
        <Home size={20} />
        <div>
          <p className="text-xs opacity-70">Propriedade:</p>
          <p className="font-bold text-sm">fazenda minas gerais</p>
        </div>
      </div>

      {/* Stats carousel */}
      <div className="px-4 py-4 flex gap-3 overflow-x-auto">
        {stats.map((stat) => (
          <div key={stat.label} className="min-w-[140px] bg-card rounded-xl shadow-sm p-4 text-center flex-shrink-0">
            <p className="text-xs font-bold text-muted-foreground tracking-wide">{stat.label}</p>
            <p className="text-3xl font-extrabold text-foreground my-2">{stat.value}</p>
            <PawPrint size={40} className="mx-auto text-muted-foreground/40" />
          </div>
        ))}
      </div>

      {/* Menu cards */}
      <div className="px-4 space-y-3">
        {menuCards.map((card) => (
          <button
            key={card.label}
            onClick={() => navigate(card.route)}
            className="w-full bg-card rounded-xl shadow-sm p-6 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
          >
            <card.icon size={36} className={card.color} />
            <span className="font-bold text-primary text-sm">{card.label}</span>
          </button>
        ))}
      </div>

      {/* Grid cards */}
      <div className="px-4 py-4 grid grid-cols-2 gap-3">
        {gridCards.map((card) => (
          <button
            key={card.label}
            onClick={() => navigate(card.route)}
            className="bg-card rounded-xl shadow-sm p-5 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
          >
            <card.icon size={32} className={card.color} />
            <span className="font-bold text-primary text-xs text-center">{card.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
