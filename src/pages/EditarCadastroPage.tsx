// ==============================
// EditarCadastroPage.tsx — Edição de dados do usuário e da propriedade
//
// Fluxo:
//   1. No mount, carrega os dados atuais via GET /api/usuario (autenticado)
//   2. Usuário edita os campos e submete
//   3. PUT /api/usuario atualiza nome, endereço, email e opcionalmente a senha
//   4. Após salvar, o AuthContext é atualizado com os novos nome + nomePropriedade
//
// Mudança de senha é opcional:
//   - Se os campos de senha estiverem vazios, a senha permanece inalterada
//   - Para mudar a senha, é obrigatório informar a senha atual (validada no back-end)
// ==============================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Home, MapPin, FileText, Save } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/context/AuthContext";

const EditarCadastroPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [nome, setNome] = useState("");
  const [nomePropriedade, setNomePropriedade] = useState("");
  const [endereco, setEndereco] = useState("");
  const [referencia, setReferencia] = useState("");
  const [documento, setDocumento] = useState("");
  const [cep, setCep] = useState("");
  const [email, setEmail] = useState("");
  const [passwordAtual, setPasswordAtual] = useState("");
  const [passwordNova, setPasswordNova] = useState("");
  const [confirmPasswordNova, setConfirmPasswordNova] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Carrega os dados atuais do usuário ao entrar na página ───────────────
  useEffect(() => {
    const carregarDados = async () => {
      const token = localStorage.getItem("easy_cattle_token");
      if (!token) return navigate("/");

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/usuario`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) return navigate("/");

        const data = await response.json();
        setNome(data.nome || "");
        setNomePropriedade(data.nome_propriedade || "");
        setEndereco(data.endereco || "");
        setReferencia(data.referencia || "");
        setDocumento(data.documento || "");
        setCep(data.cep || "");
        setEmail(data.email || "");
      } catch {
        navigate("/");
      }
    };

    carregarDados();
  }, []);

  // ── Submissão do formulário de edição ─────────────────────────────────────
  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordNova && passwordNova !== confirmPasswordNova) {
      setError("As novas senhas não coincidem.");
      return;
    }
    if (passwordNova && !passwordAtual) {
      setError("Informe sua senha atual para alterar a senha.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("easy_cattle_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/usuario`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome,
          nomePropriedade,
          endereco,
          referencia,
          documento,
          cep,
          email,
          passwordAtual: passwordAtual || undefined,
          passwordNova: passwordNova || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao salvar.");
        return;
      }

      login({ nome, nomePropriedade }, token || "");
      setSuccess("Cadastro atualizado com sucesso!");
      setPasswordAtual("");
      setPasswordNova("");
      setConfirmPasswordNova("");
    } catch {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Editar Cadastro">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Seção: Dados da conta */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#ff6b3518" }}>
              <User size={18} className="text-[#ff6b35]" />
            </div>
            <h2 className="text-base font-bold text-white font-exo2">Dados da conta</h2>
          </div>

          <div className="dash-card space-y-0 divide-y divide-white/[0.06]">

            {/* Nome | Nome da propriedade */}
            <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
              <div className="px-5 py-4">
                <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Nome *</label>
                <div className="flex items-center gap-2">
                  <User size={14} className="text-[#8892b0]" />
                  <input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
                  />
                </div>
              </div>
              <div className="px-5 py-4">
                <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Propriedade *</label>
                <div className="flex items-center gap-2">
                  <Home size={14} className="text-[#8892b0]" />
                  <input
                    value={nomePropriedade}
                    onChange={(e) => setNomePropriedade(e.target.value)}
                    placeholder="Nome da propriedade"
                    className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
                  />
                </div>
              </div>
            </div>

            {/* Endereço | Referência */}
            <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
              <div className="px-5 py-4">
                <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Endereço *</label>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-[#8892b0]" />
                  <input
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Endereço"
                    className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
                  />
                </div>
              </div>
              <div className="px-5 py-4">
                <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Referência</label>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-[#8892b0]" />
                  <input
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    placeholder="Opcional"
                    className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
                  />
                </div>
              </div>
            </div>

            {/* Documento | CEP */}
            <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
              <div className="px-5 py-4">
                <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Documento *</label>
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-[#8892b0]" />
                  <input
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                    placeholder="CPF/CNPJ"
                    className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
                  />
                </div>
              </div>
              <div className="px-5 py-4">
                <label className="text-xs font-semibold text-[#8892b0] mb-1 block">CEP</label>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-[#8892b0]" />
                  <input
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    placeholder="Opcional"
                    className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
                />
              </div>
              <Mail size={20} className="text-[#8892b0] flex-shrink-0" />
            </div>

          </div>
        </div>

        {/* Seção: Alterar senha */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#7c3aed18" }}>
              <Lock size={18} className="text-[#7c3aed]" />
            </div>
            <h2 className="text-base font-bold text-white font-exo2">
              Alterar senha{" "}
              <span className="text-[#4a5568] font-normal text-sm">— deixe em branco para manter</span>
            </h2>
          </div>

          <div className="dash-card space-y-0 divide-y divide-white/[0.06]">

            {/* Senha atual */}
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Senha atual</label>
                <input
                  type="password"
                  value={passwordAtual}
                  onChange={(e) => setPasswordAtual(e.target.value)}
                  placeholder="Informe a senha atual"
                  className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
                />
              </div>
              <Lock size={20} className="text-[#8892b0] flex-shrink-0" />
            </div>

            {/* Nova senha | Confirmar */}
            <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
              <div className="px-5 py-4">
                <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Nova senha</label>
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-[#8892b0]" />
                  <input
                    type="password"
                    value={passwordNova}
                    onChange={(e) => setPasswordNova(e.target.value)}
                    placeholder="Nova senha"
                    className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
                  />
                </div>
              </div>
              <div className="px-5 py-4">
                <label className="text-xs font-semibold text-[#8892b0] mb-1 block">Confirmar</label>
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-[#8892b0]" />
                  <input
                    type="password"
                    value={confirmPasswordNova}
                    onChange={(e) => setConfirmPasswordNova(e.target.value)}
                    placeholder="Confirme a nova senha"
                    className="w-full bg-transparent text-white text-sm outline-none placeholder:text-[#4a5568]"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
        {success && <p className="text-sm text-green-500 text-center">{success}</p>}

        <button
          onClick={handleSalvar as any}
          disabled={loading}
          className="w-full mt-2 py-3.5 rounded-2xl text-white font-bold text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #7c3aed, #e040fb)" }}
        >
          <Save size={16} />
          {loading ? "Salvando..." : "Salvar alterações"}
        </button>

      </div>
    </AppLayout>
  );
};

export default EditarCadastroPage;
