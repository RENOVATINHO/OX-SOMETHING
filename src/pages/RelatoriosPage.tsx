// ==============================
// RelatoriosPage.tsx — Dark analytics redesign
// Visual update: consistent dark cards, gradient accents, new table styling
// All Supabase queries, CSV export, and business logic are unchanged
// ==============================

import { useState, useEffect, useCallback } from "react";
import { PawPrint, Calendar, DollarSign, Download, ChevronRight, ChevronDown, FileSpreadsheet, Loader2 } from "lucide-react";
import AppLayout from "@/components/AppLayout";
const API = "http://localhost:3001";

// ──────────────────────────────────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────────────────────────────────
interface CompraAnimal {
  id: number;
  lote: string;        // mapeado de numero_compra
  sexo: string;
  faixa_etaria: string;
  quantidade: number;
  valor_unitario: number; // mapeado de valor_kg
  numero_gta: string | null;
  observacao: string | null;
  created_at: string;  // mapeado de data
  vendedor_nome: string | null;
}

interface CompraInsumo {
  id: number;
  produto: string;
  quantidade: number;
  valor: number;
  nota_fiscal: string | null;
  created_at: string;
  vendedor_nome: string | null;
}

// ──────────────────────────────────────────────────────────────────────────────
// UTILS (unchanged)
// ──────────────────────────────────────────────────────────────────────────────
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("pt-BR");

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(";"),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h];
        if (typeof val === "string") return `"${val.replace(/"/g, '""')}"`;
        return val ?? "";
      }).join(";")
    ),
  ];
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

// ──────────────────────────────────────────────────────────────────────────────
// STAT MINI CARD
// ──────────────────────────────────────────────────────────────────────────────
const StatMini = ({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) => (
  <div className="rounded-xl p-4 text-center"
    style={{ background: "hsl(228,35%,14%)", border: "1px solid rgba(255,255,255,0.08)" }}>
    <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>{label}</p>
    <p className={`text-xl font-black font-mono ${accent ? "" : "text-white"}`}
      style={accent ? { color: "var(--accent-orange)" } : undefined}>
      {value}
    </p>
  </div>
);

// ──────────────────────────────────────────────────────────────────────────────
// DARK TABLE COMPONENTS
// ──────────────────────────────────────────────────────────────────────────────
const DarkTH = ({ children, center }: { children: React.ReactNode; center?: boolean }) => (
  <th className={`px-4 py-3.5 text-xs font-semibold uppercase tracking-wider ${center ? "text-center" : "text-left"}`}
    style={{ color: "var(--text-secondary)", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
    {children}
  </th>
);

const DarkTD = ({ children, center, mono }: { children: React.ReactNode; center?: boolean; mono?: boolean }) => (
  <td className={`px-4 py-3.5 text-sm ${center ? "text-center" : ""} ${mono ? "font-mono" : ""}`}
    style={{ color: "#d1d5db", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
    {children}
  </td>
);

// ──────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────────────────────
const RelatoriosPage = () => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [comprasAnimais, setComprasAnimais] = useState<CompraAnimal[]>([]);
  const [comprasInsumos, setComprasInsumos] = useState<CompraInsumo[]>([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("easy_cattle_token");

  const fetchComprasAnimais = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/compras-animais`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setComprasAnimais(data.map((c: Record<string, unknown>) => ({
          id: c.id as number,
          lote: String(c.numero_compra ?? ""),
          sexo: c.sexo as string,
          faixa_etaria: c.faixa_etaria as string,
          quantidade: c.quantidade as number,
          valor_unitario: Number(c.valor_kg ?? 0),
          numero_gta: (c.numero_gta as string | null) ?? null,
          observacao: (c.observacao as string | null) ?? null,
          created_at: String(c.data ?? ""),
          vendedor_nome: (c.vendedor_nome as string | null) ?? null,
        })));
      }
    } catch { /* silently ignore */ }
    setLoading(false);
  }, [token]);

  const fetchComprasInsumos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/compras-insumos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setComprasInsumos(data);
    } catch { /* silently ignore */ }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (activeTab === "compras-animais" || activeTab === "animais-propriedade") fetchComprasAnimais();
    if (activeTab === "compras-insumos") fetchComprasInsumos();
  }, [activeTab, fetchComprasAnimais, fetchComprasInsumos]);

  const exportComprasAnimais = () => {
    exportToCSV(comprasAnimais.map(c => ({
      Lote: c.lote, Sexo: c.sexo, "Faixa Etária": c.faixa_etaria,
      Quantidade: c.quantidade, "Valor Unitário": c.valor_unitario,
      "Valor Total": c.quantidade * c.valor_unitario,
      "Nº GTA": c.numero_gta || "", Vendedor: c.vendedor_nome || "",
      Observação: c.observacao || "", "Data da Compra": formatDate(c.created_at),
    })), "relatorio-compras-animais");
  };

  const exportComprasInsumos = () => {
    exportToCSV(comprasInsumos.map(c => ({
      Produto: c.produto, Quantidade: c.quantidade, Valor: c.valor,
      "Nota Fiscal": c.nota_fiscal || "", Vendedor: c.vendedor_nome || "",
      "Data da Compra": formatDate(c.created_at),
    })), "relatorio-compras-insumos");
  };

  const exportAnimaisPropriedade = () => {
    exportToCSV(comprasAnimais.map(c => ({
      Lote: c.lote, Sexo: c.sexo, "Faixa Etária": c.faixa_etaria,
      Quantidade: c.quantidade, "Valor Unitário (R$)": c.valor_unitario,
      "Nº GTA": c.numero_gta || "", Vendedor: c.vendedor_nome || "",
      "Data de Entrada": formatDate(c.created_at),
    })), "relatorio-animais-propriedade");
  };

  const totalAnimais      = comprasAnimais.reduce((acc, c) => acc + c.quantidade, 0);
  const totalValorAnimais = comprasAnimais.reduce((acc, c) => acc + c.quantidade * c.valor_unitario, 0);
  const totalInsumos      = comprasInsumos.reduce((acc, c) => acc + c.quantidade, 0);
  const totalValorInsumos = comprasInsumos.reduce((acc, c) => acc + c.valor, 0);

  const reports = [
    { id: "compras-animais",    icon: DollarSign, title: "Compras e Vendas de Animais",  desc: "Resumo completo das compras de animais — lote, GTA, vendedor e valores.", color: "#ff6b35" },
    { id: "compras-insumos",    icon: Calendar,   title: "Compras de Insumos",           desc: "Empresa, produto, quantidade e valor de cada compra de insumo.",          color: "#7c3aed" },
    { id: "animais-propriedade",icon: PawPrint,   title: "Animais na Propriedade",       desc: "Animais ativos — lote, sexo, faixa etária, data de entrada e valor.",     color: "#00e5ff" },
  ];

  return (
    <AppLayout title="Relatórios">

      {/* ── Report selection cards ─────────────────────────────────────────── */}
      {!activeTab && (
        <div className="max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reports.map((report, i) => (
            <button
              key={report.id}
              onClick={() => setActiveTab(report.id)}
              className="dash-card text-left flex items-start gap-4 animate-enter"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Gradient top border handled by .gradient-border-top would need custom per color, use inline */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${report.color}18` }}>
                <report.icon size={20} style={{ color: report.color }} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-sm font-exo2">{report.title}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{report.desc}</p>
              </div>
              <ChevronRight size={18} className="flex-shrink-0 mt-1" style={{ color: "var(--text-muted)" }} />
            </button>
          ))}
        </div>
      )}

      {/* ── Active report ─────────────────────────────────────────────────── */}
      {activeTab && (
        <div className="space-y-5">
          {/* Back button */}
          <button
            onClick={() => setActiveTab(null)}
            className="flex items-center gap-2 text-sm font-semibold transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            <ChevronDown size={16} className="rotate-90" />
            Voltar aos relatórios
          </button>

          {/* ── COMPRAS ANIMAIS ───────────────────────────────────────────── */}
          {activeTab === "compras-animais" && (
            <div className="dash-card animate-enter">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-lg font-bold text-white font-exo2">Compras e Vendas de Animais</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{comprasAnimais.length} registros encontrados</p>
                </div>
                <button
                  onClick={exportComprasAnimais}
                  disabled={comprasAnimais.length === 0}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-40"
                  style={{ background: "rgba(255,107,53,0.12)", color: "var(--accent-orange)", border: "1px solid rgba(255,107,53,0.25)" }}
                >
                  <FileSpreadsheet size={15} /> Exportar CSV
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                <StatMini label="Total de Compras" value={comprasAnimais.length} />
                <StatMini label="Total de Cabeças"  value={totalAnimais} />
                <StatMini label="Valor Total"        value={formatCurrency(totalValorAnimais)} accent />
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin" size={28} style={{ color: "var(--accent-orange)" }} />
                </div>
              ) : comprasAnimais.length === 0 ? (
                <p className="text-center py-12" style={{ color: "var(--text-secondary)" }}>Nenhuma compra de animal registrada.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <table className="w-full">
                    <thead>
                      <tr>
                        {["Lote", "Sexo", "Faixa Etária", "Qtd", "Valor Unit.", "Valor Total", "Nº GTA", "Vendedor", "Data"].map((h, i) => (
                          <DarkTH key={h} center={h === "Qtd"}>{h}</DarkTH>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {comprasAnimais.map(c => (
                        <tr key={c.id} className="transition-colors"
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <DarkTD><span className="font-semibold text-white">{c.lote}</span></DarkTD>
                          <DarkTD>
                            <span className="badge-orange text-[10px]">{c.sexo}</span>
                          </DarkTD>
                          <DarkTD>{c.faixa_etaria}</DarkTD>
                          <DarkTD center mono>{c.quantidade}</DarkTD>
                          <DarkTD mono>{formatCurrency(c.valor_unitario)}</DarkTD>
                          <DarkTD mono><span style={{ color: "var(--accent-orange)", fontWeight: 700 }}>{formatCurrency(c.quantidade * c.valor_unitario)}</span></DarkTD>
                          <DarkTD>{c.numero_gta || "—"}</DarkTD>
                          <DarkTD>{c.vendedor_nome}</DarkTD>
                          <DarkTD mono>{formatDate(c.created_at)}</DarkTD>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── COMPRAS INSUMOS ───────────────────────────────────────────── */}
          {activeTab === "compras-insumos" && (
            <div className="dash-card animate-enter">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-lg font-bold text-white font-exo2">Compras de Insumos</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{comprasInsumos.length} registros encontrados</p>
                </div>
                <button
                  onClick={exportComprasInsumos}
                  disabled={comprasInsumos.length === 0}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-40"
                  style={{ background: "rgba(124,58,237,0.12)", color: "var(--accent-purple)", border: "1px solid rgba(124,58,237,0.25)" }}
                >
                  <FileSpreadsheet size={15} /> Exportar CSV
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                <StatMini label="Total de Compras"   value={comprasInsumos.length} />
                <StatMini label="Itens Comprados"    value={totalInsumos} />
                <StatMini label="Valor Total"        value={formatCurrency(totalValorInsumos)} accent />
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin" size={28} style={{ color: "var(--accent-purple)" }} />
                </div>
              ) : comprasInsumos.length === 0 ? (
                <p className="text-center py-12" style={{ color: "var(--text-secondary)" }}>Nenhuma compra de insumo registrada.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <table className="w-full">
                    <thead>
                      <tr>
                        {["Produto", "Qtd", "Valor", "Nota Fiscal", "Vendedor", "Data"].map(h => (
                          <DarkTH key={h} center={h === "Qtd"}>{h}</DarkTH>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {comprasInsumos.map(c => (
                        <tr key={c.id} className="transition-colors"
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <DarkTD><span className="font-semibold text-white">{c.produto}</span></DarkTD>
                          <DarkTD center mono>{c.quantidade}</DarkTD>
                          <DarkTD mono><span style={{ color: "var(--accent-orange)", fontWeight: 700 }}>{formatCurrency(c.valor)}</span></DarkTD>
                          <DarkTD>{c.nota_fiscal || "—"}</DarkTD>
                          <DarkTD>{c.vendedor_nome}</DarkTD>
                          <DarkTD mono>{formatDate(c.created_at)}</DarkTD>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── ANIMAIS PROPRIEDADE ───────────────────────────────────────── */}
          {activeTab === "animais-propriedade" && (
            <div className="dash-card animate-enter">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-lg font-bold text-white font-exo2">Animais na Propriedade</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{comprasAnimais.length} lotes registrados</p>
                </div>
                <button
                  onClick={exportAnimaisPropriedade}
                  disabled={comprasAnimais.length === 0}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-40"
                  style={{ background: "rgba(0,229,255,0.1)", color: "var(--accent-teal)", border: "1px solid rgba(0,229,255,0.2)" }}
                >
                  <FileSpreadsheet size={15} /> Exportar CSV
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <StatMini label="Total de Cabeças" value={totalAnimais} />
                <StatMini label="Lotes"            value={new Set(comprasAnimais.map(c => c.lote)).size} />
                <StatMini label="Machos"           value={comprasAnimais.filter(c => c.sexo.toLowerCase() === "macho").reduce((a, c) => a + c.quantidade, 0)} />
                <StatMini label="Fêmeas"           value={comprasAnimais.filter(c => ["fêmea","femea"].includes(c.sexo.toLowerCase())).reduce((a, c) => a + c.quantidade, 0)} />
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin" size={28} style={{ color: "var(--accent-teal)" }} />
                </div>
              ) : comprasAnimais.length === 0 ? (
                <p className="text-center py-12" style={{ color: "var(--text-secondary)" }}>Nenhum animal registrado na propriedade.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <table className="w-full">
                    <thead>
                      <tr>
                        {["Lote", "Sexo", "Faixa Etária", "Qtd", "Valor Unit.", "Nº GTA", "Vendedor", "Data de Entrada"].map(h => (
                          <DarkTH key={h} center={h === "Qtd"}>{h}</DarkTH>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {comprasAnimais.map(c => (
                        <tr key={c.id} className="transition-colors"
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <DarkTD><span className="font-semibold text-white">{c.lote}</span></DarkTD>
                          <DarkTD>
                            <span className={c.sexo.toLowerCase() === "macho" ? "badge-orange" : "badge-purple"} style={{ fontSize: 10 }}>
                              {c.sexo}
                            </span>
                          </DarkTD>
                          <DarkTD>{c.faixa_etaria}</DarkTD>
                          <DarkTD center mono>{c.quantidade}</DarkTD>
                          <DarkTD mono>{formatCurrency(c.valor_unitario)}</DarkTD>
                          <DarkTD>{c.numero_gta || "—"}</DarkTD>
                          <DarkTD>{c.vendedor_nome}</DarkTD>
                          <DarkTD mono>{formatDate(c.created_at)}</DarkTD>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
};

export default RelatoriosPage;
