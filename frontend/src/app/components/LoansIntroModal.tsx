import { X, ShoppingCart, TrendingUp, Building2, Briefcase, Home, GraduationCap, Stethoscope, Wrench, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LoansIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  pendingLoan?: {
    id: string;
    fullName: string;
    loanAmount: number;
    term: number;
    monthlyPayment: number;
    status: 'pending' | 'approved' | 'rejected';
    applicationDate: string;
  };
}

export function LoansIntroModal({ isOpen, onClose, onContinue, pendingLoan }: LoansIntroModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Check localStorage for intro preference
  const getInitialView = () => {
    try {
      const hideIntro = localStorage.getItem('woz_loans_hide_intro');
      return hideIntro === 'true';
    } catch {
      return false;
    }
  };

  // Reset checkbox when modal opens
  useEffect(() => {
    if (isOpen) {
      setDontShowAgain(false);
      // If user has set to hide intro and there's no pending loan, auto-continue
      if (getInitialView() && !pendingLoan) {
        onContinue();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, pendingLoan]);

  const handleContinue = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('woz_loans_hide_intro', 'true');
      } catch (error) {
        console.error('Error saving preference:', error);
      }
    }
    onContinue();
  };

  if (!isOpen) return null;

  // Si hay un préstamo pendiente, mostrar el estado
  if (pendingLoan) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold mb-2">
              Tu Solicitud de Préstamo
            </h2>
            <p className="text-blue-100 text-sm">
              Estado actual de tu préstamo
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-amber-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Solicitud Pendiente de Aprobación
              </h3>
              
              <p className="text-sm text-gray-600">
                Tu solicitud está siendo evaluada por nuestro equipo
              </p>
            </div>

            {/* Detalles del Préstamo */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
              <h4 className="text-sm font-bold text-gray-700 mb-3">Detalles de tu solicitud</h4>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Monto solicitado</span>
                <span className="text-sm font-bold text-gray-900">
                  {pendingLoan.loanAmount.toLocaleString('es-PY')} Gs
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Plazo</span>
                <span className="text-sm font-bold text-gray-900">{pendingLoan.term} meses</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Cuota mensual</span>
                <span className="text-sm font-bold text-gray-900">
                  {pendingLoan.monthlyPayment.toLocaleString('es-PY')} Gs
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Fecha de solicitud</span>
                <span className="text-sm font-bold text-gray-900">
                  {new Date(pendingLoan.applicationDate).toLocaleDateString('es-PY', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            </div>

            {/* Información */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-900 leading-relaxed">
                <span className="font-semibold">Te notificaremos pronto:</span> Recibirás una notificación por WhatsApp y correo electrónico cuando tu solicitud sea aprobada. El proceso toma entre <span className="font-semibold">24 a 48 horas hábiles</span>.
              </p>
            </div>

            {/* Nota adicional */}
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs text-amber-900 leading-relaxed">
                <span className="font-semibold">Importante:</span> No puedes solicitar otro préstamo mientras tengas una solicitud pendiente. Espera la respuesta de tu solicitud actual.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const loanCategories = [
    {
      icon: ShoppingCart,
      title: 'Préstamos de Consumo',
      subtitle: 'Para gastos personales, compras y necesidades del día a día',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: TrendingUp,
      title: 'Préstamos para Proyectos',
      subtitle: 'Financia tus emprendimientos y nuevos proyectos personales',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Building2,
      title: 'Préstamos para Inversiones',
      subtitle: 'Invierte en propiedades, vehículos y activos que generen valor',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Briefcase,
      title: 'Capital Operativo',
      subtitle: 'Mantén tu negocio funcionando con capital de trabajo',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: Home,
      title: 'Préstamos Hipotecarios',
      subtitle: 'Adquiere o mejora tu vivienda con tasas preferenciales',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      icon: GraduationCap,
      title: 'Préstamos Educativos',
      subtitle: 'Invierte en tu educación y la de tu familia',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    },
    {
      icon: Stethoscope,
      title: 'Préstamos de Salud',
      subtitle: 'Financia tratamientos médicos y procedimientos de salud',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      icon: Wrench,
      title: 'Préstamos para Mejoras',
      subtitle: 'Remodela, repara o mejora tu hogar o negocio',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          
          <h2 className="text-2xl font-bold mb-2">
            Préstamos Woz Payments
          </h2>
          <p className="text-blue-100 text-sm">
            Soluciones financieras para cada necesidad de tu vida
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-blue-900 leading-relaxed">
              <span className="font-semibold">Hasta 600.000.000 Gs</span> a sola firma, con tasas competitivas del <span className="font-semibold">8% anual</span> y plazos de hasta <span className="font-semibold">60 meses</span>.
            </p>
          </div>

          <h3 className="font-bold text-gray-900 text-base mb-3">
            Categorías disponibles
          </h3>

          {loanCategories.map((category, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <div className={`${category.bgColor} rounded-xl p-3 flex-shrink-0`}>
                <category.icon size={24} className={category.color} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm mb-1">
                  {category.title}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {category.subtitle}
                </p>
              </div>
            </div>
          ))}

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
            <p className="text-xs text-amber-900 leading-relaxed">
              <span className="font-semibold">Importante:</span> Los préstamos están sujetos a aprobación crediticia. La tasa de interés puede variar según el análisis de riesgo.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-3">
          <label className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm text-gray-700">No volver a mostrar este mensaje</span>
          </label>

          <button
            onClick={handleContinue}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            Solicitar préstamo
          </button>
        </div>
      </div>
    </div>
  );
}