import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Pencil, PawPrint, DollarSign, Skull, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AppLayout from "@/components/AppLayout";

interface Animal {
  id: number;
  compra_id: number;
  brinco: string | null;
  peso_entrada: number | null;
  observacao: string | null;
  status: "ativo" | "vendido" | "morto";
  numero_compra: string;
  sexo: "macho_inteiro" | "macho_capado" | "femea";
  faixa_etaria: "bezerro" | "garrote" | "novilho" | "adulto";
  valor_kg: number | null;
  valor_total: number | null;
  numero_gta: string | null;
  vendedor_nome: string | null;
  nome_pai: string | null;
  nome_mae: string | null;
  raca: string | null;
  data_nascimento: string | null;
  tipo_cadastro: "compra" | "especial";
}

const sexoLabel: Record<string, string> = {
  macho_inteiro: "Macho Inteiro",
  macho_capado: "Macho Capado",
  femea: "Fêmea",
};

const faixaLabel: Record<string, string> = {
  bezerro: "Bezerro",
  garrote: "Garrote",
  novilho: "Novilho",
  adulto: "Adulto",
};

const statusCores: Record<string, string> = {
  ativo: "bg-green-100 text-green-800",
  vendido: "bg-blue-100 text-blue-800",
  morto: "bg-red-100 text-red-800",
};

const filtrarPorAba = (animais: Animal[], aba: string) => {
  const ativos = animais.filter(a => a.status === "ativo");
  switch (aba) {
    case "touros":   return ativos.filter(a => a.sexo === "macho_inteiro");
    case "mi":       return ativos.filter(a => a.sexo === "macho_inteiro" && a.faixa_etaria !== "adulto");
    case "mc":       return ativos.filter(a => a.sexo === "macho_capado");
    case "matrizes": return ativos.filter(a => a.sexo === "femea" && a.faixa_etaria === "adulto");
    case "novilhas": return ativos.filter(a => a.sexo === "femea" && ["garrote","novilho"].includes(a.faixa_etaria));
    case "bezerras": return ativos.filter(a => a.sexo === "femea" && a.faixa_etaria === "bezerro");
    default:         return animais;
  }
};

const TabelaAnimais = ({ animais, search, onEditar, onVenda, onMorte }: {
  animais: Animal[]; search: string;
  onEditar: (a: Animal) => void; onVenda: (a: Animal) => void; onMorte: (a: Animal) => void;
}) => {
  const filtrados = animais.filter(a =>
    (a.brinco || "").toLowerCase().includes(search.toLowerCase()) ||
    (a.numero_compra || "").includes(search) ||
    (a.vendedor_nome || "").toLowerCase().includes(search.toLowerCase())
  );
  if (filtrados.length === 0) return (
    <div className="text-center py-12">
      <PawPrint size={40} className="text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground font-semibold">Nenhum animal nesta categoria.</p>
    </div>
  );
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/80">
            <th className="text-left px-5 py-3 text-muted-foreground font-semibold">Brinco</th>
            <th className="text-left px-5 py-3 text-muted-foreground font-semibold">Nº Compra</th>
            <th className="text-left px-5 py-3 text-muted-foreground font-semibold">Sexo</th>
            <th className="text-left px-5 py-3 text-muted-foreground font-semibold">Faixa</th>
            <th className="text-left px-5 py-3 text-muted-foreground font-semibold">Peso</th>
            <th className="text-left px-5 py-3 text-muted-foreground font-semibold">Vendedor</th>
            <th className="text-left px-5 py-3 text-muted-foreground font-semibold">Status</th>
            <th className="text-right px-5 py-3 text-muted-foreground font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtrados.map((animal, index) => (
            <tr key={animal.id} className={`border-b border-border last:border-0 ${index % 2 === 0 ? "" : "bg-muted/20"}`}>
              <td className="px-5 py-4 font-semibold text-foreground">
                {animal.brinco || <span className="text-muted-foreground italic text-xs">Sem brinco</span>}
              </td>
              <td className="px-5 py-4 font-mono text-primary font-bold">#{animal.numero_compra}</td>
              <td className="px-5 py-4 text-foreground">{sexoLabel[animal.sexo]}</td>
              <td className="px-5 py-4 text-foreground">{faixaLabel[animal.faixa_etaria]}</td>
              <td className="px-5 py-4 text-foreground">
                {animal.peso_entrada ? `${animal.peso_entrada} kg` : <span className="text-muted-foreground italic text-xs">—</span>}
              </td>
              <td className="px-5 py-4 text-foreground">{animal.vendedor_nome || "—"}</td>
              <td className="px-5 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusCores[animal.status]}`}>
                  {animal.status}
                </span>
              </td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-1.5">
                  <button onClick={() => onEditar(animal)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-colors">
                    <Pencil size={12} /> Editar
                  </button>
                  {animal.status === "ativo" && (<>
                    <button onClick={() => onVenda(animal)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 text-xs font-semibold transition-colors">
                      <DollarSign size={12} /> Venda
                    </button>
                    <button onClick={() => onMorte(animal)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 text-xs font-semibold transition-colors">
                      <Skull size={12} /> Morte
                    </button>
                  </>)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AnimaisPage = () => {
  const navigate = useNavigate();
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalEditar, setModalEditar] = useState(false);
  const [animalSel, setAnimalSel] = useState<Animal | null>(null);
  const [editBrinco, setEditBrinco] = useState("");
  const [editPeso, setEditPeso] = useState("");
  const [editObs, setEditObs] = useState("");
  const [editStatus, setEditStatus] = useState("ativo");
  const [erroEditar, setErroEditar] = useState("");
  const [loadingEditar, setLoadingEditar] = useState(false);

  const [modalVenda, setModalVenda] = useState(false);
  const [animalVenda, setAnimalVenda] = useState<Animal | null>(null);
  const [valorVenda, setValorVenda] = useState("");
  const [dataVenda, setDataVenda] = useState(new Date().toISOString().split("T")[0]);
  const [erroVenda, setErroVenda] = useState("");
  const [loadingVenda, setLoadingVenda] = useState(false);

  const [modalMorte, setModalMorte] = useState(false);
  const [animalMorte, setAnimalMorte] = useState<Animal | null>(null);
  const [causaMorte, setCausaMorte] = useState("");
  const [dataMorte, setDataMorte] = useState(new Date().toISOString().split("T")[0]);
  const [erroMorte, setErroMorte] = useState("");
  const [loadingMorte, setLoadingMorte] = useState(false);

  const token = localStorage.getItem("token");

  const carregarAnimais = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/animais", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setAnimais(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Erro ao carregar animais:", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { carregarAnimais(); }, []);

  const abrirEditar = (a: Animal) => {
    setAnimalSel(a); setEditBrinco(a.brinco || "");
    setEditPeso(a.peso_entrada ? String(a.peso_entrada) : "");
    setEditObs(a.observacao || ""); setEditStatus(a.status);
    setErroEditar(""); setModalEditar(true);
  };

  const handleEditar = async () => {
    setLoadingEditar(true);
    try {
      const res = await fetch(`http://localhost:3001/api/animais/${animalSel?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ brinco: editBrinco, peso_entrada: Number(editPeso) || null, observacao: editObs, status: editStatus }),
      });
      const data = await res.json();
      if (!res.ok) { setErroEditar(data.error || "Erro."); return; }
      setModalEditar(false); carregarAnimais();
    } catch { setErroEditar("Não foi possível conectar."); }
    finally { setLoadingEditar(false); }
  };

  const handleVenda = async () => {
    if (!valorVenda) { setErroVenda("Informe o valor da venda."); return; }
    setLoadingVenda(true);
    try {
      const res = await fetch(`http://localhost:3001/api/animais/${animalVenda?.id}/venda`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ valor_venda: Number(valorVenda), data_saida: dataVenda }),
      });
      const data = await res.json();
      if (!res.ok) { setErroVenda(data.error || "Erro."); return; }
      setModalVenda(false); carregarAnimais();
    } catch { setErroVenda("Não foi possível conectar."); }
    finally { setLoadingVenda(false); }
  };

  const handleMorte = async () => {
    setLoadingMorte(true);
    try {
      const res = await fetch(`http://localhost:3001/api/animais/${animalMorte?.id}/morte`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ causa_morte: causaMorte, data_saida: dataMorte }),
      });
      const data = await res.json();
      if (!res.ok) { setErroMorte(data.error || "Erro."); return; }
      setModalMorte(false); carregarAnimais();
    } catch { setErroMorte("Não foi possível conectar."); }
    finally { setLoadingMorte(false); }
  };

  const ativos = animais.filter(a => a.status === "ativo");
  const cnt = {
    touros:   filtrarPorAba(animais, "touros").length,
    mi:       filtrarPorAba(animais, "mi").length,
    mc:       filtrarPorAba(animais, "mc").length,
    matrizes: filtrarPorAba(animais, "matrizes").length,
    novilhas: filtrarPorAba(animais, "novilhas").length,
    bezerras: filtrarPorAba(animais, "bezerras").length,
  };

  return (
    <AppLayout title="Animais">
      <div className="max-w-7xl">

        {/* Barra de busca + botões */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex-1 flex items-center bg-card border border-border rounded-lg px-4 py-3 gap-2 min-w-48">
            <Search size={18} className="text-muted-foreground" />
            <input placeholder="Buscar por brinco, nº compra ou vendedor..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground" />
          </div>
          <button onClick={() => navigate("/animais/nova-compra")}
            className="bg-primary text-primary-foreground rounded-lg px-4 py-3 text-sm font-bold hover:bg-accent transition-colors flex items-center gap-2">
            <Plus size={15} /> Nova Compra
          </button>
          <button onClick={() => navigate("/animais/cadastro-especial?sexo=macho_inteiro")}
            className="bg-amber-600 text-white rounded-lg px-4 py-3 text-sm font-bold hover:bg-amber-700 transition-colors flex items-center gap-2">
            <Plus size={15} /> 🐂 Touro
          </button>
          <button onClick={() => navigate("/animais/cadastro-especial?sexo=femea")}
            className="bg-pink-600 text-white rounded-lg px-4 py-3 text-sm font-bold hover:bg-pink-700 transition-colors flex items-center gap-2">
            <Plus size={15} /> 🐄 Matriz
          </button>
        </div>

        {/* Cards — retângulo total + grid 2x3 */}
        <div className="flex gap-4 mb-6 items-stretch">
          <div className="bg-card border border-border rounded-xl w-44 flex-shrink-0 flex flex-col items-center justify-center gap-2 py-6 px-4">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider text-center">Total Ativo</p>
            <p className="text-6xl font-black text-primary leading-none">{ativos.length}</p>
            <p className="text-xs text-muted-foreground">animais</p>
          </div>

          <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-3">
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Touros</p>
              <p className="text-3xl font-black text-amber-500">{cnt.touros}</p>
              <p className="text-xs text-muted-foreground mt-1">Macho inteiro adulto</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">M. Inteiro Jovem</p>
              <p className="text-3xl font-black text-amber-500">{cnt.mi}</p>
              <p className="text-xs text-muted-foreground mt-1">Bezerro/Garrote/Novilho</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Macho Castrado</p>
              <p className="text-3xl font-black text-amber-500">{cnt.mc}</p>
              <p className="text-xs text-muted-foreground mt-1">Capados</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Matrizes</p>
              <p className="text-3xl font-black text-pink-500">{cnt.matrizes}</p>
              <p className="text-xs text-muted-foreground mt-1">Fêmea acima 36m</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Novilhas</p>
              <p className="text-3xl font-black text-pink-500">{cnt.novilhas}</p>
              <p className="text-xs text-muted-foreground mt-1">Fêmea 13 a 36m</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Bezerras</p>
              <p className="text-3xl font-black text-pink-500">{cnt.bezerras}</p>
              <p className="text-xs text-muted-foreground mt-1">Fêmea 0 a 12m</p>
            </div>
          </div>
        </div>

        {/* Tabela com abas */}
        {loading ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border p-6">
            <Tabs defaultValue="todos">
              <TabsList className="mb-6 flex-wrap h-auto gap-1">
                <TabsTrigger value="todos">Todos ({animais.length})</TabsTrigger>
                <TabsTrigger value="touros">Touros ({cnt.touros})</TabsTrigger>
                <TabsTrigger value="mi">M. Inteiro ({cnt.mi})</TabsTrigger>
                <TabsTrigger value="mc">M. Castrado ({cnt.mc})</TabsTrigger>
                <TabsTrigger value="matrizes">Matrizes ({cnt.matrizes})</TabsTrigger>
                <TabsTrigger value="novilhas">Novilhas ({cnt.novilhas})</TabsTrigger>
                <TabsTrigger value="bezerras">Bezerras ({cnt.bezerras})</TabsTrigger>
              </TabsList>
              {["todos","touros","mi","mc","matrizes","novilhas","bezerras"].map(aba => (
                <TabsContent key={aba} value={aba}>
                  <TabelaAnimais
                    animais={filtrarPorAba(animais, aba)}
                    search={search}
                    onEditar={abrirEditar}
                    onVenda={(a) => { setAnimalVenda(a); setValorVenda(""); setDataVenda(new Date().toISOString().split("T")[0]); setErroVenda(""); setModalVenda(true); }}
                    onMorte={(a) => { setAnimalMorte(a); setCausaMorte(""); setDataMorte(new Date().toISOString().split("T")[0]); setErroMorte(""); setModalMorte(true); }}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </div>

      {/* Modal editar */}
      {modalEditar && animalSel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-1">Editar animal</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Compra #{animalSel.numero_compra} — {sexoLabel[animalSel.sexo]} — {faixaLabel[animalSel.faixa_etaria]}
            </p>
            <div className="flex flex-col gap-3">
              <input type="text" placeholder="Número do brinco" value={editBrinco} onChange={(e) => setEditBrinco(e.target.value)}
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none" />
              <input type="number" placeholder="Peso de entrada (kg)" value={editPeso} onChange={(e) => setEditPeso(e.target.value)}
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none" />
              <input type="text" placeholder="Observação" value={editObs} onChange={(e) => setEditObs(e.target.value)}
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none" />
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none">
                <option value="ativo">Ativo</option>
                <option value="vendido">Vendido</option>
                <option value="morto">Morto</option>
              </select>
              {erroEditar && <p className="text-sm text-destructive text-center">{erroEditar}</p>}
              <div className="flex gap-3 mt-2">
                <button onClick={() => setModalEditar(false)} className="flex-1 border border-border rounded-lg py-2.5 text-sm font-semibold hover:bg-muted transition-colors">Cancelar</button>
                <button onClick={handleEditar} disabled={loadingEditar} className="flex-1 bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-bold hover:bg-accent transition-colors disabled:opacity-60">
                  {loadingEditar ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal venda */}
      {modalVenda && animalVenda && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center"><DollarSign size={20} className="text-blue-600" /></div>
              <div>
                <h3 className="text-lg font-bold">Registrar Venda</h3>
                <p className="text-xs text-muted-foreground">{animalVenda.brinco || "Sem brinco"} — Compra #{animalVenda.numero_compra}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <input type="number" placeholder="Valor da venda (R$)" value={valorVenda} onChange={(e) => setValorVenda(e.target.value)}
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none" />
              <input type="date" value={dataVenda} onChange={(e) => setDataVenda(e.target.value)}
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none" />
              {erroVenda && <p className="text-sm text-destructive text-center">{erroVenda}</p>}
              <div className="flex gap-3 mt-2">
                <button onClick={() => setModalVenda(false)} className="flex-1 border border-border rounded-lg py-2.5 text-sm font-semibold hover:bg-muted transition-colors">Cancelar</button>
                <button onClick={handleVenda} disabled={loadingVenda} className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-60">
                  {loadingVenda ? "Salvando..." : "Confirmar venda"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal morte */}
      {modalMorte && animalMorte && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center"><Skull size={20} className="text-red-600" /></div>
              <div>
                <h3 className="text-lg font-bold">Registrar Morte</h3>
                <p className="text-xs text-muted-foreground">{animalMorte.brinco || "Sem brinco"} — Compra #{animalMorte.numero_compra}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <input type="text" placeholder="Causa da morte (opcional)" value={causaMorte} onChange={(e) => setCausaMorte(e.target.value)}
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none" />
              <input type="date" value={dataMorte} onChange={(e) => setDataMorte(e.target.value)}
                className="bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none" />
              {erroMorte && <p className="text-sm text-destructive text-center">{erroMorte}</p>}
              <div className="flex gap-3 mt-2">
                <button onClick={() => setModalMorte(false)} className="flex-1 border border-border rounded-lg py-2.5 text-sm font-semibold hover:bg-muted transition-colors">Cancelar</button>
                <button onClick={handleMorte} disabled={loadingMorte} className="flex-1 bg-red-600 text-white rounded-lg py-2.5 text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-60">
                  {loadingMorte ? "Salvando..." : "Confirmar morte"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default AnimaisPage;
