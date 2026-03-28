import { useState } from 'react';
import { ArrowLeft, Crown, Link, QrCode, Percent, Clock, CheckCircle2, Zap, Calendar, Gift, Sparkles, Banknote, CreditCard, Copy, Phone, ArrowRight } from 'lucide-react';

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToMemberships?: () => void;
}

interface MembershipPlan {
  id: string;
  name: string;
  annualCost: number;
  currency: 'GS' | 'USD';
  color: string;
  iconType: 'crown' | 'zap' | 'gift';
  badge?: string;
  paymentUrl?: string;
  features: {
    accounts: string[];
    linksQrs: {
      limit: string;
      maxPerLink: string;
      monthlyLimit?: string;
    };
    commission: string;
    loans?: string;
    extras?: string[];
  };
}

const membershipPlans: MembershipPlan[] = [
  // Plan Gratuito eliminado de la lista visible
  {
    id: 'basico',
    name: 'Básico',
    annualCost: 250000,
    currency: 'GS',
    color: 'from-gray-600 to-gray-700',
    iconType: 'crown',
    paymentUrl: 'https://link.wozpay.com/basico',
    features: {
      accounts: ['Cuenta básica en GS y USD'],
      linksQrs: {
        limit: 'Hasta 20 links y QRs',
        maxPerLink: 'Hasta 1.000.000 por link',
      },
      commission: '12%',
    }
  },
  {
    id: 'emprendedor-regular',
    name: 'Emprendedor Regular',
    annualCost: 600000,
    currency: 'GS',
    color: 'from-blue-600 to-blue-700',
    iconType: 'zap',
    badge: 'POPULAR',
    paymentUrl: 'https://link.wozpay.com/regular',
    features: {
      accounts: ['Cuenta corriente en USD'],
      linksQrs: {
        limit: 'Hasta 30 links y QRs por mes',
        maxPerLink: 'Hasta 1.000 USD por link o QR',
        monthlyLimit: 'Hasta 30.000 USD mensual',
      },
      commission: '6,5%',
      loans: 'Préstamos hasta 200 millones',
    }
  },
  {
    id: 'emprendedor-business',
    name: 'Emprendedor Business',
    annualCost: 1500000,
    currency: 'GS',
    color: 'from-amber-600 to-amber-700',
    iconType: 'crown',
    badge: 'PREMIUM',
    paymentUrl: 'https://link.wozpay.com/business',
    features: {
      accounts: ['Cuenta corriente en USD', 'Tarjeta de crédito de 2.000 USD oro'],
      linksQrs: {
        limit: 'Links y QRs ilimitados',
        maxPerLink: 'Hasta 20.000 USD por link o QR',
        monthlyLimit: 'Hasta 1.000.000 USD por transacción mensual',
      },
      commission: '3,9%',
      loans: 'Préstamos hasta 600 millones',
      extras: [
        'Más de 200 monedas',
        'Acreditación en 24 hs',
        'Botón Woz Pay API',
        'Integración Shopify',
        'Integración Woocommerce',
        'Miles de tiendas más'
      ]
    }
  }
];

const getPlanIcon = (iconType: 'crown' | 'zap' | 'gift') => {
  if (iconType === 'crown') return <Crown size={16} className="text-blue-600" />;
  if (iconType === 'zap') return <Zap size={16} className="text-blue-600" />;
  return <Gift size={16} className="text-blue-600" />;
};

export function MembershipModal({ isOpen, onClose, onNavigateToMemberships }: MembershipModalProps) {
  const [view, setView] = useState<'list' | 'payment'>('list');
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSelectPlan = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    setView('payment');
  };

  const handleBack = () => {
    if (view === 'payment') {
      setView('list');
      setSelectedPlan(null);
    } else {
      onClose();
    }
  };

  const handleCopyAlias = () => {
    navigator.clipboard.writeText('0983994268');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toLocaleString('es-PY')} ${currency}`;
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header fijo */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-4 flex items-center gap-3 flex-shrink-0">
        <button 
          onClick={handleBack} 
          className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <Crown size={20} />
        <h1 className="font-bold text-base">
          {view === 'payment' ? 'Método de pago' : 'Membresías'}
        </h1>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto bg-gray-50 pb-6">
        <div className="max-w-md mx-auto">
          
          {view === 'list' ? (
            <>
              {/* Intro */}
              <div className="bg-white px-5 py-5 border-b border-gray-200">
                <h2 className="font-bold text-base text-gray-900 mb-1">Potencia tu negocio</h2>
                <p className="text-xs text-gray-600">Elige el plan que mejor se adapte a tus necesidades.</p>
              </div>

              {/* Lista de planes */}
              <div className="bg-white">
                {membershipPlans.map((plan, index) => (
                  <div 
                    key={plan.id}
                    className={`px-5 py-5 ${index !== membershipPlans.length - 1 ? 'border-b border-gray-200' : ''}`}
                  >
                    {/* Header del plan */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          {getPlanIcon(plan.iconType)}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-gray-900">{plan.name}</h3>
                          <p className="text-[11px] text-gray-500">
                            {plan.annualCost === 0 ? 'Gratis' : `${formatAmount(plan.annualCost, plan.currency)}/año`}
                          </p>
                        </div>
                      </div>
                      {plan.badge && (
                        <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[9px] font-bold">
                          {plan.badge}
                        </div>
                      )}
                    </div>

                    {/* Características - Todo en una lista */}
                    <div className="space-y-2 mb-4">
                      {plan.features.accounts.map((account, idx) => (
                        <div key={`account-${idx}`} className="flex items-start gap-2">
                          <CheckCircle2 size={12} className="text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-700">{account}</p>
                        </div>
                      ))}
                      
                      <div className="flex items-start gap-2">
                        <CheckCircle2 size={12} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-700">{plan.features.linksQrs.limit}</p>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <CheckCircle2 size={12} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-700">{plan.features.linksQrs.maxPerLink}</p>
                      </div>
                      
                      {plan.features.linksQrs.monthlyLimit && (
                        <div className="flex items-start gap-2">
                          <CheckCircle2 size={12} className="text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-700">{plan.features.linksQrs.monthlyLimit}</p>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-2">
                        <CheckCircle2 size={12} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-700">Comisión: {plan.features.commission}</p>
                      </div>
                      
                      {plan.features.loans && (
                        <div className="flex items-start gap-2">
                          <CheckCircle2 size={12} className="text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-700">{plan.features.loans}</p>
                        </div>
                      )}
                      
                      {plan.features.extras && plan.features.extras.map((extra, idx) => (
                        <div key={`extra-${idx}`} className="flex items-start gap-2">
                          <CheckCircle2 size={12} className="text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-700">{extra}</p>
                        </div>
                      ))}
                    </div>

                    {/* Botón de acción */}
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className="w-full py-3 rounded-lg text-xs font-bold transition-all bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Elegir plan
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            selectedPlan && (
              <div className="p-5 space-y-6">
                {/* Resumen del plan */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{selectedPlan.name}</h3>
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">
                      {formatAmount(selectedPlan.annualCost, selectedPlan.currency)}/año
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Selecciona cómo deseas realizar el pago de tu membresía.</p>
                </div>

                {/* Opción 1: Transferencia */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <Banknote size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">Transferencia Bancaria</h3>
                      <p className="text-xs text-gray-500">Sudameris Bank</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Alias</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-bold text-gray-900">0983-994-268</span>
                        <button 
                          onClick={handleCopyAlias}
                          className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"
                        >
                          {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mb-4">
                    Una vez realizada la transferencia, por favor envía el comprobante a nuestro WhatsApp para activar tu plan.
                  </p>

                  <a 
                    href={`https://wa.me/595983994268?text=Hola,%20adjunto%20comprobante%20para%20activar%20plan%20${encodeURIComponent(selectedPlan.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-600 text-white py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                  >
                    <Phone size={16} />
                    Enviar comprobante por WhatsApp
                  </a>
                </div>

                {/* Separador */}
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">O</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                {/* Opción 2: Tarjeta / Woz Payments */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">Pago con Woz Payments</h3>
                      <p className="text-xs text-gray-500">Tarjeta de Crédito / Débito</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mb-4">
                    Paga de forma segura y al instante con tu tarjeta a través de nuestra pasarela de pagos.
                  </p>

                  <button
                    onClick={() => {
                      if (selectedPlan.paymentUrl) {
                        window.open(selectedPlan.paymentUrl, '_blank');
                      }
                    }}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    <Link size={16} />
                    Pagar con tarjeta
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}