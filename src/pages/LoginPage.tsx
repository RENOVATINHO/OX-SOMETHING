// ==============================
// LoginPage.tsx — Tela de login da aplicação
// Página inicial: coleta email e senha do usuário
// NOTA: Atualmente não possui autenticação real — apenas redireciona para o Dashboard
// ==============================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";       // Ícones para os campos de email e senha
import mascotImg from "@/assets/mascot.png";      // Imagem do mascote exibida no centro do formulário

const LoginPage = () => {
  const navigate = useNavigate();

  // Estados locais do formulário de login
  const [email, setEmail] = useState("");           // Email digitado pelo usuário
  const [password, setPassword] = useState("");     // Senha digitada pelo usuário
  const [savePassword, setSavePassword] = useState(false); // Checkbox "Salvar senha"

  // Handler de submit do formulário — por enquanto apenas navega para o dashboard sem validação
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();       // Previne o reload padrão do formulário HTML
    navigate("/dashboard");   // Redireciona para o painel principal
  };

  return (
    // Container principal: centraliza o card de login vertical e horizontalmente
    <div className="min-h-screen bg-primary/5 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-8">

        {/* Cabeçalho: nome do sistema + mascote */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-primary tracking-wide mb-4">Easy Cattle</h1>
          <img src={mascotImg} alt="Mascote" className="w-36 h-36 object-contain mx-auto" />
        </div>

        {/* Formulário de login */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Campo de email com ícone à direita */}
          <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3">
            <input
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
            />
            <Mail size={18} className="text-muted-foreground" />
          </div>

          {/* Campo de senha com ícone à direita */}
          <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3">
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
            />
            <Lock size={18} className="text-muted-foreground" />
          </div>

          {/* Linha de opções: salvar senha e recuperação de senha */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={savePassword}
                onChange={(e) => setSavePassword(e.target.checked)}
                className="w-4 h-4 accent-primary rounded"
              />
              <span className="text-sm text-foreground">Salvar senha?</span>
            </label>
            <button type="button" className="text-sm text-primary font-semibold hover:underline">
              Esqueceu a senha?
            </button>
          </div>

          {/* Botão de submit */}
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground rounded-lg py-3 text-base font-bold hover:bg-accent transition-colors"
          >
            Login
          </button>

          {/* Link para cadastro de novo usuário (ainda não implementado) */}
          <p className="text-center text-sm text-muted-foreground">
            Ainda não é membro?{" "}
            <button type="button" className="text-primary font-bold hover:underline">Cadastre-se</button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
