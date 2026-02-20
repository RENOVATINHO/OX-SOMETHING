import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PawPrint, ShoppingCart, TrendingUp, Package, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import celeiroIcon from "@/assets/celeiro.png";
import rebanhoIcon from "@/assets/rebanho.png";
import vacaIcon from "@/assets/vaca.png";
import touroIcon from "@/assets/touro.png";
import bezerroIcon from "@/assets/bezerro.png";

const animaisMensal = [
  { periodo: "Jan", quantidade: 120 }, { periodo: "Fev", quantidade: 125 },
  { periodo: "Mar", quantidade: 132 }, { periodo: "Abr", quantidade: 128 },
  { periodo: "Mai", quantidade: 140 }, { periodo: "Jun", quantidade: 155 },
  { periodo: "Jul", quantidade: 160 }, { periodo: "Ago", quantidade: 158 },
  { periodo: "Set", quantidade: 165 }, { periodo: "Out", quantidade: 172 },
  { periodo: "Nov", quantidade: 180 }, { periodo: "Dez", quantidade: 185 },
];

const animaisQuinzenal = [
  { periodo: "Jan 1Q", quantidade: 118 }, { periodo: "Jan 2Q", quantidade: 122 },
  { periodo: "Fev 1Q", quantidade: 124 }, { periodo: "Fev 2Q", quantidade: 126 },
  { periodo: "Mar 1Q", quantidade: 129 }, { periodo: "Mar 2Q", quantidade: 134 },
  { periodo: "Abr 1Q", quantidade: 130 }, { periodo: "Abr 2Q", quantidade: 127 },
  { periodo: "Mai 1Q", quantidade: 135 }, { periodo: "Mai 2Q", quantidade: 142 },
  { periodo: "Jun 1Q", quantidade: 148 }, { periodo: "Jun 2Q", quantidade: 157 },
  { periodo: "Jul 1Q", quantidade: 159 }, { periodo: "Jul 2Q", quantidade: 161 },
  { periodo: "Ago 1Q", quantidade: 156 }, { periodo: "Ago 2Q", quantidade: 159 },
  { periodo: "Set 1Q", quantidade: 162 }, { periodo: "Set 2Q", quantidade: 167 },
  { periodo: "Out 1Q", quantidade: 170 }, { periodo: "Out 2Q", quantidade: 174 },
  { periodo: "Nov 1Q", quantidade: 177 }, { periodo: "Nov 2Q", quantidade: 182 },
  { periodo: "Dez 1Q", quantidade: 183 }, { periodo: "Dez 2Q", quantidade: 187 },
];

const AnimaisChart = () => {
  const [modo, setModo] = useState<"mensal" | "quinzenal">("mensal");
  const data = modo === "mensal" ? animaisMensal : animaisQuinzenal;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Estoque de Animais</h3>
        <div className="flex gap-2">
          <Button size="sm" variant={modo === "mensal" ? "default" : "outline"} onClick={() => setModo("mensal")}>
            Mensal
          </Button>
          <Button size="sm" variant={modo === "quinzenal" ? "default" : "outline"} onClick={() => setModo("quinzenal")}>
            Quinzenal
          </Button>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 22%)" />
            <XAxis dataKey="periodo" tick={{ fill: "hsl(215 15% 55%)", fontSize: 10 }} angle={modo === "quinzenal" ? -45 : 0} textAnchor={modo === "quinzenal" ? "end" : "middle"} height={modo === "quinzenal" ? 60 : 30} />
            <YAxis tick={{ fill: "hsl(215 15% 55%)", fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(220 20% 14%)", border: "1px solid hsl(220 15% 22%)", borderRadius: "8px", color: "hsl(210 20% 90%)" }} labelStyle={{ color: "hsl(210 20% 90%)", fontWeight: "bold" }} formatter={(value: number) => [`${value} cabeças`, "Quantidade"]} />
            <Line type="monotone" dataKey="quantidade" stroke="hsl(160 60% 45%)" strokeWidth={2} dot={{ fill: "hsl(160 60% 45%)", r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();

  const stats = [
    { label: "Total de Animais", value: 1, img: rebanhoIcon },
    { label: "Matrizes", value: 0, img: vacaIcon },
    { label: "Reprodutores", value: 1, img: touroIcon },
    { label: "Nascimentos", value: 0, img: bezerroIcon },
  ];

  const insumosData = [
    { tipo: "Ração", quantidade: 120, valor: 4800 },
    { tipo: "Vacina", quantidade: 85, valor: 3200 },
    { tipo: "Medicamento", quantidade: 45, valor: 5400 },
    { tipo: "Vermífugo", quantidade: 70, valor: 2800 },
  ];

  const totalEstoque = insumosData.reduce((acc, item) => acc + item.valor, 0);
  const totalItens = insumosData.reduce((acc, item) => acc + item.quantidade, 0);

  const quickActions = [
    { icon: PawPrint, label: "Cadastrar Animal", desc: "Adicionar novo animal ao rebanho", route: "/animais/novo" },
    { icon: ShoppingCart, label: "Nova Compra Animal", desc: "Registrar compra de animais", route: "/compras-animais/nova" },
    { icon: Package, label: "Nova Compra Insumo", desc: "Registrar compra de insumos", route: "/compras-insumos/nova" },
    { icon: BarChart3, label: "Ver Relatórios", desc: "Acessar relatórios e análises", route: "/relatorios" },
  ];

  return (
    <AppLayout title="Dashboard">
      {/* Property card */}
      <div className="bg-primary rounded-xl p-6 mb-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden">
          <img src={celeiroIcon} alt="Propriedade" className="w-12 h-12 object-cover" />
        </div>
        <div>
          <p className="text-primary-foreground/70 text-sm">Propriedade</p>
          <p className="text-primary-foreground text-xl font-bold">Fazenda Minas Gerais</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden">
              <img src={stat.img} alt={stat.label} className="w-12 h-12 object-cover" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-semibold">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Estoque de Insumos */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-foreground">Estoque de Insumos</h3>
            <div className="flex gap-4 text-sm">
              <span className="text-muted-foreground">Total: <strong className="text-foreground">{totalItens}</strong></span>
              <span className="text-muted-foreground">Valor: <strong className="text-primary">R$ {totalEstoque.toLocaleString("pt-BR")}</strong></span>
            </div>
          </div>
          <Tabs defaultValue="quantidade" className="mt-4">
            <TabsList className="mb-4">
              <TabsTrigger value="quantidade">Quantidade</TabsTrigger>
              <TabsTrigger value="valor">Valor (R$)</TabsTrigger>
            </TabsList>
            <TabsContent value="quantidade">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={insumosData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 22%)" />
                    <XAxis dataKey="tipo" tick={{ fill: "hsl(215 15% 55%)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "hsl(215 15% 55%)", fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(220 20% 14%)", border: "1px solid hsl(220 15% 22%)", borderRadius: "8px", color: "hsl(210 20% 90%)" }} labelStyle={{ color: "hsl(210 20% 90%)", fontWeight: "bold" }} formatter={(value: number) => [`${value} un`, "Quantidade"]} />
                    <Bar dataKey="quantidade" fill="hsl(215 70% 50%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="valor">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={insumosData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 22%)" />
                    <XAxis dataKey="tipo" tick={{ fill: "hsl(215 15% 55%)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "hsl(215 15% 55%)", fontSize: 12 }} tickFormatter={(v) => `R$${v}`} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(220 20% 14%)", border: "1px solid hsl(220 15% 22%)", borderRadius: "8px", color: "hsl(210 20% 90%)" }} labelStyle={{ color: "hsl(210 20% 90%)", fontWeight: "bold" }} formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, "Valor"]} />
                    <Bar dataKey="valor" fill="hsl(160 60% 45%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Estoque de Animais */}
        <AnimaisChart />
      </div>


      <h3 className="text-lg font-bold text-foreground mb-4">Ações Rápidas</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.route)}
            className="bg-card rounded-xl border border-border p-5 text-left hover:shadow-md hover:border-primary/30 transition-all group"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
              <action.icon size={20} className="text-primary" />
            </div>
            <p className="font-bold text-foreground text-sm">{action.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
          </button>
        ))}
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
