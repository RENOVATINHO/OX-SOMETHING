import { useState, useEffect } from "react";
import { ArrowDownCircle, ArrowUpCircle, Package, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AppLayout from "@/components/AppLayout";

interface Insumo {
  id: number;
  nome: string;
  categoria: string;
  unidade: string;
  valor_unitario: number;
  quantidade_estoque: number;
}

interface DashboardCategoria {
  nome: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

interface DashboardData {
  alimentacao: DashboardCategoria[];
  saude: DashboardCategoria[];
  solo_pasto: DashboardCategoria[];
}

const categoriasLabel: Record<string, string> = {
  alimentacao: "Alimentação",
  saude: "Saúde",
  solo_pasto: "Solo/Pasto",
};

const CORES_ROSCA = {
  alimentacao: "hsl(45 90% 50%)",
  saude: "hsl(0 70% 55%)",
  solo_pasto: "hsl(160 60% 45%)",
};

const GraficoCategoria = ({ dados, cor }: { dados: DashboardCategoria[]; cor: string }) => {
  if (dados.length === 0) return (
    <div className="h-48 flex items-center justify-center text-sm" style={{ color: "var(--text-secondary)" }}>
      Nenhum insumo nesta categoria.
    </div>
  );
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="nome" tick={{ fill: "#8892b0", fontSize: 11 }} />
          <YAxis tick={{ fill: "#8892b0", fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: "hsl(224,42%,20%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#fff" }}
            formatter={(value: number, _: string, entry: { payload: DashboardCategoria }) => [`${value} ${entry.payload.unidade}`, "Estoque"]}
          />
          <Bar dataKey="quantidade" fill={cor} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const EstoqueInsumosPage = () => {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const [modalAberto, setModalAberto] = useState(false);
  const [modalTipo, setModalTipo] = useState<"entrada" | "saida">("entrada");
  const [insumoSelecionado, setInsumoSelecionado] = useState<Insumo | null>(null);
  const [quantidade, setQuantidade] = useState("");
  const [valor, setValor] = useState("");
  const [observacao, setObservacao] = useState("");
  const [erroModal, setErroModal] = useState("");
  const [loadingModal, setLoadingModal] = useState(false);

  const carregarDados = async () => {
    const token = localStorage.getItem("easy_cattle_token");
    try {
      const [resInsumos, resDash] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/insumos`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${import.meta.env.VITE_API_URL}/api/insumos/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setInsumos(await resInsumos.json());
      setDashboard(await resDash.json());
    } catch {
      console.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const abrirModal = (insumo: Insumo, tipo: "entrada" | "saida") => {
    setInsumoSelecionado(insumo);
    setModalTipo(tipo);
    setQuantidade("");
    setValor("");
    setObservacao("");
    setErroModal("");
    setModalAberto(true);
  };

  const handleMovimentacao = async () => {
    if (!quantidade || Number(quantidade) <= 0) {
      setErroModal("Informe uma quantidade válida.");
      return;
    }
    setLoadingModal(true);
    const token = localStorage.getItem("easy_cattle_token");
    try {
      const body: Record<string, unknown> = { quantidade: Number(quantidade), observacao };
      if (modalTipo === "entrada") body.valor_unitario = Number(valor);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/insumos/${insumoSelecionado?.id}/${modalTipo}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setErroModal(data.error || "Erro ao registrar."); return; }
      setModalAberto(false);
      carregarDados();
    } catch {
      setErroModal("Não foi possível conectar ao servidor.");
    } finally {
      setLoadingModal(false);
    }
  };

  const dadosRosca = dashboard ? [
    { name: "Alimentação", value: (dashboard.alimentacao || []).reduce((acc, i) => acc + i.valorTotal, 0), cor: CORES_ROSCA.alimentacao },
    { name: "Saúde",       value: (dashboard.saude || []).reduce((acc, i) => acc + i.valorTotal, 0),       cor: CORES_ROSCA.saude },
    { name: "Solo/Pasto",  value: (dashboard.solo_pasto || []).reduce((acc, i) => acc + i.valorTotal, 0),  cor: CORES_ROSCA.solo_pasto },
  ].filter(d => d.value > 0) : [];

  const totalValor = dadosRosca.reduce((acc, d) => acc + d.value, 0);
  const totalItens = insumos.length;

  return (
    <AppLayout title="Estoque de Insumos">
      <div className="max-w-6xl space-y-6">

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total de produtos",      value: totalItens, color: "#ff6b35" },
            { label: "Valor total em estoque", value: `R$ ${totalValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, color: "#7c3aed" },
            { label: "Categorias",             value: 3, color: "#00e5ff" },
          ].map((card, i) => (
            <div key={i} className="rounded-2xl p-5 animate-enter"
              style={{ background: "hsl(224,42%,20%)", border: "1px solid rgba(255,255,255,0.08)", animationDelay: `${i * 60}ms` }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>{card.label}</p>
              <p className="text-3xl font-black font-mono" style={{ color: card.color }}>{card.value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="dash-card text-center py-12">
            <div className="w-8 h-8 border-2 border-[#ff6b35] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p style={{ color: "var(--text-secondary)" }}>Carregando...</p>
          </div>
        ) : (
          <>
            {/* Gráfico de rosca + gráficos por categoria */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Rosca */}
              <div className="dash-card flex flex-col">
                <p className="text-base font-bold text-white font-exo2 mb-4">Visão geral do estoque</p>
                {dadosRosca.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-sm" style={{ color: "var(--text-secondary)" }}>
                    Nenhum valor em estoque ainda.
                  </div>
                ) : (
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={dadosRosca} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                          {dadosRosca.map((entry, index) => (
                            <Cell key={index} fill={entry.cor} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: "hsl(224,42%,20%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#fff" }}
                          formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Valor"]}
                        />
                        <Legend formatter={(value) => <span style={{ color: "#8892b0", fontSize: 13 }}>{value}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-2 space-y-2">
                      {dadosRosca.map((d) => (
                        <div key={d.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.cor }} />
                            <span style={{ color: "var(--text-secondary)" }}>{d.name}</span>
                          </div>
                          <span className="font-semibold text-white">
                            R$ {d.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Gráficos por categoria */}
              <div className="lg:col-span-2 dash-card">
                <p className="text-base font-bold text-white font-exo2 mb-4">Estoque por categoria</p>
                <Tabs defaultValue="alimentacao">
                  <TabsList className="mb-4">
                    <TabsTrigger value="alimentacao">🌽 Alimentação</TabsTrigger>
                    <TabsTrigger value="saude">💊 Saúde</TabsTrigger>
                    <TabsTrigger value="solo_pasto">🌱 Solo/Pasto</TabsTrigger>
                  </TabsList>
                  <TabsContent value="alimentacao">
                    <GraficoCategoria dados={dashboard?.alimentacao || []} cor={CORES_ROSCA.alimentacao} />
                  </TabsContent>
                  <TabsContent value="saude">
                    <GraficoCategoria dados={dashboard?.saude || []} cor={CORES_ROSCA.saude} />
                  </TabsContent>
                  <TabsContent value="solo_pasto">
                    <GraficoCategoria dados={dashboard?.solo_pasto || []} cor={CORES_ROSCA.solo_pasto} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Tabela de movimentação */}
            <div className="dash-card">
              <p className="text-base font-bold text-white font-exo2 mb-5">Registrar movimentação</p>
              {insumos.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={40} className="mx-auto mb-3 opacity-30" style={{ color: "var(--accent-orange)" }} />
                  <p style={{ color: "var(--text-secondary)" }}>Nenhum insumo cadastrado ainda.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
                        {["Nome", "Categoria", "Estoque atual", "Movimentar"].map((h, i) => (
                          <th key={h} className={`px-5 py-3.5 font-semibold text-xs uppercase tracking-wider ${i === 3 ? "text-right" : "text-left"}`}
                            style={{ color: "var(--text-secondary)" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {insumos.map((insumo, index) => (
                        <tr key={insumo.id}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.05)",
                            background: index % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,107,53,0.04)")}
                          onMouseLeave={e => (e.currentTarget.style.background = index % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent")}
                        >
                          <td className="px-5 py-4 font-semibold text-white">{insumo.nome}</td>
                          <td className="px-5 py-4" style={{ color: "var(--text-secondary)" }}>{categoriasLabel[insumo.categoria] || insumo.categoria}</td>
                          <td className="px-5 py-4 font-mono text-white">
                            {Number(insumo.quantidade_estoque).toLocaleString("pt-BR")} {insumo.unidade}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => abrirModal(insumo, "entrada")}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}>
                                <ArrowDownCircle size={13} /> Entrada
                              </button>
                              <button onClick={() => abrirModal(insumo, "saida")}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
                                <ArrowUpCircle size={13} /> Saída
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {modalAberto && insumoSelecionado && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md relative rounded-2xl p-6"
            style={{ background: "hsl(224,42%,20%)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
            <button onClick={() => setModalAberto(false)} className="absolute top-4 right-4 transition-colors"
              style={{ color: "#8892b0" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "#8892b0")}>
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: modalTipo === "entrada" ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)" }}>
                {modalTipo === "entrada"
                  ? <ArrowDownCircle size={20} style={{ color: "#34d399" }} />
                  : <ArrowUpCircle size={20} style={{ color: "#f87171" }} />}
              </div>
              <div>
                <p className="text-base font-bold text-white font-exo2">
                  {modalTipo === "entrada" ? "Registrar Entrada" : "Registrar Saída"}
                </p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{insumoSelecionado.nome}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <input type="number" placeholder={`Quantidade (${insumoSelecionado.unidade})`}
                value={quantidade} onChange={(e) => setQuantidade(e.target.value)} className="input-dark" />
              {modalTipo === "entrada" && (
                <input type="number" placeholder="Valor unitário (R$)"
                  value={valor} onChange={(e) => setValor(e.target.value)} className="input-dark" />
              )}
              <input type="text" placeholder="Observação (opcional)"
                value={observacao} onChange={(e) => setObservacao(e.target.value)} className="input-dark" />
              {erroModal && <p className="text-sm text-red-400 text-center">{erroModal}</p>}
              <div className="flex gap-3 mt-2">
                <button onClick={() => setModalAberto(false)} className="btn-outline-dim flex-1">Cancelar</button>
                <button onClick={handleMovimentacao} disabled={loadingModal}
                  className="flex-1 text-white rounded-lg py-2.5 text-sm font-bold transition-all disabled:opacity-50"
                  style={{ background: modalTipo === "entrada" ? "#16a34a" : "#dc2626" }}>
                  {loadingModal ? "Salvando..." : modalTipo === "entrada" ? "Confirmar entrada" : "Confirmar saída"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default EstoqueInsumosPage;
