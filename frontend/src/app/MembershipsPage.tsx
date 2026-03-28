import { useNavigate } from 'react-router';
import { 
  ArrowLeft, 
  Crown, 
  Link, 
  QrCode, 
  Percent, 
  CheckCircle2, 
  CreditCard,
  Banknote,
  Globe,
  Zap,
  Clock,
  Code,
  ShoppingBag,
  Store
} from 'lucide-react';

interface MembershipPlan {
  id: string;
  name: string;
  annualCost: number;
  currency: 'GS' | 'USD';
  color: string;
  iconType: 'crown' | 'zap';
  badge?: string;
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
  {
    id: 'gratuito',
    name: 'Gratuito',
    annualCost: 0,
    currency: 'GS',
    color: 'from-slate-500 to-slate-600',
    iconType: 'zap',
    features: {
      accounts: ['Cuenta básica en GS'],
      linksQrs: {
        limit: 'Hasta 5 links y QRs',
        maxPerLink: 'Hasta 500.000 por link',
      },
      commission: '15%',
    }
  },
  {
    id: 'basico',
    name: 'Básico',
    annualCost: 250000,
    currency: 'GS',
    color: 'from-gray-600 to-gray-700',
    iconType: 'crown',
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

const getPlanIcon = (iconType: 'crown' | 'zap') => {
  return iconType === 'crown' ? <Crown size={20} /> : <Zap size={20} />;
};

export default function MembershipsPage() {
  const navigate = useNavigate();

  const handleSelectPlan = (planId: string) => {
    navigate(`/membership/checkout/${planId}`);
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toLocaleString('es-PY')} ${currency}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header fijo */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-4 flex items-center gap-3 flex-shrink-0 sticky top-0 z-10 shadow-md">
        <button 
          onClick={() => navigate('/')} 
          className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <Crown size={20} />
        <h1 className="font-bold text-base">Membresías</h1>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="max-w-md mx-auto">
          
          {/* Intro */}
          <div className="bg-white px-5 py-6 border-b border-gray-200">
            <h2 className="font-bold text-lg text-gray-900 mb-2">Potencia tu negocio</h2>
            <p className="text-sm text-gray-600">Elige el plan que mejor se adapte a tus necesidades y lleva tu emprendimiento al siguiente nivel.</p>
          </div>

          {/* Espaciado */}
          <div className="h-6" />

          {/* Lista de planes */}
          <div className="px-5 space-y-6">
            {membershipPlans.map((plan) => (
              <div 
                key={plan.id}
                className={`rounded-2xl p-1 ${
                  plan.id === 'gratuito' 
                    ? 'border-2 border-green-500 bg-green-50/30' 
                    : 'border border-gray-300/50 bg-transparent'
                }`}
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                  {/* Header del plan con gradiente */}
                  <div className={`bg-gradient-to-r ${plan.color} text-white px-6 py-5 relative`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          {getPlanIcon(plan.iconType)}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{plan.name}</h3>
                          <p className="text-xs text-white/80">Plan anual</p>
                        </div>
                      </div>
                      {plan.badge && (
                        <div className="bg-white/25 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-bold">
                          {plan.badge}
                        </div>
                      )}
                    </div>
                    
                    {/* Precio */}
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <p className="text-3xl font-bold">{formatAmount(plan.annualCost, plan.currency)}</p>
                      <p className="text-xs text-white/80">por año</p>
                    </div>
                  </div>

                  {/* Características */}
                  <div className="p-6 space-y-5">
                    {/* Cuentas */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Banknote size={14} className="text-blue-700" />
                        </div>
                        <p className="font-bold text-sm text-gray-900">Cuentas</p>
                      </div>
                      <div className="ml-9 space-y-2">
                        {plan.features.accounts.map((account, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-gray-700">{account}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Links y QRs */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                          <QrCode size={14} className="text-purple-700" />
                        </div>
                        <p className="font-bold text-sm text-gray-900">Links y QRs de cobro</p>
                      </div>
                      <div className="ml-9 space-y-2">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-700">{plan.features.linksQrs.limit}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-700">{plan.features.linksQrs.maxPerLink}</p>
                        </div>
                        {plan.features.linksQrs.monthlyLimit && (
                          <div className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-gray-700">{plan.features.linksQrs.monthlyLimit}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Comisión */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                          <Percent size={14} className="text-amber-700" />
                        </div>
                        <p className="font-bold text-sm text-gray-900">Comisión por transacción</p>
                      </div>
                      <div className="ml-9 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                        <p className="text-lg font-bold text-amber-900">{plan.features.commission}</p>
                      </div>
                    </div>

                    {/* Préstamos */}
                    {plan.features.loans && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                            <CreditCard size={14} className="text-green-700" />
                          </div>
                          <p className="font-bold text-sm text-gray-900">Préstamos</p>
                        </div>
                        <div className="ml-9 flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-700">{plan.features.loans}</p>
                        </div>
                      </div>
                    )}

                    {/* Extras */}
                    {plan.features.extras && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <Zap size={14} className="text-indigo-700" />
                          </div>
                          <p className="font-bold text-sm text-gray-900">Características adicionales</p>
                        </div>
                        <div className="ml-9 space-y-2">
                          {plan.features.extras.map((extra, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle2 size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-gray-700">{extra}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botón de acción */}
                  <div className="px-6 pb-6">
                    {plan.id === 'gratuito' ? (
                      <div className="w-full bg-green-100 border-2 border-green-500 text-green-700 py-4 rounded-xl font-bold text-sm text-center">
                        Plan actual
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSelectPlan(plan.id)}
                        className={`w-full bg-gradient-to-r ${plan.color} text-white py-4 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-md hover:shadow-lg`}
                      >
                        Elegir plan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}