import { useNavigate } from "react-router-dom";
import { PawPrint, ShoppingCart, TrendingUp, Package, BarChart3, Home } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const DashboardPage = () => {
  const navigate = useNavigate();

  const stats = [
    { label: "Total de Animais", value: 1, icon: PawPrint, color: "text-primary" },
    { label: "Matrizes", value: 0, icon: PawPrint, color: "text-accent" },
    { label: "Reprodutores", value: 1, icon: PawPrint, color: "text-success" },
    { label: "Nascimentos", value: 0, icon: PawPrint, color: "text-warning" },
  ];

  const quickActions = [
    { icon: PawPrint, label: "Cadastrar Animal", desc: "Adicionar novo animal ao rebanho", route: "/animais/novo" },
    { icon: ShoppingCart, label: "Nova Compra Animal", desc: "Registrar compra de animais", route: "/compras-animais/nova" },
    { icon: Package, label: "Nova Compra Insumo", desc: "Registrar compra de insumos", route: "/compras-insumos/nova" },
    { icon: BarChart3, label: "Ver Relatórios", desc: "Acessar relatórios e análises", route: "/relatorios" },
  ];

  return (
    <AppLayout title="Dashboard">
      {/* Property card */}
      <div className="bg-primary rounded-xl p-6 mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
          <Home size={24} className="text-primary-foreground" />
        </div>
        <div>
          <p className="text-primary-foreground/70 text-sm">Propriedade ativa</p>
          <p className="text-primary-foreground text-xl font-bold">Fazenda Minas Gerais</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
              <stat.icon size={22} className={stat.color} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-semibold">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h3 className="text-lg font-bold text-foreground mb-4">Ações Rápidas</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.route)}
            className="bg-card rounded-xl border border-border p-5 text-left hover:shadow-md hover:border-primary/30 transition-all group"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
              <action.icon size={20} className="text-primary" />
            </div>
            <p className="font-bold text-foreground text-sm">{action.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
          </button>
        ))}
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
