import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";

const NovaCompraAnimaisPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    vendedor: "", dataCompra: "", notaFiscal: "", sexo: "",
    quantidade: "", valorUnitario: "", observacao: "",
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const fieldClass = "w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";
  const labelClass = "text-sm font-semibold text-foreground mb-1.5 block";

  return (
    <AppLayout title="Nova Compra de Animal">
      <div className="max-w-2xl">
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <div>
            <label className={labelClass}>Nome do vendedor *</label>
            <input placeholder="Nome completo do vendedor" value={form.vendedor} onChange={(e) => update("vendedor", e.target.value)} className={fieldClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Data da compra *</label>
              <input type="date" value={form.dataCompra} onChange={(e) => update("dataCompra", e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Nº Nota fiscal</label>
              <input placeholder="Número" value={form.notaFiscal} onChange={(e) => update("notaFiscal", e.target.value)} className={fieldClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Sexo *</label>
              <select value={form.sexo} onChange={(e) => update("sexo", e.target.value)} className={fieldClass}>
                <option value="">Selecione</option>
                <option value="macho">Macho</option>
                <option value="femea">Fêmea</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Quantidade *</label>
              <input placeholder="0" type="number" value={form.quantidade} onChange={(e) => update("quantidade", e.target.value)} className={fieldClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Valor unitário R$ *</label>
            <input placeholder="R$ 0,00" value={form.valorUnitario} onChange={(e) => update("valorUnitario", e.target.value)} className={fieldClass} />
          </div>

          <div>
            <label className={labelClass}>Observação</label>
            <textarea placeholder="Observações adicionais" value={form.observacao} onChange={(e) => update("observacao", e.target.value)} className={`${fieldClass} min-h-[80px] resize-none`} />
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Para o controle de animais é necessário fazer o cadastro na página de Animais.
        </p>

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={() => navigate("/compras-animais")} className="px-6 py-3 rounded-lg border border-border text-foreground font-semibold hover:bg-muted transition-colors text-sm">
            Cancelar
          </button>
          <button onClick={() => navigate("/compras-animais")} className="bg-primary text-primary-foreground rounded-lg px-8 py-3 text-sm font-bold hover:bg-accent transition-colors">
            Cadastrar compra
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default NovaCompraAnimaisPage;
