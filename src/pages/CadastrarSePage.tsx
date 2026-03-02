// ==============================
// CadastrarSePage.tsx — Tela de cadastro de novo usuário
// ==============================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Home, MapPin, FileText } from "lucide-react";
import mascotImg from "@/assets/mascot.png";
import { useAuth } from "@/context/AuthContext";

const CadastrarSePage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, nomePropriedade, endereco, referencia, documento, cep, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao cadastrar.");
        return;
      }

      localStorage.setItem("token", data.token);
      login({ nome: data.nome, nomePropriedade: data.nomePropriedade }, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary/5 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-2xl p-8">

        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-primary tracking-wide mb-1">
            Vamos iniciar a nova forma de administrar fazendas
          </h1>
          <p className="text-muted-foreground text-sm mb-4">insira seus dados e de sua propriedade</p>
          <img src={mascotImg} alt="Mascote" className="w-10 h-10 object-contain mx-auto" />
        </div>

        <form onSubmit={handleCadastro} className="flex flex-col gap-3">

          <div className="flex gap-3">
            <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3 flex-1">
              <input type="text" placeholder="Seu nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm" />
              <User size={18} className="text-muted-foreground" />
            </div>
            <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3 flex-1">
              <input type="text" placeholder="Nome da propriedade" value={nomePropriedade} onChange={(e) => setNomePropriedade(e.target.value)} required className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm" />
              <Home size={18} className="text-muted-foreground" />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3 flex-1">
              <input type="text" placeholder="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} required className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm" />
              <MapPin size={18} className="text-muted-foreground" />
            </div>
            <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3 flex-1">
              <input type="text" placeholder="Referência" value={referencia} onChange={(e) => setReferencia(e.target.value)} className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm" />
              <MapPin size={18} className="text-muted-foreground" />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3 flex-1">
              <input type="text" placeholder="Documento (CPF/CNPJ)" value={documento} onChange={(e) => setDocumento(e.target.value)} required className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm" />
              <FileText size={18} className="text-muted-foreground" />
            </div>
            <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3 flex-1">
              <input type="text" placeholder="CEP (opcional)" value={cep} onChange={(e) => setCep(e.target.value)} className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm" />
              <MapPin size={18} className="text-muted-foreground" />
            </div>
          </div>

          <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3">
            <input type="email" placeholder="email@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm" />
            <Mail size={18} className="text-muted-foreground" />
          </div>

          <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3">
            <input type="password" placeholder="Crie uma senha" value={password} onChange={(e) => setPassword(e.target.value)} required className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm" />
            <Lock size={18} className="text-muted-foreground" />
          </div>

          <div className="flex items-center bg-background rounded-lg border border-border px-4 py-3">
            <input type="password" placeholder="Confirme sua senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm" />
            <Lock size={18} className="text-muted-foreground" />
          </div>

          {error && <p className="text-sm text-destructive text-center">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground rounded-lg py-3 text-base font-bold hover:bg-accent transition-colors disabled:opacity-60">
            {loading ? "Cadastrando..." : "Criar conta"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <button type="button" onClick={() => navigate("/")} className="text-primary font-bold hover:underline">Faça login</button>
          </p>

        </form>
      </div>
    </div>
  );
};

export default CadastrarSePage;
