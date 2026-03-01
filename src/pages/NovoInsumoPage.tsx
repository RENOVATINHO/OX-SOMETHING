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
      const res = await fetch("http://localhost:3001/api/insumos", {
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
      <div className="max-w-lg">
        <div className="bg-card rounded-2xl border border-border p-8">
          <h2 className="text-xl font-bold text-foreground mb-6">Cadastrar insumo</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Nome */}
            <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3">
              <input
                type="text"
                placeholder="Nome do insumo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
              />
              <Package size={18} className="text-muted-foreground" />
            </div>

            {/* Categoria */}
            <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3">
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                required
                className="flex-1 bg-transparent outline-none text-sm text-foreground"
              >
                <option value="" disabled>Selecione a categoria</option>
                <option value="alimentacao">Alimentação (ração, milho, trigo...)</option>
                <option value="saude">Saúde (vacinas, remédios, venenos...)</option>
                <option value="solo_pasto">Solo/Pasto (adubo, suplementação...)</option>
              </select>
              <Tag size={18} className="text-muted-foreground" />
            </div>

            {/* Unidade */}
            <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3">
              <select
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
                required
                className="flex-1 bg-transparent outline-none text-sm text-foreground"
              >
                <option value="" disabled>Unidade de medida</option>
                <option value="kg">kg — Quilograma</option>
                <option value="g">g — Grama</option>
                <option value="L">L — Litro</option>
                <option value="ml">ml — Mililitro</option>
                <option value="un">un — Unidade</option>
                <option value="sc">sc — Saco</option>
                <option value="cx">cx — Caixa</option>
              </select>
              <Ruler size={18} className="text-muted-foreground" />
            </div>

            {/* Valor unitário + Quantidade inicial */}
            <div className="flex gap-3">
              <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3 flex-1">
                <input
                  type="number"
                  placeholder="Valor unitário (R$)"
                  value={valorUnitario}
                  onChange={(e) => setValorUnitario(e.target.value)}
                  min="0"
                  step="0.01"
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
                />
                <DollarSign size={18} className="text-muted-foreground" />
              </div>
              <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3 flex-1">
                <input
                  type="number"
                  placeholder="Qtd. inicial (opcional)"
                  value={quantidadeInicial}
                  onChange={(e) => setQuantidadeInicial(e.target.value)}
                  min="0"
                  step="0.01"
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
                />
                <Hash size={18} className="text-muted-foreground" />
              </div>
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground rounded-lg py-3 text-base font-bold hover:bg-accent transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? "Cadastrando..." : "Cadastrar insumo"}
            </button>

          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default NovoInsumoPage;
