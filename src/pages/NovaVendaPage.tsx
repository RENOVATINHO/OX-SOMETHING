import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Calendar, FileText, Tag, Hash, DollarSign, ShoppingCart } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const NovaVendaPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nomeComprador: "",
    dataVenda: "",
    notaFiscal: "",
    sexo: "",
    quantidade: "",
    valorUnitario: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nomeComprador || !form.dataVenda || !form.sexo || !form.quantidade || !form.valorUnitario) return;
    setLoading(true);
    // TODO: salvar venda no backend
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 600);
  };

  return (
    <AppLayout title="Nova Venda">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#7c3aed18" }}>
            <ShoppingCart size={18} className="text-[#7c3aed]" />
          </div>
          <h2 className="text-base font-bold text-white font-exo2">Registrar Venda</h2>
        </div>

        <form onSubmit={handleSubmit} className="dash-card space-y-0 divide-y divide-white/[0.06]">

          {/* Nome do comprador */}
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Nome do comprador *</label>
              <input
                name="nomeComprador"
                value={form.nomeComprador}
                onChange={handleChange}
                placeholder="Ex: João Silva"
                className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
              />
            </div>
            <User size={20} className="text-[#8892b0] flex-shrink-0" />
          </div>

          {/* Data + Nota fiscal */}
          <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
            <div className="px-5 py-4">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Data da venda *</label>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-[#8892b0]" />
                <input
                  type="date"
                  name="dataVenda"
                  value={form.dataVenda}
                  onChange={handleChange}
                  className="w-full bg-transparent text-white text-sm outline-none"
                />
              </div>
            </div>
            <div className="px-5 py-4">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Nº Nota fiscal</label>
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-[#8892b0]" />
                <input
                  name="notaFiscal"
                  value={form.notaFiscal}
                  onChange={handleChange}
                  placeholder="Opcional"
                  className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
                />
              </div>
            </div>
          </div>

          {/* Sexo + Quantidade */}
          <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
            <div className="px-5 py-4">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Sexo *</label>
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-[#8892b0]" />
                <select
                  name="sexo"
                  value={form.sexo}
                  onChange={handleChange}
                  className="w-full bg-transparent text-white text-sm outline-none appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#1a2332]">Selecione</option>
                  <option value="Macho" className="bg-[#1a2332]">Macho</option>
                  <option value="Fêmea" className="bg-[#1a2332]">Fêmea</option>
                </select>
              </div>
            </div>
            <div className="px-5 py-4">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Quantidade *</label>
              <div className="flex items-center gap-2">
                <Hash size={14} className="text-[#8892b0]" />
                <input
                  type="number"
                  name="quantidade"
                  value={form.quantidade}
                  onChange={handleChange}
                  placeholder="0"
                  min="1"
                  className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
                />
              </div>
            </div>
          </div>

          {/* Valor unitário */}
          <div className="px-5 py-4">
            <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Valor unitário *</label>
            <div className="flex items-center gap-2">
              <DollarSign size={14} className="text-[#8892b0]" />
              <input
                type="number"
                name="valorUnitario"
                value={form.valorUnitario}
                onChange={handleChange}
                placeholder="0,00"
                step="0.01"
                min="0"
                className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
              />
            </div>
          </div>
        </form>

        {/* Botão cadastrar */}
        <button
          onClick={handleSubmit as any}
          disabled={loading || !form.nomeComprador || !form.dataVenda || !form.sexo || !form.quantidade || !form.valorUnitario}
          className="w-full mt-6 py-3.5 rounded-2xl text-white font-bold text-sm transition-all disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #7c3aed, #e040fb)" }}
        >
          {loading ? "Cadastrando..." : "Cadastrar venda"}
        </button>

        <p className="text-xs text-[#8892b0] mt-4 text-center">
          Para o controle de animais vendidos é necessário dar baixa editando cada animal.
        </p>
      </div>
    </AppLayout>
  );
};

export default NovaVendaPage;
