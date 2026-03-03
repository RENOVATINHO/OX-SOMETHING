// ==============================
// NovaCompraAnimaisPage.tsx — Formulário de registro de nova compra de animais
//
// Responsabilidades:
//   • Exibir o número sequencial da próxima compra (preview antes de confirmar)
//   • Carregar a lista de vendedores cadastrados para seleção
//   • Validar os campos obrigatórios antes de enviar
//   • Criar a compra na API (POST /api/compras-animais)
//   • O back-end cria automaticamente N animais individuais para essa compra
//     (um registro por animal, com status "ativo" por padrão)
//
// Campos obrigatórios: vendedor, sexo, faixa_etaria, quantidade, data
// Campos opcionais:  numero_gta, valor_kg, observacao
// ==============================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, FileText, Tag, Hash, DollarSign, Calendar, AlignLeft, PawPrint } from "lucide-react";
import AppLayout from "@/components/AppLayout";

// Tipo mínimo necessário para popular o select de vendedores
interface Vendedor { id: number; nome: string; }

const NovaCompraAnimaisPage = () => {
  const navigate = useNavigate();

  // Lista de vendedores cadastrados — carregada via API no mount
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);

  // Número sequencial da próxima compra (ex: "0043") — apenas para exibição
  const [proximoNumero, setProximoNumero] = useState<string>("");

  // ── Campos do formulário ──────────────────────────────────────────────────
  const [vendedorId, setVendedorId] = useState("");       // ID do vendedor selecionado
  const [numeroGta, setNumeroGta] = useState("");          // Guia de Trânsito Animal (opcional)
  const [sexo, setSexo] = useState("");                    // "macho_inteiro" | "macho_capado" | "femea"
  const [faixaEtaria, setFaixaEtaria] = useState("");      // "bezerro" | "garrote" | "novilho" | "adulto"
  const [quantidade, setQuantidade] = useState("");        // quantos animais desta compra
  const [valorKg, setValorKg] = useState("");              // R$/kg (usado para estimar valor do rebanho)
  const [data, setData] = useState(new Date().toISOString().split("T")[0]); // data padrão: hoje
  const [observacao, setObservacao] = useState("");

  // ── Controle de UI ────────────────────────────────────────────────────────
  const [error, setError] = useState("");       // mensagem de erro para o usuário
  const [loading, setLoading] = useState(false); // desabilita o botão enquanto salva

  // Token JWT para autenticação nas chamadas à API
  const token = localStorage.getItem("easy_cattle_token");

  // ── Carrega dados iniciais em paralelo ────────────────────────────────────
  useEffect(() => {
    // Busca a lista de vendedores cadastrados pelo usuário logado
    fetch("http://localhost:3001/api/vendedores", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setVendedores(data);
        else setVendedores([]);
      })
      .catch(() => setVendedores([]));

    // Busca o próximo número sequencial disponível para exibir no preview
    fetch("http://localhost:3001/api/compras-animais/proximo-numero", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d?.numero) setProximoNumero(d.numero); })
      .catch(() => {});
  }, []);

  // ── Submissão do formulário ───────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validação client-side dos campos obrigatórios
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
      // Envia a compra para a API — o back-end cria a compra + N registros de animais
      const res = await fetch("http://localhost:3001/api/compras-animais", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vendedor_id: Number(vendedorId),
          numero_gta: numeroGta || null,
          sexo,
          faixa_etaria: faixaEtaria,
          quantidade: Number(quantidade),
          valor_kg: Number(valorKg) || 0, // 0 quando não informado (sem estimativa de valor)
          data,
          observacao: observacao || null,
        }),
      });

      const resultado = await res.json();

      if (!res.ok) {
        setError(resultado.error || "Erro ao registrar compra.");
        return;
      }

      // Sucesso: redireciona para a lista de animais
      navigate("/animais");
    } catch {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Nova Compra de Animais">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#ff6b3518" }}>
            <PawPrint size={18} className="text-[#ff6b35]" />
          </div>
          <h2 className="text-base font-bold text-white font-exo2">Registrar Compra de Animais</h2>
        </div>

        {vendedores.length === 0 && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold text-yellow-400 border border-yellow-500/20" style={{ background: "rgba(234,179,8,0.07)" }}>
            Nenhum vendedor cadastrado.{" "}
            <button onClick={() => navigate("/cadastros/novo-vendedor")} className="underline font-bold">
              Cadastrar agora
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="dash-card space-y-0 divide-y divide-white/[0.06]">

          {/* Preview do número da compra */}
          {proximoNumero && (
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-xs font-semibold text-[#8892b0]">Número desta compra</span>
              <span className="text-2xl font-black font-mono" style={{ color: "#ff6b35" }}>#{proximoNumero}</span>
            </div>
          )}

          {/* Vendedor */}
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Vendedor *</label>
              <select
                value={vendedorId}
                onChange={(e) => setVendedorId(e.target.value)}
                className="w-full bg-transparent text-white text-sm outline-none appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#1a2332]">Selecione o vendedor</option>
                {vendedores.map((v) => (
                  <option key={v.id} value={v.id} className="bg-[#1a2332]">{v.nome}</option>
                ))}
              </select>
            </div>
            <User size={20} className="text-[#8892b0] flex-shrink-0" />
          </div>

          {/* Nº GTA */}
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Nº GTA</label>
              <input
                type="text"
                value={numeroGta}
                onChange={(e) => setNumeroGta(e.target.value)}
                placeholder="Ex: 12345/2024 (opcional)"
                className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
              />
            </div>
            <FileText size={20} className="text-[#8892b0] flex-shrink-0" />
          </div>

          {/* Sexo + Faixa Etária */}
          <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
            <div className="px-5 py-4">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Sexo *</label>
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-[#8892b0]" />
                <select
                  value={sexo}
                  onChange={(e) => setSexo(e.target.value)}
                  className="w-full bg-transparent text-white text-sm outline-none appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#1a2332]">Selecione</option>
                  <option value="macho_inteiro" className="bg-[#1a2332]">Macho Inteiro</option>
                  <option value="macho_capado" className="bg-[#1a2332]">Macho Capado</option>
                  <option value="femea" className="bg-[#1a2332]">Fêmea</option>
                </select>
              </div>
            </div>
            <div className="px-5 py-4">
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Faixa Etária *</label>
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-[#8892b0]" />
                <select
                  value={faixaEtaria}
                  onChange={(e) => setFaixaEtaria(e.target.value)}
                  className="w-full bg-transparent text-white text-sm outline-none appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#1a2332]">Selecione</option>
                  <option value="bezerro" className="bg-[#1a2332]">Bezerro — 0 a 12 meses</option>
                  <option value="garrote" className="bg-[#1a2332]">Garrote — 13 a 24 meses</option>
                  <option value="novilho" className="bg-[#1a2332]">Novilho — 25 a 36 meses</option>
                  <option value="adulto" className="bg-[#1a2332]">Adulto — acima de 36 meses</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quantidade + Valor/kg */}
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
              <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Valor por kg (R$)</label>
              <div className="flex items-center gap-2">
                <DollarSign size={14} className="text-[#8892b0]" />
                <input
                  type="number"
                  value={valorKg}
                  onChange={(e) => setValorKg(e.target.value)}
                  placeholder="0,00"
                  min="0"
                  step="0.01"
                  className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
                />
              </div>
            </div>
          </div>

          {/* Data da compra */}
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
          disabled={loading || !vendedorId || !sexo || !faixaEtaria || !quantidade || !data}
          className="w-full mt-4 py-3.5 rounded-2xl text-white font-bold text-sm transition-all disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #ff6b35, #f7931e)" }}
        >
          {loading ? "Registrando..." : "Registrar Compra"}
        </button>

      </div>
    </AppLayout>
  );
};

export default NovaCompraAnimaisPage;