import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import mascotImg from "@/assets/mascot.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [savePassword, setSavePassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-extrabold text-primary tracking-wide mb-4">Rebanho Fácil</h1>
      <img src={mascotImg} alt="Mascote Rebanho Fácil" className="w-48 h-48 object-contain mb-6" />

      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <div className="flex items-center bg-card rounded-lg border border-border px-4 py-3">
          <input
            type="email"
            placeholder="email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          />
          <Mail size={20} className="text-muted-foreground" />
        </div>

        <div className="flex items-center bg-card rounded-lg border border-border px-4 py-3">
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          />
          <Lock size={20} className="text-muted-foreground" />
        </div>

        <label className="flex items-center gap-2 bg-card rounded-lg border border-border px-4 py-3 w-fit cursor-pointer">
          <span className="text-sm text-foreground">Salvar senha?</span>
          <input
            type="checkbox"
            checked={savePassword}
            onChange={(e) => setSavePassword(e.target.checked)}
            className="w-5 h-5 accent-primary"
          />
        </label>

        <div className="text-right">
          <button type="button" className="text-sm text-primary font-semibold hover:underline">
            Esqueceu a senha?
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground rounded-full py-4 text-lg font-bold hover:bg-accent transition-colors"
        >
          Login
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Ainda não é membro?{" "}
          <button type="button" className="text-primary font-bold hover:underline">
            Cadastre-se
          </button>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
