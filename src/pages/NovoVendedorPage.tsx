// ==============================
// NovoVendedorPage.tsx — Cadastro de vendedor
// ==============================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, FileText, Phone, MapPin } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const NovoVendedorPage = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nome) { setError("Informe o nome do vendedor."); return; }
    setLoading(true);
    const token = localStorage.getItem("easy_cattle_token");
    try {
      const res = await fetch("http://localhost:3001/api/vendedores", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nome, documento, telefone, cidade }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erro ao cadastrar."); return; }
      navigate("/cadastros");
    } catch {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Novo Vendedor">
      <div className="max-w-lg">
        <div className="bg-card rounded-2xl border border-border p-8">
          <h2 className="text-xl font-bold text-foreground mb-6">Cadastrar vendedor</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3">
              <input type="text" placeholder="Nome *" value={nome} onChange={(e) => setNome(e.target.value)} required
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm" />
              <User size={18} className="text-muted-foreground" />
            </div>
            <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3">
              <input type="text" placeholder="CPF / CNPJ" value={documento} onChange={(e) => setDocumento(e.target.value)}
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm" />
              <FileText size={18} className="text-muted-foreground" />
            </div>
            <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3">
              <input type="text" placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)}
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm" />
              <Phone size={18} className="text-muted-foreground" />
            </div>
            <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3">
              <input type="text" placeholder="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)}
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm" />
              <MapPin size={18} className="text-muted-foreground" />
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-primary text-primary-foreground rounded-lg py-3 text-base font-bold hover:bg-accent transition-colors disabled:opacity-60 mt-2">
              {loading ? "Cadastrando..." : "Cadastrar vendedor"}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default NovoVendedorPage;
