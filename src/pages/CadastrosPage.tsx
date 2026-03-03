// ==============================
// CadastrosPage.tsx — Hub central de compras
// ==============================
import { useNavigate } from "react-router-dom";
import { Package, PawPrint } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const options = [
  { icon: Package, label: "Comprar Insumos", desc: "Registrar compra de insumos", route: "/insumos" },
  { icon: PawPrint, label: "Comprar Animais", desc: "Registrar compra de animais", route: "/animais/nova-compra" },
];

const CadastrosPage = () => {
  const navigate = useNavigate();
  return (
    <AppLayout title="Compras">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => navigate(opt.route)}
            className="bg-card rounded-xl border border-border p-6 text-left hover:shadow-md hover:border-primary/30 transition-all group"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <opt.icon size={24} className="text-primary" />
            </div>
            <p className="font-bold text-foreground text-sm">{opt.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
          </button>
        ))}
      </div>
    </AppLayout>
  );
};

export default CadastrosPage;
