// ==============================
// NavLink.tsx — Componente wrapper para links de navegação com estado ativo
// Encapsula o NavLink do React Router DOM com suporte a classes CSS condicionais
// Facilita a aplicação de estilos diferentes para links ativos, inativos e pendentes
// ==============================

import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom"; // NavLink nativo do React Router
import { forwardRef } from "react"; // forwardRef permite passar refs para componentes funcionais
import { cn } from "@/lib/utils"; // Função utilitária para mesclagem de classes Tailwind

// Interface de props customizada:
// - Remove o className original do React Router (que é uma função) e substitui por string simples
// - Adiciona activeClassName e pendingClassName para aplicação condicional de estilos
interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;          // Classes CSS padrão (sempre aplicadas)
  activeClassName?: string;    // Classes CSS aplicadas apenas quando o link está ativo (rota atual)
  pendingClassName?: string;   // Classes CSS aplicadas enquanto a navegação está pendente (lazy loading)
}

/**
 * NavLink — Componente de navegação com suporte a estilos condicionais
 * 
 * Uso:
 *   <NavLink to="/dashboard" className="text-sm" activeClassName="font-bold text-primary">
 *     Dashboard
 *   </NavLink>
 * 
 * Quando a rota "/dashboard" estiver ativa, o link terá as classes: "text-sm font-bold text-primary"
 */
const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}        // Passa a ref para o elemento <a> subjacente
        to={to}          // Rota de destino do link
        // O className do React Router recebe uma função com { isActive, isPending }
        // Usamos cn() para mesclar as classes base + condicionais sem conflitos
        className={({ isActive, isPending }) =>
          cn(
            className,                           // Classes sempre aplicadas
            isActive && activeClassName,          // Adiciona se o link está ativo
            isPending && pendingClassName         // Adiciona se a navegação está pendente
          )
        }
        {...props} // Repassa todas as outras props (children, onClick, etc.)
      />
    );
  },
);

// displayName ajuda na identificação do componente no React DevTools
NavLink.displayName = "NavLink";

export { NavLink };