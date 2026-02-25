// ==============================
// AnimaisPage.tsx — Página de listagem e resumo de animais
// Exibe contadores por categoria (Matrizes, Reprodutores, Nascimentos) e total geral
// Possui botão para cadastrar novo animal individual
// NOTA: dados atualmente são estáticos — futuramente serão carregados do banco de dados
// ==============================

import { useNavigate } from "react-router-dom";
import { PawPrint, ChevronRight, BarChart3, Plus } from "lucide-react";
import AppLayout from "@/components/AppLayout";

// Categorias de animais com contadores — futuramente serão calculados a partir do banco
const categories = [
  { label: "Matrizes", count: 0, color: "text-primary", bgColor: "bg-primary/10" },
  { label: "Reprodutores", count: 0, color: "text-accent", bgColor: "bg-accent/10" },
  { label: "Nascimentos", count: 0, color: "text-success", bgColor: "bg-success/10" },
];

const AnimaisPage = () => {
  const navigate = useNavigate();

  // Calcula o total de animais somando todas as categorias
  const total = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <AppLayout title="Animais">
      <div className="max-w-3xl">
        {/* ===== BARRA DE RESUMO + BOTÃO CADASTRAR ===== */}
        <div className="flex items-center gap-3 mb-6">
          {/* Contador total de animais */}
          <div className="flex items-center gap-2 bg-card rounded-lg border border-border px-4 py-2">
            <BarChart3 size={18} className="text-primary" />
            <span className="text-sm text-foreground">Total de animais: <strong className="text-primary">{total}</strong></span>
          </div>

          {/* Botão para navegar ao formulário de novo animal */}
          <button
            onClick={() => navigate("/animais/novo")}
            className="ml-auto bg-primary text-primary-foreground rounded-lg px-5 py-2.5 text-sm font-bold hover:bg-accent transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Cadastrar novo animal
          </button>
        </div>

        {/* ===== LISTA DE CATEGORIAS ===== */}
        {/* Cada categoria é um botão clicável — futuramente navegará para uma sub-listagem filtrada */}
        <div className="space-y-3">
          {categories.map((cat) => (
            <button
              key={cat.label}
              className="w-full bg-card rounded-xl border border-border p-5 flex items-center gap-4 hover:shadow-md hover:border-primary/30 transition-all"
            >
              {/* Ícone com cor personalizada por categoria */}
              <div className={`w-10 h-10 ${cat.bgColor} rounded-lg flex items-center justify-center`}>
                <PawPrint size={20} className={cat.color} />
              </div>
              <span className="flex-1 text-left font-bold text-foreground">{cat.label}</span>
              <span className="text-lg font-bold text-muted-foreground">{cat.count}</span>
              <ChevronRight size={18} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default AnimaisPage;
