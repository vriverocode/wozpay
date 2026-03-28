import { Crown, X } from 'lucide-react';

interface MembershipRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  onViewPlans: () => void;
}

export function MembershipRequiredModal({ 
  isOpen, 
  onClose, 
  featureName,
  onViewPlans 
}: MembershipRequiredModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-8 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <Crown size={32} className="text-white" />
            </div>
            <h2 className="text-lg font-bold">Función Premium</h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 text-center">
          <p className="text-gray-900 font-semibold mb-2">
            Para habilitar la función
          </p>
          <p className="text-blue-600 font-bold text-lg mb-4">
            "{featureName}"
          </p>
          <p className="text-gray-600 text-sm mb-6">
            debes escoger una membresía premium con más beneficios para tu negocio.
          </p>

          {/* Features preview */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs font-semibold text-blue-900 mb-3">Con una membresía premium tendrás:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-xs text-gray-700">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                <span>Más links y QRs por mes</span>
              </li>
              <li className="flex items-start gap-2 text-xs text-gray-700">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                <span>Comisiones más bajas</span>
              </li>
              <li className="flex items-start gap-2 text-xs text-gray-700">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                <span>Acceso a productos financieros</span>
              </li>
              <li className="flex items-start gap-2 text-xs text-gray-700">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                <span>Soporte prioritario</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={onViewPlans}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
            >
              Ver planes de membresía
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              Ahora no
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
