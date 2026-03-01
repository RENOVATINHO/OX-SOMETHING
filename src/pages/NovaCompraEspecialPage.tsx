import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppLayout from "@/components/AppLayout";

const NovaCompraEspecialPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sexoFixo = searchParams.get("sexo") || "femea"; // "macho_inteiro" ou "femea"

  const [proximoNumero, setProximoNumero] = useState<string>("");
  const [faixaEtaria, setFaixaEtaria] = useState("adulto");
  const [quantidade, setQuantidade] = useState("1");
  const [dataNascimento, setDataNascimento] = useState("");
  const [nomePai, setNomePai] = useState("");
  const [nomeMae, setNomeMae] = useState("");
  const [raca, setRaca] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [observacao, setObservacao] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("easy_cattle_token");
  const isTouro = sexoFixo === "macho_inteiro";
  const titulo = isTouro ? "Cadastrar Touro" : "Cadastrar Matriz";

  useEffect(() => {
    fetch("http://localhost:3001/api/compras-animais/proximo-numero", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setProximoNumero(d.numero)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!faixaEtaria || !quantidade || !data) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/compras-animais/especial", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          sexo: sexoFixo,
          faixa_etaria: faixaEtaria,
          quantidade: Number(quantidade),
          data,
          observacao: observacao || null,
          nome_pai: nomePai || null,
          nome_mae: nomeMae || null,
          raca: raca || null,
          valor_total: Number(valorTotal) || null,
          data_nascimento: dataNascimento || null,
        }),
      });
      const data2 = await res.json();
      if (!res.ok) { setError(data2.error || "Erro ao registrar."); return; }
      navigate("/animais");
    } catch { setError("Não foi possível conectar ao servidor."); }
    finally { setLoading(false); }
  };

  return (
    <AppLayout title={titulo}>
      <div className="max-w-2xl">
        <div className="bg-card rounded-2xl border border-border p-8">

          {/* Badge do sexo fixo */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 ${isTouro ? "bg-amber-500/10 text-amber-600" : "bg-pink-500/10 text-pink-600"}`}>
            {isTouro ? "🐂 Touro — Macho Inteiro" : "🐄 Matriz — Fêmea"}
          </div>

          {/* Número da compra preview */}
          {proximoNumero && (
            <div className="flex items-center justify-between bg-muted/40 border border-border rounded-xl px-5 py-4 mb-6">
              <span className="text-sm text-muted-foreground font-semibold">Número desta compra</span>
              <span className="text-2xl font-black text-primary font-mono">#{proximoNumero}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Faixa etária + Quantidade */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Faixa etária *</label>
                <select value={faixaEtaria} onChange={(e) => setFaixaEtaria(e.target.value)} required
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none">
                  <option value="bezerro">Bezerro — 0 a 12 meses</option>
                  <option value="garrote">Garrote — 13 a 24 meses</option>
                  <option value="novilho">Novilho — 25 a 36 meses</option>
                  <option value="adulto">Adulto — acima de 36 meses</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Quantidade *</label>
                <input type="number" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} min="1" required
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none" />
              </div>
            </div>

            {/* Pai + Mãe */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Nome do pai</label>
                <input type="text" placeholder="Ex: Touro Bandido" value={nomePai} onChange={(e) => setNomePai(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Nome da mãe</label>
                <input type="text" placeholder="Ex: Vaca Pintada" value={nomeMae} onChange={(e) => setNomeMae(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none" />
              </div>
            </div>

            {/* Raça + Valor total */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Raça</label>
                <input type="text" placeholder="Ex: Nelore, Angus..." value={raca} onChange={(e) => setRaca(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Valor total (R$)</label>
                <input type="number" placeholder="Ex: 5000.00" value={valorTotal} onChange={(e) => setValorTotal(e.target.value)} min="0" step="0.01"
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none" />
              </div>
            </div>

            {/* Data nascimento + Data compra */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Data de nascimento</label>
                <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Data da compra *</label>
                <input type="date" value={data} onChange={(e) => setData(e.target.value)} required
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none" />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block">Observação</label>
              <input type="text" placeholder="Opcional" value={observacao} onChange={(e) => setObservacao(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none" />
            </div>

            {error && <p className="text-sm text-destructive text-center font-semibold">{error}</p>}

            <button type="submit" disabled={loading}
              className={`w-full text-white rounded-lg py-3 text-base font-bold transition-colors disabled:opacity-60 mt-2 ${isTouro ? "bg-amber-600 hover:bg-amber-700" : "bg-pink-600 hover:bg-pink-700"}`}>
              {loading ? "Cadastrando..." : `Cadastrar ${isTouro ? "Touro" : "Matriz"}`}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default NovaCompraEspecialPage;
