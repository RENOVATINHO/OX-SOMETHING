import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, FileText, Phone, MapPin, Building } from "lucide-react";
import AppLayout from "@/components/AppLayout";

interface CadastroFormProps {
  titulo: string;
  tipo: "vendedor" | "comprador";
}

const CadastroForm = ({ titulo, tipo }: CadastroFormProps) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: "", documento: "", telefone: "", cidade: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.nome) { setError("Informe o nome."); return; }
    setLoading(true);
    const token = localStorage.getItem("easy_cattle_token");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vendedores`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, tipo }),
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
    <div>
      <form onSubmit={handleSubmit} className="dash-card space-y-0 divide-y divide-white/[0.06]">
        {/* Nome */}
        <div className="flex items-center gap-4 px-5 py-4">
          <div className="flex-1">
            <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Nome *</label>
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder={tipo === "vendedor" ? "Ex: Agropecuária Silva" : "Ex: João Comprador"}
              className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
            />
          </div>
          <User size={20} className="text-[#8892b0] flex-shrink-0" />
        </div>

        {/* Documento + Telefone */}
        <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
          <div className="px-5 py-4">
            <label className="text-xs font-semibold text-[#8892b0] mb-1 block">CPF / CNPJ</label>
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-[#8892b0]" />
              <input
                name="documento"
                value={form.documento}
                onChange={handleChange}
                placeholder="Opcional"
                className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
              />
            </div>
          </div>
          <div className="px-5 py-4">
            <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Telefone</label>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-[#8892b0]" />
              <input
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                placeholder="Opcional"
                className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
              />
            </div>
          </div>
        </div>

        {/* Cidade */}
        <div className="px-5 py-4">
          <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Cidade</label>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-[#8892b0]" />
            <input
              name="cidade"
              value={form.cidade}
              onChange={handleChange}
              placeholder="Opcional"
              className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
            />
          </div>
        </div>
      </form>

      {error && <p className="text-sm text-red-400 text-center mt-3">{error}</p>}

      <button
        onClick={handleSubmit as any}
        disabled={loading || !form.nome}
        className="w-full mt-4 py-3.5 rounded-2xl text-white font-bold text-sm transition-all disabled:opacity-40"
        style={{ background: "linear-gradient(135deg, #7c3aed, #e040fb)" }}
      >
        {loading ? "Cadastrando..." : titulo}
      </button>
    </div>
  );
};

const NovoVendedorPage = () => {
  return (
    <AppLayout title="Novo Cadastro">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Vendedor */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#ff6b3518" }}>
              <User size={18} className="text-[#ff6b35]" />
            </div>
            <h2 className="text-base font-bold text-white font-exo2">Cadastrar Vendedor</h2>
          </div>
          <CadastroForm titulo="Cadastrar vendedor" tipo="vendedor" />
        </div>

        {/* Comprador */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#7c3aed18" }}>
              <Building size={18} className="text-[#7c3aed]" />
            </div>
            <h2 className="text-base font-bold text-white font-exo2">Cadastrar Comprador</h2>
          </div>
          <CadastroForm titulo="Cadastrar comprador" tipo="comprador" />
        </div>
      </div>
    </AppLayout>
  );
};

export default NovoVendedorPage;
