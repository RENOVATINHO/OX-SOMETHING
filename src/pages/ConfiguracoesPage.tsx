import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/AppLayout";
import { User, Lock, Bell, Palette, Shield, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SettingItemProps {
  icon: React.ElementType;
  label: string;
  desc: string;
  color: string;
  onClick?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (v: boolean) => void;
}

const SettingItem = ({ icon: Icon, label, desc, color, onClick, toggle, toggleValue, onToggle }: SettingItemProps) => (
  <button
    onClick={toggle ? () => onToggle?.(!toggleValue) : onClick}
    className="w-full flex items-center gap-4 px-5 py-4 text-left transition-all hover:bg-white/[0.03]"
  >
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}18` }}>
      <Icon size={18} style={{ color }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-white">{label}</p>
      <p className="text-xs text-[#8892b0] mt-0.5">{desc}</p>
    </div>
    {toggle && (
      <div className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${toggleValue ? "bg-[#7c3aed]" : "bg-white/10"}`}>
        <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${toggleValue ? "translate-x-5" : "translate-x-0"}`} />
      </div>
    )}
  </button>
);

const ConfiguracoesPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const initials = (user?.nome || "U").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <AppLayout title="Configurações">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Profile card */}
        <div className="dash-card flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#e040fb] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-white font-exo2 truncate">{user?.nome || "Usuário"}</p>
            <p className="text-sm text-[#8892b0] truncate">{user?.nomePropriedade || "Minha Propriedade"}</p>
          </div>
        </div>

        {/* Settings sections */}
        <div className="dash-card !p-0 divide-y divide-white/[0.06] overflow-hidden">
          <p className="px-5 pt-4 pb-2 text-[10px] uppercase tracking-widest text-[#4a5568] font-semibold">Conta</p>
          <SettingItem icon={User} label="Editar Perfil" desc="Alterar nome e dados da propriedade" color="#ff6b35" onClick={() => navigate("/editar-cadastro")} />
          <SettingItem icon={Lock} label="Alterar Senha" desc="Trocar a senha de acesso" color="#7c3aed" />
          <SettingItem icon={Shield} label="Segurança" desc="Configurações de segurança da conta" color="#00e5ff" />
        </div>

        <div className="dash-card !p-0 divide-y divide-white/[0.06] overflow-hidden">
          <p className="px-5 pt-4 pb-2 text-[10px] uppercase tracking-widest text-[#4a5568] font-semibold">Preferências</p>
          <SettingItem icon={Bell} label="Notificações" desc="Ativar ou desativar alertas" color="#e040fb"
            toggle toggleValue={notificacoes} onToggle={setNotificacoes} />
          <SettingItem icon={Palette} label="Modo Escuro" desc="Alternar aparência do sistema" color="#ff6b35"
            toggle toggleValue={darkMode} onToggle={setDarkMode} />
        </div>

        <div className="dash-card !p-0 overflow-hidden">
          <SettingItem icon={LogOut} label="Sair da conta" desc="Encerrar sessão atual" color="#ef4444" onClick={handleLogout} />
        </div>
      </div>
    </AppLayout>
  );
};

export default ConfiguracoesPage;
