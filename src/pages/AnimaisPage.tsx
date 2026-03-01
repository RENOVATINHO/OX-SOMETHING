import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Pencil, PawPrint, DollarSign, Skull, Plus, TrendingUp } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import AppLayout from "@/components/AppLayout";

interface Animal {
  id: number;
  compra_id: number;
  brinco: string | null;
  peso_entrada: number | null;
  observacao: string | null;
  status: "ativo" | "vendido" | "morto";
  numero_compra: string;
  sexo: "macho_inteiro" | "macho_capado" | "femea";
  faixa_etaria: "bezerro" | "garrote" | "novilho" | "adulto";
  valor_kg: number | null;
  valor_total: number | null;
  numero_gta: string | null;
  vendedor_nome: string | null;
  nome_pai: string | null;
  nome_mae: string | null;
  raca: string | null;
  data_nascimento: string | null;
  tipo_cadastro: "compra" | "especial";
}

const sexoLabel: Record<string, string> = {
  macho_inteiro: "Macho Inteiro",
  macho_capado: "Boi",
  femea: "Fêmea",
};

const faixaLabel: Record<string, string> = {
  bezerro: "Bezerro",
  garrote: "Garrote",
  novilho: "Novilho",
  adulto: "Adulto",
};

const statusCores: Record<string, string> = {
  ativo: "bg-green-100 text-green-800",
  vendido: "bg-blue-100 text-blue-800",
  morto: "bg-red-100 text-red-800",
};

const filtrarPorAba = (animais: Animal[], aba: string) => {
  const ativos = animais.filter(a => a.status === "ativo");
  switch (aba) {
    case "reprodutores": return ativos.filter(a => a.sexo === "macho_inteiro" && a.faixa_etaria === "adulto" && a.tipo_cadastro === "especial");
    case "garrotes":     return ativos.filter(a => a.sexo === "macho_inteiro" && a.faixa_etaria !== "adulto");
    case "bois":         return ativos.filter(a => a.sexo === "macho_capado");
    case "matrizes":     return ativos.filter(a => a.sexo === "femea" && a.faixa_etaria === "adulto");
    case "novilhas":     return ativos.filter(a => a.sexo === "femea" && ["garrote", "novilho"].includes(a.faixa_etaria));
    case "bezerras":     return ativos.filter(a => a.sexo === "femea" && a.faixa_etaria === "bezerro");
    default:             return animais;
  }
};

// ── Gráfico de pizza customizado ──────────────────────────────────────────────
const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
        <p className="font-bold text-foreground">{payload[0].name}</p>
        <p className="text-muted-foreground">{payload[0].value} animais</p>
      </div>
    );
  }
  return null;
};

const CustomTooltipValor = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
        <p className="font-bold text-foreground">{payload[0].name}</p>
        <p className="text-muted-foreground">
          {payload[0].value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>
      </div>
    );
  }
  return null;
};

// ── Tabela ────────────────────────────────────────────────────────────────────
const TabelaAnimais = ({ animais, search, onEditar, onVenda, onMorte }: {
  animais: Animal[]; search: string;
  onEditar: (a: Animal) => void; onVenda: (a: Animal) => void; onMorte: (a: Animal) => void;
}) => {
  const filtrados = animais.filter(a =>
    (a.brinco || "").toLowerCase().includes(search.toLowerCase()) ||
    (a.numero_compra || "").includes(search) ||
    (a.vendedor_nome || "").toLowerCase().includes(search.toLowerCase())
  );
  if (filtrados.length === 0) return (
    <div className="text-center py-12">
      <PawPrint size={40} className="text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground font-semibold">Nenhum animal nesta categoria.</p>
    </div>
  );
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/80">
            <th className="text-left px-5 py-3 text-muted-foreground font-semibold">Brinco</th>
            <th className="text-left px-5 py-3 text-muted-foreground font-semibold">Nº Compra</th>
            <th className="text-left px-5 py-3 text-muted-foreground font-semibold">Sexo</th>
            <th className="text-left px-5 py-3 text-muted-foreground font-semibold">Faixa</th>
            <th className="text-left px-5 py-3 text-muted-foreground font-semibold">Peso</th>
            <th className="text-left px-5 py-3 text-muted-foreground font-semibold">Vendedor</th>
            <th className="text-left px-5 py-3 text-muted-foreground font-semibold">Status</th>
            <th className="text-right px-5 py-3 text-muted-foreground font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtrados.map((animal, index) => (
            <tr key={animal.id} className={`border-b border-border last:border-0 ${index % 2 === 0 ? "" : "bg-muted/20"}`}>
              <td className="px-5 py-4 font-semibold text-foreground">
                {animal.brinco || <span className="text-muted-foreground italic text-xs">Sem brinco</span>}
              </td>
              <td className="px-5 py-4 font-mono text-primary font-bold">#{animal.numero_compra}</td>
              <td className="px-5 py-4 text-foreground">{sexoLabel[animal.sexo]}</td>
              <td className="px-5 py-4 text-foreground">{faixaLabel[animal.faixa_etaria]}</td>
              <td className="px-5 py-4 text-foreground">
                {animal.peso_entrada ? `${animal.peso_entrada} kg` : <span className="text-muted-foreground italic text-xs">—</span>}
              </td>
              <td className="px-5 py-4 text-foreground">{animal.vendedor_nome || "—"}</td>
              <td className="px-5 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusCores[animal.status]}`}>
                  {animal.status}
                </span>
              </td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-1.5">
                  <button onClick={() => onEditar(animal)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-colors">
                    <Pencil size={12} /> Editar
                  </button>
                  {animal.status === "ativo" && (<>
                    <button onClick={() => onVenda(animal)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 text-xs font-semibold transition-colors">
                      <DollarSign size={12} /> Venda
                    </button>
                    <button onClick={() => onMorte(animal)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 text-xs font-semibold transition-colors">
                      <Skull size={12} /> Morte
                    </button>
                  </>)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const AnimaisPage = () => {
  const navigate = useNavigate();
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);

  const [modalEditar, setModalEditar] = useState(false);
  const [animalSel, setAnimalSel] = useState<Animal | null>(null);
  const [editBrinco, setEditBrinco] = useState("");
  const [editPeso, setEditPeso] = useState("");
  const [editObs, setEditObs] = useState("");
  const [editStatus, setEditStatus] = useState("ativo");
  const [erroEditar, setErroEditar] = useState("");
  const [loadingEditar, setLoadingEditar] = useState(false);

  const [modalVenda, setModalVenda] = useState(false);
  const [animalVenda, setAnimalVenda] = useState<Animal | null>(null);
  const [valorVenda, setValorVenda] = useState("");
  const [dataVenda, setDataVenda] = useState(new Date().toISOString().split("T")[0]);
  const [erroVenda, setErroVenda] = useState("");
  const [loadingVenda, setLoadingVenda] = useState(false);

  const [modalMorte, setModalMorte] = useState(false);
  const [animalMorte, setAnimalMorte] = useState<Animal | null>(null);
  const [causaMorte, setCausaMorte] = useState("");
  const [dataMorte, setDataMorte] = useState(new Date().toISOString().split("T")[0]);
  const [erroMorte, setErroMorte] = useState("");
  const [loadingMorte, setLoadingMorte] = useState(false);

  const token = localStorage.getItem("easy_cattle_token");

  const carregarAnimais = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/animais", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setAnimais(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Erro ao carregar animais:", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { carregarAnimais(); }, []);

  const abrirEditar = (a: Animal) => {
    setAnimalSel(a); setEditBrinco(a.brinco || "");
    setEditPeso(a.peso_entrada ? String(a.peso_entrada) : "");
    setEditObs(a.observacao || ""); setEditStatus(a.status);
    setErroEditar(""); setModalEditar(true);
  };

  const handleEditar = async () => {
    setLoadingEditar(true);
    try {
      const res = await fetch(`http://localhost:3001/api/animais/${animalSel?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ brinco: editBrinco, peso_entrada: Number(editPeso) || null, observacao: editObs, status: editStatus }),
      });
      const data = await res.json();
      if (!res.ok) { setErroEditar(data.error || "Erro."); return; }
      setModalEditar(false); carregarAnimais();
    } catch { setErroEditar("Não foi possível conectar."); }
    finally { setLoadingEditar(false); }
  };

  const handleVenda = async () => {
    if (!valorVenda) { setErroVenda("Informe o valor da venda."); return; }
    setLoadingVenda(true);
    try {
      const res = await fetch(`http://localhost:3001/api/animais/${animalVenda?.id}/venda`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ valor_venda: Number(valorVenda), data_saida: dataVenda }),
      });
      const data = await res.json();
      if (!res.ok) { setErroVenda(data.error || "Erro."); return; }
      setModalVenda(false); carregarAnimais();
    } catch { setErroVenda("Não foi possível conectar."); }
    finally { setLoadingVenda(false); }
  };

  const handleMorte = async () => {
    setLoadingMorte(true);
    try {
      const res = await fetch(`http://localhost:3001/api/animais/${animalMorte?.id}/morte`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ causa_morte: causaMorte, data_saida: dataMorte }),
      });
      const data = await res.json();
      if (!res.ok) { setErroMorte(data.error || "Erro."); return; }
      setModalMorte(false); carregarAnimais();
    } catch { setErroMorte("Não foi possível conectar."); }
    finally { setLoadingMorte(false); }
  };

  const ativos = animais.filter(a => a.status === "ativo");

  const cnt = {
    reprodutores: filtrarPorAba(animais, "reprodutores").length,
    garrotes:     filtrarPorAba(animais, "garrotes").length,
    bois:         filtrarPorAba(animais, "bois").length,
    matrizes:     filtrarPorAba(animais, "matrizes").length,
    novilhas:     filtrarPorAba(animais, "novilhas").length,
    bezerras:     filtrarPorAba(animais, "bezerras").length,
  };

  // ── Dados para os gráficos ────────────────────────────────────────────────
  const CORES_PIZZA = ["#f59e0b", "#f97316", "#84cc16", "#ec4899", "#a78bfa", "#38bdf8"];

  const dadosPizza = [
    { name: "Reprodutores", value: cnt.reprodutores },
    { name: "Garrotes",     value: cnt.garrotes },
    { name: "Bois",         value: cnt.bois },
    { name: "Matrizes",     value: cnt.matrizes },
    { name: "Novilhas",     value: cnt.novilhas },
    { name: "Bezerras",     value: cnt.bezerras },
  ].filter(d => d.value > 0);

  // Valor estimado por categoria (peso_entrada * valor_kg da compra)
  const calcularValorCategoria = (lista: Animal[]) =>
    lista.reduce((acc, a) => {
      const peso = a.peso_entrada || 0;
      const valorKg = a.valor_kg || 0;
      return acc + peso * valorKg;
    }, 0);

  const dadosValor = [
    { name: "Reprodutores", value: calcularValorCategoria(filtrarPorAba(animais, "reprodutores")) },
    { name: "Garrotes",     value: calcularValorCategoria(filtrarPorAba(animais, "garrotes")) },
    { name: "Bois",         value: calcularValorCategoria(filtrarPorAba(animais, "bois")) },
    { name: "Matrizes",     value: calcularValorCategoria(filtrarPorAba(animais, "matrizes")) },
    { name: "Novilhas",     value: calcularValorCategoria(filtrarPorAba(animais, "novilhas")) },
    { name: "Bezerras",     value: calcularValorCategoria(filtrarPorAba(animais, "bezerras")) },
  ].filter(d => d.value > 0);

  const valorTotalRebanho = dadosValor.reduce((acc, d) => acc + d.value, 0);

  return (
    <AppLayout title="Rebanho">
      <div className="max-w-7xl">

        {/* Barra de busca + botões */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex-1 flex items-center bg-card border border-border rounded-lg px-4 py-3 gap-2 min-w-48">
            <Search size={18} className="text-muted-foreground" />
            <input placeholder="Buscar por brinco, nº compra ou vendedor..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground" />
          </div>
          <button
            onClick={() => setShowDashboard(v => !v)}
            className={`rounded-lg px-4 py-3 text-sm font-bold transition-colors flex items-center gap-2 border ${showDashboard ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:bg-muted"}`}>
            <TrendingUp size={15} /> Dashboard
          </button>
          <button onClick={() => navigate("/animais/nova-compra")}
            className="bg-primary text-primary-foreground rounded-lg px-4 py-3 text-sm font-bold hover:bg-accent transition-colors flex items-center gap-2">
            <Plus size={15} /> Nova Compra
          </button>
          <button onClick={() => navigate("/animais/cadastro-especial?sexo=macho_inteiro")}
            className="bg-amber-600 text-white rounded-lg px-4 py-3 text-sm font-bold hover:bg-amber-700 transition-colors flex items-center gap-2">
            <Plus size={15} /> 🐂 Reprodutor
          </button>
          <button onClick={() => navigate("/animais/cadastro-especial?sexo=femea")}
            className="bg-pink-600 text-white rounded-lg px-4 py-3 text-sm font-bold hover:bg-pink-700 transition-colors flex items-center gap-2">
            <Plus size={15} /> 🐄 Matriz
          </button>
        </div>

        {/* Cards — Total do Rebanho + grid 2x3 */}
        <div className="flex gap-4 mb-6 items-stretch">
          <div className="bg-card border border-border rounded-xl w-44 flex-shrink-0 flex flex-col items-center justify-center gap-2 py-6 px-4">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider text-center">Total do Rebanho</p>
            <p className="text-6xl font-black text-primary leading-none">{ativos.length}</p>
            <p className="text-xs text-muted-foreground">animais</p>
          </div>

          <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-3">
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Reprodutores</p>
              <p className="text-3xl font-black text-amber-500">{cnt.reprodutores}</p>
              <p className="text-xs text-muted-foreground mt-1">Macho inteiro adulto</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Garrotes</p>
              <p className="text-3xl font-black text-amber-500">{cnt.garrotes}</p>
              <p className="text-xs text-muted-foreground mt-1">Inteiros jovens</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Bois</p>
              <p className="text-3xl font-black text-amber-500">{cnt.bois}</p>
              <p className="text-xs text-muted-foreground mt-1">Machos castrados</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Matrizes</p>
              <p className="text-3xl font-black text-pink-500">{cnt.matrizes}</p>
              <p className="text-xs text-muted-foreground mt-1">Fêmea acima 36m</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Novilhas</p>
              <p className="text-3xl font-black text-pink-500">{cnt.novilhas}</p>
              <p className="text-xs text-muted-foreground mt-1">Fêmea 13 a 36m</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Bezerras</p>
              <p className="text-3xl font-black text-pink-500">{cnt.bezerras}</p>
              <p className="text-xs text-muted-foreground mt-1">Fêmea 0 a 12m</p>
            </div>
          </div>
        </div>

        {/* Dashboard em pizza — aparece ao clicar no botão */}
        {showDashboard && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

            {/* Pizza — Quantidade */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="mb-4">
                <p className="text-sm font-bold text-foreground">Composição do Rebanho</p>
                <p className="text-xs text-muted-foreground">Distribuição por categoria (ativos)</p>
              </div>
              {dadosPizza.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={dadosPizza}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {dadosPizza.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CORES_PIZZA[index % CORES_PIZZA.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
                  Nenhum animal ativo cadastrado.
                </div>
              )}
            </div>

            {/* Pizza — Valor */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="mb-4">
                <p className="text-sm font-bold text-foreground">Valor Estimado do Rebanho</p>
                <p className="text-xs text-muted-foreground">
                  Baseado em peso de entrada × valor/kg da compra
                  {valorTotalRebanho > 0 && (
                    <span className="ml-2 font-bold text-primary">
                      Total: {valorTotalRebanho.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  )}
                </p>
              </div>
              {dadosValor.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={dadosValor}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {dadosValor.map((_, index) => (
                        <Cell key={`cell-v-${index}`} fill={CORES_PIZZA[index % CORES_PIZZA.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltipValor />} />
                    <Legend
                      formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
                  Cadastre peso e valor/kg para visualizar.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabela com abas */}
        {loading ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border p-6">
            <Tabs defaultValue="todos">
              <TabsList className="mb-6 flex-wrap h-auto gap-1">
                <TabsTrigger value="todos">Todos ({animais.length})</TabsTrigger>
                <TabsTrigger value="reprodutores">Reprodutores ({cnt.reprodutores})</TabsTrigger>
                <TabsTrigger value="garrotes">Garrotes ({cnt.garrotes})</TabsTrigger>
                <TabsTrigger value="bois">Bois ({cnt.bois})</TabsTrigger>
                <TabsTrigger value="matrizes">Matrizes ({cnt.matrizes})</TabsTrigger>
                <TabsTrigger value="novilhas">Novilhas ({cnt.novilhas})</TabsTrigger>
                <TabsTrigger value="bezerras">Bezerras ({cnt.bezerras})</TabsTrigger>
              </TabsList>
              {["todos", "reprodutores", "garrotes", "bois", "matrizes", "novilhas", "bezerras"].map(aba => (
                <TabsContent key={aba} value={aba}>
                  <TabelaAnimais
                    animais={filtrarPorAba(animais, aba)}
                    search={search}
                    onEditar={abrirEditar}
                    onVenda={(a) => { setAnimalVenda(a); setValorVenda(""); setDataVenda(new Date().toISOString().split("T")[0]); setErroVenda(""); setModalVenda(true); }}
                    onMorte={(a) => { setAnimalMorte(a); setCausaMorte(""); setDataMorte(new Date().toISOString().split("T")[0]); setErroMorte(""); setModalMorte(true); }}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </div>

      {/* Modal editar */}
      {modalEditar && animalSel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-1">Editar animal</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Compra #{animalSel.numero_compra} — {sexoLabel[animalSel.sexo]} — {faixaLabel[animalSel.faixa_etaria]}
            </p>
            <div className="flex flex-col gap-3">
              <input type="text" placeholder="Número do brinco" value={editBrinco} onChange={(e) => setEditBrinco(e.target.value)}
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none" />
              <input type="number" placeholder="Peso de entrada (kg)" value={editPeso} onChange={(e) => setEditPeso(e.target.value)}
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none" />
              <input type="text" placeholder="Observação" value={editObs} onChange={(e) => setEditObs(e.target.value)}
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none" />
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none">
                <option value="ativo">Ativo</option>
                <option value="vendido">Vendido</option>
                <option value="morto">Morto</option>
              </select>
              {erroEditar && <p className="text-sm text-destructive text-center">{erroEditar}</p>}
              <div className="flex gap-3 mt-2">
                <button onClick={() => setModalEditar(false)} className="flex-1 border border-border rounded-lg py-2.5 text-sm font-semibold hover:bg-muted transition-colors">Cancelar</button>
                <button onClick={handleEditar} disabled={loadingEditar} className="flex-1 bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-bold hover:bg-accent transition-colors disabled:opacity-60">
                  {loadingEditar ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal venda */}
      {modalVenda && animalVenda && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center"><DollarSign size={20} className="text-blue-600" /></div>
              <div>
                <h3 className="text-lg font-bold">Registrar Venda</h3>
                <p className="text-xs text-muted-foreground">{animalVenda.brinco || "Sem brinco"} — Compra #{animalVenda.numero_compra}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <input type="number" placeholder="Valor da venda (R$)" value={valorVenda} onChange={(e) => setValorVenda(e.target.value)}
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none" />
              <input type="date" value={dataVenda} onChange={(e) => setDataVenda(e.target.value)}
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none" />
              {erroVenda && <p className="text-sm text-destructive text-center">{erroVenda}</p>}
              <div className="flex gap-3 mt-2">
                <button onClick={() => setModalVenda(false)} className="flex-1 border border-border rounded-lg py-2.5 text-sm font-semibold hover:bg-muted transition-colors">Cancelar</button>
                <button onClick={handleVenda} disabled={loadingVenda} className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-60">
                  {loadingVenda ? "Salvando..." : "Confirmar venda"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal morte */}
      {modalMorte && animalMorte && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center"><Skull size={20} className="text-red-600" /></div>
              <div>
                <h3 className="text-lg font-bold">Registrar Morte</h3>
                <p className="text-xs text-muted-foreground">{animalMorte.brinco || "Sem brinco"} — Compra #{animalMorte.numero_compra}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <input type="text" placeholder="Causa da morte (opcional)" value={causaMorte} onChange={(e) => setCausaMorte(e.target.value)}
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none" />
              <input type="date" value={dataMorte} onChange={(e) => setDataMorte(e.target.value)}
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none" />
              {erroMorte && <p className="text-sm text-destructive text-center">{erroMorte}</p>}
              <div className="flex gap-3 mt-2">
                <button onClick={() => setModalMorte(false)} className="flex-1 border border-border rounded-lg py-2.5 text-sm font-semibold hover:bg-muted transition-colors">Cancelar</button>
                <button onClick={handleMorte} disabled={loadingMorte} className="flex-1 bg-red-600 text-white rounded-lg py-2.5 text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-60">
                  {loadingMorte ? "Salvando..." : "Confirmar morte"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default AnimaisPage;