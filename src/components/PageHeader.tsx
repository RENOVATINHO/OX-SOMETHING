import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  variant?: "light" | "blue";
}

const PageHeader = ({ title, showBack = true, variant = "light" }: PageHeaderProps) => {
  const navigate = useNavigate();

  if (variant === "blue") {
    return (
      <div className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        {showBack && (
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground">
            <ChevronLeft size={24} />
            <span className="text-sm font-semibold">Voltar</span>
          </button>
        )}
        <h1 className="text-lg font-bold flex-1 text-center pr-10">{title}</h1>
      </div>
    );
  }

  return (
    <div className="bg-card border-b border-border px-4 py-4 flex items-center gap-3">
      {showBack && (
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-primary hover:text-accent">
          <ChevronLeft size={24} />
          <span className="text-sm font-semibold">Voltar</span>
        </button>
      )}
      <h1 className="text-lg font-bold flex-1 text-center pr-10 text-foreground">{title}</h1>
    </div>
  );
};

export default PageHeader;
