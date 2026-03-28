import { useState } from 'react';
import {
  X, Phone, MessageCircle, Share2, Target, Users, CheckCircle2,
  Star, Package, BookOpen, ShoppingCart, Repeat, Globe, Truck,
  Briefcase, ArrowRight, Zap, Shield, Award, ChevronDown,
  TrendingUp, BarChart2, Headphones, MessageSquare
} from 'lucide-react';

interface CapitalMarketsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLANS = [
  {
    name: 'Starter',
    price: '5',
    desc: 'Para negocios que recién empiezan',
    popular: false,
    features: [
      '1 vendedor asignado',
      'Gestión básica de ventas',
      'Contacto por mensajes y llamadas',
      'Reportes mensuales',
      'Comisión 10% si se alcanza la meta',
    ],
  },
  {
    name: 'Grow',
    price: '9,99',
    desc: 'El más elegido por emprendedores',
    popular: true,
    features: [
      '10 vendedores asignados',
      'Seguimiento semanal',
      'Optimización comercial activa',
      'Gestión multicanal completa',
      'Comisión 10% por meta alcanzada',
    ],
  },
  {
    name: 'Scale',
    price: '12',
    desc: 'Para negocios en expansión',
    popular: false,
    features: [
      '15 vendedores asignados',
      'Supervisor de campaña incluido',
      'Seguimiento intensivo diario',
      'Prioridad en campañas activas',
      'Comisión 10% por meta alcanzada',
    ],
  },
];

const STEPS = [
  { num: '01', title: 'Cargás tu negocio o producto', desc: 'Nos contás qué vendés, a quién y cuánto vale. En minutos tenemos toda la info.' },
  { num: '02', title: 'Definís tu meta de ventas', desc: 'Establecés el objetivo en USD o Gs. Nosotros trabajamos para alcanzarlo.' },
  { num: '03', title: 'Elegís la cantidad de vendedores', desc: 'Más vendedores = más velocidad. Vos decidís la potencia de tu equipo.' },
  { num: '04', title: 'Nosotros vendemos y cobramos 10% solo si alcanzamos la meta', desc: 'Sin resultados, no cobramos comisión. Así de simple.' },
];

const CATEGORIES = [
  { icon: Package, label: 'Productos físicos' },
  { icon: Briefcase, label: 'Servicios' },
  { icon: BookOpen, label: 'Cursos' },
  { icon: ShoppingCart, label: 'Ecommerce' },
  { icon: Repeat, label: 'Suscripciones' },
  { icon: Globe, label: 'Negocios digitales' },
  { icon: Truck, label: 'Dropshipping' },
];

const CHANNELS = [
  { icon: Phone, label: 'Llamadas', color: 'bg-blue-500' },
  { icon: MessageCircle, label: 'WhatsApp', color: 'bg-green-500' },
  { icon: Share2, label: 'Redes sociales', color: 'bg-purple-500' },
  { icon: Target, label: 'Meta alcanzada', color: 'bg-orange-500' },
];

const initialForm = {
  businessName: '',
  businessType: '',
  country: '',
  whatSells: '',
  avgPrice: '',
  salesGoal: '',
  sellers: '',
  duration: '',
  paymentMethod: '',
};

export function CapitalMarketsModal({ isOpen, onClose }: CapitalMarketsModalProps) {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('Grow');

  if (!isOpen) return null;

  const handleField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const scrollToForm = () => {
    document.getElementById('woz-seller-form')?.scrollIntoView({ behavior: 'smooth' });
  };
  const scrollToPlans = () => {
    document.getElementById('woz-seller-plans')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto">
      <div className="relative w-full max-w-5xl mx-auto min-h-screen bg-white shadow-2xl">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-[60] bg-white/90 border border-gray-200 backdrop-blur-sm text-gray-700 rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
        >
          <X size={18} />
        </button>

        {/* ─── HERO ──────────────────────────────────────────────── */}
        <section className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 text-white overflow-hidden px-6 py-20 md:px-16 md:py-28">
          {/* Decorative blobs */}
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
            <Zap size={12} className="fill-current" /> Contact Center Virtual
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 max-w-3xl">
            Multiplicá tu fuerza<br className="hidden md:block" /> de ventas sin{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">contratar empleados</span>
          </h1>

          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
            Con <strong className="text-white">Woz Seller</strong> asignamos vendedores reales que venden por vos mediante llamadas, mensajes y gestión directa hasta alcanzar tu meta.
          </p>

          <div className="flex flex-wrap gap-3 mb-14">
            <button
              onClick={scrollToForm}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2"
            >
              Empezar ahora <ArrowRight size={16} />
            </button>
            <button
              onClick={scrollToPlans}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-7 py-3.5 rounded-xl transition-all backdrop-blur-sm"
            >
              Ver planes
            </button>
          </div>

          {/* Channel indicators */}
          <div className="flex flex-wrap gap-3">
            {CHANNELS.map(ch => (
              <div key={ch.label} className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                <div className={`w-2 h-2 rounded-full ${ch.color} animate-pulse`} />
                <ch.icon size={13} className="text-gray-300" />
                <span className="text-xs font-semibold text-gray-200">{ch.label}</span>
              </div>
            ))}
          </div>

          {/* Commission badge */}
          <div className="absolute top-6 right-16 hidden md:flex flex-col items-center bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
            <span className="text-3xl font-black text-green-400">10%</span>
            <span className="text-[10px] text-gray-400 font-semibold mt-0.5">solo si logramos<br />tu meta</span>
          </div>
        </section>

        {/* ─── CÓMO FUNCIONA ─────────────────────────────────────── */}
        <section className="bg-gray-50 px-6 py-16 md:px-16">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-2">Proceso simple</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">¿Cómo funciona?</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">En 4 pasos tu negocio tiene un equipo de ventas activo trabajando para vos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {STEPS.map((step, i) => (
              <div key={i} className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-3 w-6 h-0.5 bg-gray-200 z-10" />
                )}
                <div className="text-4xl font-black text-gray-100 mb-3">{step.num}</div>
                <h3 className="text-sm font-bold text-gray-900 mb-2 leading-snug">{step.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                {i === 3 && (
                  <div className="mt-3 inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    <Shield size={9} /> Sin riesgo para vos
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ─── PLANES ─────────────────────────────────────────────── */}
        <section id="woz-seller-plans" className="bg-white px-6 py-16 md:px-16">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-2">Planes mensuales</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">Elegí tu plan</h2>
            <p className="text-gray-500 mt-3">Todos incluyen <strong className="text-gray-700">comisión del 10% solo si alcanzamos tu meta.</strong></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                onClick={() => setSelectedPlan(plan.name)}
                className={`relative rounded-2xl p-7 cursor-pointer transition-all border-2 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-gray-900 to-blue-950 text-white border-blue-600 shadow-2xl shadow-blue-900/30 scale-105'
                    : selectedPlan === plan.name
                    ? 'bg-white border-blue-400 shadow-lg'
                    : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-blue-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md">
                    <Star size={9} className="fill-current" /> MÁS POPULAR
                  </div>
                )}

                <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${plan.popular ? 'text-blue-300' : 'text-gray-400'}`}>
                  {plan.name}
                </div>
                <div className={`text-xs mb-4 ${plan.popular ? 'text-gray-400' : 'text-gray-500'}`}>{plan.desc}</div>

                <div className="flex items-end gap-1 mb-6">
                  <span className={`text-4xl font-black ${plan.popular ? 'text-white' : 'text-gray-900'}`}>${plan.price}</span>
                  <span className={`text-sm mb-1.5 ${plan.popular ? 'text-gray-400' : 'text-gray-500'}`}>/mes</span>
                </div>

                <ul className="space-y-2.5 mb-7">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 size={14} className={`flex-shrink-0 mt-0.5 ${plan.popular ? 'text-blue-400' : 'text-green-500'}`} />
                      <span className={`text-xs leading-snug ${plan.popular ? 'text-gray-300' : 'text-gray-600'}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedPlan(plan.name); scrollToForm(); }}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
                    plan.popular
                      ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                      : 'bg-gray-900 hover:bg-black text-white'
                  }`}
                >
                  Elegir {plan.name}
                </button>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            + 10% de comisión sobre ventas realizadas, <strong>únicamente si se alcanza la meta.</strong>
          </p>
        </section>

        {/* ─── QUÉ VENDEMOS ──────────────────────────────────────── */}
        <section className="bg-gray-50 px-6 py-16 md:px-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-2">Versatilidad total</p>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">¿Qué vendemos?</h2>
              <p className="text-gray-500 mt-3">Nuestro equipo está entrenado para cerrar ventas en cualquier categoría.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {CATEGORIES.map(cat => (
                <div key={cat.label} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col items-center gap-3 text-center hover:border-blue-300 hover:shadow-md transition-all group">
                  <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <cat.icon size={20} className="text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{cat.label}</span>
                </div>
              ))}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-5 flex flex-col items-center gap-3 text-center text-white">
                <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                  <Award size={20} className="text-white" />
                </div>
                <span className="text-xs font-bold">Y mucho más</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── DIFERENCIAL ───────────────────────────────────────── */}
        <section className="bg-gray-950 text-white px-6 py-16 md:px-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-black leading-tight mb-4">
                No te damos herramientas.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Te damos ventas.</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">Nuestro equipo vende directamente por vos. Sin excusas. Sin herramientas que aprender. Solo resultados.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: Phone, title: 'Llamadas directas', desc: 'Nuestros vendedores llaman a tus prospectos y cierran ventas por teléfono.' },
                { icon: MessageCircle, title: 'WhatsApp activo', desc: 'Gestión de conversaciones, seguimiento y cierre vía WhatsApp.' },
                { icon: Share2, title: 'Redes sociales', desc: 'Captamos leads en Instagram, Facebook y otras redes para convertirlos en ventas.' },
                { icon: TrendingUp, title: 'Seguimiento activo', desc: 'No dejamos ir a ningún prospecto. Seguimiento constante hasta el cierre.' },
                { icon: BarChart2, title: 'Cierre de ventas', desc: 'Equipo entrenado en técnicas de cierre consultivo y por resultados.' },
                { icon: Headphones, title: 'Soporte comercial', desc: 'Supervisor de campaña que garantiza el rendimiento del equipo.' },
              ].map(item => (
                <div key={item.title} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-colors">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                    <item.icon size={18} className="text-blue-400" />
                  </div>
                  <h3 className="font-bold text-sm text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-col md:flex-row items-center gap-6 bg-blue-600/20 border border-blue-500/30 rounded-2xl p-6">
              <div className="flex-1 text-center md:text-left">
                <p className="text-white font-bold text-lg mb-1">Solo cobramos el 10% si alcanzamos tu meta.</p>
                <p className="text-gray-400 text-sm">Sin resultados, no hay comisión. Sin riesgo para tu negocio.</p>
              </div>
              <button
                onClick={scrollToForm}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-7 py-3.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-blue-900/40"
              >
                Activar mi equipo <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>

        {/* ─── FORMULARIO ────────────────────────────────────────── */}
        <section id="woz-seller-form" className="bg-white px-6 py-16 md:px-16">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-2">Activá tu campaña</p>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">Activar mi equipo de ventas</h2>
              <p className="text-gray-500 mt-3 text-sm">Completá el formulario y te contactamos en menos de 24 horas.</p>
            </div>

            {submitted ? (
              <div className="text-center bg-green-50 border border-green-200 rounded-2xl p-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">¡Solicitud enviada!</h3>
                <p className="text-gray-600 text-sm max-w-sm mx-auto">Tu equipo Woz Seller estará activo en menos de 24 horas. Te contactaremos para confirmar los detalles.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-sm text-blue-600 font-semibold hover:underline"
                >
                  Enviar otra solicitud
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Plan seleccionado */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Plan seleccionado</p>
                    <p className="text-sm font-black text-gray-900 mt-0.5">{selectedPlan}</p>
                  </div>
                  <button
                    type="button"
                    onClick={scrollToPlans}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    Cambiar plan
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nombre del negocio */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Nombre del negocio *</label>
                    <input
                      required
                      type="text"
                      placeholder="Ej: Mi Tienda Online"
                      value={form.businessName}
                      onChange={e => handleField('businessName', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-300 transition-all"
                    />
                  </div>

                  {/* Tipo de negocio */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Tipo de negocio *</label>
                    <div className="relative">
                      <select
                        required
                        value={form.businessType}
                        onChange={e => handleField('businessType', e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all"
                      >
                        <option value="" disabled>Seleccioná una opción</option>
                        <option>Productos físicos</option>
                        <option>Servicios</option>
                        <option>Cursos / Infoproductos</option>
                        <option>Ecommerce</option>
                        <option>Suscripciones</option>
                        <option>Negocio digital</option>
                        <option>Dropshipping</option>
                        <option>Otro</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* País */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">País *</label>
                    <div className="relative">
                      <select
                        required
                        value={form.country}
                        onChange={e => handleField('country', e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all"
                      >
                        <option value="" disabled>Seleccioná tu país</option>
                        <option>Paraguay</option>
                        <option>Argentina</option>
                        <option>Uruguay</option>
                        <option>Bolivia</option>
                        <option>Brasil</option>
                        <option>Chile</option>
                        <option>Perú</option>
                        <option>México</option>
                        <option>Colombia</option>
                        <option>Otro</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Qué vende */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">¿Qué vendés u ofrecés? *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Describí brevemente tu producto o servicio..."
                      value={form.whatSells}
                      onChange={e => handleField('whatSells', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-300 transition-all resize-none"
                    />
                  </div>

                  {/* Precio promedio */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Precio promedio del producto/servicio *</label>
                    <input
                      required
                      type="text"
                      placeholder="Ej: USD 50 / Gs 350.000"
                      value={form.avgPrice}
                      onChange={e => handleField('avgPrice', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-300 transition-all"
                    />
                  </div>

                  {/* Meta de ventas */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Meta de ventas *</label>
                    <input
                      required
                      type="text"
                      placeholder="Ej: USD 2.000 / Gs 10.000.000"
                      value={form.salesGoal}
                      onChange={e => handleField('salesGoal', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-300 transition-all"
                    />
                  </div>

                  {/* Vendedores */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Cantidad de vendedores deseada *</label>
                    <div className="relative">
                      <select
                        required
                        value={form.sellers}
                        onChange={e => handleField('sellers', e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all"
                      >
                        <option value="" disabled>Seleccioná</option>
                        <option>1 vendedor (Plan Starter)</option>
                        <option>10 vendedores (Plan Grow)</option>
                        <option>15 vendedores (Plan Scale)</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Tiempo de campaña */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Tiempo de campaña *</label>
                    <div className="relative">
                      <select
                        required
                        value={form.duration}
                        onChange={e => handleField('duration', e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all"
                      >
                        <option value="" disabled>Seleccioná</option>
                        <option>1 mes</option>
                        <option>2 meses</option>
                        <option>3 meses</option>
                        <option>6 meses</option>
                        <option>Indefinido</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Método de pago */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-2">Método de pago *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Transferencia bancaria', 'Woz Pay'].map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => handleField('paymentMethod', method)}
                          className={`border-2 rounded-xl py-3.5 px-4 text-sm font-bold transition-all text-left flex items-center gap-2 ${
                            form.paymentMethod === method
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            form.paymentMethod === method ? 'border-blue-500' : 'border-gray-300'
                          }`}>
                            {form.paymentMethod === method && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                          </div>
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 text-base mt-2"
                >
                  <Users size={18} /> Activar mi equipo de ventas
                </button>

                <p className="text-center text-[11px] text-gray-400">
                  Al enviar aceptás nuestra política de comisión del 10% sobre ventas realizadas al alcanzar la meta.
                </p>
              </form>
            )}
          </div>
        </section>

        {/* ─── FOOTER ────────────────────────────────────────────── */}
        <footer className="bg-gray-950 text-gray-400 px-6 py-10 md:px-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                    <MessageSquare size={14} className="text-white" />
                  </div>
                  <span className="text-white font-black text-lg">Woz Seller</span>
                </div>
                <p className="text-xs text-gray-500 max-w-xs">Tu Contact Center Virtual. Vendemos por vos.</p>
              </div>
              <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-xs">
                <a href="#" className="hover:text-white transition-colors">Términos y condiciones</a>
                <a href="#" className="hover:text-white transition-colors">Política de privacidad</a>
                <a href="#" className="hover:text-white transition-colors">Política de comisión</a>
                <a href="#" className="hover:text-white transition-colors">Contacto</a>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <p className="text-[11px] text-gray-600">© 2025 Woz Seller. Todos los derechos reservados.</p>
              <p className="text-[11px] text-gray-600 max-w-xs text-right">
                La comisión del 10% se aplica únicamente sobre las ventas efectivamente realizadas al alcanzar la meta acordada.
              </p>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
