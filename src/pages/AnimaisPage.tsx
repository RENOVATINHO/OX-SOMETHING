import { useNavigate } from "react-router-dom";
import { PawPrint, ChevronRight, BarChart3 } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const categories = [
  { label: "Matrizes", count: 0, color: "text-primary", icon: PawPrint },
  { label: "Reprodutores", count: 1, color: "text-accent", icon: PawPrint },
  { label: "Nascimentos", count: 0, color: "text-success", icon: PawPrint },
];

const AnimaisPage = () => {
  const navigate = useNavigate();
  const total = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader title="Animais" variant="blue" />

      <div className="flex-1 px-4 py-4 space-y-3">
        {categories.map((cat) => (
          <button
            key={cat.label}
            className="w-full bg-card rounded-xl border border-border p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <cat.icon size={28} className={cat.color} />
            <span className="flex-1 text-left font-bold text-foreground">{cat.label}</span>
            <span className="text-muted-foreground font-bold">{cat.count}</span>
            <ChevronRight size={20} className="text-muted-foreground" />
          </button>
        ))}

        <div className="flex items-center justify-center gap-2 py-4">
          <BarChart3 size={20} className="text-primary" />
          <span className="text-foreground">Total de animais: <strong className="text-primary">{total}</strong></span>
        </div>
      </div>

      <div className="p-4">
        <button
          onClick={() => navigate("/animais/novo")}
          className="w-full bg-primary text-primary-foreground rounded-full py-4 text-lg font-bold hover:bg-accent transition-colors"
        >
          Cadastrar novo animal
        </button>
      </div>
    </div>
  );
};

export default AnimaisPage;
