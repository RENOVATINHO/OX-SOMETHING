// ==============================
// EditarCadastroPage.tsx — Página para editar dados do usuário logado
// ==============================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Home, MapPin, FileText, Save } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/context/AuthContext";

const EditarCadastroPage = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();

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

  // Carrega os dados atuais do usuário ao entrar na página
  useEffect(() => {
    const carregarDados = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      try {
        const response = await fetch("http://localhost:3001/api/usuario", {
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
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/usuario", {
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

      // Atualiza o contexto com os novos dados
      login({ nome, nomePropriedade });
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
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-2xl border border-border p-8">

          <h2 className="text-xl font-bold text-foreground mb-6">Seus dados</h2>

          <form onSubmit={handleSalvar} className="flex flex-col gap-4">

            {/* Nome + Propriedade */}
            <div className="flex gap-3">
              <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3 flex-1">
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
                />
                <User size={18} className="text-muted-foreground" />
              </div>
              <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3 flex-1">
                <input
                  type="text"
                  placeholder="Nome da propriedade"
                  value={nomePropriedade}
                  onChange={(e) => setNomePropriedade(e.target.value)}
                  required
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
                />
                <Home size={18} className="text-muted-foreground" />
              </div>
            </div>

            {/* Endereço + Referência */}
            <div className="flex gap-3">
              <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3 flex-1">
                <input
                  type="text"
                  placeholder="Endereço"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  required
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
                />
                <MapPin size={18} className="text-muted-foreground" />
              </div>
              <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3 flex-1">
                <input
                  type="text"
                  placeholder="Referência"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
                />
                <MapPin size={18} className="text-muted-foreground" />
              </div>
            </div>

            {/* Documento + CEP */}
            <div className="flex gap-3">
              <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3 flex-1">
                <input
                  type="text"
                  placeholder="Documento (CPF/CNPJ)"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  required
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
                />
                <FileText size={18} className="text-muted-foreground" />
              </div>
              <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3 flex-1">
                <input
                  type="text"
                  placeholder="CEP (opcional)"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
                />
                <MapPin size={18} className="text-muted-foreground" />
              </div>
            </div>

            {/* Email */}
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

            {/* Separador de senha */}
            <div className="border-t border-border pt-4 mt-2">
              <p className="text-sm font-semibold text-muted-foreground mb-3">
                Alterar senha — <span className="font-normal">deixe em branco para manter a atual</span>
              </p>

              <div className="flex flex-col gap-3">
                <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3">
                  <input
                    type="password"
                    placeholder="Senha atual"
                    value={passwordAtual}
                    onChange={(e) => setPasswordAtual(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
                  />
                  <Lock size={18} className="text-muted-foreground" />
                </div>

                <div className="flex gap-3">
                  <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3 flex-1">
                    <input
                      type="password"
                      placeholder="Nova senha"
                      value={passwordNova}
                      onChange={(e) => setPasswordNova(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
                    />
                    <Lock size={18} className="text-muted-foreground" />
                  </div>
                  <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3 flex-1">
                    <input
                      type="password"
                      placeholder="Confirme nova senha"
                      value={confirmPasswordNova}
                      onChange={(e) => setConfirmPasswordNova(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
                    />
                    <Lock size={18} className="text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            {success && <p className="text-sm text-green-500 text-center">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground rounded-lg py-3 text-base font-bold hover:bg-accent transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {loading ? "Salvando..." : "Salvar alterações"}
            </button>

          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default EditarCadastroPage;
