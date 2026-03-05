// ==============================
// CadastrosPage.tsx — Hub central de compras
// ==============================
import { useNavigate } from "react-router-dom";
import { Package, PawPrint, ShoppingCart } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const options = [
  { icon: Package, label: "Comprar Insumos", desc: "Registrar compra de insumos", route: "/insumos" },
  { icon: PawPrint, label: "Comprar Animais", desc: "Registrar compra de animais", route: "/animais/nova-compra" },
];

const CadastrosPage = () => {
  const navigate = useNavigate();
  return (
    <AppLayout title="Compras">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#7c3aed18" }}>
            <ShoppingCart size={18} className="text-[#7c3aed]" />
          </div>
          <h2 className="text-base font-bold text-white font-exo2">Compras</h2>
        </div>

        <div className="dash-card divide-y divide-white/[0.06]">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => navigate(opt.route)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.03] transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors" style={{ background: "#7c3aed18" }}>
                <opt.icon size={20} className="text-[#7c3aed]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{opt.label}</p>
                <p className="text-xs text-[#8892b0] mt-0.5">{opt.desc}</p>
              </div>
              <span className="text-[#8892b0] text-lg">›</span>
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default CadastrosPage;
