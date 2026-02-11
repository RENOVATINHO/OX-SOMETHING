import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const NovaCompraInsumosPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    empresa: "", data: "", produto: "", quantidade: "",
    valorUnitario: "", notaFiscal: "",
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader title="Nova compra" />

      <div className="flex-1 px-4 py-4">
        <div className="bg-card rounded-xl shadow-sm divide-y divide-border">
          <div className="p-4 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-bold text-foreground">Nome da empresa *</p>
              <input placeholder="Escolha uma empresa" value={form.empresa} onChange={(e) => update("empresa", e.target.value)} className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
            </div>
            <User size={20} className="text-muted-foreground" />
          </div>
          <div className="p-4">
            <p className="text-xs font-bold text-foreground">Data *</p>
            <input type="date" placeholder="Ex: 01/01/2024" value={form.data} onChange={(e) => update("data", e.target.value)} className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
          </div>
          <div className="p-4">
            <p className="text-xs font-bold text-foreground">Produto *</p>
            <input placeholder="Nome do produto" value={form.produto} onChange={(e) => update("produto", e.target.value)} className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
          </div>
          <div className="p-4">
            <p className="text-xs font-bold text-foreground">Quantidade *</p>
            <input placeholder="Quantidade" type="number" value={form.quantidade} onChange={(e) => update("quantidade", e.target.value)} className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
          </div>
          <div className="p-4">
            <p className="text-xs font-bold text-foreground">Valor unitário *</p>
            <input placeholder="R$ 00,00" value={form.valorUnitario} onChange={(e) => update("valorUnitario", e.target.value)} className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
          </div>
          <div className="p-4">
            <p className="text-xs font-bold text-foreground">Nº Nota fiscal</p>
            <input placeholder="Número" value={form.notaFiscal} onChange={(e) => update("notaFiscal", e.target.value)} className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="p-4">
        <button
          onClick={() => navigate("/compras-insumos")}
          className="w-full bg-primary text-primary-foreground rounded-full py-4 text-lg font-bold hover:bg-accent transition-colors"
        >
          Cadastrar compra
        </button>
      </div>
    </div>
  );
};

export default NovaCompraInsumosPage;
