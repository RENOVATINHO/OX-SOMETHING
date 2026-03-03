// ==============================
// NovoInsumoPage.tsx — Cadastro de novo insumo
// ==============================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Tag, Ruler, Hash, DollarSign } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const NovoInsumoPage = () => {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [unidade, setUnidade] = useState("");
  const [valorUnitario, setValorUnitario] = useState("");
  const [quantidadeInicial, setQuantidadeInicial] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nome || !categoria || !unidade) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("easy_cattle_token");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/insumos`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nome,
          categoria,
          unidade,
          valor_unitario: Number(valorUnitario) || 0,
          quantidade_inicial: Number(quantidadeInicial) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao cadastrar.");
        return;
      }

      navigate("/insumos");
    } catch {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Novo Insumo">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#7c3aed18" }}>
            <Package size={18} className="text-[#7c3aed]" />
          </div>
          <h2 className="text-base font-bold text-white font-exo2">Cadastrar Insumo</h2>
        </div>

        <form onSubmit={handleSubmit} className="dash-card space-y-0 divide-y divide-white/[0.06]">

          {/* Nome */}
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Nome *</label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Ração 26% PB"
                className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
              />
            </div>
            <Package size={20} className="text-[#8892b0] flex-shrink-0" />
          </div>

          {/* Categoria */}
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Categoria *</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full bg-transparent text-white text-sm outline-none appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#1a2332]">Selecione a categoria</option>
                <option value="alimentacao" className="bg-[#1a2332]">Alimentação (ração, milho, trigo...)</option>
                <option value="saude" className="bg-[#1a2332]">Saúde (vacinas, remédios, venenos...)</option>
                <option value="solo_pasto" className="bg-[#1a2332]">Solo/Pasto (adubo, suplementação...)</option>
              </select>
            </div>
            <Tag size={20} className="text-[#8892b0] flex-shrink-0" />
          </div>

          {/* Unidade */}
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Unidade de medida *</label>
              <select
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
                className="w-full bg-transparent text-white text-sm outline-none appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#1a2332]">Selecione a unidade</option>
                <option value="kg" className="bg-[#1a2332]">kg — Quilograma</option>
                <option value="g" className="bg-[#1a2332]">g — Grama</option>
                <option value="L" className="bg-[#1a2332]">L — Litro</option>
                <option value="ml" className="bg-[#1a2332]">ml — Mililitro</option>
                <option value="un" className="bg-[#1a2332]">un — Unidade</option>
                <option value="sc" className="bg-[#1a2332]">sc — Saco</option>
                <option value="cx" className="bg-[#1a2332]">cx — Caixa</option>
              </select>
            </div>
            <Ruler size={20} className="text-[#8892b0] flex-shrink-0" />
          </div>

          {/* Valor unitário + Quantidade inicial */}
          <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
            <div className="px-5 py-4">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Valor unitário (R$)</label>
              <div className="flex items-center gap-2">
                <DollarSign size={14} className="text-[#8892b0]" />
                <input
                  type="number"
                  value={valorUnitario}
                  onChange={(e) => setValorUnitario(e.target.value)}
                  placeholder="0,00"
                  min="0"
                  step="0.01"
                  className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
                />
              </div>
            </div>
            <div className="px-5 py-4">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Qtd. inicial (opcional)</label>
              <div className="flex items-center gap-2">
                <Hash size={14} className="text-[#8892b0]" />
                <input
                  type="number"
                  value={quantidadeInicial}
                  onChange={(e) => setQuantidadeInicial(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
                />
              </div>
            </div>
          </div>

        </form>

        {error && <p className="text-sm text-red-400 text-center mt-3">{error}</p>}

        <button
          onClick={handleSubmit as any}
          disabled={loading || !nome || !categoria || !unidade}
          className="w-full mt-4 py-3.5 rounded-2xl text-white font-bold text-sm transition-all disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #7c3aed, #e040fb)" }}
        >
          {loading ? "Cadastrando..." : "Cadastrar Insumo"}
        </button>

      </div>
    </AppLayout>
  );
};

export default NovoInsumoPage;
