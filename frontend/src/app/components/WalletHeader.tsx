import { User, BadgeCheck, Menu, Crown } from 'lucide-react';
import { MembershipTier, membershipProfiles } from '../types/membership';
import { getMembershipColors } from '../utils/membershipColors';

interface WalletHeaderProps {
  userName: string;
  userIdNumber: string;
  verificationStatus: 'incomplete' | 'pending' | 'approved';
  currentMembership?: MembershipTier;
  onOpenProfile: () => void;
  onOpenMenu?: () => void;
  onOpenMembershipSwitcher?: () => void;
}

export function WalletHeader({ 
  userName, 
  userIdNumber, 
  verificationStatus, 
  currentMembership = 'gratuito',
  onOpenProfile, 
  onOpenMenu,
  onOpenMembershipSwitcher 
}: WalletHeaderProps) {
  const membershipProfile = membershipProfiles[currentMembership];
  const colors = getMembershipColors(currentMembership);
  
  return (
    <header className={`fixed top-0 left-0 right-0 bg-gradient-to-br ${colors.gradient} text-white z-50 shadow-xl m-[0px] px-[14px] py-[29px] overflow-hidden`}>
      {/* Patrón decorativo de fondo */}
      <div className="absolute inset-0 opacity-10 mx-[34px] my-[24px] px-[0px] py-[21px]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24"></div>
      </div>
      
      <div className="max-w-md mx-auto relative z-10">
        <div className="relative flex justify-between items-center">
          {/* User info a la izquierda */}
          <div className="flex-1">
            {/* Nombre con icono de verificación */}
            <div className="flex items-center gap-2 mb-1.5">
              <h2 className="text-lg font-bold text-white">{userName}</h2>
              {verificationStatus === 'approved' && (
                <BadgeCheck size={20} className="text-blue-500 fill-blue-500 [&>path:first-child]:fill-blue-500 [&>path:last-child]:stroke-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]" />
              )}
            </div>
            
            {/* Viñeta de membresía - clickeable para cambiar */}
            <button 
              onClick={onOpenMembershipSwitcher}
              className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full hover:bg-white/30 transition-all group"
            >
              <Crown size={12} className="text-white group-hover:scale-110 transition-transform" />
              <p className="text-xs text-white font-medium">{membershipProfile.name}</p>
              <svg className="w-3 h-3 text-white opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {/* Botones a la derecha: menú y perfil */}
          <div className="flex items-center gap-3 mx-[-13px] my-[12px] p-[0px]">
            {/* Avatar button */}
            <button className="relative w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-all duration-300 border border-white/20 hover:scale-105 p-[0px] bg-[#ffffff03]" onClick={onOpenProfile}>
              <User size={20} className="text-white" />
              <div className={`absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 ${currentMembership === 'gratuito' ? 'border-blue-600' : currentMembership === 'basico' ? 'border-gray-500' : currentMembership === 'regular' ? 'border-green-600' : 'border-amber-500'}`} />
            </button>
            
            {/* Menu button */}
            {onOpenMenu && (
              <button 
                className="p-2 hover:opacity-70 transition-opacity" 
                onClick={onOpenMenu}
              >
                <Menu size={22} className="text-white" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}