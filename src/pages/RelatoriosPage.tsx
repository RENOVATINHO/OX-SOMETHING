import { PawPrint, Calendar, DollarSign, ChevronRight } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const reports = [
  { icon: PawPrint, title: "Relatório de Animais", desc: "Detalhes por tipo, identificação e nascimentos.", borderColor: "border-l-primary" },
  { icon: PawPrint, title: "Relatório de Animais", desc: "Detalhes por proprietário.", borderColor: "border-l-accent" },
  { icon: Calendar, title: "Relatório de Compra de Insumos", desc: "Empresa, produto, quantidade e valor unitário.", borderColor: "border-l-warning" },
  { icon: DollarSign, title: "Relatório de Compras e Vendas", desc: "Resumo completo das compras e vendas de animais no ano.", borderColor: "border-l-success" },
];

const RelatoriosPage = () => {
  return (
    <AppLayout title="Relatórios">
      <div className="max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reports.map((report, i) => (
          <button
            key={i}
            className={`bg-card rounded-xl border border-border border-l-4 ${report.borderColor} p-5 text-left hover:shadow-md transition-all flex items-start gap-4`}
          >
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <report.icon size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground text-sm">{report.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{report.desc}</p>
            </div>
            <ChevronRight size={18} className="text-muted-foreground flex-shrink-0 mt-1" />
          </button>
        ))}
      </div>
    </AppLayout>
  );
};

export default RelatoriosPage;
