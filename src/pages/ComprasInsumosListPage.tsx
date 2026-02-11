import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const ComprasInsumosListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  return (
    <AppLayout title="Compra de Insumos">
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 flex items-center bg-card border border-border rounded-lg px-4 py-2.5 gap-2">
            <Search size={18} className="text-muted-foreground" />
            <input
              placeholder="Buscar por empresa"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <button
            onClick={() => navigate("/compras-insumos/nova")}
            className="bg-primary text-primary-foreground rounded-lg px-5 py-2.5 text-sm font-bold hover:bg-accent transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Nova compra
          </button>
        </div>

        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <p className="text-muted-foreground">Não encontramos nenhuma compra.</p>
          <p className="text-muted-foreground">Para cadastrar uma nova compra clique no botão acima.</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default ComprasInsumosListPage;
