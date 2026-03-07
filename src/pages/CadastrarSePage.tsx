// ==============================
// CadastrarSePage.tsx — Cadastro de novo usuário e propriedade
//
// Fluxo:
//   1. Usuário preenche dados pessoais + dados da propriedade + credenciais
//   2. POST /api/cadastro → cria usuário + propriedade no banco
//   3. Resposta retorna token JWT + nome + nomePropriedade
//   4. login() salva os dados no AuthContext e redireciona para /dashboard
//
// Campos obrigatórios: nome, nomePropriedade, endereco, documento, email, password
// Campos opcionais:   referencia, cep
//
// Página pública — sem AppLayout (mesma estrutura visual do LoginPage).
// ==============================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Home, MapPin, FileText, Eye, EyeOff } from "lucide-react";
import mascotImg from "@/assets/mascot.png";
import { useAuth } from "@/context/AuthContext";

const CadastrarSePage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [nomePropriedade, setNomePropriedade] = useState("");
  const [endereco, setEndereco] = useState("");
  const [referencia, setReferencia] = useState("");
  const [documento, setDocumento] = useState("");
  const [cep, setCep] = useState("");

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validação client-side: senhas devem coincidir antes de enviar à API
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cadastro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, nomePropriedade, endereco, referencia, documento, cep, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao cadastrar.");
        return;
      }

      // Salva o token no AuthContext — o usuário já está logado após o cadastro
      localStorage.setItem("token", data.token);
      login({ nome: data.nome, nomePropriedade: data.nomePropriedade }, data.token);
      navigate("/dashboard");
    } catch {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <img src={mascotImg} alt="Mascote" className="w-12 h-12 object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-white font-exo2 tracking-wide mb-1">
            Crie sua conta
          </h1>
          <p className="text-sm text-[#8892b0]">Preencha seus dados e os da sua propriedade</p>
        </div>

        {/* Seção: Dados pessoais */}
        <div className="mb-3">
          <p className="text-[10px] uppercase tracking-widest text-[#4a5568] font-semibold mb-2 px-1">Dados pessoais</p>
          <div className="rounded-2xl overflow-hidden divide-y divide-white/[0.06]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>

            {/* Nome | Propriedade */}
            <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
              <div className="px-5 py-4">
                <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Nome *</label>
                <div className="flex items-center gap-2">
                  <User size={14} className="text-[#8892b0]" />
                  <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" required
                    className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]" />
                </div>
              </div>
              <div className="px-5 py-4">
                <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Propriedade *</label>
                <div className="flex items-center gap-2">
                  <Home size={14} className="text-[#8892b0]" />
                  <input value={nomePropriedade} onChange={(e) => setNomePropriedade(e.target.value)} placeholder="Nome da fazenda" required
                    className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]" />
                </div>
              </div>
            </div>

            {/* Endereço | Referência */}
            <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
              <div className="px-5 py-4">
                <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Endereço *</label>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-[#8892b0]" />
                  <input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Endereço" required
                    className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]" />
                </div>
              </div>
              <div className="px-5 py-4">
                <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Referência</label>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-[#8892b0]" />
                  <input value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="Opcional"
                    className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]" />
                </div>
              </div>
            </div>

            {/* Documento | CEP */}
            <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
              <div className="px-5 py-4">
                <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Documento *</label>
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-[#8892b0]" />
                  <input value={documento} onChange={(e) => setDocumento(e.target.value)} placeholder="CPF/CNPJ" required
                    className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]" />
                </div>
              </div>
              <div className="px-5 py-4">
                <label className="text-xs font-semibold text-[#8892b0] mb-1 block">CEP</label>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-[#8892b0]" />
                  <input value={cep} onChange={(e) => setCep(e.target.value)} placeholder="Opcional"
                    className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Seção: Acesso */}
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-widest text-[#4a5568] font-semibold mb-2 px-1">Acesso</p>
          <div className="rounded-2xl overflow-hidden divide-y divide-white/[0.06]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>

            {/* Email */}
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" required
                  className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]" />
              </div>
              <Mail size={20} className="text-[#8892b0] flex-shrink-0" />
            </div>

            {/* Senha | Confirmar */}
            <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
              <div className="px-5 py-4">
                <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Senha *</label>
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-[#8892b0] flex-shrink-0" />
                  <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Crie uma senha" required
                    className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]" />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="text-[#4a5568] hover:text-[#8892b0] transition-colors flex-shrink-0">
                    {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
              <div className="px-5 py-4">
                <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Confirmar *</label>
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-[#8892b0] flex-shrink-0" />
                  <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirme a senha" required
                    className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]" />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} className="text-[#4a5568] hover:text-[#8892b0] transition-colors flex-shrink-0">
                    {showConfirm ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {error && <p className="text-sm text-red-400 text-center mb-4">{error}</p>}

        <button
          onClick={handleCadastro as any}
          disabled={loading}
          className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #7c3aed, #e040fb)" }}
        >
          {loading ? "Cadastrando..." : "Criar conta"}
        </button>

        <p className="text-center text-sm text-[#8892b0] mt-4">
          Já tem uma conta?{" "}
          <button type="button" onClick={() => navigate("/")} className="text-[#7c3aed] font-bold hover:underline">
            Faça login
          </button>
        </p>

      </div>
    </div>
  );
};

export default CadastrarSePage;
