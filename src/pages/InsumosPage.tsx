// ==============================
// InsumosPage.tsx — Listagem de insumos com nova categoria
// ==============================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Package, Pencil, Plus, Skull, Tag } from "lucide-react";
import AppLayout from "@/components/AppLayout";

interface Insumo {
  id: number;
  nome: string;
  categoria: string;
  unidade: string;
  valor_unitario: number;
  quantidade_estoque: number;
}

interface Categoria {
  id: number;
  nome: string;
  slug: string;
}

const coresBadge = [
  "bg-yellow-100 text-yellow-800",
  "bg-red-100 text-red-800",
  "bg-green-100 text-green-800",
  "bg-blue-100 text-blue-800",
  "bg-purple-100 text-purple-800",
  "bg-pink-100 text-pink-800",
  "bg-orange-100 text-orange-800",
];

const InsumosPage = () => {
  const navigate = useNavigate();
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [search, setSearch] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [loading, setLoading] = useState(true);

  // Modal editar
  const [modalEditar, setModalEditar] = useState(false);
  const [insumoSelecionado, setInsumoSelecionado] = useState<Insumo | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editCategoria, setEditCategoria] = useState("");
  const [editUnidade, setEditUnidade] = useState("");
  const [editValor, setEditValor] = useState("");
  const [erroModal, setErroModal] = useState("");
  const [loadingModal, setLoadingModal] = useState(false);

  // Modal excluir
  const [modalExcluir, setModalExcluir] = useState(false);
  const [insumoParaExcluir, setInsumoParaExcluir] = useState<Insumo | null>(null);
  const [loadingExcluir, setLoadingExcluir] = useState(false);

  // Modal nova categoria
  const [modalCategoria, setModalCategoria] = useState(false);
  const [novaCategoriaNome, setNovaCategoriaNome] = useState("");
  const [erroCategoria, setErroCategoria] = useState("");
  const [loadingCategoria, setLoadingCategoria] = useState(false);

  const token = localStorage.getItem("easy_cattle_token");

  const carregarDados = async () => {
    try {
      const [resInsumos, resCats] = await Promise.all([
        fetch("http://localhost:3001/api/insumos", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:3001/api/categorias-insumos", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setInsumos(await resInsumos.json());
      setCategorias(await resCats.json());
    } catch { console.error("Erro ao carregar dados."); }
    finally { setLoading(false); }
  };

  useEffect(() => { carregarDados(); }, []);

  const getCorBadge = (slug: string) => {
    const idx = categorias.findIndex(c => c.slug === slug);
    return coresBadge[idx % coresBadge.length] || coresBadge[0];
  };

  const getNomeCategoria = (slug: string) => {
    return categorias.find(c => c.slug === slug)?.nome || slug;
  };

  const abrirEditar = (insumo: Insumo) => {
    setInsumoSelecionado(insumo);
    setEditNome(insumo.nome);
    setEditCategoria(insumo.categoria);
    setEditUnidade(insumo.unidade);
    setEditValor(String(insumo.valor_unitario));
    setErroModal("");
    setModalEditar(true);
  };

  const handleEditar = async () => {
    if (!editNome || !editCategoria || !editUnidade) { setErroModal("Preencha todos os campos."); return; }
    setLoadingModal(true);
    try {
      const res = await fetch(`http://localhost:3001/api/insumos/${insumoSelecionado?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nome: editNome, categoria: editCategoria, unidade: editUnidade, valor_unitario: Number(editValor) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) { setErroModal(data.error || "Erro ao editar."); return; }
      setModalEditar(false);
      carregarDados();
    } catch { setErroModal("Não foi possível conectar ao servidor."); }
    finally { setLoadingModal(false); }
  };

  const handleExcluir = async () => {
    if (!insumoParaExcluir) return;
    setLoadingExcluir(true);
    try {
      await fetch(`http://localhost:3001/api/insumos/${insumoParaExcluir.id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      setModalExcluir(false);
      carregarDados();
    } catch { console.error("Erro ao excluir."); }
    finally { setLoadingExcluir(false); }
  };

  const handleNovaCategoria = async () => {
    if (!novaCategoriaNome.trim()) { setErroCategoria("Informe o nome da categoria."); return; }
    setLoadingCategoria(true);
    try {
      const res = await fetch("http://localhost:3001/api/categorias-insumos", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nome: novaCategoriaNome }),
      });
      const data = await res.json();
      if (!res.ok) { setErroCategoria(data.error || "Erro ao criar categoria."); return; }
      setModalCategoria(false);
      setNovaCategoriaNome("");
      carregarDados();
    } catch { setErroCategoria("Não foi possível conectar ao servidor."); }
    finally { setLoadingCategoria(false); }
  };

  const insumosFiltrados = insumos.filter((i) => {
    const buscaOk = i.nome.toLowerCase().includes(search.toLowerCase());
    const categoriaOk = filtroCategoria === "todos" || i.categoria === filtroCategoria;
    return buscaOk && categoriaOk;
  });

  return (
    <AppLayout title="Insumos">
      <div className="max-w-6xl">

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex-1 flex items-center bg-card border border-border rounded-lg px-4 py-3 gap-2 min-w-48">
            <Search size={18} className="text-muted-foreground" />
            <input placeholder="Buscar insumo..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground" />
          </div>
          <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}
            className="bg-card border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none">
            <option value="todos">Todas as categorias</option>
            {categorias.map(c => <option key={c.slug} value={c.slug}>{c.nome}</option>)}
          </select>
          <button onClick={() => { setModalCategoria(true); setNovaCategoriaNome(""); setErroCategoria(""); }}
            className="border border-border bg-card text-foreground rounded-lg px-4 py-3 text-sm font-semibold hover:bg-muted transition-colors flex items-center gap-2">
            <Tag size={16} />
            Nova categoria
          </button>
          <button onClick={() => navigate("/insumos/novo")}
            className="bg-primary text-primary-foreground rounded-lg px-5 py-3 text-sm font-bold hover:bg-accent transition-colors flex items-center gap-2">
            <Plus size={16} />
            Novo insumo
          </button>
        </div>

        {loading ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : insumosFiltrados.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <Package size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-semibold text-lg">Nenhum insumo encontrado.</p>
            <p className="text-muted-foreground text-sm mt-2">Clique em "Novo insumo" para cadastrar.</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-border bg-muted/80">
                  <th className="text-left px-8 py-4 text-muted-foreground font-semibold">Nome</th>
                  <th className="text-left px-8 py-4 text-muted-foreground font-semibold">Categoria</th>
                  <th className="text-left px-8 py-4 text-muted-foreground font-semibold">Unidade</th>
                  <th className="text-right px-8 py-4 text-muted-foreground font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {insumosFiltrados.map((insumo, index) => (
                  <tr key={insumo.id} className={`border-b border-border last:border-0 ${index % 2 === 0 ? "" : "bg-muted/20"}`}>
                    <td className="px-8 py-5 font-semibold text-foreground">{insumo.nome}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getCorBadge(insumo.categoria)}`}>
                        {getNomeCategoria(insumo.categoria)}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-foreground">{insumo.unidade}</td>
                    <td className="px-8 py-5">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => abrirEditar(insumo)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-sm font-semibold transition-colors">
                          <Pencil size={15} /> Editar
                        </button>
                        <button onClick={() => { setInsumoParaExcluir(insumo); setModalExcluir(true); }}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 text-sm font-semibold transition-colors">
                          <Skull size={15} /> Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal editar */}
      {modalEditar && insumoSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-foreground mb-4">Editar insumo</h3>
            <div className="flex flex-col gap-3">
              <input type="text" placeholder="Nome" value={editNome} onChange={(e) => setEditNome(e.target.value)}
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none" />
              <select value={editCategoria} onChange={(e) => setEditCategoria(e.target.value)}
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none">
                {categorias.map(c => <option key={c.slug} value={c.slug}>{c.nome}</option>)}
              </select>
              <select value={editUnidade} onChange={(e) => setEditUnidade(e.target.value)}
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none">
                <option value="kg">kg — Quilograma</option>
                <option value="g">g — Grama</option>
                <option value="L">L — Litro</option>
                <option value="ml">ml — Mililitro</option>
                <option value="un">un — Unidade</option>
                <option value="sc">sc — Saco</option>
                <option value="cx">cx — Caixa</option>
              </select>
              <input type="number" placeholder="Valor unitário (R$)" value={editValor} onChange={(e) => setEditValor(e.target.value)}
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none" />
              {erroModal && <p className="text-sm text-destructive text-center">{erroModal}</p>}
              <div className="flex gap-3 mt-2">
                <button onClick={() => setModalEditar(false)}
                  className="flex-1 border border-border rounded-lg py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors">Cancelar</button>
                <button onClick={handleEditar} disabled={loadingModal}
                  className="flex-1 bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-bold hover:bg-accent transition-colors disabled:opacity-60">
                  {loadingModal ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal excluir */}
      {modalExcluir && insumoParaExcluir && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-sm text-center">
            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Skull size={28} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Excluir insumo?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Tem certeza que deseja excluir <strong className="text-foreground">{insumoParaExcluir.nome}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setModalExcluir(false)}
                className="flex-1 border border-border rounded-lg py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors">Cancelar</button>
              <button onClick={handleExcluir} disabled={loadingExcluir}
                className="flex-1 bg-red-600 text-white rounded-lg py-2.5 text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-60">
                {loadingExcluir ? "Excluindo..." : "Sim, excluir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal nova categoria */}
      {modalCategoria && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Tag size={20} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Nova categoria</h3>
            </div>
            <input type="text" placeholder="Nome da categoria" value={novaCategoriaNome}
              onChange={(e) => setNovaCategoriaNome(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNovaCategoria()}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none mb-3" />
            {erroCategoria && <p className="text-sm text-destructive mb-3">{erroCategoria}</p>}
            <div className="flex gap-3">
              <button onClick={() => setModalCategoria(false)}
                className="flex-1 border border-border rounded-lg py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors">Cancelar</button>
              <button onClick={handleNovaCategoria} disabled={loadingCategoria}
                className="flex-1 bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-bold hover:bg-accent transition-colors disabled:opacity-60">
                {loadingCategoria ? "Criando..." : "Criar categoria"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default InsumosPage;
