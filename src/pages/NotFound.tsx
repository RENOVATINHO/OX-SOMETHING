// ==============================
// NotFound.tsx — Página 404 (rota não encontrada)
// Exibida automaticamente quando o usuário acessa uma URL que não existe na aplicação
// Definida como rota curinga ("*") no App.tsx
// ==============================

import { useLocation } from "react-router-dom"; // Hook para acessar informações da URL atual
import { useEffect } from "react";

const NotFound = () => {
  // Obtém o objeto de localização atual — contém pathname, search, hash, etc.
  const location = useLocation();

  // Loga no console a tentativa de acesso a uma rota inexistente
  // Útil para monitoramento e debug — ajuda a identificar links quebrados na aplicação
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]); // Executa sempre que o pathname mudar

  return (
    // Container centralizado vertical e horizontalmente — ocupa tela inteira
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        {/* Código de erro HTTP em destaque */}
        <h1 className="mb-4 text-4xl font-bold">404</h1>

        {/* Mensagem amigável ao usuário */}
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>

        {/* Link para voltar à página inicial (tela de login) */}
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;