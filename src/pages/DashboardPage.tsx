// ==============================
// DashboardPage.tsx — Painel principal da aplicação (home autenticada)
//
// Exibe ao usuário uma visão geral imediata da fazenda:
//   1. Card com o nome da propriedade (vindo do AuthContext)
//   2. Grid de estatísticas de animais: total, matrizes, reprodutores e bezerros
//      (buscado via GET /api/animais/stats — endpoint resumido no back-end)
//   3. Gráfico de rosca de insumos (componente GraficoRoscaInsumos)
//   4. Ações rápidas: botões de atalho para as principais funcionalidades
// ==============================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PawPrint, ShoppingCart, Package, BarChart3 } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/context/AuthContext";
import GraficoRoscaInsumos from "@/components/GraficoRoscaInsumos";

// Ícones ilustrativos para os cards de estatísticas
import celeiroIcon from "@/assets/celeiro.png";
import rebanhoIcon from "@/assets/rebanho.png";
import vacaIcon from "@/assets/vaca.png";
import touroIcon from "@/assets/touro.png";
import bezerroIcon from "@/assets/bezerro.png";

// Estrutura retornada pelo endpoint GET /api/animais/stats
interface AnimalStats {
  total: number;        // total de animais ativos
  matrizes: number;     // fêmeas adultas
  reprodutores: number; // machos inteiros adultos (tipo "especial")
  bezerros: number;     // animais na faixa "bezerro"
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // nome e nomePropriedade do usuário logado

  // Estatísticas de animais — inicializa com zeros para evitar undefined
  const [animalStats, setAnimalStats] = useState<AnimalStats>({ total: 0, matrizes: 0, reprodutores: 0, bezerros: 0 });

  // Busca as estatísticas assim que o Dashboard é montado
  // Usa .catch(() => {}) para falhar silenciosamente (não bloqueia a UI)
  useEffect(() => {
    const token = localStorage.getItem("easy_cattle_token");
    fetch("http://localhost:3001/api/animais/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setAnimalStats({
          total: data.total || 0,
          matrizes: data.matrizes || 0,
          reprodutores: data.reprodutores || 0,
          bezerros: data.bezerros || 0,
        });
      })
      .catch(() => {}); // falha silenciosa — os cards mostram "0" em caso de erro
  }, []);

  // Array de configuração dos cards de estatísticas (mapeado no JSX)
  const stats = [
    { label: "Total de Animais", value: animalStats.total, img: rebanhoIcon },
    { label: "Matrizes", value: animalStats.matrizes, img: vacaIcon },
    { label: "Reprodutores", value: animalStats.reprodutores, img: touroIcon },
    { label: "Bezerros", value: animalStats.bezerros, img: bezerroIcon },
  ];

  // Array de configuração dos botões de ação rápida (mapeado no JSX)
  const quickActions = [
    { icon: PawPrint, label: "Nova Compra Animal", desc: "Registrar compra de animais", route: "/compras-animais/nova" },
    { icon: ShoppingCart, label: "Cadastros", desc: "Acessar todos os cadastros", route: "/cadastros" },
    { icon: Package, label: "Estoque de Insumos", desc: "Ver e movimentar estoque", route: "/insumos/estoque" },
    { icon: BarChart3, label: "Ver Relatórios", desc: "Acessar relatórios e análises", route: "/relatorios" },
  ];

  return (
    <AppLayout title="Dashboard">

      {/* ── Card da propriedade ─────────────────────────────────────────────
          Destaque visual com fundo primário — primeira coisa que o usuário vê.
          Nome vem do AuthContext (persistido no localStorage após o login).
      ─────────────────────────────────────────────────────────────────────── */}
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

      {/* ── Grid de estatísticas de animais ──────────────────────────────────
          4 cards responsivos: total, matrizes, reprodutores e bezerros.
          Dados vêm do endpoint /api/animais/stats — carregados no useEffect.
      ─────────────────────────────────────────────────────────────────────── */}
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

      {/* ── Gráfico de rosca de insumos ──────────────────────────────────────
          Componente reutilizável que busca e exibe o valor em estoque por categoria.
          Separado em GraficoRoscaInsumos.tsx para evitar poluir este arquivo.
      ─────────────────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <GraficoRoscaInsumos />
      </div>

      {/* ── Ações rápidas ────────────────────────────────────────────────────
          4 botões de navegação rápida para as funções mais usadas do sistema.
          hover:shadow-md + group-hover simula um efeito de elevação no hover.
      ─────────────────────────────────────────────────────────────────────── */}
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