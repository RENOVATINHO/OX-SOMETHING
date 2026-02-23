// ==============================
// NovoAnimalPage.tsx — Formulário para cadastrar um animal individual
// Regra de negócio principal: o animal DEVE ser vinculado a um lote existente (criado em Compra de Animais)
// Os campos de Sexo e Idade são preenchidos automaticamente e ficam em modo leitura,
// pois são herdados dos dados do lote selecionado
// ==============================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";

// Tipo que representa os dados de um lote — obtidos da tabela compras_animais
type Lote = { lote: string; sexo: string; faixa_etaria: string };

const NovoAnimalPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lotes, setLotes] = useState<Lote[]>([]);     // Lista de lotes disponíveis (únicos)
  const [selectedLote, setSelectedLote] = useState(""); // Lote selecionado pelo usuário

  // Campos do formulário que NÃO vêm do lote
  const [form, setForm] = useState({
    identificacao: "",   // Ex: número do brinco, tatuagem, chip
    observacao: "",      // Observações sobre o animal
    proprietario: "",    // Proprietário (opcional — futuro: lista de proprietários)
    matrizMae: "",       // Identificação da mãe (opcional — para rastreabilidade genética)
    touroPai: "",        // Identificação do pai (opcional — para rastreabilidade genética)
  });

  // Carrega lotes únicos da tabela compras_animais ao montar o componente
  // Usa reduce para deduplicar por nome do lote (pode haver múltiplas compras com mesmo lote)
  useEffect(() => {
    supabase.from("compras_animais").select("lote, sexo, faixa_etaria").then(({ data }) => {
      if (data) {
        const unique = data.reduce((acc: Lote[], item) => {
          if (!acc.find(l => l.lote === item.lote)) acc.push(item); // Mantém apenas o primeiro registro de cada lote
          return acc;
        }, []);
        setLotes(unique);
      }
    });
  }, []);

  // Busca os dados do lote selecionado para preencher campos automáticos (sexo e idade)
  const loteData = lotes.find(l => l.lote === selectedLote);

  // Função genérica para atualizar campos do formulário
  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  // Handler de submit — NOTA: atualmente só exibe toast, não persiste no banco (tabela de animais ainda não criada)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação: lote e identificação são obrigatórios
    if (!selectedLote || !form.identificacao.trim()) {
      toast({ title: "Erro", description: "Lote e identificação são obrigatórios", variant: "destructive" });
      return;
    }

    toast({ title: "Animal cadastrado com sucesso!" });
    navigate("/animais"); // Redireciona para a listagem de animais
  };

  // Converte o código da faixa etária para texto legível
  const faixaLabel = (f: string) => {
    if (f === "0-12") return "0 a 12 meses";
    if (f === "12-24") return "12 a 24 meses";
    if (f === "24+") return "24 meses em diante";
    return f;
  };

  // Classes CSS reutilizáveis
  const fieldClass = "w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";
  const labelClass = "text-sm font-semibold text-foreground mb-1.5 block";
  const readonlyClass = "w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm text-foreground cursor-not-allowed"; // Estilo para campos somente leitura

  return (
    <AppLayout title="Novo Animal">
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">

          {/* ===== SELEÇÃO DE LOTE ===== */}
          {/* O lote é obrigatório e define sexo + idade do animal automaticamente */}
          <div>
            <label className={labelClass}>Lote *</label>
            {lotes.length > 0 ? (
              <select value={selectedLote} onChange={(e) => setSelectedLote(e.target.value)} className={fieldClass}>
                <option value="">Selecione o lote</option>
                {lotes.map((l) => (
                  <option key={l.lote} value={l.lote}>{l.lote}</option>
                ))}
              </select>
            ) : (
              // Estado vazio: orienta o usuário a primeiro registrar uma compra de animal
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Nenhum lote cadastrado. Cadastre uma compra de animal primeiro.</p>
                <button type="button" onClick={() => navigate("/compras-animais/nova")} className="text-sm font-semibold text-primary hover:underline">
                  + Nova compra de animal
                </button>
              </div>
            )}
          </div>

          {/* ===== IDENTIFICAÇÃO DO ANIMAL ===== */}
          {/* Aparece após o lote conforme regra de negócio */}
          <div>
            <label className={labelClass}>Identificação *</label>
            <input placeholder="Ex: Brinco 001" value={form.identificacao} onChange={(e) => update("identificacao", e.target.value)} className={fieldClass} />
          </div>

          {/* ===== CAMPOS AUTOMÁTICOS: SEXO E IDADE ===== */}
          {/* Só aparecem quando um lote está selecionado — valores herdados do lote, não editáveis */}
          {loteData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Sexo</label>
                {/* readOnly: o sexo vem do lote cadastrado na compra de animais */}
                <input value={loteData.sexo === "macho" ? "Macho" : "Fêmea"} readOnly className={readonlyClass} />
              </div>
              <div>
                <label className={labelClass}>Idade</label>
                {/* readOnly: a faixa etária vem do lote cadastrado na compra de animais */}
                <input value={faixaLabel(loteData.faixa_etaria)} readOnly className={readonlyClass} />
              </div>
            </div>
          )}

          {/* ===== OBSERVAÇÃO ===== */}
          <div>
            <label className={labelClass}>Observação</label>
            <textarea placeholder="Observações sobre o animal" value={form.observacao} onChange={(e) => update("observacao", e.target.value)} className={`${fieldClass} min-h-[80px] resize-none`} />
          </div>

          {/* ===== PROPRIETÁRIO ===== */}
          {/* Futuro: será populado com lista de proprietários cadastrados */}
          <div>
            <label className={labelClass}>Proprietário (opcional)</label>
            <select value={form.proprietario} onChange={(e) => update("proprietario", e.target.value)} className={fieldClass}>
              <option value="">Selecione o proprietário</option>
            </select>
          </div>

          {/* ===== FAMÍLIA (GENEALOGIA) ===== */}
          {/* Campos opcionais para rastreabilidade genética do animal */}
          <div className="border-t border-border pt-5">
            <h3 className="text-sm font-bold text-foreground mb-4">Família (opcional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Matriz (Mãe)</label>
                <input placeholder="Identificação da mãe" value={form.matrizMae} onChange={(e) => update("matrizMae", e.target.value)} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Touro (Pai)</label>
                <input placeholder="Identificação do pai" value={form.touroPai} onChange={(e) => update("touroPai", e.target.value)} className={fieldClass} />
              </div>
            </div>
          </div>
        </div>

        {/* ===== BOTÕES DE AÇÃO ===== */}
        <div className="flex gap-3 mt-6">
          <button type="button" onClick={() => navigate("/animais")} className="px-6 py-3 rounded-lg border border-border text-foreground font-semibold hover:bg-muted transition-colors text-sm">
            Cancelar
          </button>
          <button type="submit" className="bg-primary text-primary-foreground rounded-lg px-8 py-3 text-sm font-bold hover:bg-accent transition-colors">
            Cadastrar Animal
          </button>
        </div>
      </form>
    </AppLayout>
  );
};

export default NovoAnimalPage;
