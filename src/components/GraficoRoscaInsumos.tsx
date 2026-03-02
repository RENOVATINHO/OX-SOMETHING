// ==============================
// GraficoRoscaInsumos.tsx — Donut chart do valor em estoque por categoria
// Visual update: new dark-analytics accent colors, gradient tooltip
// Logic unchanged
// ==============================

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

// New accent palette aligned with the dark analytics design system
const CORES = {
  alimentacao: "#ff6b35",  // orange
  saude:       "#7c3aed",  // purple
  solo_pasto:  "#00e5ff",  // teal
};

interface DashboardCategoria {
  valorTotal: number;
}

interface DashboardData {
  alimentacao: DashboardCategoria[];
  saude: DashboardCategoria[];
  solo_pasto: DashboardCategoria[];
}

const GraficoRoscaInsumos = () => {
  const [dados, setDados] = useState<{ name: string; value: number; cor: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      const token = localStorage.getItem("easy_cattle_token");
      try {
        const res = await fetch("http://localhost:3001/api/insumos/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: DashboardData = await res.json();
        const rosca = [
          { name: "Alimentação", value: (data.alimentacao || []).reduce((acc, i) => acc + i.valorTotal, 0), cor: CORES.alimentacao },
          { name: "Saúde",       value: (data.saude || []).reduce((acc, i) => acc + i.valorTotal, 0),       cor: CORES.saude },
          { name: "Solo/Pasto",  value: (data.solo_pasto || []).reduce((acc, i) => acc + i.valorTotal, 0),  cor: CORES.solo_pasto },
        ].filter(d => d.value > 0);
        setDados(rosca);
      } catch {
        console.error("Erro ao carregar gráfico de insumos.");
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  if (loading) return (
    <div className="dash-card h-full flex items-center justify-center min-h-[200px]">
      <div className="w-6 h-6 border-2 border-[#ff6b35] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const total = dados.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="dash-card h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-base font-bold text-white font-exo2">Estoque de Insumos</p>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Valor total por categoria</p>
        </div>
        {total > 0 && (
          <span className="badge-orange font-mono">
            R$ {(total / 1000).toFixed(1)}k
          </span>
        )}
      </div>

      {dados.length === 0 ? (
        <div className="h-48 flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>
          <p className="text-sm">Nenhum insumo em estoque ainda.</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={dados}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {dados.map((entry, index) => (
                  <Cell key={index} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(224, 42%, 20%)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "13px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                }}
                formatter={(value: number) => [
                  `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                  "Valor",
                ]}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ color: "#8892b0", fontSize: 12 }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-2 space-y-2.5">
            {dados.map(d => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.cor, boxShadow: `0 0 6px ${d.cor}60` }} />
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{d.name}</span>
                </div>
                <span className="text-sm font-semibold font-mono text-white">
                  R$ {d.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 mt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <span className="text-sm font-semibold text-white">Total</span>
              <span className="text-sm font-black font-mono" style={{ color: "var(--accent-orange)" }}>
                R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GraficoRoscaInsumos;
