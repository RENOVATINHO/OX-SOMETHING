// ==============================
// EstoqueInsumosPage.tsx — Visão geral e movimentação do estoque de insumos
//
// Responsabilidades:
//   • Cards de resumo: total de produtos, valor em estoque e nº de categorias
//   • Gráfico de rosca: distribuição do valor por categoria (alimentacao/saude/solo_pasto)
//   • Gráficos de barras por categoria: quantidade em estoque por insumo
//   • Tabela de movimentação: botões Entrada e Saída para cada insumo
//   • Modal de movimentação: registra entrada (com valor unitário) ou saída (sem valor)
//
// Fonte de dados:
//   GET /api/insumos              → lista de insumos com quantidade_estoque atual
//   GET /api/insumos/dashboard    → dados agregados por categoria para os gráficos
//   POST /api/insumos/:id/entrada → adiciona ao estoque
//   POST /api/insumos/:id/saida   → subtrai do estoque
// ==============================

import { useState, useEffect } from "react";
import { ArrowDownCircle, ArrowUpCircle, Package } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AppLayout from "@/components/AppLayout";

// Insumo individual com quantidade atual em estoque
interface Insumo {
  id: number;
  nome: string;
  categoria: "alimentacao" | "saude" | "solo_pasto"; // categorias base (além das dinâmicas)
  unidade: string;
  valor_unitario: number;
  quantidade_estoque: number; // atualizado a cada entrada/saída registrada
}

// Dados de um insumo no endpoint de dashboard (valores já calculados pelo back-end)
interface DashboardCategoria {
  nome: string;
  unidade: string;
  quantidade: number;   // estoque atual
  valorUnitario: number;
  valorTotal: number;   // quantidade × valorUnitario (pré-calculado)
}

// Estrutura do endpoint GET /api/insumos/dashboard — insumos agrupados por categoria
interface DashboardData {
  alimentacao: DashboardCategoria[];
  saude: DashboardCategoria[];
  solo_pasto: DashboardCategoria[];
}

// Conversão de slug para nome exibível nas abas e tabela
const categoriasLabel: Record<string, string> = {
  alimentacao: "Alimentação",
  saude: "Saúde",
  solo_pasto: "Solo/Pasto",
};

// Cores HSL dos gráficos — mesmas do GraficoRoscaInsumos para consistência visual
const CORES_ROSCA = {
  alimentacao: "hsl(45 90% 50%)",  // âmbar
  saude: "hsl(0 70% 55%)",          // vermelho
  solo_pasto: "hsl(160 60% 45%)",   // verde
};

// Componente interno: gráfico de barras para uma categoria específica
// Recebe os dados já filtrados e a cor correspondente à categoria
const GraficoCategoria = ({ dados, cor }: { dados: DashboardCategoria[]; cor: string }) => {
  if (dados.length === 0) return (
    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
      Nenhum insumo nesta categoria.
    </div>
  );
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 22%)" />
          <XAxis dataKey="nome" tick={{ fill: "hsl(215 15% 55%)", fontSize: 11 }} />
          <YAxis tick={{ fill: "hsl(215 15% 55%)", fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: "hsl(220 20% 14%)", border: "1px solid hsl(220 15% 22%)", borderRadius: "8px", color: "hsl(210 20% 90%)" }}
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
        fetch("http://localhost:3001/api/insumos", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:3001/api/insumos/dashboard", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const dataInsumos = await resInsumos.json();
      const dataDash = await resDash.json();
      setInsumos(dataInsumos);
      setDashboard(dataDash);
    } catch {
      console.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  // Pré-preenche e abre o modal de movimentação para o insumo selecionado
  const abrirModal = (insumo: Insumo, tipo: "entrada" | "saida") => {
    setInsumoSelecionado(insumo);
    setModalTipo(tipo);
    setQuantidade("");
    setValor("");
    setObservacao("");
    setErroModal("");
    setModalAberto(true);
  };

  // Registra a movimentação (entrada ou saída) na API e recarrega os dados
  // Entrada: exige quantidade + valor unitário (atualiza o preço médio do insumo)
  // Saída:   exige apenas a quantidade (sem valor — só subtrai do estoque)
  const handleMovimentacao = async () => {
    if (!quantidade || Number(quantidade) <= 0) {
      setErroModal("Informe uma quantidade válida.");
      return;
    }
    setLoadingModal(true);
    const token = localStorage.getItem("easy_cattle_token");
    try {
      const body: Record<string, unknown> = { quantidade: Number(quantidade), observacao };
      // valor_unitario só é enviado nas entradas — nas saídas não é necessário
      if (modalTipo === "entrada") body.valor_unitario = Number(valor);

      const res = await fetch(`http://localhost:3001/api/insumos/${insumoSelecionado?.id}/${modalTipo}`, {
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

  // Dados para o gráfico de rosca
  const dadosRosca = dashboard ? [
    {
      name: "Alimentação",
      value: (dashboard.alimentacao || []).reduce((acc, i) => acc + i.valorTotal, 0),
      cor: CORES_ROSCA.alimentacao,
    },
    {
      name: "Saúde",
      value: (dashboard.saude || []).reduce((acc, i) => acc + i.valorTotal, 0),
      cor: CORES_ROSCA.saude,
    },
    {
      name: "Solo/Pasto",
      value: (dashboard.solo_pasto || []).reduce((acc, i) => acc + i.valorTotal, 0),
      cor: CORES_ROSCA.solo_pasto,
    },
  ].filter(d => d.value > 0) : [];

  const totalValor = dadosRosca.reduce((acc, d) => acc + d.value, 0);
  const totalItens = insumos.length;

  return (
    <AppLayout title="Estoque de Insumos">
      <div className="max-w-6xl space-y-6">

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Total de produtos</p>
            <p className="text-3xl font-extrabold text-foreground">{totalItens}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Valor total em estoque</p>
            <p className="text-3xl font-extrabold text-primary">R$ {totalValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Categorias</p>
            <p className="text-3xl font-extrabold text-foreground">3</p>
          </div>
        </div>

        {loading ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : (
          <>
            {/* Gráfico de rosca + gráficos por categoria lado a lado */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Rosca — visão geral */}
              <div className="bg-card rounded-xl border border-border p-6 flex flex-col">
                <h3 className="text-lg font-bold text-foreground mb-4">Visão geral do estoque</h3>
                {dadosRosca.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                    Nenhum valor em estoque ainda.
                  </div>
                ) : (
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={dadosRosca}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {dadosRosca.map((entry, index) => (
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

                    {/* Totais por categoria */}
                    <div className="mt-2 space-y-2">
                      {dadosRosca.map((d) => (
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
                    </div>
                  </div>
                )}
              </div>

              {/* Gráficos por categoria */}
              <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Estoque por categoria</h3>
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
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Registrar movimentação</h3>
              {insumos.length === 0 ? (
                <div className="text-center py-8">
                  <Package size={40} className="text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhum insumo cadastrado ainda.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left px-6 py-3 text-muted-foreground font-semibold">Nome</th>
                        <th className="text-left px-6 py-3 text-muted-foreground font-semibold">Categoria</th>
                        <th className="text-left px-6 py-3 text-muted-foreground font-semibold">Estoque atual</th>
                        <th className="text-right px-6 py-3 text-muted-foreground font-semibold">Movimentar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {insumos.map((insumo, index) => (
                        <tr key={insumo.id} className={`border-b border-border last:border-0 ${index % 2 === 0 ? "" : "bg-muted/20"}`}>
                          <td className="px-6 py-4 font-semibold text-foreground">{insumo.nome}</td>
                          <td className="px-6 py-4 text-muted-foreground">{categoriasLabel[insumo.categoria]}</td>
                          <td className="px-6 py-4 text-foreground">
                            {Number(insumo.quantidade_estoque).toLocaleString("pt-BR")} {insumo.unidade}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => abrirModal(insumo, "entrada")}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 text-xs font-semibold transition-colors"
                              >
                                <ArrowDownCircle size={14} />
                                Entrada
                              </button>
                              <button
                                onClick={() => abrirModal(insumo, "saida")}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 text-xs font-semibold transition-colors"
                              >
                                <ArrowUpCircle size={14} />
                                Saída
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-foreground mb-1">
              {modalTipo === "entrada" ? "Registrar Entrada" : "Registrar Saída"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">{insumoSelecionado.nome}</p>
            <div className="flex flex-col gap-3">
              <input
                type="number"
                placeholder={`Quantidade (${insumoSelecionado.unidade})`}
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none"
              />
              {modalTipo === "entrada" && (
                <input
                  type="number"
                  placeholder="Valor unitário (R$)"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none"
                />
              )}
              <input
                type="text"
                placeholder="Observação (opcional)"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none"
              />
              {erroModal && <p className="text-sm text-destructive text-center">{erroModal}</p>}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setModalAberto(false)}
                  className="flex-1 border border-border rounded-lg py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleMovimentacao}
                  disabled={loadingModal}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-60 ${
                    modalTipo === "entrada" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
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
