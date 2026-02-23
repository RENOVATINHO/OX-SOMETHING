// ==============================
// CadastrosPage.tsx — Hub central de cadastros
// Página que concentra atalhos para todas as operações de cadastro do sistema:
// vendedores, compras de insumos, compras de animais, vendas e pastos
// ==============================

import { useNavigate } from "react-router-dom";
import { UserPlus, Package, PawPrint, DollarSign, Fence } from "lucide-react";
import AppLayout from "@/components/AppLayout";

// Lista de opções de cadastro — cada uma com ícone, label, descrição e rota de destino
const options = [
  { icon: UserPlus, label: "Novo Vendedor", desc: "Cadastrar um novo vendedor", route: "/cadastros/novo-vendedor" },
  { icon: Package, label: "Novos Insumos", desc: "Registrar compra de insumos", route: "/compras-insumos/nova" },
  { icon: PawPrint, label: "Novos Animais", desc: "Registrar compra de animais", route: "/compras-animais/nova" },
  { icon: DollarSign, label: "Nova Venda", desc: "Registrar uma nova venda", route: "/cadastros/nova-venda" },
  { icon: Fence, label: "Novo Pasto", desc: "Cadastrar um novo pasto", route: "/cadastros/novo-pasto" },
];

const CadastrosPage = () => {
  const navigate = useNavigate();

  return (
    <AppLayout title="Cadastros">
      {/* Grid responsivo de cards — cada card é um botão que navega para o formulário correspondente */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => navigate(opt.route)}
            className="bg-card rounded-xl border border-border p-6 text-left hover:shadow-md hover:border-primary/30 transition-all group"
          >
            {/* Ícone com efeito hover — muda de opacidade ao passar o mouse */}
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
