import { LucideIcon, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface BadgeConfig {
  icon: LucideIcon;
  text: string;
  color: string;
  bgColor: string;
}

interface FinancialProductCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  value?: string;
  onClick?: () => void;
  iconColor?: string;
  bgColor?: string;
  accentColor?: string;
  showCopyIcon?: boolean;
  badge?: BadgeConfig;
}

export function FinancialProductCard({
  icon: Icon,
  title,
  subtitle,
  value,
  onClick,
  iconColor = 'text-blue-600',
  bgColor = 'bg-blue-50',
  accentColor = 'text-blue-600',
  showCopyIcon = false,
  badge
}: FinancialProductCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value) {
      // Extraer solo el número de cuenta del valor (remover "N° ")
      const accountNumber = value.replace('N° ', '');
      navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all text-left w-full cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}>
          <Icon size={20} className={iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
            {badge && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${badge.bgColor} flex-shrink-0`}>
                <badge.icon size={12} className={badge.color} />
                <span className={`text-xs font-semibold ${badge.color}`}>
                  {badge.text}
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">{subtitle}</p>
          {value && (
            <div className="mt-2.5 flex items-center justify-between">
              <p className={`font-bold ${accentColor} text-sm`}>
                {value}
              </p>
              {showCopyIcon && (
                <button
                  onClick={handleCopy}
                  className={`ml-2 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    copied 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                  title={copied ? 'Copiado' : 'Copiar número de cuenta'}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}