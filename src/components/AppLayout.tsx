// ==============================
// AppLayout.tsx — Layout principal da aplicação (sidebar + header + área de conteúdo)
//
// Estrutura visual:
//   ┌──────────┬──────────────────────────────┐
//   │ Sidebar  │ Header (título da página)    │
//   │ (w-64)   ├──────────────────────────────┤
//   │          │ <children> (conteúdo)        │
//   └──────────┴──────────────────────────────┘
//
// Responsabilidades:
//   • Renderizar a sidebar com navegação principal e secundária
//   • Exibir o nome da propriedade ativa (vindo do AuthContext)
//   • Mostrar o nome do usuário logado e botão de logout
//   • Botão "Voltar" no header (aparece em todas as páginas exceto Dashboard)
//   • Modal de "Limpar banco" — feature de desenvolvimento (apaga todos os dados do usuário)
//
// Uso: envolva o conteúdo de cada página dentro de <AppLayout title="Nome da Página">
// ==============================

import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, PawPrint, ShoppingCart, BarChart3, User, LogOut, TrendingUp, Edit, Lock, ArrowLeft, Boxes, Trash2, Skull } from "lucide-react";
import mascotImg from "@/assets/mascot.png";
import { useAuth } from "@/context/AuthContext";

// ── Itens do menu principal ────────────────────────────────────────────────
// Exibidos em destaque na sidebar — as 4 seções principais do sistema
const navItems = [
  { icon: Home, label: "Dashboard", route: "/dashboard" },
  { icon: PawPrint, label: "Animais", route: "/animais" },
  { icon: ShoppingCart, label: "Cadastros", route: "/cadastros" },
  { icon: BarChart3, label: "Relatórios", route: "/relatorios" },
];

// ── Itens do menu secundário ───────────────────────────────────────────────
// Seção "Outros" abaixo do menu principal — funcionalidades de suporte
const secondaryItems = [
  { icon: Boxes, label: "Estoque de Insumos", route: "/insumos/estoque" },
  { icon: TrendingUp, label: "Animais Vendidos", route: "/dashboard" },   // TODO: rota própria ainda não criada
  { icon: Edit, label: "Editar Cadastro", route: "/editar-cadastro" },
  { icon: Lock, label: "Alterar Senha", route: "/dashboard" },            // TODO: rota própria ainda não criada
];

interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

const AppLayout = ({ children, title }: AppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth(); // dados do usuário logado + função de logout

  // ── Estado do modal "Limpar banco" ─────────────────────────────────────
  // Feature de desenvolvimento — exige digitação da palavra "LIMPAR" para confirmar
  const [modalLimpar, setModalLimpar] = useState(false);
  const [confirmTexto, setConfirmTexto] = useState("");    // texto digitado pelo usuário
  const [loadingLimpar, setLoadingLimpar] = useState(false);
  const [sucesso, setSucesso] = useState(false);           // controla exibição da mensagem de sucesso

  // Usado para ocultar o botão "Voltar" somente no Dashboard (página raiz autenticada)
  const isDashboard = location.pathname === "/dashboard";

  // Limpa o contexto de autenticação e redireciona para o login
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // ── Limpar banco (feature de desenvolvimento) ──────────────────────────
  // Chama DELETE /api/dev/limpar-tudo — apaga todos os dados do usuário logado
  // Exibe feedback de sucesso por 1.5s antes de fechar o modal e recarregar
  const handleLimparBanco = async () => {
    setLoadingLimpar(true);
    const token = localStorage.getItem("easy_cattle_token");
    try {
      const res = await fetch("http://localhost:3001/api/dev/limpar-tudo", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSucesso(true);
        setTimeout(() => {
          setModalLimpar(false);
          setConfirmTexto("");
          setSucesso(false);
          navigate("/dashboard");
        }, 1500);
      }
    } catch { console.error("Erro ao limpar."); }
    finally { setLoadingLimpar(false); }
  };

  return (
    <div className="min-h-screen bg-background flex">

      {/* ══════════════════════════════════════════════════════════════════
          SIDEBAR — fixa na esquerda, 256px de largura, altura total da tela
      ═══════════════════════════════════════════════════════════════════ */}
      <aside className="w-64 bg-card border-r border-border flex flex-col flex-shrink-0 sticky top-0 h-screen">

        {/* Logo + nome do sistema */}
        <div className="p-5 border-b border-border flex items-center gap-3">
          <img src={mascotImg} alt="Easy Cattle" className="w-10 h-10 rounded-full object-cover" />
          <h1 className="text-lg font-extrabold text-primary tracking-wide">Easy Cattle</h1>
        </div>

        {/* Nome da propriedade ativa — vem do AuthContext (salvo no localStorage) */}
        <div className="px-5 py-3 border-b border-border bg-muted/50">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Propriedade Ativa</p>
          <p className="text-sm font-bold text-foreground">{user?.nomePropriedade || "Propriedade"}</p>
        </div>

        {/* ── Navegação principal + secundária ─────────────────────────── */}
        <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto">
          <p className="px-5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Menu Principal</p>

          {navItems.map((item) => {
            // Marca como ativo se a rota atual for igual OU começar com a rota do item
            // Isso garante que /animais/novo ainda mantém "Animais" ativo na sidebar
            const isActive = location.pathname === item.route || location.pathname.startsWith(item.route + "/");
            return (
              <button
                key={item.route}
                onClick={() => navigate(item.route)}
                className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm font-semibold transition-colors ${
                  isActive ? "bg-primary/10 text-primary border-r-2 border-primary" : "text-foreground/70 hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Seção secundária — funcionalidades de suporte */}
          <div className="pt-4">
            <p className="px-5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Outros</p>
            {secondaryItems.map((item) => {
              const isActive = location.pathname === item.route;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.route)}
                  className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                    isActive ? "bg-primary/10 text-primary border-r-2 border-primary font-semibold" : "text-foreground/70 hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Botão "Limpar banco" — destaque em vermelho para alertar sobre ação destrutiva */}
            <button
              onClick={() => { setModalLimpar(true); setConfirmTexto(""); setSucesso(false); }}
              className="w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors text-red-500 hover:bg-red-500/10 mt-1"
            >
              <Trash2 size={18} />
              <span>Limpar banco</span>
            </button>
          </div>
        </nav>

        {/* ── Rodapé da sidebar: avatar do usuário + botão logout ─────── */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <User size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              {/* truncate evita overflow do nome longo */}
              <p className="text-sm font-semibold text-foreground truncate">{user?.nome || "Usuário"}</p>
            </div>
            {/* Botão de logout: limpa o AuthContext + localStorage e volta para / */}
            <button onClick={handleLogout} className="text-destructive hover:text-destructive/80 p-1">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════════
          ÁREA PRINCIPAL — header fixo + conteúdo scrollável
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* Header fixo no topo: botão voltar (exceto no Dashboard) + título da página */}
        <header className="h-16 border-b border-border bg-card px-8 flex items-center gap-3 sticky top-0 z-10">
          {/* Botão "Voltar" usa navigate(-1) — volta para a página anterior no histórico */}
          {!isDashboard && (
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
        </header>

        {/* Área de conteúdo — renderiza o children de cada página */}
        <main className="flex-1 p-8">{children}</main>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MODAL: Limpar banco de dados
          Proteção dupla: usuário deve digitar "LIMPAR" para habilitar o botão.
          Exibe feedback de sucesso por 1.5s antes de fechar automaticamente.
      ═══════════════════════════════════════════════════════════════════ */}
      {modalLimpar && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-red-600/30 p-6 w-full max-w-sm">
            {sucesso ? (
              // Tela de confirmação de sucesso — fecha após 1.5s (controlado pelo setTimeout)
              <div className="text-center py-4">
                <p className="text-2xl mb-2">✅</p>
                <p className="font-bold text-foreground">Banco limpo com sucesso!</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
                    <Skull size={20} className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Limpar banco de dados</h3>
                    <p className="text-xs text-muted-foreground">Apaga animais, compras, insumos e vendedores</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Digite <strong className="text-red-500">LIMPAR</strong> para confirmar:
                </p>
                <input
                  type="text"
                  placeholder="Digite LIMPAR"
                  value={confirmTexto}
                  onChange={(e) => setConfirmTexto(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm outline-none mb-3"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setModalLimpar(false)}
                    className="flex-1 border border-border rounded-lg py-2.5 text-sm font-semibold hover:bg-muted transition-colors">
                    Cancelar
                  </button>
                  {/* Botão desabilitado até que o texto exato "LIMPAR" seja digitado */}
                  <button
                    onClick={handleLimparBanco}
                    disabled={confirmTexto !== "LIMPAR" || loadingLimpar}
                    className="flex-1 bg-red-600 text-white rounded-lg py-2.5 text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-40">
                    {loadingLimpar ? "Limpando..." : "Confirmar"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;