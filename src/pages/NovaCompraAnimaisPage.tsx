import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";

interface Vendedor { id: number; nome: string; }

const NovaCompraAnimaisPage = () => {
  const navigate = useNavigate();
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [proximoNumero, setProximoNumero] = useState<string>("");
  const [vendedorId, setVendedorId] = useState("");
  const [numeroGta, setNumeroGta] = useState("");
  const [sexo, setSexo] = useState("");
  const [faixaEtaria, setFaixaEtaria] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [valorKg, setValorKg] = useState("");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [observacao, setObservacao] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    // Carrega vendedores e próximo número SEM incrementar
    fetch("http://localhost:3001/api/vendedores", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setVendedores).catch(() => {});

    fetch("http://localhost:3001/api/compras-animais/proximo-numero", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setProximoNumero(d.numero)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!vendedorId || !sexo || !faixaEtaria || !quantidade || !data) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    if (Number(quantidade) < 1) {
      setError("Quantidade deve ser pelo menos 1.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/compras-animais", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          vendedor_id: Number(vendedorId),
          numero_gta: numeroGta || null,
          sexo,
          faixa_etaria: faixaEtaria,
          quantidade: Number(quantidade),
          valor_kg: Number(valorKg) || 0,
          data,
          observacao: observacao || null,
        }),
      });
      const data2 = await res.json();
      if (!res.ok) { setError(data2.error || "Erro ao registrar."); return; }
      navigate("/animais");
    } catch { setError("Não foi possível conectar ao servidor."); }
    finally { setLoading(false); }
  };

  return (
    <AppLayout title="Nova Compra de Animais">
      <div className="max-w-2xl">
        <div className="bg-card rounded-2xl border border-border p-8">

          {/* Número da compra preview */}
          {proximoNumero && (
            <div className="flex items-center justify-between bg-muted/40 border border-border rounded-xl px-5 py-4 mb-6">
              <span className="text-sm text-muted-foreground font-semibold">Número desta compra</span>
              <span className="text-2xl font-black text-primary font-mono">#{proximoNumero}</span>
            </div>
          )}

          {vendedores.length === 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 mb-4 text-sm text-yellow-700">
              Nenhum vendedor cadastrado.{" "}
              <button onClick={() => navigate("/cadastros/novo-vendedor")} className="underline font-semibold">
                Cadastrar vendedor
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div>
              <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Vendedor *</label>
              <select value={vendedorId} onChange={(e) => setVendedorId(e.target.value)} required
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none">
                <option value="">Selecione o vendedor</option>
                {vendedores.map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Número GTA</label>
              <input type="text" placeholder="Ex: 12345/2024" value={numeroGta} onChange={(e) => setNumeroGta(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Sexo *</label>
                <select value={sexo} onChange={(e) => setSexo(e.target.value)} required
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none">
                  <option value="">Selecione</option>
                  <option value="macho_inteiro">Macho Inteiro</option>
                  <option value="macho_capado">Macho Capado</option>
                  <option value="femea">Fêmea</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Faixa etária *</label>
                <select value={faixaEtaria} onChange={(e) => setFaixaEtaria(e.target.value)} required
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none">
                  <option value="">Selecione</option>
                  <option value="bezerro">Bezerro — 0 a 12 meses</option>
                  <option value="garrote">Garrote — 13 a 24 meses</option>
                  <option value="novilho">Novilho — 25 a 36 meses</option>
                  <option value="adulto">Adulto — acima de 36 meses</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Quantidade *</label>
                <input type="number" placeholder="Ex: 10" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} min="1" required
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Valor por kg (R$)</label>
                <input type="number" placeholder="Ex: 12.50" value={valorKg} onChange={(e) => setValorKg(e.target.value)} min="0" step="0.01"
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none" />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Data da compra *</label>
              <input type="date" value={data} onChange={(e) => setData(e.target.value)} required
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none" />
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Observação</label>
              <input type="text" placeholder="Opcional" value={observacao} onChange={(e) => setObservacao(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none" />
            </div>

            {error && <p className="text-sm text-destructive text-center font-semibold">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-primary text-primary-foreground rounded-lg py-3 text-base font-bold hover:bg-accent transition-colors disabled:opacity-60 mt-2">
              {loading ? "Registrando..." : "Registrar compra"}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default NovaCompraAnimaisPage;