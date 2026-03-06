// ==============================
// NovaVendaPage.tsx — Formulário de venda em lote de animais do rebanho
//
// Responsabilidades:
//   • Carregar compradores cadastrados para seleção (ou digitar nome livre)
//   • Filtrar animais disponíveis pelo critério selecionado (sexo + faixa_etaria)
//   • Validar campos obrigatórios antes de enviar
//   • Enviar para POST /api/vendas-animais — o back-end marca N animais como vendidos
//
// Campos obrigatórios: quantidade, valorCabeca, data
// Campos opcionais:  compradorId (ou compradorNome livre), sexo, faixaEtaria,
//                   numeroGtaSaida, finalidadeVenda
// ==============================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, FileText, Tag, Hash, DollarSign, Calendar, ShoppingCart } from "lucide-react";
import AppLayout from "@/components/AppLayout";

interface Comprador { id: number; nome: string; }

const FINALIDADES = ["Abate", "Cria", "Recria", "Engorda", "Reprodução", "Exposição", "Leilão"];

const NovaVendaPage = () => {
  const navigate = useNavigate();

  // Lista de compradores cadastrados
  const [compradores, setCompradores] = useState<Comprador[]>([]);

  // ── Campos do formulário ──────────────────────────────────────────────────
  const [compradorId, setCompradorId]       = useState("");   // ID do comprador registrado
  const [compradorNome, setCompradorNome]   = useState("");   // nome livre (se não cadastrado)
  const [usarCadastrado, setUsarCadastrado] = useState(true); // alterna entre select e input livre
  const [sexo, setSexo]                     = useState("");
  const [faixaEtaria, setFaixaEtaria]       = useState("");
  const [quantidade, setQuantidade]         = useState("");
  const [valorCabeca, setValorCabeca]       = useState("");
  const [data, setData]                     = useState(new Date().toISOString().split("T")[0]);
  const [numeroGtaSaida, setNumeroGtaSaida] = useState("");
  const [finalidadeVenda, setFinalidadeVenda] = useState("");

  // ── Controle de UI ────────────────────────────────────────────────────────
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("easy_cattle_token");

  // Carrega compradores cadastrados
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/vendedores?tipo=comprador`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCompradores(data); })
      .catch(() => {});
  }, []);

  // Nome efetivo do comprador para o POST
  const nomeEfetivo = usarCadastrado
    ? compradores.find(c => c.id === Number(compradorId))?.nome || ""
    : compradorNome;

  // ── Submissão ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!quantidade || Number(quantidade) < 1) {
      setError("Informe a quantidade de animais a vender.");
      return;
    }
    if (!valorCabeca || Number(valorCabeca) <= 0) {
      setError("Informe o valor por cabeça.");
      return;
    }
    if (!data) {
      setError("Informe a data da venda.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vendas-animais`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          comprador_nome:    nomeEfetivo || null,
          numero_gta_saida:  numeroGtaSaida || null,
          finalidade_venda:  finalidadeVenda || null,
          sexo:              sexo || null,
          faixa_etaria:      faixaEtaria || null,
          quantidade:        Number(quantidade),
          valor_venda:       Number(valorCabeca),
          data_saida:        data,
        }),
      });

      const resultado = await res.json();

      if (!res.ok) {
        // Se o backend informa quantos animais estão disponíveis
        if (resultado.disponivel !== undefined) {
          setError(`${resultado.error} Deseja vender ${resultado.disponivel} animal(is) em vez de ${quantidade}?`);
        } else {
          setError(resultado.error || "Erro ao registrar venda.");
        }
        return;
      }

      // Sucesso — redireciona para o rebanho
      navigate("/animais");
    } catch {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  const podeEnviar = !!quantidade && Number(quantidade) >= 1 && !!valorCabeca && Number(valorCabeca) > 0 && !!data;

  return (
    <AppLayout title="Nova Venda">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#7c3aed18" }}>
            <ShoppingCart size={18} className="text-[#7c3aed]" />
          </div>
          <h2 className="text-base font-bold text-white font-exo2">Registrar Venda de Animais</h2>
        </div>

        <form onSubmit={handleSubmit} className="dash-card space-y-0 divide-y divide-white/[0.06]">

          {/* Comprador */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#8892b0]">Comprador</label>
              <button
                type="button"
                onClick={() => { setUsarCadastrado(!usarCadastrado); setCompradorId(""); setCompradorNome(""); }}
                className="text-[10px] text-[#7c3aed] font-semibold underline"
              >
                {usarCadastrado ? "Digitar nome livre" : "Usar cadastrado"}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <User size={14} className="text-[#8892b0]" />
              {usarCadastrado ? (
                <select
                  value={compradorId}
                  onChange={(e) => setCompradorId(e.target.value)}
                  className="w-full bg-transparent text-white text-sm outline-none appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#1a2332]">Selecione o comprador (opcional)</option>
                  {compradores.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#1a2332]">{c.nome}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={compradorNome}
                  onChange={(e) => setCompradorNome(e.target.value)}
                  placeholder="Ex: João Silva (opcional)"
                  className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
                />
              )}
            </div>
            {usarCadastrado && compradores.length === 0 && (
              <p className="text-[11px] text-yellow-400 mt-1">
                Nenhum comprador cadastrado.{" "}
                <button type="button" onClick={() => navigate("/cadastros/novo-vendedor")} className="underline font-bold">
                  Cadastrar agora
                </button>
              </p>
            )}
          </div>

          {/* Sexo + Faixa Etária */}
          <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
            <div className="px-5 py-4">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Sexo</label>
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-[#8892b0]" />
                <select
                  value={sexo}
                  onChange={(e) => setSexo(e.target.value)}
                  className="w-full bg-transparent text-white text-sm outline-none appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#1a2332]">Todos</option>
                  <option value="macho_inteiro" className="bg-[#1a2332]">Macho Inteiro</option>
                  <option value="macho_capado"  className="bg-[#1a2332]">Macho Capado</option>
                  <option value="femea"          className="bg-[#1a2332]">Fêmea</option>
                </select>
              </div>
            </div>
            <div className="px-5 py-4">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Faixa Etária</label>
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-[#8892b0]" />
                <select
                  value={faixaEtaria}
                  onChange={(e) => setFaixaEtaria(e.target.value)}
                  className="w-full bg-transparent text-white text-sm outline-none appearance-none cursor-pointer"
                >
                  <option value=""         className="bg-[#1a2332]">Todas</option>
                  <option value="bezerro"  className="bg-[#1a2332]">Bezerro — 0 a 12 meses</option>
                  <option value="garrote"  className="bg-[#1a2332]">Garrote — 13 a 25 meses</option>
                  <option value="boi"      className="bg-[#1a2332]">Boi — acima de 25 meses</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quantidade + Valor/cabeça */}
          <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
            <div className="px-5 py-4">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Quantidade *</label>
              <div className="flex items-center gap-2">
                <Hash size={14} className="text-[#8892b0]" />
                <input
                  type="number"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  placeholder="0"
                  min="1"
                  className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
                />
              </div>
            </div>
            <div className="px-5 py-4">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Valor por cabeça (R$) *</label>
              <div className="flex items-center gap-2">
                <DollarSign size={14} className="text-[#8892b0]" />
                <input
                  type="number"
                  value={valorCabeca}
                  onChange={(e) => setValorCabeca(e.target.value)}
                  placeholder="0,00"
                  min="0"
                  step="0.01"
                  className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
                />
              </div>
            </div>
          </div>

          {/* Data da venda */}
          <div className="px-5 py-4">
            <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Data da venda *</label>
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

          {/* Nº GTA Saída */}
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Nº GTA Saída</label>
              <input
                type="text"
                value={numeroGtaSaida}
                onChange={(e) => setNumeroGtaSaida(e.target.value)}
                placeholder="Ex: 67890/2025 (opcional)"
                className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
              />
            </div>
            <FileText size={20} className="text-[#8892b0] flex-shrink-0" />
          </div>

          {/* Finalidade */}
          <div className="px-5 py-4">
            <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Finalidade da venda</label>
            <div className="flex items-center gap-2">
              <Tag size={14} className="text-[#8892b0]" />
              <select
                value={finalidadeVenda}
                onChange={(e) => setFinalidadeVenda(e.target.value)}
                className="w-full bg-transparent text-white text-sm outline-none appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#1a2332]">Selecione (opcional)</option>
                {FINALIDADES.map(f => (
                  <option key={f} value={f} className="bg-[#1a2332]">{f}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Resumo do valor total */}
          {quantidade && valorCabeca && Number(quantidade) > 0 && Number(valorCabeca) > 0 && (
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-xs font-semibold text-[#8892b0]">Valor total estimado</span>
              <span className="text-lg font-black font-mono" style={{ color: "#7c3aed" }}>
                R$ {(Number(quantidade) * Number(valorCabeca)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

        </form>

        {error && <p className="text-sm text-red-400 text-center mt-3">{error}</p>}

        <button
          onClick={handleSubmit as any}
          disabled={loading || !podeEnviar}
          className="w-full mt-4 py-3.5 rounded-2xl text-white font-bold text-sm transition-all disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #7c3aed, #e040fb)" }}
        >
          {loading ? "Registrando..." : "Registrar Venda"}
        </button>

        <p className="text-xs text-[#8892b0] mt-3 text-center">
          O sistema escolhe automaticamente os animais disponíveis com os critérios selecionados.
          Para dar baixa em um animal específico, use o botão "Vender" em Rebanho.
        </p>

      </div>
    </AppLayout>
  );
};

export default NovaVendaPage;
