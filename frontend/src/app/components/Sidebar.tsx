import { X, CreditCard, Clock, HandCoins, PiggyBank, TrendingUp, Code, Store, Truck, Crown, Settings, HelpCircle, FileText, Shield, LogOut, BadgeCheck } from 'lucide-react';
import { MembershipTier, membershipProfiles } from '../types/membership';
import { getMembershipColors } from '../utils/membershipColors';

interface MenuSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userIdNumber: string;
  membershipType?: 'free' | 'premium';
  currentMembership?: MembershipTier;
  onNavigate: (section: string) => void;
}

export function MenuSidebar({ isOpen, onClose, userName, userIdNumber, membershipType = 'free', currentMembership = 'gratuito', onNavigate }: MenuSidebarProps) {
  if (!isOpen) return null;

  const colors = getMembershipColors(currentMembership);
  const membershipProfile = membershipProfiles[currentMembership];

  const menuSections = [
    {
      title: 'Cuenta',
      items: [
        { 
          id: 'membership', 
          icon: Crown, 
          label: 'Membresía', 
          badge: membershipType === 'free' ? 'Gratuita' : 'Premium'
        },
        { id: 'settings', icon: Settings, label: 'Configuración' },
        { id: 'help', icon: HelpCircle, label: 'Ayuda y soporte' },
        { id: 'terms', icon: FileText, label: 'Términos y condiciones' },
        { id: 'privacy', icon: Shield, label: 'Privacidad' },
      ]
    },
    {
      title: 'Negocios',
      items: [
        { id: 'api', icon: Code, label: 'Woz API' },
        { id: 'marketplace', icon: Store, label: 'Woz Marketplace' },
        { id: 'dropshipping', icon: Truck, label: 'Woz Dropshipping' },
      ]
    },
    {
      title: 'Finanzas',
      items: [
        { id: 'loans', icon: HandCoins, label: 'Préstamos' },
        { id: 'savings', icon: PiggyBank, label: 'Ahorro programado' },
        { id: 'capital-markets', icon: TrendingUp, label: 'Woz Seller' },
      ]
    }
  ];

  const handleNavigation = (itemId: string) => {
    onNavigate(itemId);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-[60] transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed top-0 right-0 bottom-0 w-80 bg-white z-[70] shadow-2xl overflow-hidden flex flex-col animate-in">
        {/* Header del sidebar */}
        <div className={`bg-gradient-to-br ${colors.gradient} px-5 py-6 flex-shrink-0 relative overflow-hidden`}>
          {/* Patrón decorativo de fondo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Nombre con icono de verificación */}
                <div className="flex items-center gap-2 mb-1.5">
                  <h2 className="text-lg font-bold text-white">{userName}</h2>
                  <BadgeCheck size={20} className="text-blue-500 fill-blue-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]" style={{ fill: '#3b82f6', stroke: 'white' }} />
                </div>
                
                {/* Viñeta de membresía */}
                <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  <div className="w-1 h-1 rounded-full bg-white"></div>
                  <p className="text-xs text-white">{membershipProfile.name}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-white/80 hover:bg-white/10 rounded-full p-1.5 transition-colors flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto">
          <div className="py-2">
            {menuSections.map((section, sectionIndex) => {
              const sectionClasses = sectionIndex > 0 ? 'border-t border-gray-200' : '';
              
              return (
                <div key={section.title} className={sectionClasses}>
                  {/* Título de sección */}
                  <div className="px-5 pt-4 pb-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                      {section.title}
                    </h3>
                  </div>

                  {/* Items de la sección */}
                  <div>
                    {section.items.map((item, itemIndex) => {
                      const Icon = item.icon;
                      const itemClasses = itemIndex < section.items.length - 1 
                        ? 'w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors group border-b border-gray-100'
                        : 'w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors group';
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavigation(item.id)}
                          className={itemClasses}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={18} className="text-gray-600" />
                            <span className="text-sm text-gray-700">{item.label}</span>
                          </div>
                          
                          {item.badge && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Cerrar sesión como último item */}
            <div className="border-t border-gray-200">
              <div className="px-5 pt-4 pb-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  Sesión
                </h3>
              </div>
              <button 
                onClick={() => handleNavigation('logout')}
                className="w-full px-5 py-3 flex items-center gap-3 hover:bg-gray-50 active:bg-gray-100 transition-colors group"
              >
                <LogOut size={18} className="text-gray-600" />
                <span className="text-sm text-gray-700">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}