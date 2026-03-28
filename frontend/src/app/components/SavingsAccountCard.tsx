import { Wallet, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { MembershipTier } from '../types/membership';
import { getMembershipColors } from '../utils/membershipColors';

interface SavingsAccountCardProps {
  accountNumber: string;
  balanceGs: number;
  balanceUsd: number;
  showUsd: boolean;
  activeMembership: MembershipTier;
}

export function SavingsAccountCard({ 
  accountNumber, 
  balanceGs, 
  balanceUsd,
  showUsd,
  activeMembership
}: SavingsAccountCardProps) {
  const [copied, setCopied] = useState(false);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-PY').format(num);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const colors = getMembershipColors(activeMembership);

  return (
    <div className={`relative bg-gradient-to-br ${colors.gradient} rounded-2xl p-5 text-white overflow-hidden shadow-lg`}>
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
      
      <div className="relative z-10">
        {/* Header con icono */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Wallet size={16} className="text-white" />
          </div>
          <span className="text-xs text-white/80">Saldo disponible</span>
        </div>

        {/* Balance principal */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {!showUsd ? formatNumber(balanceGs) : formatNumber(balanceUsd)}
            </span>
            <span className="text-lg font-medium text-white/90">
              {!showUsd ? 'Gs' : 'USD'}
            </span>
          </div>
        </div>

        {/* Footer con número de cuenta */}
        <div className="flex items-center justify-between pt-3 border-t border-white/20">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/70">N°</span>
            <span className="text-xs font-medium text-white/90">{accountNumber}</span>
          </div>
          
          <button
            onClick={handleCopy}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              copied 
                ? 'bg-green-500 text-white' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            title={copied ? 'Copiado' : 'Copiar número de cuenta'}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}