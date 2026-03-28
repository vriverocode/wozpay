import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { 
  ArrowLeft, 
  Crown,
  Zap,
  CheckCircle2,
  AlertCircle,
  Shield,
  Lock
} from 'lucide-react';

interface MembershipPlan {
  id: string;
  name: string;
  annualCost: number;
  currency: 'GS' | 'USD';
  color: string;
  iconType: 'crown' | 'zap';
}

const membershipPlans: Record<string, MembershipPlan> = {
  'basico': {
    id: 'basico',
    name: 'Básico',
    annualCost: 250000,
    currency: 'GS',
    color: 'from-gray-600 to-gray-700',
    iconType: 'crown'
  },
  'emprendedor-regular': {
    id: 'emprendedor-regular',
    name: 'Emprendedor Regular',
    annualCost: 600000,
    currency: 'GS',
    color: 'from-blue-600 to-blue-700',
    iconType: 'zap'
  },
  'emprendedor-business': {
    id: 'emprendedor-business',
    name: 'Emprendedor Business',
    annualCost: 1500000,
    currency: 'GS',
    color: 'from-amber-600 to-amber-700',
    iconType: 'crown'
  }
};

const getPlanIcon = (iconType: 'crown' | 'zap') => {
  return iconType === 'crown' ? <Crown size={20} /> : <Zap size={20} />;
};

export default function MembershipCheckoutPage() {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const plan = planId ? membershipPlans[planId] : null;

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-600 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">Plan no encontrado</p>
          <button 
            onClick={() => navigate('/memberships')}
            className="mt-4 text-blue-600 text-sm font-medium"
          >
            Volver a membresías
          </button>
        </div>
      </div>
    );
  }

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toLocaleString('es-PY')} ${currency}`;
  };

  const handleConfirmPurchase = async () => {
    setProcessing(true);
    
    // Simular procesamiento de pago
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setProcessing(false);
    setSuccess(true);
    
    // Redirigir después de mostrar éxito
    setTimeout(() => {
      navigate('/');
    }, 2500);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">¡Compra exitosa!</h2>
          <p className="text-sm text-gray-600 mb-4">
            Tu membresía <span className="font-semibold">{plan.name}</span> ha sido activada correctamente.
          </p>
          <div className="bg-white rounded-xl px-5 py-4 border border-green-200">
            <p className="text-xs text-gray-500 mb-1">Monto procesado</p>
            <p className="text-2xl font-bold text-gray-900">{formatAmount(plan.annualCost, plan.currency)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header fijo */}
      <div className="bg-white text-gray-900 px-5 py-4 flex items-center gap-3 flex-shrink-0 sticky top-0 z-10 shadow-sm border-b border-gray-200">
        <button 
          onClick={() => navigate('/memberships')} 
          className="text-gray-700 hover:bg-gray-100 rounded-full p-1 transition-colors"
          disabled={processing}
        >
          <ArrowLeft size={24} />
        </button>
        <Lock size={18} className="text-gray-600" />
        <h1 className="font-bold text-base">Checkout seguro</h1>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="max-w-md mx-auto">
          
          {/* Mensaje de seguridad */}
          <div className="bg-blue-50 border-b border-blue-100 px-5 py-3">
            <div className="flex items-start gap-2">
              <Shield size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-800">
                Transacción protegida por Woz Payments. Tus datos están encriptados.
              </p>
            </div>
          </div>

          <div className="h-6" />

          {/* Resumen del plan */}
          <div className="px-5">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              
              {/* Header del plan */}
              <div className={`bg-gradient-to-r ${plan.color} text-white px-6 py-5`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    {getPlanIcon(plan.iconType)}
                  </div>
                  <div>
                    <p className="text-xs text-white/70 mb-1">Plan seleccionado</p>
                    <h2 className="font-bold text-lg">{plan.name}</h2>
                  </div>
                </div>
              </div>

              {/* Detalles del pago */}
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Frecuencia de pago</p>
                  <p className="text-sm font-medium text-gray-900">Anual</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="text-sm font-medium text-gray-900">{formatAmount(plan.annualCost, plan.currency)}</p>
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-gray-600">IVA (incluido)</p>
                    <p className="text-sm font-medium text-gray-900">0 {plan.currency}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-bold text-gray-900">Total a pagar</p>
                    <p className="text-xl font-bold text-gray-900">{formatAmount(plan.annualCost, plan.currency)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-6" />

          {/* Método de pago */}
          <div className="px-5">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm p-6">
              <h3 className="font-bold text-sm text-gray-900 mb-4">Método de pago</h3>
              
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-white/70 mb-1">Saldo en Woz Wallet</p>
                    <p className="text-2xl font-bold">2.450.000 GS</p>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Shield size={20} />
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                  <CheckCircle2 size={14} />
                  <p className="text-xs">Saldo suficiente</p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-6" />

          {/* Términos */}
          <div className="px-5">
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-xs text-amber-900 leading-relaxed">
                Al confirmar la compra, aceptas los términos y condiciones de la membresía. 
                El cargo se realizará de forma anual y se renovará automáticamente.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botón fijo inferior */}
      <div className="bg-white border-t border-gray-200 px-5 py-4 flex-shrink-0 shadow-lg">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleConfirmPurchase}
            disabled={processing}
            className={`w-full bg-gradient-to-r ${plan.color} text-white py-4 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {processing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Procesando...</span>
              </div>
            ) : (
              'Confirmar compra'
            )}
          </button>
          <p className="text-center text-xs text-gray-500 mt-3">
            <Lock size={10} className="inline mr-1" />
            Pago seguro procesado por Woz Payments
          </p>
        </div>
      </div>
    </div>
  );
}