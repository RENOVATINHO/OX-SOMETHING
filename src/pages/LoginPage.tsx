// ==============================
// LoginPage.tsx — Dark analytics redesign
// Full visual redesign: gradient card, dark inputs, gradient button
// All form logic, AuthContext, and navigation are unchanged
// ==============================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, X, KeyRound, CheckCircle } from "lucide-react";
import mascotImg from "@/assets/mascot.png";
import { useAuth } from "@/context/AuthContext";

// ── Modal de recuperação de senha ─────────────────────────────────────────
const EsqueciSenhaModal = ({ onClose }: { onClose: () => void }) => {
  const [etapa, setEtapa]           = useState<1 | 2 | 3>(1); // 1=email, 2=código+senha, 3=sucesso
  const [emailReset, setEmailReset] = useState("");
  const [codigo, setCodigo]         = useState("");
  const [codigoGerado, setCodigoGerado] = useState(""); // exibido ao usuário
  const [novaSenha, setNovaSenha]   = useState("");
  const [confirmar, setConfirmar]   = useState("");
  const [loading, setLoading]       = useState(false);
  const [erro, setErro]             = useState("");

  const solicitarCodigo = async () => {
    setErro("");
    if (!emailReset) { setErro("Informe seu email."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/esqueci-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailReset }),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.error || "Erro ao solicitar reset."); return; }
      if (data.codigo) setCodigoGerado(data.codigo);
      setEtapa(2);
    } catch { setErro("Não foi possível conectar ao servidor."); }
    finally { setLoading(false); }
  };

  const redefinirSenha = async () => {
    setErro("");
    if (!codigo) { setErro("Informe o código."); return; }
    if (!novaSenha || novaSenha.length < 6) { setErro("A senha deve ter pelo menos 6 caracteres."); return; }
    if (novaSenha !== confirmar) { setErro("As senhas não conferem."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/resetar-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailReset, codigo, novaSenha }),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.error || "Erro ao redefinir senha."); return; }
      setEtapa(3);
    } catch { setErro("Não foi possível conectar ao servidor."); }
    finally { setLoading(false); }
  };

  const inputStyle = {
    background: "hsl(228,35%,14%)",
    border: "1px solid rgba(255,255,255,0.1)",
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl p-6 relative"
        style={{ background: "hsl(224,38%,18%)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#ff6b3518" }}>
              <KeyRound size={18} className="text-[#ff6b35]" />
            </div>
            <h3 className="text-base font-bold text-white font-exo2">Recuperar Senha</h3>
          </div>
          <button onClick={onClose} className="text-[#8892b0] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {etapa === 3 ? (
          <div className="text-center py-4">
            <CheckCircle size={48} className="mx-auto mb-3 text-green-400" />
            <p className="text-white font-bold mb-1">Senha redefinida!</p>
            <p className="text-sm text-[#8892b0] mb-4">Você já pode entrar com sua nova senha.</p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl text-white font-bold text-sm"
              style={{ background: "var(--gradient-warm)" }}
            >
              Fechar
            </button>
          </div>
        ) : etapa === 1 ? (
          <>
            <p className="text-sm text-[#8892b0] mb-4">
              Informe seu email cadastrado para receber o código de recuperação.
            </p>
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl mb-4" style={inputStyle}>
              <Mail size={16} className="text-[#8892b0]" />
              <input
                type="email"
                value={emailReset}
                onChange={e => setEmailReset(e.target.value)}
                placeholder="seu@email.com"
                className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-[#4a5568]"
                onKeyDown={e => e.key === "Enter" && solicitarCodigo()}
              />
            </div>
            {erro && <p className="text-xs text-red-400 mb-3 text-center">{erro}</p>}
            <button
              onClick={solicitarCodigo}
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50"
              style={{ background: "var(--gradient-warm)" }}
            >
              {loading ? "Enviando..." : "Solicitar Código"}
            </button>
          </>
        ) : (
          <>
            {codigoGerado && (
              <div className="rounded-xl px-4 py-3 mb-4 text-center"
                style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <p className="text-xs text-[#8892b0] mb-1">Seu código de recuperação:</p>
                <p className="text-3xl font-black font-mono text-green-400 tracking-widest">{codigoGerado}</p>
                <p className="text-xs text-[#8892b0] mt-1">Válido por 15 minutos</p>
              </div>
            )}
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl" style={inputStyle}>
                <KeyRound size={16} className="text-[#8892b0]" />
                <input
                  type="text"
                  value={codigo}
                  onChange={e => setCodigo(e.target.value)}
                  placeholder="Código de 6 dígitos"
                  className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-[#4a5568]"
                />
              </div>
              <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl" style={inputStyle}>
                <Lock size={16} className="text-[#8892b0]" />
                <input
                  type="password"
                  value={novaSenha}
                  onChange={e => setNovaSenha(e.target.value)}
                  placeholder="Nova senha (mín. 6 caracteres)"
                  className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-[#4a5568]"
                />
              </div>
              <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl" style={inputStyle}>
                <Lock size={16} className="text-[#8892b0]" />
                <input
                  type="password"
                  value={confirmar}
                  onChange={e => setConfirmar(e.target.value)}
                  placeholder="Confirmar nova senha"
                  className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-[#4a5568]"
                  onKeyDown={e => e.key === "Enter" && redefinirSenha()}
                />
              </div>
            </div>
            {erro && <p className="text-xs text-red-400 mt-2 text-center">{erro}</p>}
            <button
              onClick={redefinirSenha}
              disabled={loading}
              className="w-full mt-4 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50"
              style={{ background: "var(--gradient-warm)" }}
            >
              {loading ? "Salvando..." : "Redefinir Senha"}
            </button>
            <button
              onClick={() => setEtapa(1)}
              className="w-full mt-2 py-2 text-xs text-[#8892b0] hover:text-white transition-colors"
            >
              ← Voltar
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [savePassword, setSavePassword] = useState(false);
  const [showPass, setShowPass]       = useState(false);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [modalEsqueci, setModalEsqueci] = useState(false);

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

      {/* Modal de esqueci a senha */}
      {modalEsqueci && <EsqueciSenhaModal onClose={() => setModalEsqueci(false)} />}

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
              <button
                type="button"
                onClick={() => setModalEsqueci(true)}
                className="text-sm font-semibold transition-colors"
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
