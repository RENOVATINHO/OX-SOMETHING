import { useNavigate } from "react-router-dom";
import { PawPrint, Calendar, DollarSign, ChevronRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const reports = [
  { icon: PawPrint, title: "Relatório de Animais", desc: "Detalhes por tipo, identificação e nascimentos.", borderColor: "border-l-primary" },
  { icon: PawPrint, title: "Relatório de Animais", desc: "Detalhes por proprietário.", borderColor: "border-l-primary" },
  { icon: Calendar, title: "Relatório de Compra de Insumos", desc: "Empresa, produto, quantidade e valor unitário.", borderColor: "border-l-warning" },
  { icon: DollarSign, title: "Relatório de Compras e Vendas", desc: "Resumo completo das compras e vendas de animais no ano.", borderColor: "border-l-success" },
];

const RelatoriosPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader title="Relatórios" variant="blue" />

      <div className="flex-1 px-4 py-4 space-y-4">
        {reports.map((report, i) => (
          <button
            key={i}
            className={`w-full bg-card rounded-xl shadow-sm p-5 flex items-center gap-4 border-l-4 ${report.borderColor} hover:shadow-md transition-shadow text-left`}
          >
            <report.icon size={28} className="text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-foreground">{report.title}</p>
              <p className="text-sm text-muted-foreground">{report.desc}</p>
            </div>
            <ChevronRight size={20} className="text-muted-foreground flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default RelatoriosPage;
