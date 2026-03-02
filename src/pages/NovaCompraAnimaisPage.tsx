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

  // Classes CSS reutilizadas nos inputs/selects do formulário
  const fieldClass = "w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";
  const labelClass = "text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 block";

  return (
    <AppLayout title="Nova Compra de Animais">
      <div className="max-w-2xl">
        <div className="bg-card rounded-2xl border border-border p-8">

          {/* ── Preview do número da compra ─────────────────────────────────
              Exibe o número sequencial reservado para esta compra.
              Só aparece quando a API retornou o valor com sucesso.
          ─────────────────────────────────────────────────────────────────── */}
          {proximoNumero && (
            <div className="flex items-center justify-between bg-muted/40 border border-border rounded-xl px-5 py-4 mb-6">
              <span className="text-sm text-muted-foreground font-semibold">Número desta compra</span>
              <span className="text-2xl font-black text-primary font-mono">#{proximoNumero}</span>
            </div>
          )}

          {/* ── Aviso: nenhum vendedor cadastrado ───────────────────────────
              Se o usuário ainda não tem vendedores, o formulário não pode ser
              submetido. Exibe alerta com link direto para o cadastro.
          ─────────────────────────────────────────────────────────────────── */}
          {vendedores.length === 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 mb-4 text-sm text-yellow-700">
              Nenhum vendedor cadastrado.{" "}
              <button
                onClick={() => navigate("/cadastros/novo-vendedor")}
                className="underline font-semibold"
              >
                Cadastrar vendedor
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* ── Vendedor (obrigatório) ───────────────────────────────────── */}
            <div>
              <label className={labelClass}>Vendedor *</label>
              <select
                value={vendedorId}
                onChange={(e) => setVendedorId(e.target.value)}
                required
                className={fieldClass}
              >
                <option value="">Selecione o vendedor</option>
                {/* Popula dinamicamente com os vendedores carregados no mount */}
                {vendedores.map((v) => (
                  <option key={v.id} value={v.id}>{v.nome}</option>
                ))}
              </select>
            </div>

            {/* ── Número GTA (opcional) ───────────────────────────────────── */}
            {/* Guia de Trânsito Animal — documento fiscal obrigatório no transporte de bovinos */}
            <div>
              <label className={labelClass}>Número GTA</label>
              <input
                type="text"
                placeholder="Ex: 12345/2024"
                value={numeroGta}
                onChange={(e) => setNumeroGta(e.target.value)}
                className={fieldClass}
              />
            </div>

            {/* ── Sexo + Faixa Etária (ambos obrigatórios) ─────────────────── */}
            {/* Estes dois campos determinam em qual aba o animal aparecerá em AnimaisPage */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Sexo *</label>
                <select
                  value={sexo}
                  onChange={(e) => setSexo(e.target.value)}
                  required
                  className={fieldClass}
                >
                  <option value="">Selecione</option>
                  <option value="macho_inteiro">Macho Inteiro</option>
                  <option value="macho_capado">Macho Capado</option>
                  <option value="femea">Fêmea</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Faixa Etária *</label>
                <select
                  value={faixaEtaria}
                  onChange={(e) => setFaixaEtaria(e.target.value)}
                  required
                  className={fieldClass}
                >
                  <option value="">Selecione</option>
                  <option value="bezerro">Bezerro — 0 a 12 meses</option>
                  <option value="garrote">Garrote — 13 a 24 meses</option>
                  <option value="novilho">Novilho — 25 a 36 meses</option>
                  <option value="adulto">Adulto — acima de 36 meses</option>
                </select>
              </div>
            </div>

            {/* ── Quantidade + Valor por kg ─────────────────────────────────── */}
            {/* Quantidade determina quantos registros de animais serão criados no banco */}
            {/* Valor/kg é usado no gráfico "Valor Estimado do Rebanho" em AnimaisPage */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Quantidade *</label>
                <input
                  type="number"
                  placeholder="Ex: 10"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  min="1"
                  required
                  className={fieldClass}
                />
              </div>
              <div>
                <label className={labelClass}>Valor por kg (R$)</label>
                <input
                  type="number"
                  placeholder="Ex: 12.50"
                  value={valorKg}
                  onChange={(e) => setValorKg(e.target.value)}
                  min="0"
                  step="0.01"
                  className={fieldClass}
                />
              </div>
            </div>

            {/* ── Data da compra (obrigatória) ─────────────────────────────── */}
            <div>
              <label className={labelClass}>Data da compra *</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
                className={fieldClass}
              />
            </div>

            {/* ── Observação (opcional) ────────────────────────────────────── */}
            <div>
              <label className={labelClass}>Observação</label>
              <input
                type="text"
                placeholder="Opcional"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className={fieldClass}
              />
            </div>

            {/* Mensagem de erro de validação ou da API */}
            {error && (
              <p className="text-sm text-destructive text-center font-semibold">{error}</p>
            )}

            {/* ── Botões de ação ───────────────────────────────────────────── */}
            <div className="flex gap-3 mt-2">
              {/* Cancelar: retorna para a lista de animais sem salvar */}
              <button
                type="button"
                onClick={() => navigate("/animais")}
                className="px-6 py-3 rounded-lg border border-border text-foreground font-semibold hover:bg-muted transition-colors text-sm"
              >
                Cancelar
              </button>
              {/* Registrar compra: desabilitado durante o envio para evitar duplo clique */}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-primary-foreground rounded-lg py-3 text-base font-bold hover:bg-accent transition-colors disabled:opacity-60"
              >
                {loading ? "Registrando..." : "Registrar compra"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default NovaCompraAnimaisPage;