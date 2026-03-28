import { useState } from 'react';
import { X, Crown, Zap, Check, Lock, ArrowRight } from 'lucide-react';
import { MembershipTier, membershipProfiles, MembershipProfile } from '../types/membership';

interface MembershipSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  currentMembership: MembershipTier;
  onChangeMembership: (tier: MembershipTier) => void;
}

export function MembershipSwitcher({ isOpen, onClose, currentMembership, onChangeMembership }: MembershipSwitcherProps) {
  const [selectedTier, setSelectedTier] = useState<MembershipTier>(currentMembership);

  if (!isOpen) return null;

  const currentProfile = membershipProfiles[currentMembership];
  const profiles: MembershipProfile[] = [
    membershipProfiles.gratuito,
    membershipProfiles.basico,
    membershipProfiles.regular,
    membershipProfiles['emprendedor-business'],
  ];

  const handleConfirm = () => {
    if (selectedTier !== currentMembership) {
      onChangeMembership(selectedTier);
    }
    onClose();
  };

  const getPlanIcon = (iconType: 'crown' | 'zap') => {
    return iconType === 'crown' ? <Crown size={18} /> : <Zap size={18} />;
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-blue-600 border-b border-blue-700 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown size={20} className="text-white" />
          <h2 className="text-lg font-semibold text-white">Cambiar membresía</h2>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full hover:bg-blue-700 flex items-center justify-center transition-colors"
        >
          <X size={20} className="text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        
      </div>

      {/* Botón fijo inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10">
        <div className="max-w-lg mx-auto flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedTier === currentMembership}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {selectedTier === currentMembership ? 'Sin cambios' : 'Confirmar cambio'}
            {selectedTier !== currentMembership && <ArrowRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
