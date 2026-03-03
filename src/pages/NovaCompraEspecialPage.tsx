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
import { Hash, Tag, User, DollarSign, Calendar, AlignLeft } from "lucide-react";
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
    fetch(`${import.meta.env.VITE_API_URL}/api/compras-animais/proximo-numero`, { headers: { Authorization: `Bearer ${token}` } })
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/compras-animais/especial`, {
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

  const accentColor = isTouro ? "#f59e0b" : "#ec4899";
  const accentBg   = isTouro ? "rgba(245,158,11,0.08)" : "rgba(236,72,153,0.08)";

  return (
    <AppLayout title={titulo}>
      <div className="max-w-2xl mx-auto">

        {/* Cabeçalho da seção */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: accentBg }}>
            <span className="text-lg">{isTouro ? "🐂" : "🐄"}</span>
          </div>
          <h2 className="text-base font-bold text-white font-exo2">
            {isTouro ? "Cadastrar Touro — Reprodutor" : "Cadastrar Matriz — Fêmea"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="dash-card space-y-0 divide-y divide-white/[0.06]">

          {/* Preview do número da compra */}
          {proximoNumero && (
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-xs font-semibold text-[#8892b0]">Número deste cadastro</span>
              <span className="text-2xl font-black font-mono" style={{ color: accentColor }}>#{proximoNumero}</span>
            </div>
          )}

          {/* Faixa etária + Quantidade */}
          <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
            <div className="px-5 py-4">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Faixa etária *</label>
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-[#8892b0]" />
                <select
                  value={faixaEtaria}
                  onChange={(e) => setFaixaEtaria(e.target.value)}
                  className="w-full bg-transparent text-white text-sm outline-none appearance-none cursor-pointer"
                >
                  <option value="bezerro" className="bg-[#1a2332]">Bezerro — 0 a 12 meses</option>
                  <option value="garrote" className="bg-[#1a2332]">Garrote — 13 a 24 meses</option>
                  <option value="novilho" className="bg-[#1a2332]">Novilho — 25 a 36 meses</option>
                  <option value="adulto" className="bg-[#1a2332]">Adulto — acima de 36 meses</option>
                </select>
              </div>
            </div>
            <div className="px-5 py-4">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Quantidade *</label>
              <div className="flex items-center gap-2">
                <Hash size={14} className="text-[#8892b0]" />
                <input
                  type="number"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  placeholder="1"
                  min="1"
                  className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
                />
              </div>
            </div>
          </div>

          {/* Nome do pai + Nome da mãe */}
          <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
            <div className="px-5 py-4">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Nome do pai</label>
              <div className="flex items-center gap-2">
                <User size={14} className="text-[#8892b0]" />
                <input
                  type="text"
                  value={nomePai}
                  onChange={(e) => setNomePai(e.target.value)}
                  placeholder="Ex: Touro Bandido"
                  className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
                />
              </div>
            </div>
            <div className="px-5 py-4">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Nome da mãe</label>
              <div className="flex items-center gap-2">
                <User size={14} className="text-[#8892b0]" />
                <input
                  type="text"
                  value={nomeMae}
                  onChange={(e) => setNomeMae(e.target.value)}
                  placeholder="Ex: Vaca Pintada"
                  className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
                />
              </div>
            </div>
          </div>

          {/* Raça + Valor total */}
          <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
            <div className="px-5 py-4">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Raça</label>
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-[#8892b0]" />
                <input
                  type="text"
                  value={raca}
                  onChange={(e) => setRaca(e.target.value)}
                  placeholder="Ex: Nelore, Angus..."
                  className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
                />
              </div>
            </div>
            <div className="px-5 py-4">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Valor total (R$)</label>
              <div className="flex items-center gap-2">
                <DollarSign size={14} className="text-[#8892b0]" />
                <input
                  type="number"
                  value={valorTotal}
                  onChange={(e) => setValorTotal(e.target.value)}
                  placeholder="0,00"
                  min="0"
                  step="0.01"
                  className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
                />
              </div>
            </div>
          </div>

          {/* Data nascimento + Data compra */}
          <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
            <div className="px-5 py-4">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Data de nascimento</label>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-[#8892b0]" />
                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="w-full bg-transparent text-white text-sm outline-none"
                />
              </div>
            </div>
            <div className="px-5 py-4">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Data da compra *</label>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-[#8892b0]" />
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full bg-transparent text-white text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {/* Observação */}
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Observação</label>
              <input
                type="text"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Opcional"
                className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
              />
            </div>
            <AlignLeft size={20} className="text-[#8892b0] flex-shrink-0" />
          </div>

        </form>

        {error && <p className="text-sm text-red-400 text-center mt-3">{error}</p>}

        <button
          onClick={handleSubmit as any}
          disabled={loading || !faixaEtaria || !quantidade || !data}
          className="w-full mt-4 py-3.5 rounded-2xl text-white font-bold text-sm transition-all disabled:opacity-40"
          style={{ background: isTouro ? "linear-gradient(135deg, #f59e0b, #d97706)" : "linear-gradient(135deg, #ec4899, #be185d)" }}
        >
          {loading ? "Cadastrando..." : `Cadastrar ${isTouro ? "Touro" : "Matriz"}`}
        </button>

      </div>
    </AppLayout>
  );
};

export default NovaCompraEspecialPage;
