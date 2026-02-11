import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";

interface ComprasListPageProps {
  title: string;
  searchPlaceholder: string;
  newRoute: string;
}

const ComprasListPage = ({ title, searchPlaceholder, newRoute }: ComprasListPageProps) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader title={title} />

      <div className="px-4 py-3">
        <div className="bg-muted rounded-xl px-4 py-3 flex items-center gap-2">
          <Search size={18} className="text-muted-foreground" />
          <input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex-1 px-4 py-4">
        <p className="text-foreground font-semibold">
          Não encontramos nenhuma compra. Para cadastrar uma nova compra clique no botão abaixo
        </p>
      </div>

      <div className="p-4">
        <button
          onClick={() => navigate(newRoute)}
          className="w-full bg-primary text-primary-foreground rounded-full py-4 text-lg font-bold hover:bg-accent transition-colors"
        >
          Nova compra
        </button>
      </div>
    </div>
  );
};

export default ComprasListPage;
