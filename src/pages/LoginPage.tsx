// ==============================
// LoginPage.tsx — Tela de login da aplicação
// ==============================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import mascotImg from "@/assets/mascot.png";
import { useAuth } from "@/context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [savePassword, setSavePassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao fazer login.");
        return;
      }

      // Salva token e dados do usuário
      localStorage.setItem("token", data.token);
      login({ nome: data.nome, nomePropriedade: data.nomePropriedade });

      navigate("/dashboard");
    } catch (err) {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary/5 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-8">

        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-primary tracking-wide mb-4">Easy Cattle</h1>
          <img src={mascotImg} alt="Mascote" className="w-36 h-36 object-contain mx-auto" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3">
            <input
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
            />
            <Mail size={18} className="text-muted-foreground" />
          </div>

          <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3">
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
            />
            <Lock size={18} className="text-muted-foreground" />
          </div>

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

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground rounded-lg py-3 text-base font-bold hover:bg-accent transition-colors disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Login"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Ainda não é membro?{" "}
            <button
              type="button"
              onClick={() => navigate("/cadastrar-se")}
              className="text-primary font-bold hover:underline"
            >
              Cadastre-se
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
