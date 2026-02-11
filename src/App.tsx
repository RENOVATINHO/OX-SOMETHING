import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AnimaisPage from "./pages/AnimaisPage";
import NovoAnimalPage from "./pages/NovoAnimalPage";
import NovaCompraAnimaisPage from "./pages/NovaCompraAnimaisPage";
import NovaCompraInsumosPage from "./pages/NovaCompraInsumosPage";
import RelatoriosPage from "./pages/RelatoriosPage";
import ComprasAnimaisListPage from "./pages/ComprasAnimaisListPage";
import ComprasInsumosListPage from "./pages/ComprasInsumosListPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/animais" element={<AnimaisPage />} />
          <Route path="/animais/novo" element={<NovoAnimalPage />} />
          <Route path="/compras-animais" element={<ComprasAnimaisListPage />} />
          <Route path="/compras-animais/nova" element={<NovaCompraAnimaisPage />} />
          <Route path="/compras-insumos" element={<ComprasInsumosListPage />} />
          <Route path="/compras-insumos/nova" element={<NovaCompraInsumosPage />} />
          <Route path="/relatorios" element={<RelatoriosPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
