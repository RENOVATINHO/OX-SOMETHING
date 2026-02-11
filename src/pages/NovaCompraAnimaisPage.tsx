import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const NovaCompraAnimaisPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    vendedor: "", dataCompra: "", notaFiscal: "", sexo: "",
    quantidade: "", valorUnitario: "", observacao: "",
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader title="Nova compra" />

      <div className="flex-1 px-4 py-4">
        <div className="bg-card rounded-xl shadow-sm divide-y divide-border">
          <div className="p-4 flex items-center justify-between">
            <input placeholder="Nome do vendedor *" value={form.vendedor} onChange={(e) => update("vendedor", e.target.value)} className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
            <User size={20} className="text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="p-4">
              <input placeholder="Data da compra *" type="date" value={form.dataCompra} onChange={(e) => update("dataCompra", e.target.value)} className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="p-4">
              <input placeholder="Nº Nota fiscal" value={form.notaFiscal} onChange={(e) => update("notaFiscal", e.target.value)} className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="p-4">
              <select value={form.sexo} onChange={(e) => update("sexo", e.target.value)} className="w-full bg-transparent outline-none text-foreground">
                <option value="">Sexo *</option>
                <option value="macho">Macho</option>
                <option value="femea">Fêmea</option>
              </select>
            </div>
            <div className="p-4">
              <input placeholder="Quantidade *" type="number" value={form.quantidade} onChange={(e) => update("quantidade", e.target.value)} className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
            </div>
          </div>
          <div className="p-4">
            <input placeholder="Valor unitário R$ *" value={form.valorUnitario} onChange={(e) => update("valorUnitario", e.target.value)} className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
          </div>
          <div className="p-4">
            <input placeholder="Observação" value={form.observacao} onChange={(e) => update("observacao", e.target.value)} className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          Para o controle de animais é necessário fazer o cadastro no botão Animais na página inicial.
        </p>
      </div>

      <div className="p-4">
        <button
          onClick={() => navigate("/compras-animais")}
          className="w-full bg-primary text-primary-foreground rounded-full py-4 text-lg font-bold hover:bg-accent transition-colors"
        >
          Cadastrar compra
        </button>
      </div>
    </div>
  );
};

export default NovaCompraAnimaisPage;
