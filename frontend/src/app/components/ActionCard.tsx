import { LucideIcon } from 'lucide-react';

interface ActionCardProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  iconColor?: string;
  bgColor?: string;
}

export function ActionCard({ 
  icon: Icon, 
  label, 
  onClick, 
  disabled = false, 
  iconColor = 'text-blue-600',
  bgColor = 'bg-blue-50'
}: ActionCardProps) {
  const handleClick = () => {
    if (disabled) return;
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`bg-white rounded-xl p-2.5 shadow-sm border border-gray-100 transition-all flex flex-col items-center justify-center gap-1.5 aspect-square w-full h-full ${ 
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:shadow-md hover:border-blue-200'
      }`}
    >
      <div className={`w-9 h-9 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} className={iconColor} />
      </div>
      <span className="text-[10px] text-center text-gray-700 font-medium leading-tight line-clamp-2 min-h-[28px] flex items-center">{label}</span>
    </button>
  );
}