// ==============================
// AuthContext.tsx — Contexto global de autenticação
// Armazena e compartilha os dados do usuário logado entre todas as páginas
// ==============================
import { createContext, useContext, useState, ReactNode } from "react";

interface UserData {
  nome: string;
  nomePropriedade: string;
}

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  login: (data: UserData, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Inicializa já lendo do localStorage — sobrevive a reload/navegação
  const [user, setUser] = useState<UserData | null>(() => {
    try {
      const stored = localStorage.getItem("easy_cattle_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("easy_cattle_token");
  });

  const login = (data: UserData, newToken: string) => {
    setUser(data);
    setToken(newToken);
    localStorage.setItem("easy_cattle_user", JSON.stringify(data));
    localStorage.setItem("easy_cattle_token", newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("easy_cattle_user");
    localStorage.removeItem("easy_cattle_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
};