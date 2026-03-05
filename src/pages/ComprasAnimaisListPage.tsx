import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, ShoppingCart } from "lucide-react";
import AppLayout from "@/components/AppLayout";

interface CompraAnimal {
  id: number;
  numero_compra: string;
  sexo: string;
  faixa_etaria: string;
  quantidade: number;
  valor_kg: number;
  data: string;
  numero_gta: string | null;
  observacao: string | null;
  vendedor_nome: string | null;
}

const sexoLabel: Record<string, string> = {
  macho_inteiro: "Macho Inteiro",
  macho_capado:  "Boi",
  femea:         "Fêmea",
};

const faixaLabel: Record<string, string> = {
  bezerro: "Bezerro",
  garrote: "Garrote",
  novilho: "Novilho",
  adulto:  "Adulto",
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR");
};

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const ComprasAnimaisListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [compras, setCompras] = useState<CompraAnimal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("easy_cattle_token");
    fetch(`${import.meta.env.VITE_API_URL}/api/compras-animais`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setCompras(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtradas = compras.filter(c =>
    (c.vendedor_nome || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.numero_compra || "").includes(search) ||
    (c.numero_gta || "").includes(search)
  );

  return (
    <AppLayout title="Compras de Animais">
      <div className="max-w-5xl mx-auto">

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-full min-w-48"
            style={{ background: "hsl(224,42%,20%)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Search size={16} style={{ color: "var(--text-secondary)" }} />
            <input
              placeholder="Buscar por vendedor, nº compra ou GTA..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-[#4a5568]"
            />
          </div>
          <button onClick={() => navigate("/animais/nova-compra")} className="btn-gradient flex items-center gap-2">
            <Plus size={14} /> Nova Compra
          </button>
        </div>

        {/* Tabela */}
        <div className="dash-card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#ff6b3518" }}>
              <ShoppingCart size={18} style={{ color: "#ff6b35" }} />
            </div>
            <div>
              <p className="text-base font-bold text-white font-exo2">Histórico de Compras</p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{compras.length} compras registradas</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-[#ff6b35] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p style={{ color: "var(--text-secondary)" }}>Carregando...</p>
            </div>
          ) : filtradas.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" style={{ color: "var(--accent-orange)" }} />
              <p className="font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                {search ? "Nenhuma compra encontrada." : "Nenhuma compra registrada ainda."}
              </p>
              {!search && (
                <button onClick={() => navigate("/animais/nova-compra")}
                  className="btn-gradient mt-4 inline-flex items-center gap-2">
                  <Plus size={14} /> Nova Compra
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
                    {["Nº", "Sexo", "Faixa", "Qtd", "Valor/kg", "Total", "GTA", "Vendedor", "Data"].map((h) => (
                      <th key={h}
                        className={`px-4 py-3.5 font-semibold text-xs uppercase tracking-wider ${h === "Qtd" ? "text-center" : "text-left"}`}
                        style={{ color: "var(--text-secondary)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map((c, index) => (
                    <tr key={c.id}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        background: index % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,107,53,0.04)")}
                      onMouseLeave={e => (e.currentTarget.style.background = index % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent")}
                    >
                      <td className="px-4 py-4 font-mono font-bold" style={{ color: "var(--accent-orange)" }}>
                        #{c.numero_compra}
                      </td>
                      <td className="px-4 py-4 text-white">{sexoLabel[c.sexo] || c.sexo}</td>
                      <td className="px-4 py-4 text-white">{faixaLabel[c.faixa_etaria] || c.faixa_etaria}</td>
                      <td className="px-4 py-4 text-center font-mono text-white">{c.quantidade}</td>
                      <td className="px-4 py-4 font-mono" style={{ color: "var(--text-secondary)" }}>
                        {formatCurrency(c.valor_kg || 0)}
                      </td>
                      <td className="px-4 py-4 font-mono font-bold" style={{ color: "var(--accent-orange)" }}>
                        {formatCurrency((c.quantidade || 0) * (c.valor_kg || 0))}
                      </td>
                      <td className="px-4 py-4" style={{ color: "var(--text-secondary)" }}>{c.numero_gta || "—"}</td>
                      <td className="px-4 py-4" style={{ color: "var(--text-secondary)" }}>{c.vendedor_nome || "—"}</td>
                      <td className="px-4 py-4 font-mono" style={{ color: "var(--text-secondary)" }}>
                        {formatDate(c.data)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ComprasAnimaisListPage;
