// ==============================
// LoginPage.tsx — Dark analytics redesign
// Full visual redesign: gradient card, dark inputs, gradient button
// All form logic, AuthContext, and navigation are unchanged
// ==============================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import mascotImg from "@/assets/mascot.png";
import { useAuth } from "@/context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [savePassword, setSavePassword] = useState(false);
  const [showPass, setShowPass]       = useState(false);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Erro ao fazer login."); return; }
      login({ nome: data.nome, nomePropriedade: data.nomePropriedade }, data.token);
      navigate("/dashboard");
    } catch {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "hsl(228,35%,14%)" }}>

      {/* ── Background decorative blobs ──────────────────────────────────── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 65%)", transform: "translate(-50%, -40%)" }} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 65%)", transform: "translate(30%, 30%)" }} />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 65%)", transform: "translate(-30%, 30%)" }} />

      {/* ── Login card ───────────────────────────────────────────────────── */}
      <div className="w-full max-w-md relative z-10 animate-enter">
        {/* Gradient top border */}
        <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl"
          style={{ background: "var(--gradient-warm)" }} />

        <div className="rounded-2xl p-8"
          style={{ background: "hsl(224,38%,18%)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>

          {/* Header */}
          <div className="text-center mb-8">
            {/* Mascot with purple glow ring */}
            <div className="relative inline-block mb-5">
              <div className="absolute inset-0 rounded-full"
                style={{ boxShadow: "0 0 30px rgba(124,58,237,0.4), 0 0 60px rgba(124,58,237,0.15)" }} />
              <img
                src={mascotImg}
                alt="Easy Cattle"
                className="w-28 h-28 object-contain rounded-full relative z-10"
                style={{ outline: "2px solid rgba(124,58,237,0.5)", outlineOffset: "2px" }}
              />
            </div>

            <h1 className="text-3xl font-black font-exo2 gradient-text mb-1">
              Easy Cattle
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Gestão inteligente do seu rebanho
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all"
                style={{ background: "hsl(228,35%,14%)", border: "1px solid rgba(255,255,255,0.1)" }}
                onFocusCapture={e => (e.currentTarget.style.borderColor = "rgba(255,107,53,0.5)")}
                onBlurCapture={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}>
                <Mail size={17} style={{ color: "var(--text-secondary)" }} className="flex-shrink-0" />
                <input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-[#4a5568]"
                />
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all"
                style={{ background: "hsl(228,35%,14%)", border: "1px solid rgba(255,255,255,0.1)" }}
                onFocusCapture={e => (e.currentTarget.style.borderColor = "rgba(255,107,53,0.5)")}
                onBlurCapture={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}>
                <Lock size={17} style={{ color: "var(--text-secondary)" }} className="flex-shrink-0" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-[#4a5568]"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="flex-shrink-0 transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Options row */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={savePassword}
                  onChange={e => setSavePassword(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#ff6b35]"
                />
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Salvar senha?</span>
              </label>
              <button type="button" className="text-sm font-semibold transition-colors"
                style={{ color: "var(--accent-orange)" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                Esqueceu a senha?
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl px-4 py-3 text-sm font-semibold text-center animate-enter"
                style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-base transition-all disabled:opacity-60"
              style={{ background: "var(--gradient-warm)", boxShadow: "0 4px 20px rgba(255,107,53,0.3)" }}
              onMouseEnter={e => !loading && (e.currentTarget.style.boxShadow = "0 8px 32px rgba(255,107,53,0.5)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(255,107,53,0.3)")}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : "Entrar"}
            </button>

            {/* Register link */}
            <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
              Ainda não é membro?{" "}
              <button
                type="button"
                onClick={() => navigate("/cadastrar-se")}
                className="font-bold transition-colors"
                style={{ color: "var(--accent-orange)" }}
              >
                Cadastre-se
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
