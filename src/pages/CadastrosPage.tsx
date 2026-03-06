// ==============================
// CadastrosPage.tsx — Hub de Compras + Gestão de Vendedores e Compradores
//
// Seções:
//   • Ações rápidas: Comprar Insumos / Comprar Animais
//   • Vendedores cadastrados — lista com edição inline e exclusão
//   • Compradores cadastrados — lista com edição inline e exclusão
// ==============================

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, PawPrint, ShoppingCart, User, Building, Plus,
  Pencil, Trash2, Check, X, Phone, MapPin, FileText,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";

interface Cadastro {
  id: number;
  nome: string;
  documento?: string;
  telefone?: string;
  cidade?: string;
  tipo: "vendedor" | "comprador";
}

// ── Componente inline de edição ────────────────────────────────────────────
const EditRow = ({
  item,
  onSave,
  onCancel,
}: {
  item: Cadastro;
  onSave: (updated: Partial<Cadastro>) => void;
  onCancel: () => void;
}) => {
  const [nome, setNome]           = useState(item.nome);
  const [documento, setDocumento] = useState(item.documento || "");
  const [telefone, setTelefone]   = useState(item.telefone || "");
  const [cidade, setCidade]       = useState(item.cidade || "");

  return (
    <div className="px-5 py-3 bg-white/[0.03] space-y-2">
      <input
        value={nome}
        onChange={e => setNome(e.target.value)}
        placeholder="Nome *"
        className="w-full bg-white/[0.05] text-white text-sm rounded-lg px-3 py-2 outline-none border border-white/[0.08] placeholder:text-[#4a5568]"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          value={documento}
          onChange={e => setDocumento(e.target.value)}
          placeholder="CPF / CNPJ"
          className="w-full bg-white/[0.05] text-white text-sm rounded-lg px-3 py-2 outline-none border border-white/[0.08] placeholder:text-[#4a5568]"
        />
        <input
          value={telefone}
          onChange={e => setTelefone(e.target.value)}
          placeholder="Telefone"
          className="w-full bg-white/[0.05] text-white text-sm rounded-lg px-3 py-2 outline-none border border-white/[0.08] placeholder:text-[#4a5568]"
        />
      </div>
      <input
        value={cidade}
        onChange={e => setCidade(e.target.value)}
        placeholder="Cidade"
        className="w-full bg-white/[0.05] text-white text-sm rounded-lg px-3 py-2 outline-none border border-white/[0.08] placeholder:text-[#4a5568]"
      />
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave({ nome, documento, telefone, cidade })}
          disabled={!nome.trim()}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
        >
          <Check size={13} /> Salvar
        </button>
        <button
          onClick={onCancel}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-[#8892b0] border border-white/[0.1]"
        >
          <X size={13} /> Cancelar
        </button>
      </div>
    </div>
  );
};

// ── Lista de cadastros (vendedores ou compradores) ─────────────────────────
const CadastroList = ({
  tipo,
  accentColor,
  icon: Icon,
  titulo,
  novoRoute,
}: {
  tipo: "vendedor" | "comprador";
  accentColor: string;
  icon: React.ElementType;
  titulo: string;
  novoRoute: string;
}) => {
  const navigate = useNavigate();
  const [items, setItems]       = useState<Cadastro[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const token = localStorage.getItem("easy_cattle_token");

  const carregar = useCallback(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/vendedores?tipo=${tipo}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setItems(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tipo, token]);

  useEffect(() => { carregar(); }, [carregar]);

  const handleSave = async (id: number, updated: Partial<Cadastro>) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    await fetch(`${import.meta.env.VITE_API_URL}/api/vendedores/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...updated, tipo }),
    });
    setEditingId(null);
    carregar();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este cadastro?")) return;
    await fetch(`${import.meta.env.VITE_API_URL}/api/vendedores/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    carregar();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${accentColor}18` }}>
            <Icon size={18} style={{ color: accentColor }} />
          </div>
          <h2 className="text-base font-bold text-white font-exo2">{titulo}</h2>
        </div>
        <button
          onClick={() => navigate(novoRoute)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
          style={{ background: `${accentColor}22`, color: accentColor }}
        >
          <Plus size={13} /> Novo
        </button>
      </div>

      <div className="dash-card divide-y divide-white/[0.06]">
        {loading ? (
          <div className="px-5 py-6 text-sm text-[#8892b0] text-center">Carregando...</div>
        ) : items.length === 0 ? (
          <div className="px-5 py-6 text-sm text-[#8892b0] text-center">
            Nenhum {tipo} cadastrado ainda.{" "}
            <button onClick={() => navigate(novoRoute)} className="underline font-bold" style={{ color: accentColor }}>
              Cadastrar agora
            </button>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id}>
              {editingId === item.id ? (
                <EditRow
                  item={item}
                  onSave={(updated) => handleSave(item.id, updated)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex items-center gap-3 px-5 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{item.nome}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                      {item.documento && (
                        <span className="text-[11px] text-[#8892b0] flex items-center gap-1">
                          <FileText size={10} /> {item.documento}
                        </span>
                      )}
                      {item.telefone && (
                        <span className="text-[11px] text-[#8892b0] flex items-center gap-1">
                          <Phone size={10} /> {item.telefone}
                        </span>
                      )}
                      {item.cidade && (
                        <span className="text-[11px] text-[#8892b0] flex items-center gap-1">
                          <MapPin size={10} /> {item.cidade}
                        </span>
                      )}
                      {!item.documento && !item.telefone && !item.cidade && (
                        <span className="text-[11px] text-[#4a5568]">Sem informações adicionais</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setEditingId(item.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8892b0] hover:text-white hover:bg-white/[0.08] transition-colors"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8892b0] hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ── Página principal ───────────────────────────────────────────────────────
const comprasOptions = [
  { icon: Package,  label: "Comprar Insumos",  desc: "Registrar compra de insumos",  route: "/insumos" },
  { icon: PawPrint, label: "Comprar Animais",   desc: "Registrar compra de animais",  route: "/animais/nova-compra" },
];

const CadastrosPage = () => {
  const navigate = useNavigate();

  return (
    <AppLayout title="Compras">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* ── Ações rápidas ── */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#7c3aed18" }}>
              <ShoppingCart size={18} className="text-[#7c3aed]" />
            </div>
            <h2 className="text-base font-bold text-white font-exo2">Compras</h2>
          </div>
          <div className="dash-card divide-y divide-white/[0.06]">
            {comprasOptions.map((opt) => (
              <button
                key={opt.label}
                onClick={() => navigate(opt.route)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.03] transition-colors"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#7c3aed18" }}>
                  <opt.icon size={20} className="text-[#7c3aed]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{opt.label}</p>
                  <p className="text-xs text-[#8892b0] mt-0.5">{opt.desc}</p>
                </div>
                <span className="text-[#8892b0] text-lg">›</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Vendedores cadastrados ── */}
        <CadastroList
          tipo="vendedor"
          accentColor="#ff6b35"
          icon={User}
          titulo="Vendedores"
          novoRoute="/cadastros/novo-vendedor"
        />

        {/* ── Compradores cadastrados ── */}
        <CadastroList
          tipo="comprador"
          accentColor="#7c3aed"
          icon={Building}
          titulo="Compradores"
          novoRoute="/cadastros/novo-vendedor"
        />

      </div>
    </AppLayout>
  );
};

export default CadastrosPage;
