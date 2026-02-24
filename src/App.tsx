// ==============================
// App.tsx — Arquivo raiz da aplicação
// Define o roteamento principal e os provedores globais (React Query, Tooltips, Toasts)
// ==============================

import { Toaster } from "@/components/ui/toaster";       // Componente de notificações toast (estilo shadcn)
import { Toaster as Sonner } from "@/components/ui/sonner"; // Componente de notificações sonner (alternativo)
import { TooltipProvider } from "@/components/ui/tooltip";  // Provedor global de tooltips
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Gerenciamento de cache e estado assíncrono
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Roteamento SPA

// Importação de todas as páginas da aplicação
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AnimaisPage from "./pages/AnimaisPage";
import NovoAnimalPage from "./pages/NovoAnimalPage";
import NovaCompraAnimaisPage from "./pages/NovaCompraAnimaisPage";
import NovaCompraInsumosPage from "./pages/NovaCompraInsumosPage";
import RelatoriosPage from "./pages/RelatoriosPage";
import ComprasAnimaisListPage from "./pages/ComprasAnimaisListPage";
import ComprasInsumosListPage from "./pages/ComprasInsumosListPage";
import CadastrosPage from "./pages/CadastrosPage";
import NovoVendedorPage from "./pages/NovoVendedorPage";
import NotFound from "./pages/NotFound";

// Instância única do QueryClient — gerencia cache de requisições em toda a app
const queryClient = new QueryClient();

const App = () => (
  // QueryClientProvider: disponibiliza o cache do React Query para toda a árvore de componentes
  <QueryClientProvider client={queryClient}>
    {/* TooltipProvider: necessário para que tooltips do shadcn funcionem em qualquer componente filho */}
    <TooltipProvider>
      {/* Componentes globais de notificação — ficam sempre montados para exibir toasts de qualquer página */}
      <Toaster />
      <Sonner />

      {/* BrowserRouter: habilita navegação SPA com histórico do navegador */}
      <BrowserRouter>
        <Routes>
          {/* Rota raiz: tela de login (ponto de entrada da aplicação) */}
          <Route path="/" element={<LoginPage />} />

          {/* Dashboard: painel principal com estatísticas e gráficos */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Módulo de Animais: listagem e cadastro individual */}
          <Route path="/animais" element={<AnimaisPage />} />
          <Route path="/animais/novo" element={<NovoAnimalPage />} />

          {/* Módulo de Cadastros: hub central para criar vendedores, compras, etc. */}
          <Route path="/cadastros" element={<CadastrosPage />} />
          <Route path="/cadastros/novo-vendedor" element={<NovoVendedorPage />} />

          {/* Módulo de Compras de Animais: listagem e formulário de nova compra */}
          <Route path="/compras-animais" element={<ComprasAnimaisListPage />} />
          <Route path="/compras-animais/nova" element={<NovaCompraAnimaisPage />} />

          {/* Módulo de Compras de Insumos: listagem e formulário de nova compra */}
          <Route path="/compras-insumos" element={<ComprasInsumosListPage />} />
          <Route path="/compras-insumos/nova" element={<NovaCompraInsumosPage />} />

          {/* Relatórios: acesso a relatórios e análises */}
          <Route path="/relatorios" element={<RelatoriosPage />} />

          {/* Rota curinga: qualquer URL não mapeada exibe a página 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
