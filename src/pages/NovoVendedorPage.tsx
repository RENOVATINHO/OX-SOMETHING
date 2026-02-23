// ==============================
// NovoVendedorPage.tsx — Formulário para cadastrar um novo vendedor/empresa
// O vendedor cadastrado aqui aparece como opção de seleção nas páginas de compra de animais e insumos
// Suporta dois tipos: "empresa" (CNPJ) e "pessoa" (CPF)
// ==============================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";

const NovoVendedorPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false); // Controle de carregamento durante o submit

  // Estado do formulário — "tipo" determina labels dinâmicos (empresa vs pessoa física)
  const [form, setForm] = useState({
    nome: "",                                    // Nome da empresa ou pessoa
    tipo: "empresa" as "empresa" | "pessoa",     // Tipo de vendedor: empresa ou pessoa física
    documento: "",                               // CNPJ (empresa) ou CPF (pessoa)
    cidade: "",                                  // Cidade do vendedor (opcional)
    estado: "",                                  // Estado/UF do vendedor (opcional)
    telefone: "",                                // Telefone de contato (opcional)
  });

  // Função genérica para atualizar qualquer campo do formulário
  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Handler de submit: valida nome obrigatório e insere no banco de dados
  const handleSubmit = async () => {
    if (!form.nome.trim()) {
      toast({ title: "Erro", description: "Nome é obrigatório", variant: "destructive" });
      return;
    }

    setLoading(true);

    // Insere o vendedor na tabela "vendedores" — campos opcionais são salvos como null se vazios
    const { error } = await supabase.from("vendedores").insert({
      nome: form.nome.trim(),
      tipo: form.tipo,
      documento: form.documento.trim() || null,
      cidade: form.cidade.trim() || null,
      estado: form.estado.trim() || null,
      telefone: form.telefone.trim() || null,
    });

    setLoading(false);

    if (error) {
      toast({ title: "Erro ao cadastrar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Vendedor cadastrado com sucesso!" });
      navigate("/cadastros"); // Volta para o hub de cadastros
    }
  };

  // Classes CSS reutilizáveis para campos de formulário
  const fieldClass =
    "w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";
  const labelClass = "text-sm font-semibold text-foreground mb-1.5 block";

  return (
    <AppLayout title="Novo Vendedor">
      <div className="max-w-2xl">
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">

          {/* ===== SELEÇÃO DE TIPO: EMPRESA OU PESSOA FÍSICA ===== */}
          {/* Altera dinamicamente os labels e placeholders dos campos abaixo */}
          <div>
            <label className={labelClass}>Tipo *</label>
            <div className="flex gap-3">
              {(["empresa", "pessoa"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => update("tipo", t)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                    form.tipo === t
                      ? "bg-primary text-primary-foreground border-primary"   // Botão ativo
                      : "bg-background border-border text-foreground hover:bg-muted" // Botão inativo
                  }`}
                >
                  {t === "empresa" ? "Empresa" : "Pessoa Física"}
                </button>
              ))}
            </div>
          </div>

          {/* ===== NOME ===== */}
          {/* Label e placeholder mudam conforme o tipo selecionado */}
          <div>
            <label className={labelClass}>
              {form.tipo === "empresa" ? "Nome da Empresa" : "Nome da Pessoa"} *
            </label>
            <input
              placeholder={form.tipo === "empresa" ? "Razão social" : "Nome completo"}
              value={form.nome}
              onChange={(e) => update("nome", e.target.value)}
              className={fieldClass}
            />
          </div>

          {/* ===== DOCUMENTO (CNPJ OU CPF) ===== */}
          {/* O placeholder muda conforme o tipo para orientar o formato correto */}
          <div>
            <label className={labelClass}>
              {form.tipo === "empresa" ? "CNPJ" : "CPF"}
            </label>
            <input
              placeholder={form.tipo === "empresa" ? "00.000.000/0000-00" : "000.000.000-00"}
              value={form.documento}
              onChange={(e) => update("documento", e.target.value)}
              className={fieldClass}
            />
          </div>

          {/* ===== CIDADE E ESTADO (OPCIONAIS) ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Cidade</label>
              <input
                placeholder="Cidade"
                value={form.cidade}
                onChange={(e) => update("cidade", e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Estado</label>
              <input
                placeholder="UF"
                value={form.estado}
                onChange={(e) => update("estado", e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          {/* ===== TELEFONE (OPCIONAL) ===== */}
          <div>
            <label className={labelClass}>Telefone</label>
            <input
              placeholder="(00) 00000-0000"
              value={form.telefone}
              onChange={(e) => update("telefone", e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        {/* ===== BOTÕES DE AÇÃO ===== */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={() => navigate("/cadastros")}
            className="px-6 py-3 rounded-lg border border-border text-foreground font-semibold hover:bg-muted transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-primary text-primary-foreground rounded-lg px-8 py-3 text-sm font-bold hover:bg-accent transition-colors disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Cadastrar vendedor"}
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default NovoVendedorPage;
