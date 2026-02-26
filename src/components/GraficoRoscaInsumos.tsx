// ==============================
// GraficoRoscaInsumos.tsx — Componente reutilizável do gráfico de rosca
// Use este componente no DashboardPage
// ==============================

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const CORES = {
  alimentacao: "hsl(45 90% 50%)",
  saude: "hsl(0 70% 55%)",
  solo_pasto: "hsl(160 60% 45%)",
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
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:3001/api/insumos/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: DashboardData = await res.json();

        const rosca = [
          { name: "Alimentação", value: (data.alimentacao || []).reduce((acc, i) => acc + i.valorTotal, 0), cor: CORES.alimentacao },
          { name: "Saúde", value: (data.saude || []).reduce((acc, i) => acc + i.valorTotal, 0), cor: CORES.saude },
          { name: "Solo/Pasto", value: (data.solo_pasto || []).reduce((acc, i) => acc + i.valorTotal, 0), cor: CORES.solo_pasto },
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
    <div className="bg-card rounded-xl border border-border p-6">
      <p className="text-muted-foreground text-sm">Carregando...</p>
    </div>
  );

  const total = dados.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">Estoque de Insumos</h3>

      {dados.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          Nenhum insumo em estoque ainda.
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={dados}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {dados.map((entry, index) => (
                  <Cell key={index} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(220 20% 14%)", border: "1px solid hsl(220 15% 22%)", borderRadius: "8px", color: "hsl(210 20% 90%)" }}
                formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Valor"]}
              />
              <Legend
                formatter={(value) => <span style={{ color: "hsl(215 15% 75%)", fontSize: 13 }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-2 space-y-2">
            {dados.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.cor }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-semibold text-foreground">
                  R$ {d.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm border-t border-border pt-2 mt-2">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-extrabold text-primary">
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
