// ==============================
// NovaCompraEspecialPage.tsx — Cadastro especial de Touro (reprodutor) ou Matriz
//
// Este formulário é diferente do NovaCompraAnimaisPage porque:
//   • O sexo é fixado via query param (?sexo=macho_inteiro ou ?sexo=femea)
//   • Não exige vendedor (animais próprios da fazenda ou de origem genética registrada)
//   • Inclui campos extras: nome do pai/mãe, raça, data de nascimento, valor total
//   • O tipo_cadastro gerado será "especial" (usado em AnimaisPage para filtrar reprodutores)
//   • Envia para POST /api/compras-animais/especial
//
// Acessado via:
//   /animais/cadastro-especial?sexo=macho_inteiro  → Cadastrar Touro
//   /animais/cadastro-especial?sexo=femea           → Cadastrar Matriz
// ==============================

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppLayout from "@/components/AppLayout";

const NovaCompraEspecialPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Lê o sexo da URL — determina se é cadastro de touro ou matriz
  // Valor padrão "femea" garante comportamento seguro se a URL não tiver o param
  const sexoFixo = searchParams.get("sexo") || "femea"; // "macho_inteiro" ou "femea"

  // Número sequencial da próxima compra — apenas para exibição antes de confirmar
  const [proximoNumero, setProximoNumero] = useState<string>("");

  // ── Campos do formulário ──────────────────────────────────────────────────
  const [faixaEtaria, setFaixaEtaria] = useState("adulto"); // padrão "adulto" para reprodutores/matrizes
  const [quantidade, setQuantidade] = useState("1");         // normalmente 1 animal por cadastro especial
  const [dataNascimento, setDataNascimento] = useState("");   // opcional — rastreabilidade genética
  const [nomePai, setNomePai] = useState("");                 // nome do touro pai (linhagem)
  const [nomeMae, setNomeMae] = useState("");                 // nome da vaca mãe (linhagem)
  const [raca, setRaca] = useState("");                       // ex: Nelore, Angus, Brahman
  const [valorTotal, setValorTotal] = useState("");           // valor pago pelo animal (sem base em kg)
  const [data, setData] = useState(new Date().toISOString().split("T")[0]); // data padrão: hoje
  const [observacao, setObservacao] = useState("");

  // ── Controle de UI ────────────────────────────────────────────────────────
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Token JWT para autenticação
  const token = localStorage.getItem("easy_cattle_token");

  // Flags derivadas do sexo para personalizar UI (título, cores, textos)
  const isTouro = sexoFixo === "macho_inteiro";
  const titulo = isTouro ? "Cadastrar Touro" : "Cadastrar Matriz";

  // Busca o próximo número sequencial para exibir no preview (mesmo endpoint da compra normal)
  useEffect(() => {
    fetch("http://localhost:3001/api/compras-animais/proximo-numero", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setProximoNumero(d.numero)).catch(() => {});
  }, []);

  // ── Submissão do formulário ───────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validação mínima — sexo já vem fixado pela URL
    if (!faixaEtaria || !quantidade || !data) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      // Endpoint específico para cadastros especiais — não exige vendedor_id
      const res = await fetch("http://localhost:3001/api/compras-animais/especial", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          sexo: sexoFixo,                          // fixado pela query string
          faixa_etaria: faixaEtaria,
          quantidade: Number(quantidade),
          data,
          observacao: observacao || null,
          nome_pai: nomePai || null,               // campos extras do cadastro especial
          nome_mae: nomeMae || null,
          raca: raca || null,
          valor_total: Number(valorTotal) || null, // null quando não informado
          data_nascimento: dataNascimento || null,
        }),
      });
      const data2 = await res.json();
      if (!res.ok) { setError(data2.error || "Erro ao registrar."); return; }
      // Sucesso: volta para a lista de animais onde o novo animal já aparecerá na aba correta
      navigate("/animais");
    } catch { setError("Não foi possível conectar ao servidor."); }
    finally { setLoading(false); }
  };

  return (
    <AppLayout title={titulo}>
      <div className="max-w-2xl">
        <div className="bg-card rounded-2xl border border-border p-8">

          {/* ── Badge indicando o tipo de cadastro (touro âmbar / matriz rosa) ── */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 ${isTouro ? "bg-amber-500/10 text-amber-600" : "bg-pink-500/10 text-pink-600"}`}>
            {isTouro ? "🐂 Touro — Macho Inteiro" : "🐄 Matriz — Fêmea"}
          </div>

          {/* ── Preview do número sequencial da compra ─────────────────────── */}
          {proximoNumero && (
            <div className="flex items-center justify-between bg-muted/40 border border-border rounded-xl px-5 py-4 mb-6">
              <span className="text-sm text-muted-foreground font-semibold">Número desta compra</span>
              <span className="text-2xl font-black text-primary font-mono">#{proximoNumero}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* ── Faixa etária + Quantidade ────────────────────────────────── */}
            {/* Faixa etária padrão "adulto" pode ser alterada para registrar filhotes de genética especial */}
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

            {/* ── Linhagem: Nome do Pai + Nome da Mãe ─────────────────────── */}
            {/* Campos de rastreabilidade genética — importantes para programas de melhoramento */}
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

            {/* ── Raça + Valor total ───────────────────────────────────────── */}
            {/* Valor total aqui = preço do animal (ao contrário da compra normal que usa peso × R$/kg) */}
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

            {/* ── Data de nascimento + Data da compra/entrada ─────────────── */}
            {/* Data de nascimento é opcional mas importante para calcular a idade atual */}
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

            {/* Mensagem de erro de validação ou da API */}
            {error && <p className="text-sm text-destructive text-center font-semibold">{error}</p>}

            {/* Botão usa cor âmbar para touro e rosa para matriz — identidade visual consistente */}
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
