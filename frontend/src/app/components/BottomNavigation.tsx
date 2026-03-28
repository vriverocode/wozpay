import { Home, Clock, QrCode, Building2, Bell } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCollectClick?: () => void;
  onBankClick?: () => void;
  onTransactionsClick?: () => void;
  onNotificationsClick?: () => void;
}

export function BottomNavigation({ activeTab, onTabChange, onCollectClick, onBankClick, onTransactionsClick, onNotificationsClick }: BottomNavigationProps) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Inicio' },
    { id: 'transactions', icon: Clock, label: 'Transacciones' },
    { id: 'collect', icon: QrCode, label: 'Cobrar', isSpecial: true },
    { id: 'bank', icon: Building2, label: 'Banco' },
    { id: 'notifications', icon: Bell, label: 'Notificaciones' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex items-center justify-around relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            if (item.isSpecial) {
              return (
                <button
                  key={item.id}
                  onClick={() => onCollectClick?.()}
                  className="flex flex-col items-center -mt-6"
                >
                  <div className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors bg-[#049944]">
                    <Icon size={24} className="text-white" />
                  </div>
                  <span className="text-xs text-gray-700 mt-1">{item.label}</span>
                </button>
              );
            }
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'bank') {
                    onBankClick?.();
                  } else if (item.id === 'transactions') {
                    onTransactionsClick?.();
                  } else if (item.id === 'notifications') {
                    onNotificationsClick?.();
                  } else {
                    onTabChange(item.id);
                  }
                }}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={22} />
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}