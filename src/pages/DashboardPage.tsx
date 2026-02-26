// ==============================
// DashboardPage.tsx — Painel principal da aplicação
// ==============================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PawPrint, ShoppingCart, TrendingUp, Package, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/context/AuthContext";

import celeiroIcon from "@/assets/celeiro.png";
import rebanhoIcon from "@/assets/rebanho.png";
import vacaIcon from "@/assets/vaca.png";
import touroIcon from "@/assets/touro.png";
import bezerroIcon from "@/assets/bezerro.png";
import GraficoRoscaInsumos from "@/components/GraficoRoscaInsumos";


const animaisMensal: { periodo: string; quantidade: number }[] = [];
const animaisQuinzenal: { periodo: string; quantidade: number }[] = [];

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
  const { user } = useAuth();

  const stats = [
    { label: "Total de Animais", value: 0, img: rebanhoIcon },
    { label: "Matrizes", value: 0, img: vacaIcon },
    { label: "Reprodutores", value: 0, img: touroIcon },
    { label: "Nascimentos", value: 0, img: bezerroIcon },
  ];

  const insumosData: { tipo: string; quantidade: number; valor: number }[] = [];
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

      {/* Card da propriedade — exibe o nome digitado no cadastro */}
      <div className="bg-primary rounded-xl p-6 mb-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden">
          <img src={celeiroIcon} alt="Propriedade" className="w-12 h-12 object-cover" />
        </div>
        <div>
          <p className="text-primary-foreground text-3xl font-bold">
            {user?.nomePropriedade || "Minha Propriedade"}
          </p>
        </div>
      </div>

      {/* Grid de estatísticas */}
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

      {/* Gráficos */}
      <div className="space-y-6 mb-8">
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

        <AnimaisChart />
        <GraficoRoscaInsumos />
      </div>

      {/* Ações rápidas */}
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
