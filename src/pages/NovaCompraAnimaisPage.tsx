// ==============================
// NovaCompraAnimaisPage.tsx — Formulário para registrar nova compra de animais
// Fluxo: o usuário seleciona uma empresa (vendedor cadastrado), preenche os dados do lote
// (GTA, sexo, faixa etária, quantidade, valor unitário) e salva no banco de dados
// O "lote" criado aqui será usado posteriormente no cadastro individual de animais
// ==============================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client"; // Cliente do banco de dados
import AppLayout from "@/components/AppLayout";

// Tipo para os vendedores carregados do banco — apenas id e nome são necessários no select
type Vendedor = { id: string; nome: string };

const NovaCompraAnimaisPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);            // Controle de estado de carregamento durante o submit
  const [vendedores, setVendedores] = useState<Vendedor[]>([]); // Lista de vendedores disponíveis para seleção

  // Estado do formulário — campos que compõem uma compra de animais
  const [form, setForm] = useState({
    vendedor_id: "",      // ID da empresa/vendedor selecionado (FK para tabela vendedores)
    numeroGta: "",        // Número da GTA (Guia de Trânsito Animal) — documento obrigatório para transporte
    sexo: "",             // Sexo do lote: "macho" ou "femea"
    quantidade: "",       // Quantidade de cabeças compradas
    valorUnitario: "",    // Valor por cabeça em R$
    observacao: "",       // Campo livre para observações adicionais
    lote: "",             // Nome/identificação do lote — será referenciado no cadastro de animais
    faixaEtaria: "",      // Faixa etária do lote: "0-12", "12-24" ou "24+"
  });

  // Carrega a lista de vendedores cadastrados ao montar o componente
  // Ordenados alfabeticamente para facilitar a busca no select
  useEffect(() => {
    supabase.from("vendedores").select("id, nome").order("nome").then(({ data }) => {
      if (data) setVendedores(data);
    });
  }, []);

  // Função genérica para atualizar qualquer campo do formulário
  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  // Handler de submit: valida campos obrigatórios e insere no banco de dados
  const handleSubmit = async () => {
    // Validação: todos os campos marcados com * são obrigatórios
    if (!form.vendedor_id || !form.sexo || !form.quantidade || !form.valorUnitario || !form.lote || !form.faixaEtaria) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    setLoading(true);

    // Insere o registro de compra no banco de dados (tabela compras_animais)
    const { error } = await supabase.from("compras_animais").insert({
      vendedor_id: form.vendedor_id,
      numero_gta: form.numeroGta.trim() || null,         // GTA é opcional — salva null se vazio
      sexo: form.sexo,
      quantidade: parseInt(form.quantidade),              // Converte string para número inteiro
      valor_unitario: parseFloat(form.valorUnitario),     // Converte string para número decimal
      observacao: form.observacao.trim() || null,         // Observação é opcional
      lote: form.lote.trim(),                             // Nome do lote (obrigatório)
      faixa_etaria: form.faixaEtaria,                    // Faixa etária selecionada
    });

    setLoading(false);

    if (error) {
      // Exibe mensagem de erro do banco de dados para o usuário
      toast({ title: "Erro ao cadastrar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Compra de animal registrada com sucesso!" });
      navigate("/compras-animais"); // Redireciona para a lista de compras de animais
    }
  };

  // Classes CSS reutilizáveis para manter consistência visual nos campos de formulário
  const fieldClass = "w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";
  const labelClass = "text-sm font-semibold text-foreground mb-1.5 block";

  return (
    <AppLayout title="Nova Compra de Animal">
      <div className="max-w-2xl">
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">

          {/* ===== SELEÇÃO DE EMPRESA/VENDEDOR ===== */}
          {/* Carrega vendedores do banco de dados — se não houver nenhum, exibe link para cadastrar */}
          <div>
            <label className={labelClass}>Selecionar empresa *</label>
            {vendedores.length > 0 ? (
              // Select populado com vendedores cadastrados na tabela "vendedores"
              <select value={form.vendedor_id} onChange={(e) => update("vendedor_id", e.target.value)} className={fieldClass}>
                <option value="">Selecione uma empresa</option>
                {vendedores.map((v) => (
                  <option key={v.id} value={v.id}>{v.nome}</option>
                ))}
              </select>
            ) : (
              // Estado vazio: nenhum vendedor cadastrado — orienta o usuário a cadastrar primeiro
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Nenhuma empresa cadastrada.</p>
                <button type="button" onClick={() => navigate("/cadastros/novo-vendedor")} className="text-sm font-semibold text-primary hover:underline">
                  + Cadastrar nova empresa
                </button>
              </div>
            )}
            {/* Link rápido para cadastrar nova empresa mesmo quando já existem vendedores */}
            {vendedores.length > 0 && (
              <button type="button" onClick={() => navigate("/cadastros/novo-vendedor")} className="text-xs text-primary hover:underline mt-1.5 inline-block">
                + Cadastrar nova empresa
              </button>
            )}
          </div>

          {/* ===== NÚMERO DA GTA E LOTE ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              {/* GTA: Guia de Trânsito Animal — documento emitido para movimentação de gado */}
              <label className={labelClass}>Nº da GTA</label>
              <input placeholder="Número da GTA" value={form.numeroGta} onChange={(e) => update("numeroGta", e.target.value)} className={fieldClass} />
            </div>
            <div>
              {/* Lote: identificação do grupo de animais — será usado no cadastro individual */}
              <label className={labelClass}>Lote *</label>
              <input placeholder="Nome do lote" value={form.lote} onChange={(e) => update("lote", e.target.value)} className={fieldClass} />
            </div>
          </div>

          {/* ===== SEXO E FAIXA ETÁRIA ===== */}
          {/* Esses dados serão herdados automaticamente pelo cadastro individual de animais do mesmo lote */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Sexo *</label>
              <select value={form.sexo} onChange={(e) => update("sexo", e.target.value)} className={fieldClass}>
                <option value="">Selecione</option>
                <option value="macho">Macho</option>
                <option value="femea">Fêmea</option>
              </select>
            </div>
            <div>
              {/* Faixa etária do lote: categorização padrão da pecuária brasileira */}
              <label className={labelClass}>Faixa etária *</label>
              <select value={form.faixaEtaria} onChange={(e) => update("faixaEtaria", e.target.value)} className={fieldClass}>
                <option value="">Selecione</option>
                <option value="0-12">0 a 12 meses</option>
                <option value="12-24">12 a 24 meses</option>
                <option value="24+">24 meses em diante</option>
              </select>
            </div>
          </div>

          {/* ===== QUANTIDADE E VALOR UNITÁRIO ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Quantidade *</label>
              <input placeholder="0" type="number" value={form.quantidade} onChange={(e) => update("quantidade", e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Valor unitário R$ *</label>
              <input placeholder="R$ 0,00" type="number" step="0.01" value={form.valorUnitario} onChange={(e) => update("valorUnitario", e.target.value)} className={fieldClass} />
            </div>
          </div>

          {/* ===== OBSERVAÇÃO (OPCIONAL) ===== */}
          <div>
            <label className={labelClass}>Observação</label>
            <textarea placeholder="Observações adicionais" value={form.observacao} onChange={(e) => update("observacao", e.target.value)} className={`${fieldClass} min-h-[80px] resize-none`} />
          </div>
        </div>

        {/* Nota informativa sobre o fluxo de cadastro */}
        <p className="text-xs text-muted-foreground mt-3">
          Para o controle de animais é necessário fazer o cadastro na página de Animais.
        </p>

        {/* ===== BOTÕES DE AÇÃO ===== */}
        <div className="flex gap-3 mt-6">
          {/* Botão cancelar: volta para a listagem de compras */}
          <button type="button" onClick={() => navigate("/compras-animais")} className="px-6 py-3 rounded-lg border border-border text-foreground font-semibold hover:bg-muted transition-colors text-sm">
            Cancelar
          </button>
          {/* Botão submit: desabilitado durante o carregamento para evitar duplo envio */}
          <button onClick={handleSubmit} disabled={loading} className="bg-primary text-primary-foreground rounded-lg px-8 py-3 text-sm font-bold hover:bg-accent transition-colors disabled:opacity-50">
            {loading ? "Salvando..." : "Cadastrar compra"}
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default NovaCompraAnimaisPage;
