// ==============================
// RelatoriosPage.tsx — Página de relatórios e análises
// Exibe cards com os relatórios disponíveis — cada um com borda lateral colorida por categoria
// NOTA: os relatórios ainda não possuem funcionalidade real — são apenas cards visuais
// ==============================

import { PawPrint, Calendar, DollarSign, ChevronRight } from "lucide-react";
import AppLayout from "@/components/AppLayout";

// Lista de relatórios disponíveis — cada um com ícone, título, descrição e cor da borda lateral
const reports = [
  { icon: PawPrint, title: "Relatório de Animais", desc: "Detalhes por tipo, identificação e nascimentos.", borderColor: "border-l-primary" },
  { icon: PawPrint, title: "Relatório de Animais", desc: "Detalhes por proprietário.", borderColor: "border-l-accent" },
  { icon: Calendar, title: "Relatório de Compra de Insumos", desc: "Empresa, produto, quantidade e valor unitário.", borderColor: "border-l-warning" },
  { icon: DollarSign, title: "Relatório de Compras e Vendas", desc: "Resumo completo das compras e vendas de animais no ano.", borderColor: "border-l-success" },
];

const RelatoriosPage = () => {
  return (
    <AppLayout title="Relatórios">
      {/* Grid responsivo 2 colunas — cada card é um botão clicável (futuramente abrirá o relatório) */}
      <div className="max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reports.map((report, i) => (
          <button
            key={i}
            className={`bg-card rounded-xl border border-border border-l-4 ${report.borderColor} p-5 text-left hover:shadow-md transition-all flex items-start gap-4`}
          >
            {/* Ícone do relatório */}
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <report.icon size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground text-sm">{report.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{report.desc}</p>
            </div>
            {/* Seta indicando que o card é clicável */}
            <ChevronRight size={18} className="text-muted-foreground flex-shrink-0 mt-1" />
          </button>
        ))}
      </div>
    </AppLayout>
  );
};

export default RelatoriosPage;
