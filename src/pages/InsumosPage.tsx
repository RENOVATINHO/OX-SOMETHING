// ==============================
// InsumosPage.tsx — Listagem de insumos cadastrados
// ==============================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Package, Pencil, Plus, Skull } from "lucide-react";
import AppLayout from "@/components/AppLayout";

interface Insumo {
  id: number;
  nome: string;
  categoria: "alimentacao" | "saude" | "solo_pasto";
  unidade: string;
  valor_unitario: number;
  quantidade_estoque: number;
}

const categoriasLabel: Record<string, string> = {
  alimentacao: "Alimentação",
  saude: "Saúde",
  solo_pasto: "Solo/Pasto",
};

const categoriaCores: Record<string, string> = {
  alimentacao: "bg-yellow-100 text-yellow-800",
  saude: "bg-red-100 text-red-800",
  solo_pasto: "bg-green-100 text-green-800",
};

const InsumosPage = () => {
  const navigate = useNavigate();
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [search, setSearch] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [loading, setLoading] = useState(true);

  // Modal de edição
  const [modalEditar, setModalEditar] = useState(false);
  const [insumoSelecionado, setInsumoSelecionado] = useState<Insumo | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editCategoria, setEditCategoria] = useState("");
  const [editUnidade, setEditUnidade] = useState("");
  const [editValor, setEditValor] = useState("");
  const [erroModal, setErroModal] = useState("");
  const [loadingModal, setLoadingModal] = useState(false);

  // Modal de confirmação de exclusão
  const [modalExcluir, setModalExcluir] = useState(false);
  const [insumoParaExcluir, setInsumoParaExcluir] = useState<Insumo | null>(null);
  const [loadingExcluir, setLoadingExcluir] = useState(false);

  const carregarInsumos = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3001/api/insumos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setInsumos(data);
    } catch {
      console.error("Erro ao carregar insumos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarInsumos(); }, []);

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
    if (!editNome || !editCategoria || !editUnidade) {
      setErroModal("Preencha todos os campos obrigatórios.");
      return;
    }
    setLoadingModal(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3001/api/insumos/${insumoSelecionado?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nome: editNome, categoria: editCategoria, unidade: editUnidade, valor_unitario: Number(editValor) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) { setErroModal(data.error || "Erro ao editar."); return; }
      setModalEditar(false);
      carregarInsumos();
    } catch {
      setErroModal("Não foi possível conectar ao servidor.");
    } finally {
      setLoadingModal(false);
    }
  };

  const abrirExcluir = (insumo: Insumo) => {
    setInsumoParaExcluir(insumo);
    setModalExcluir(true);
  };

  const handleExcluir = async () => {
    if (!insumoParaExcluir) return;
    setLoadingExcluir(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3001/api/insumos/${insumoParaExcluir.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      setModalExcluir(false);
      carregarInsumos();
    } catch {
      console.error("Erro ao excluir.");
    } finally {
      setLoadingExcluir(false);
    }
  };

  const insumosFiltrados = insumos.filter((i) => {
    const buscaOk = i.nome.toLowerCase().includes(search.toLowerCase());
    const categoriaOk = filtroCategoria === "todos" || i.categoria === filtroCategoria;
    return buscaOk && categoriaOk;
  });

  return (
    <AppLayout title="Insumos">
      <div className="max-w-6xl">

        {/* Barra de ações */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex-1 flex items-center bg-card border border-border rounded-lg px-4 py-3 gap-2 min-w-48">
            <Search size={18} className="text-muted-foreground" />
            <input
              placeholder="Buscar insumo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="bg-card border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none"
          >
            <option value="todos">Todas as categorias</option>
            <option value="alimentacao">Alimentação</option>
            <option value="saude">Saúde</option>
            <option value="solo_pasto">Solo/Pasto</option>
          </select>
          <button
            onClick={() => navigate("/insumos/novo")}
            className="bg-primary text-primary-foreground rounded-lg px-5 py-3 text-sm font-bold hover:bg-accent transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Novo insumo
          </button>
        </div>

        {/* Tabela */}
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
                      <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${categoriaCores[insumo.categoria]}`}>
                        {categoriasLabel[insumo.categoria]}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-foreground">{insumo.unidade}</td>
                    <td className="px-8 py-5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => abrirEditar(insumo)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-sm font-semibold transition-colors"
                        >
                          <Pencil size={15} />
                          Editar
                        </button>
                        <button
                          onClick={() => abrirExcluir(insumo)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 text-sm font-semibold transition-colors"
                        >
                          <Skull size={15} />
                          Excluir
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

      {/* Modal de edição */}
      {modalEditar && insumoSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-foreground mb-4">Editar insumo</h3>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Nome do insumo"
                value={editNome}
                onChange={(e) => setEditNome(e.target.value)}
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none"
              />
              <select
                value={editCategoria}
                onChange={(e) => setEditCategoria(e.target.value)}
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none"
              >
                <option value="alimentacao">Alimentação</option>
                <option value="saude">Saúde</option>
                <option value="solo_pasto">Solo/Pasto</option>
              </select>
              <select
                value={editUnidade}
                onChange={(e) => setEditUnidade(e.target.value)}
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none"
              >
                <option value="kg">kg — Quilograma</option>
                <option value="g">g — Grama</option>
                <option value="L">L — Litro</option>
                <option value="ml">ml — Mililitro</option>
                <option value="un">un — Unidade</option>
                <option value="sc">sc — Saco</option>
                <option value="cx">cx — Caixa</option>
              </select>
              <input
                type="number"
                placeholder="Valor unitário (R$)"
                value={editValor}
                onChange={(e) => setEditValor(e.target.value)}
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none"
              />
              {erroModal && <p className="text-sm text-destructive text-center">{erroModal}</p>}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setModalEditar(false)}
                  className="flex-1 border border-border rounded-lg py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEditar}
                  disabled={loadingModal}
                  className="flex-1 bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-bold hover:bg-accent transition-colors disabled:opacity-60"
                >
                  {loadingModal ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
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
              <button
                onClick={() => setModalExcluir(false)}
                className="flex-1 border border-border rounded-lg py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleExcluir}
                disabled={loadingExcluir}
                className="flex-1 bg-red-600 text-white rounded-lg py-2.5 text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {loadingExcluir ? "Excluindo..." : "Sim, excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default InsumosPage;