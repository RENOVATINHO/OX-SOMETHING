// ==============================
// RelatoriosPage.tsx — Página de relatórios com dados reais do banco
// Exibe relatórios de: Compras de Animais, Compras de Insumos e Animais na Propriedade
// Permite exportar cada relatório como CSV para uso em planilhas
// ==============================

import { useState, useEffect, useCallback } from "react";
import { PawPrint, Calendar, DollarSign, Download, ChevronRight, ChevronDown, FileSpreadsheet, Loader2 } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// ==============================
// Tipos de dados
// ==============================
interface CompraAnimal {
  id: string;
  lote: string;
  sexo: string;
  faixa_etaria: string;
  quantidade: number;
  valor_unitario: number;
  numero_gta: string | null;
  observacao: string | null;
  created_at: string;
  vendedor_nome: string | null;
}

interface CompraInsumo {
  id: string;
  produto: string;
  quantidade: number;
  valor: number;
  nota_fiscal: string | null;
  created_at: string;
  vendedor_nome: string | null;
}

// ==============================
// Utilitário: formatar data BR
// ==============================
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("pt-BR");
};

// ==============================
// Utilitário: formatar moeda BRL
// ==============================
const formatCurrency = (value: number) => {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

// ==============================
// Utilitário: exportar array de objetos como CSV
// Gera o arquivo e dispara download automático no navegador
// ==============================
const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
  if (data.length === 0) return;

  // Cabeçalhos a partir das chaves do primeiro objeto
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(";"), // separador ; para compatibilidade com Excel BR
    ...data.map((row) =>
      headers.map((h) => {
        const val = row[h];
        // Envolver strings com aspas para evitar problemas com ; dentro do valor
        if (typeof val === "string") return `"${val.replace(/"/g, '""')}"`;
        return val ?? "";
      }).join(";")
    ),
  ];

  // Cria blob com BOM UTF-8 para acentos corretos no Excel
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  // Dispara download
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

// ==============================
// Componente principal
// ==============================
const RelatoriosPage = () => {
  // Estado da aba ativa
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Dados carregados do banco
  const [comprasAnimais, setComprasAnimais] = useState<CompraAnimal[]>([]);
  const [comprasInsumos, setComprasInsumos] = useState<CompraInsumo[]>([]);
  const [loading, setLoading] = useState(false);

  // ==============================
  // Busca compras de animais com nome do vendedor (join manual)
  // ==============================
  const fetchComprasAnimais = useCallback(async () => {
    setLoading(true);
    // Busca compras
    const { data: compras, error: errCompras } = await supabase
      .from("compras_animais")
      .select("*")
      .order("created_at", { ascending: false });

    // Busca vendedores para cruzar nomes
    const { data: vendedores } = await supabase.from("vendedores").select("id, nome");
    const vendMap = new Map((vendedores || []).map((v) => [v.id, v.nome]));

    if (!errCompras && compras) {
      setComprasAnimais(
        compras.map((c) => ({
          ...c,
          vendedor_nome: c.vendedor_id ? vendMap.get(c.vendedor_id) || "—" : "—",
        }))
      );
    }
    setLoading(false);
  }, []);

  // ==============================
  // Busca compras de insumos com nome do vendedor
  // ==============================
  const fetchComprasInsumos = useCallback(async () => {
    setLoading(true);
    const { data: compras, error: errCompras } = await supabase
      .from("compras_insumos")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: vendedores } = await supabase.from("vendedores").select("id, nome");
    const vendMap = new Map((vendedores || []).map((v) => [v.id, v.nome]));

    if (!errCompras && compras) {
      setComprasInsumos(
        compras.map((c) => ({
          ...c,
          vendedor_nome: c.vendedor_id ? vendMap.get(c.vendedor_id) || "—" : "—",
        }))
      );
    }
    setLoading(false);
  }, []);

  // ==============================
  // Carrega dados ao abrir uma aba
  // ==============================
  useEffect(() => {
    if (activeTab === "compras-animais" || activeTab === "animais-propriedade") {
      fetchComprasAnimais();
    }
    if (activeTab === "compras-insumos") {
      fetchComprasInsumos();
    }
  }, [activeTab, fetchComprasAnimais, fetchComprasInsumos]);

  // ==============================
  // Exportar compras de animais
  // ==============================
  const exportComprasAnimais = () => {
    exportToCSV(
      comprasAnimais.map((c) => ({
        Lote: c.lote,
        Sexo: c.sexo,
        "Faixa Etária": c.faixa_etaria,
        Quantidade: c.quantidade,
        "Valor Unitário": c.valor_unitario,
        "Valor Total": c.quantidade * c.valor_unitario,
        "Nº GTA": c.numero_gta || "",
        Vendedor: c.vendedor_nome || "",
        Observação: c.observacao || "",
        "Data da Compra": formatDate(c.created_at),
      })),
      "relatorio-compras-animais"
    );
  };

  // ==============================
  // Exportar compras de insumos
  // ==============================
  const exportComprasInsumos = () => {
    exportToCSV(
      comprasInsumos.map((c) => ({
        Produto: c.produto,
        Quantidade: c.quantidade,
        Valor: c.valor,
        "Nota Fiscal": c.nota_fiscal || "",
        Vendedor: c.vendedor_nome || "",
        "Data da Compra": formatDate(c.created_at),
      })),
      "relatorio-compras-insumos"
    );
  };

  // ==============================
  // Exportar animais na propriedade (baseado em compras — visão consolidada)
  // ==============================
  const exportAnimaisPropriedade = () => {
    exportToCSV(
      comprasAnimais.map((c) => ({
        Lote: c.lote,
        Sexo: c.sexo,
        "Faixa Etária": c.faixa_etaria,
        Quantidade: c.quantidade,
        "Valor Unitário (R$)": c.valor_unitario,
        "Nº GTA": c.numero_gta || "",
        Vendedor: c.vendedor_nome || "",
        "Data de Entrada": formatDate(c.created_at),
      })),
      "relatorio-animais-propriedade"
    );
  };

  // ==============================
  // Totalizadores para resumo visual
  // ==============================
  const totalAnimais = comprasAnimais.reduce((acc, c) => acc + c.quantidade, 0);
  const totalValorAnimais = comprasAnimais.reduce((acc, c) => acc + c.quantidade * c.valor_unitario, 0);
  const totalInsumos = comprasInsumos.reduce((acc, c) => acc + c.quantidade, 0);
  const totalValorInsumos = comprasInsumos.reduce((acc, c) => acc + c.valor, 0);

  // ==============================
  // Cards de seleção dos relatórios (exibidos quando nenhuma aba está ativa)
  // ==============================
  const reports = [
    {
      id: "compras-animais",
      icon: DollarSign,
      title: "Compras e Vendas de Animais",
      desc: "Resumo completo das compras de animais — lote, GTA, vendedor e valores.",
      borderColor: "border-l-primary",
    },
    {
      id: "compras-insumos",
      icon: Calendar,
      title: "Compras de Insumos",
      desc: "Empresa, produto, quantidade e valor de cada compra de insumo.",
      borderColor: "border-l-accent",
    },
    {
      id: "animais-propriedade",
      icon: PawPrint,
      title: "Animais na Propriedade",
      desc: "Animais ativos — lote, sexo, faixa etária, data de entrada e valor.",
      borderColor: "border-l-success",
    },
  ];

  // ==============================
  // Render
  // ==============================
  return (
    <AppLayout title="Relatórios">
      {/* === Se nenhuma aba selecionada: mostra os cards de seleção === */}
      {!activeTab && (
        <div className="max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => setActiveTab(report.id)}
              className={`bg-card rounded-xl border border-border border-l-4 ${report.borderColor} p-5 text-left hover:shadow-md transition-all flex items-start gap-4`}
            >
              {/* Ícone do relatório */}
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <report.icon size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground text-sm">{report.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{report.desc}</p>
              </div>
              {/* Seta indicando que é clicável */}
              <ChevronRight size={18} className="text-muted-foreground flex-shrink-0 mt-1" />
            </button>
          ))}
        </div>
      )}

      {/* === Relatório ativo: mostra dados com tabela + resumo + exportação === */}
      {activeTab && (
        <div className="space-y-4">
          {/* Botão para voltar à lista de relatórios */}
          <Button variant="ghost" size="sm" onClick={() => setActiveTab(null)} className="gap-1 text-muted-foreground">
            <ChevronDown size={16} className="rotate-90" />
            Voltar aos relatórios
          </Button>

          {/* ====== RELATÓRIO: COMPRAS DE ANIMAIS ====== */}
          {activeTab === "compras-animais" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Compras e Vendas de Animais</CardTitle>
                {/* Botão exportar CSV */}
                <Button size="sm" variant="outline" onClick={exportComprasAnimais} disabled={comprasAnimais.length === 0}>
                  <FileSpreadsheet size={16} className="mr-1" />
                  Exportar CSV
                </Button>
              </CardHeader>
              <CardContent>
                {/* Cards de resumo */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Total de Compras</p>
                    <p className="text-xl font-bold text-foreground">{comprasAnimais.length}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Total de Cabeças</p>
                    <p className="text-xl font-bold text-foreground">{totalAnimais}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Valor Total</p>
                    <p className="text-xl font-bold text-primary">{formatCurrency(totalValorAnimais)}</p>
                  </div>
                </div>

                {/* Indicador de carregamento */}
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="animate-spin text-primary" size={28} />
                  </div>
                ) : comprasAnimais.length === 0 ? (
                  <p className="text-center text-muted-foreground py-10">Nenhuma compra de animal registrada.</p>
                ) : (
                  /* Tabela com scroll horizontal */
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Lote</TableHead>
                          <TableHead>Sexo</TableHead>
                          <TableHead>Faixa Etária</TableHead>
                          <TableHead className="text-center">Qtd</TableHead>
                          <TableHead>Valor Unit.</TableHead>
                          <TableHead>Valor Total</TableHead>
                          <TableHead>Nº GTA</TableHead>
                          <TableHead>Vendedor</TableHead>
                          <TableHead>Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {comprasAnimais.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium">{c.lote}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{c.sexo}</Badge>
                            </TableCell>
                            <TableCell>{c.faixa_etaria}</TableCell>
                            <TableCell className="text-center">{c.quantidade}</TableCell>
                            <TableCell>{formatCurrency(c.valor_unitario)}</TableCell>
                            <TableCell className="font-semibold">{formatCurrency(c.quantidade * c.valor_unitario)}</TableCell>
                            <TableCell>{c.numero_gta || "—"}</TableCell>
                            <TableCell>{c.vendedor_nome}</TableCell>
                            <TableCell>{formatDate(c.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ====== RELATÓRIO: COMPRAS DE INSUMOS ====== */}
          {activeTab === "compras-insumos" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Compras de Insumos</CardTitle>
                <Button size="sm" variant="outline" onClick={exportComprasInsumos} disabled={comprasInsumos.length === 0}>
                  <FileSpreadsheet size={16} className="mr-1" />
                  Exportar CSV
                </Button>
              </CardHeader>
              <CardContent>
                {/* Cards de resumo */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Total de Compras</p>
                    <p className="text-xl font-bold text-foreground">{comprasInsumos.length}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Itens Comprados</p>
                    <p className="text-xl font-bold text-foreground">{totalInsumos}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Valor Total</p>
                    <p className="text-xl font-bold text-primary">{formatCurrency(totalValorInsumos)}</p>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="animate-spin text-primary" size={28} />
                  </div>
                ) : comprasInsumos.length === 0 ? (
                  <p className="text-center text-muted-foreground py-10">Nenhuma compra de insumo registrada.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead className="text-center">Qtd</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Nota Fiscal</TableHead>
                          <TableHead>Vendedor</TableHead>
                          <TableHead>Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {comprasInsumos.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium">{c.produto}</TableCell>
                            <TableCell className="text-center">{c.quantidade}</TableCell>
                            <TableCell>{formatCurrency(c.valor)}</TableCell>
                            <TableCell>{c.nota_fiscal || "—"}</TableCell>
                            <TableCell>{c.vendedor_nome}</TableCell>
                            <TableCell>{formatDate(c.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ====== RELATÓRIO: ANIMAIS NA PROPRIEDADE ====== */}
          {activeTab === "animais-propriedade" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Animais na Propriedade</CardTitle>
                <Button size="sm" variant="outline" onClick={exportAnimaisPropriedade} disabled={comprasAnimais.length === 0}>
                  <FileSpreadsheet size={16} className="mr-1" />
                  Exportar CSV
                </Button>
              </CardHeader>
              <CardContent>
                {/* Cards de resumo */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Total de Cabeças</p>
                    <p className="text-xl font-bold text-foreground">{totalAnimais}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Lotes</p>
                    <p className="text-xl font-bold text-foreground">{new Set(comprasAnimais.map((c) => c.lote)).size}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Machos</p>
                    <p className="text-xl font-bold text-foreground">
                      {comprasAnimais.filter((c) => c.sexo.toLowerCase() === "macho").reduce((a, c) => a + c.quantidade, 0)}
                    </p>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Fêmeas</p>
                    <p className="text-xl font-bold text-foreground">
                      {comprasAnimais.filter((c) => c.sexo.toLowerCase() === "fêmea" || c.sexo.toLowerCase() === "femea").reduce((a, c) => a + c.quantidade, 0)}
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="animate-spin text-primary" size={28} />
                  </div>
                ) : comprasAnimais.length === 0 ? (
                  <p className="text-center text-muted-foreground py-10">Nenhum animal registrado na propriedade.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Lote</TableHead>
                          <TableHead>Sexo</TableHead>
                          <TableHead>Faixa Etária</TableHead>
                          <TableHead className="text-center">Qtd</TableHead>
                          <TableHead>Valor Unit.</TableHead>
                          <TableHead>Nº GTA</TableHead>
                          <TableHead>Vendedor</TableHead>
                          <TableHead>Data de Entrada</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {comprasAnimais.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium">{c.lote}</TableCell>
                            <TableCell>
                              <Badge variant={c.sexo.toLowerCase() === "macho" ? "default" : "secondary"}>
                                {c.sexo}
                              </Badge>
                            </TableCell>
                            <TableCell>{c.faixa_etaria}</TableCell>
                            <TableCell className="text-center">{c.quantidade}</TableCell>
                            <TableCell>{formatCurrency(c.valor_unitario)}</TableCell>
                            <TableCell>{c.numero_gta || "—"}</TableCell>
                            <TableCell>{c.vendedor_nome}</TableCell>
                            <TableCell>{formatDate(c.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </AppLayout>
  );
};

export default RelatoriosPage;
