// ==============================
// ComprasAnimaisListPage.tsx — Listagem de compras de animais
// Exibe todas as compras de animais registradas com campo de busca
// NOTA: a listagem real do banco ainda não está implementada — exibe estado vazio
// ==============================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const ComprasAnimaisListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState(""); // Estado do campo de busca por vendedor

  return (
    <AppLayout title="Compras de Animais">
      <div className="max-w-3xl">
        {/* ===== BARRA DE BUSCA + BOTÃO NOVA COMPRA ===== */}
        <div className="flex items-center gap-3 mb-6">
          {/* Campo de busca com ícone de lupa */}
          <div className="flex-1 flex items-center bg-card border border-border rounded-lg px-4 py-2.5 gap-2">
            <Search size={18} className="text-muted-foreground" />
            <input
              placeholder="Buscar por vendedor"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Botão para navegar ao formulário de nova compra de animal */}
          <button
            onClick={() => navigate("/animais/nova-compra")}
            className="bg-primary text-primary-foreground rounded-lg px-5 py-2.5 text-sm font-bold hover:bg-accent transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Nova compra
          </button>
        </div>

        {/* ===== ESTADO VAZIO ===== */}
        {/* Exibido quando não há compras cadastradas — futuramente será substituído pela listagem real */}
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <p className="text-muted-foreground">Não encontramos nenhuma compra.</p>
          <p className="text-muted-foreground">Para cadastrar uma nova compra clique no botão acima.</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default ComprasAnimaisListPage;
