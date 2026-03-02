// ==============================
// RelatoriosPage.tsx — Página de relatórios com abas funcionais
// Exibe 3 relatórios com dados reais do banco:
// 1. Compras e Vendas de Animais
// 2. Compras de Insumos
// 3. Animais na Propriedade (baseado nos lotes de compra)
// ==============================

import { useEffect, useState } from "react";
import { PawPrint, Package, Users } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ========== Tipos ==========

// Tipo para compra de animais (com vendedor expandido)
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
  vendedores: { nome: string } | null;
}

// Tipo para compra de insumos (com vendedor expandido)
interface CompraInsumo {
  id: string;
  produto: string;
  quantidade: number;
  valor: number;
  nota_fiscal: string | null;
  created_at: string;
  vendedores: { nome: string } | null;
}

// ========== Helpers ==========

// Converte código de faixa etária para label legível
const faixaLabel = (f: string) => {
  if (f === "0-12") return "0–12 meses";
  if (f === "12-24") return "12–24 meses";
  if (f === "24+") return "24+ meses";
  return f;
};

// Formata data ISO para dd/mm/aaaa
const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
};

// Formata valor em reais
const formatCurrency = (val: number) =>
  val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ========== Componente Principal ==========

const RelatoriosPage = () => {
  // — Estado para cada relatório —
  const [comprasAnimais, setComprasAnimais] = useState<CompraAnimal[]>([]);
  const [comprasInsumos, setComprasInsumos] = useState<CompraInsumo[]>([]);
  const [loading, setLoading] = useState(true);

  // — Carrega dados do banco ao montar —
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Busca compras de animais com nome do vendedor (join)
      const { data: animais } = await supabase
        .from("compras_animais")
        .select("id, lote, sexo, faixa_etaria, quantidade, valor_unitario, numero_gta, observacao, created_at, vendedores(nome)")
        .order("created_at", { ascending: false });

      // Busca compras de insumos com nome do vendedor (join)
      const { data: insumos } = await supabase
        .from("compras_insumos")
        .select("id, produto, quantidade, valor, nota_fiscal, created_at, vendedores(nome)")
        .order("created_at", { ascending: false });

      // Atualiza estado com os dados recebidos (ou array vazio se nulo)
      setComprasAnimais((animais as CompraAnimal[]) || []);
      setComprasInsumos((insumos as CompraInsumo[]) || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  // — Cálculos de totais para os cards resumo —
  const totalAnimais = comprasAnimais.reduce((acc, c) => acc + c.quantidade, 0);
  const totalValorAnimais = comprasAnimais.reduce(
    (acc, c) => acc + c.quantidade * c.valor_unitario, 0
  );
  const totalInsumos = comprasInsumos.reduce((acc, c) => acc + c.quantidade, 0);
  const totalValorInsumos = comprasInsumos.reduce((acc, c) => acc + c.valor, 0);

  return (
    <AppLayout title="Relatórios">
      {/* ========== Abas de navegação entre relatórios ========== */}
      <Tabs defaultValue="compras-animais" className="w-full max-w-6xl">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          {/* Aba 1 — Compras de Animais */}
          <TabsTrigger value="compras-animais" className="flex items-center gap-2 text-xs sm:text-sm">
            <PawPrint size={16} />
            Compras de Animais
          </TabsTrigger>
          {/* Aba 2 — Compras de Insumos */}
          <TabsTrigger value="compras-insumos" className="flex items-center gap-2 text-xs sm:text-sm">
            <Package size={16} />
            Compras de Insumos
          </TabsTrigger>
          {/* Aba 3 — Animais na Propriedade */}
          <TabsTrigger value="animais-propriedade" className="flex items-center gap-2 text-xs sm:text-sm">
            <Users size={16} />
            Animais na Propriedade
          </TabsTrigger>
        </TabsList>

        {/* ====================================================== */}
        {/* RELATÓRIO 1 — Compras e Vendas de Animais              */}
        {/* ====================================================== */}
        <TabsContent value="compras-animais">
          {/* Cards resumo — total de cabeças e valor investido */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Compras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{comprasAnimais.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Cabeças
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{totalAnimais}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Valor Total Investido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalValorAnimais)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabela detalhada de compras de animais */}
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Carregando...</p>
          ) : comprasAnimais.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma compra de animais registrada.</p>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Data</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead>GTA</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Sexo</TableHead>
                    <TableHead>Faixa Etária</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">Valor Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comprasAnimais.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{formatDate(c.created_at)}</TableCell>
                      <TableCell className="font-medium">{c.lote}</TableCell>
                      <TableCell>{c.numero_gta || "—"}</TableCell>
                      <TableCell>{c.vendedores?.nome || "—"}</TableCell>
                      <TableCell>{c.sexo}</TableCell>
                      <TableCell>{faixaLabel(c.faixa_etaria)}</TableCell>
                      <TableCell className="text-right">{c.quantidade}</TableCell>
                      <TableCell className="text-right">{formatCurrency(c.valor_unitario)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(c.quantidade * c.valor_unitario)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ====================================================== */}
        {/* RELATÓRIO 2 — Compras de Insumos                       */}
        {/* ====================================================== */}
        <TabsContent value="compras-insumos">
          {/* Cards resumo — total de compras, quantidade e valor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Compras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{comprasInsumos.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Quantidade Total (sacos)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{totalInsumos}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Valor Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalValorInsumos)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabela detalhada de compras de insumos */}
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Carregando...</p>
          ) : comprasInsumos.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma compra de insumos registrada.</p>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Data</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Nota Fiscal</TableHead>
                    <TableHead className="text-right">Qtd (sacos)</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comprasInsumos.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{formatDate(c.created_at)}</TableCell>
                      <TableCell className="font-medium">{c.produto}</TableCell>
                      <TableCell>{c.vendedores?.nome || "—"}</TableCell>
                      <TableCell>{c.nota_fiscal || "—"}</TableCell>
                      <TableCell className="text-right">{c.quantidade}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(c.valor)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ====================================================== */}
        {/* RELATÓRIO 3 — Animais na Propriedade                   */}
        {/* Mostra todos os lotes comprados como "rebanho atual"    */}
        {/* ====================================================== */}
        <TabsContent value="animais-propriedade">
          {/* Cards resumo — total geral de cabeças na propriedade */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Cabeças
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{totalAnimais}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Lotes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{comprasAnimais.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Valor do Rebanho
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalValorAnimais)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabela — lista de animais/lotes na propriedade com informações principais */}
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Carregando...</p>
          ) : comprasAnimais.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum animal registrado na propriedade.</p>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Data de Entrada</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead>Nº GTA</TableHead>
                    <TableHead>Sexo</TableHead>
                    <TableHead>Faixa Etária</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead className="text-right">Cabeças</TableHead>
                    <TableHead className="text-right">Valor Unit.</TableHead>
                    <TableHead>Observação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comprasAnimais.map((c) => (
                    <TableRow key={c.id}>
                      {/* Data de entrada = data da compra */}
                      <TableCell>{formatDate(c.created_at)}</TableCell>
                      {/* Identificação do lote */}
                      <TableCell className="font-medium">{c.lote}</TableCell>
                      {/* Número da GTA — documento de trânsito */}
                      <TableCell>{c.numero_gta || "—"}</TableCell>
                      <TableCell>{c.sexo}</TableCell>
                      <TableCell>{faixaLabel(c.faixa_etaria)}</TableCell>
                      <TableCell>{c.vendedores?.nome || "—"}</TableCell>
                      <TableCell className="text-right">{c.quantidade}</TableCell>
                      <TableCell className="text-right">{formatCurrency(c.valor_unitario)}</TableCell>
                      {/* Observação pode conter brinco, peso, etc */}
                      <TableCell className="max-w-[200px] truncate">{c.observacao || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default RelatoriosPage;
