import { useState, useEffect, useRef } from 'react';
import { X, Menu, FileText, Building2, DollarSign, AlertTriangle, Server, Lock, Code, Zap, ShoppingCart, Package, Webhook, Shield, Activity, Clock } from 'lucide-react';

interface WozApiDocsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WozApiDocs({ isOpen, onClose }: WozApiDocsProps) {
  const [activeSection, setActiveSection] = useState('introduccion');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9));
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    if (!isOpen) return;

    // Content protection
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['s', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sections = [
    { id: 'introduccion', label: 'Introducción', icon: FileText },
    { id: 'corporativa', label: 'Información Corporativa', icon: Building2 },
    { id: 'comisiones', label: 'Modelo de Comisiones', icon: DollarSign },
    { id: 'anti-reventa', label: 'Política Anti-Reventa', icon: AlertTriangle },
    { id: 'arquitectura', label: 'Arquitectura de la API', icon: Server },
    { id: 'autenticacion', label: 'Autenticación', icon: Lock },
    { id: 'elements', label: 'Woz Elements', icon: Code },
    { id: 'backend', label: 'Integración Backend', icon: Zap },
    { id: 'shopify', label: 'Integración Shopify (Liquid)', icon: ShoppingCart },
    { id: 'woocommerce', label: 'Integración WooCommerce', icon: Package },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'fraude', label: 'Motor de Riesgo y Fraude', icon: Shield },
    { id: 'rate-limits', label: 'Rate Limits', icon: Activity },
    { id: 'liquidacion', label: 'Modelo de Liquidación', icon: Clock },
    { id: 'activacion', label: 'Activación de API', icon: FileText },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = sectionsRef.current[sectionId];
    if (element) {
      const offset = 80; // Header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      setActiveSection(sectionId);
      setSidebarOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-hidden flex flex-col">
      {/* Watermark */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.02]">
        <div className="text-gray-900 text-6xl font-mono rotate-[-45deg] select-none">
          SESSION: {sessionId}
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 lg:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} className="text-gray-700" />
            </button>
            <div>
              <h1 className="text-lg lg:text-xl font-bold text-gray-900">Woz Payments LLC</h1>
              <p className="text-xs text-gray-600">Documentación para Desarrolladores</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:sticky top-[73px] left-0 h-[calc(100vh-73px)] w-72 bg-white border-r border-gray-200 overflow-y-auto transition-transform z-30`}>
          <nav className="p-4 space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span className="text-sm">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/20 z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
            
            {/* Introducción */}
            <section ref={el => sectionsRef.current['introduccion'] = el} className="mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Introducción</h2>
              
              <div className="prose prose-gray max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  La API de Woz Payments LLC es una infraestructura de procesamiento de pagos diseñada para integrarse de manera programática en plataformas de comercio electrónico, aplicaciones web y sistemas empresariales que requieren capacidades de cobro transaccional.
                </p>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  Esta documentación técnica describe la arquitectura, métodos de integración, políticas operativas y requisitos de cumplimiento asociados al uso de la API. El acceso a las credenciales de producción está sujeto a un proceso de aprobación institucional que incluye verificación de identidad corporativa, evaluaci��n de modelo de negocio y aceptación de términos contractuales.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Alcance de la documentación</h3>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  Este manual cubre los siguientes aspectos técnicos y operativos:
                </p>

                <ul className="space-y-2 text-gray-700 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Modelo arquitectónico de la API REST y ciclo de vida de transacciones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Métodos de autenticación mediante claves públicas y secretas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Implementación de Woz Elements para captura tokenizada de datos de pago</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Ejemplos de integración backend en múltiples lenguajes de programación</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Integraciones específicas para plataformas de comercio (Shopify, WooCommerce)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Sistema de webhooks para notificaciones asíncronas de eventos transaccionales</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Motor de análisis de riesgo y prevención de fraude transaccional</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Políticas de límites de tasa (rate limiting) y gestión de cuotas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Modelo de liquidación financiera y cronograma de transferencias</span>
                  </li>
                </ul>

                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg my-6">
                  <p className="text-sm text-gray-800">
                    <strong className="font-semibold text-gray-900">Importante:</strong> Esta documentación está dirigida a desarrolladores con conocimientos técnicos en integración de APIs REST, manejo de autenticación mediante tokens y procesamiento asíncrono de eventos mediante webhooks.
                  </p>
                </div>
              </div>
            </section>

            {/* Información Corporativa */}
            <section ref={el => sectionsRef.current['corporativa'] = el} className="mb-16 bg-gray-50 -mx-4 lg:-mx-8 px-4 lg:px-8 py-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Información Corporativa</h2>
              
              <div className="prose prose-gray max-w-none">
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                  <p className="text-lg font-semibold text-gray-900 mb-3">
                    Woz Payments LLC está constituida bajo las leyes del Estado de Delaware, Estados Unidos de América.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    La empresa opera como proveedor de infraestructura de procesamiento de pagos electrónicos, ofreciendo servicios de intermediación transaccional entre comercios y entidades financieras emisoras de instrumentos de pago.
                  </p>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Naturaleza de la relación contractual</h3>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  El acceso y uso de la API de Woz Payments LLC constituye un acuerdo vinculante entre el comercio (en adelante, "el Cliente") y Woz Payments LLC (en adelante, "el Proveedor"). Este acuerdo está regido por las siguientes condiciones:
                </p>

                <ul className="space-y-3 text-gray-700 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1 font-bold">1.</span>
                    <span><strong className="font-semibold">Licencia de uso no exclusiva:</strong> El Cliente recibe una licencia revocable y no transferible para utilizar la API exclusivamente en su operación comercial autorizada.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1 font-bold">2.</span>
                    <span><strong className="font-semibold">Obligación de confidencialidad:</strong> El Cliente se compromete a mantener la confidencialidad de sus credenciales de API y a no compartirlas con terceros no autorizados.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1 font-bold">3.</span>
                    <span><strong className="font-semibold">Cumplimiento normativo:</strong> El Cliente debe cumplir con todas las regulaciones aplicables en su jurisdicción en materia de protección de datos, prevención de lavado de dinero y financiamiento del terrorismo.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1 font-bold">4.</span>
                    <span><strong className="font-semibold">Auditorías de cumplimiento:</strong> El Proveedor se reserva el derecho de solicitar auditorías periódicas para verificar el uso apropiado de la API.</span>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Política de uso aceptable</h3>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  El uso de la API está sujeto a las siguientes restricciones operativas:
                </p>

                <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Actividades prohibidas</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">✗</span>
                      <span>Procesamiento de transacciones para bienes o servicios ilegales según legislación aplicable</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">✗</span>
                      <span>Operaciones que puedan constituir lavado de activos o financiamiento del terrorismo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">✗</span>
                      <span>Comercialización de sustancias controladas, armas de fuego o material ilícito</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">✗</span>
                      <span>Prácticas comerciales fraudulentas o engañosas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">✗</span>
                      <span>Intercambio de criptoactivos sin autorización explícita del Proveedor</span>
                    </li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Limitación de responsabilidad</h3>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  El Proveedor actúa exclusivamente como facilitador técnico del procesamiento de pagos. La relación comercial subyacente entre el Cliente y sus consumidores finales es responsabilidad exclusiva del Cliente. El Proveedor no asume responsabilidad por:
                </p>

                <ul className="space-y-2 text-gray-700 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Disputas comerciales relacionadas con la calidad, entrega o características de productos o servicios vendidos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Incumplimientos contractuales entre el Cliente y sus consumidores</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Pérdidas financieras derivadas de errores en la implementación técnica por parte del Cliente</span>
                  </li>
                </ul>

                <div className="bg-gray-100 border border-gray-300 rounded-lg p-5 mt-6">
                  <p className="text-sm text-gray-800">
                    <strong className="font-semibold text-gray-900">Jurisdicción aplicable:</strong> Cualquier controversia derivada del uso de esta API será resuelta bajo las leyes del Estado de Delaware, Estados Unidos, con renuncia expresa a cualquier otro fuero o jurisdicción.
                  </p>
                </div>
              </div>
            </section>

            {/* Modelo de Comisiones */}
            <section ref={el => sectionsRef.current['comisiones'] = el} className="mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Modelo de Comisiones</h2>
              
              <div className="prose prose-gray max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  El modelo de comisiones de Woz Payments LLC se basa en una estructura de tarifa mixta que combina un componente porcentual sobre el monto de la transacción y un cargo fijo por operación. Este modelo aplica exclusivamente a transacciones exitosas que resulten en captura efectiva de fondos.
                </p>

                <div className="bg-blue-600 text-white rounded-lg p-8 text-center mb-8">
                  <p className="text-sm font-medium mb-2 opacity-90">Comisión por transacción exitosa</p>
                  <div className="text-5xl lg:text-6xl font-bold mb-2">3.9% + 1.50 USD</div>
                  <p className="text-sm opacity-90">Aplicado automáticamente antes de liquidación</p>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Ejemplo de cálculo de comisión</h3>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  A continuación se presenta un ejemplo detallado del cálculo de comisiones para una transacción de 100.00 USD:
                </p>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-700">Monto bruto de la transacción</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">100.00 USD</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-700">Comisión porcentual (3.9%)</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">3.90 USD</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-700">Cargo fijo por transacción</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">1.50 USD</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-900">Comisión total</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-red-600">5.40 USD</td>
                      </tr>
                      <tr className="bg-blue-50">
                        <td className="px-4 py-3 font-semibold text-gray-900">Monto neto a liquidar</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-blue-700">94.60 USD</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Deducción automática de comisiones</h3>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  Las comisiones son deducidas automáticamente del monto bruto de la transacción antes del proceso de liquidación. El Cliente recibe únicamente el monto neto en su cuenta bancaria designada. Este mecanismo garantiza la transparencia operativa y elimina la necesidad de facturación mensual separada.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Cronograma de liquidación</h3>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  El cronograma estándar de liquidación opera bajo el modelo T+2, donde "T" representa el día hábil de la transacción exitosa y "+2" indica dos días hábiles adicionales para el procesamiento de transferencia bancaria.
                </p>

                <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Liquidación Estándar</h4>
                      <p className="text-2xl font-bold text-gray-900 mb-1">T+2</p>
                      <p className="text-sm text-gray-600">Dos días hábiles posteriores a la transacción</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Liquidación Enterprise</h4>
                      <p className="text-2xl font-bold text-gray-900 mb-1">Configurable</p>
                      <p className="text-sm text-gray-600">Disponible para volúmenes superiores a 100,000 USD mensuales</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Ejemplos de cronograma</h3>
                
                <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span>Transacción realizada el lunes</span>
                      <span className="font-semibold">→ Liquidación el miércoles</span>
                    </li>
                    <li className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span>Transacción realizada el viernes</span>
                      <span className="font-semibold">→ Liquidación el martes siguiente</span>
                    </li>
                    <li className="flex items-center justify-between py-2">
                      <span>Transacción realizada el sábado o domingo</span>
                      <span className="font-semibold">→ Procesada el lunes, liquidación el miércoles</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mt-6">
                  <p className="text-sm text-gray-800">
                    <strong className="font-semibold text-gray-900">Nota sobre días hábiles:</strong> El cálculo de días hábiles excluye sábados, domingos y feriados bancarios del sistema financiero estadounidense. Las transacciones realizadas en días no hábiles se procesan el siguiente día hábil.
                  </p>
                </div>
              </div>
            </section>

            {/* Política Anti-Reventa */}
            <section ref={el => sectionsRef.current['anti-reventa'] = el} className="mb-16 bg-gray-50 -mx-4 lg:-mx-8 px-4 lg:px-8 py-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Política Anti-Reventa</h2>
              
              <div className="prose prose-gray max-w-none">
                <div className="bg-red-50 border-l-4 border-red-600 p-5 rounded-r-lg mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Prohibición absoluta de reventa y agregación no autorizada</h3>
                  <p className="text-gray-800 leading-relaxed">
                    Las credenciales de API emitidas por Woz Payments LLC son estrictamente personales y no transferibles. Cualquier forma de reventa, sublicenciamiento, compartición o agregación de procesamiento de pagos para terceros sin autorización explícita constituye una violación contractual grave.
                  </p>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Definición de actividades prohibidas</h3>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  Se consideran violaciones a esta política las siguientes conductas:
                </p>

                <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="text-red-600 font-bold text-xl flex-shrink-0">✗</span>
                      <div>
                        <strong className="font-semibold text-gray-900">Reventa de acceso a la API:</strong> Ofrecer a terceros el uso de las credenciales del Cliente mediante cualquier modalidad comercial (licenciamiento, alquiler, cesión temporal).
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-600 font-bold text-xl flex-shrink-0">✗</span>
                      <div>
                        <strong className="font-semibold text-gray-900">Agregación de subcomercios:</strong> Procesar transacciones de múltiples entidades comerciales distintas bajo una única cuenta de API sin autorización explícita como Payment Facilitator (PayFac).
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-600 font-bold text-xl flex-shrink-0">✗</span>
                      <div>
                        <strong className="font-semibold text-gray-900">Intermediación no autorizada:</strong> Actuar como intermediario entre otros comercios y Woz Payments LLC sin un acuerdo formal de agregación.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-600 font-bold text-xl flex-shrink-0">✗</span>
                      <div>
                        <strong className="font-semibold text-gray-900">Compartición de credenciales:</strong> Divulgar claves secretas de API a desarrolladores, agencias o terceros no empleados directos del Cliente.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-600 font-bold text-xl flex-shrink-0">✗</span>
                      <div>
                        <strong className="font-semibold text-gray-900">Servicios de white-label no autorizados:</strong> Ofrecer soluciones de procesamiento de pagos bajo marca propia utilizando la infraestructura de Woz Payments sin contrato específico.
                      </div>
                    </li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Mecanismos de detección automatizada</h3>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  Woz Payments LLC implementa sistemas avanzados de análisis de comportamiento transaccional para identificar patrones indicativos de uso no autorizado de la API. Estos sistemas incluyen:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Análisis de clustering de IP</h4>
                    <p className="text-sm text-gray-700">Detección de transacciones originadas desde múltiples direcciones IP geográficamente dispersas de manera inconsistente con el perfil operativo declarado.</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Fingerprinting de dispositivos</h4>
                    <p className="text-sm text-gray-700">Identificación de patrones de dispositivos finales (navegadores, sistemas operativos) que sugieren procesamiento para múltiples entidades comerciales distintas.</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Detección de anomalías volumétricas</h4>
                    <p className="text-sm text-gray-700">Monitoreo de volúmenes transaccionales que exceden significativamente las proyecciones declaradas durante el proceso de activación.</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Análisis de patrones de integración</h4>
                    <p className="text-sm text-gray-700">Evaluación de parámetros técnicos de las solicitudes API que indican uso por múltiples sistemas backend independientes.</p>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Consecuencias por incumplimiento</h3>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  La detección de prácticas de reventa o agregación no autorizada resultará en la aplicación inmediata de las siguientes medidas:
                </p>

                <div className="space-y-4 mb-6">
                  <div className="bg-white border-l-4 border-red-600 p-5 rounded-r-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">1. Acciones técnicas inmediatas</h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• Revocación inmediata de credenciales de API</li>
                      <li>• Suspensión de procesamiento de nuevas transacciones</li>
                      <li>• Bloqueo de acceso al panel de administración</li>
                    </ul>
                  </div>

                  <div className="bg-white border-l-4 border-red-600 p-5 rounded-r-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">2. Retención de fondos</h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• Aplicación de reserva rodante (rolling reserve) del 100% de saldos pendientes</li>
                      <li>• Período de retención de hasta 180 días naturales</li>
                      <li>• Retención adicional equivalente a proyección de contracargos potenciales</li>
                    </ul>
                  </div>

                  <div className="bg-white border-l-4 border-red-600 p-5 rounded-r-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">3. Consecuencias contractuales y legales</h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• Terminación unilateral del contrato de servicios</li>
                      <li>• Inclusión en listas de restricción de la industria de pagos (MATCH, TMF)</li>
                      <li>• Inhabilitación permanente para solicitar nuevas cuentas</li>
                      <li>• Inicio de acciones legales por incumplimiento contractual bajo legislación de Delaware</li>
                      <li>• Potencial notificación a autoridades regulatorias financieras</li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Alternativas autorizadas para agregadores</h3>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  Entidades que requieran procesamiento de pagos para múltiples subcomercios deben solicitar autorización formal como Payment Facilitator. Este proceso incluye:
                </p>

                <ul className="space-y-2 text-gray-700 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Due diligence corporativo extendido con verificación de estructura accionaria</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Evaluación de capacidades técnicas de onboarding y KYC de subcomercios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Establecimiento de reservas de capital operativo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Contratación de estructura tarifaria específica para agregadores</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Implementación de API extendida con soporte para multi-tenancy</span>
                  </li>
                </ul>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mt-6">
                  <p className="text-sm text-gray-800">
                    <strong className="font-semibold text-gray-900">Canal de reporte de violaciones:</strong> Si identifica actividades sospechosas de reventa no autorizada, puede reportarlas a compliance@wozpayments.com. Todos los reportes son tratados confidencialmente.
                  </p>
                </div>
              </div>
            </section>

            {/* Arquitectura de la API */}
            <section ref={el => sectionsRef.current['arquitectura'] = el} className="mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Arquitectura de la API</h2>
              
              <div className="prose prose-gray max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  La API de Woz Payments LLC está construida sobre una arquitectura RESTful que sigue principios de diseño stateless y utiliza métodos HTTP estándar para operaciones CRUD. La arquitectura está diseñada para garantizar escalabilidad horizontal, alta disponibilidad y latencias de respuesta predecibles.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Principios arquitectónicos fundamentales</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h4 className="font-semibold text-gray-900 mb-2">RESTful stateless</h4>
                    <p className="text-sm text-gray-700">Cada solicitud contiene toda la información necesaria para su procesamiento. No se mantiene estado de sesi��n en el servidor.</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h4 className="font-semibold text-gray-900 mb-2">Idempotencia garantizada</h4>
                    <p className="text-sm text-gray-700">Las solicitudes POST incluyen claves de idempotencia para prevenir duplicación de transacciones en caso de reintentos de red.</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h4 className="font-semibold text-gray-900 mb-2">Versionado explícito</h4>
                    <p className="text-sm text-gray-700">La versión de la API se especifica en la URL (/v1/). Los cambios no compatibles requieren incremento de versión mayor.</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h4 className="font-semibold text-gray-900 mb-2">Validación criptográfica</h4>
                    <p className="text-sm text-gray-700">Los webhooks incluyen firmas HMAC SHA-256 para verificación de autenticidad y prevención de spoofing.</p>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">URLs base de los entornos</h3>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  Woz Payments LLC proporciona dos entornos operativos distintos para desarrollo y producción:
                </p>

                <div className="space-y-4 mb-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">Entorno Sandbox (Pruebas)</h4>
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">DESARROLLO</span>
                    </div>
                    <code className="block bg-white border border-amber-200 rounded px-3 py-2 text-sm font-mono text-gray-900 overflow-x-auto">
                      https://sandbox.api.wozpayments.com/v1
                    </code>
                    <p className="text-sm text-gray-700 mt-3">
                      Entorno de pruebas con simulación completa de flujos transaccionales. No procesa dinero real. Acepta tarjetas de prueba documentadas.
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">Entorno Production (Producción)</h4>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">PRODUCCIÓN</span>
                    </div>
                    <code className="block bg-white border border-green-200 rounded px-3 py-2 text-sm font-mono text-gray-900 overflow-x-auto">
                      https://api.wozpayments.com/v1
                    </code>
                    <p className="text-sm text-gray-700 mt-3">
                      Entorno de producción con procesamiento real de transacciones. Requiere credenciales de producción aprobadas. Aplican comisiones estándar.
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Ciclo de vida de una transacción</h3>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  El procesamiento de pagos sigue un flujo secuencial de estados bien definidos:
                </p>

                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">1</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">Creación de intención de pago (Payment Intent)</h4>
                        <p className="text-sm text-gray-700">El backend del comercio crea un objeto PaymentIntent especificando monto, moneda y metadatos. Este objeto recibe un ID único y un client_secret para uso frontend.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">2</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">Tokenización de método de pago</h4>
                        <p className="text-sm text-gray-700">El frontend utiliza Woz Elements para capturar datos sensibles de tarjeta. Estos datos son tokenizados directamente en servidores de Woz sin pasar por el servidor del comercio.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">3</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">Autorización</h4>
                        <p className="text-sm text-gray-700">El motor de riesgo evalúa la transacción. Si es aprobada, se solicita autorización al emisor de la tarjeta. Los fondos quedan reservados pero no capturados.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">4</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">Captura</h4>
                        <p className="text-sm text-gray-700">Una vez confirmado el envío del producto/servicio, el comercio solicita la captura. Los fondos se transfieren efectivamente desde la cuenta del tarjetahabiente.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">5</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">Liquidación</h4>
                        <p className="text-sm text-gray-700">Después del período T+2, los fondos netos (descontadas comisiones) son transferidos a la cuenta bancaria del comercio mediante ACH o wire transfer.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Métodos HTTP y códigos de respuesta</h3>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  La API utiliza métodos HTTP semánticamente apropiados para cada tipo de operación:
                </p>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Método</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Uso</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Idempotente</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 font-mono text-blue-600">GET</td>
                        <td className="px-4 py-3 text-gray-700">Recuperar información de recursos existentes</td>
                        <td className="px-4 py-3 text-green-600 font-semibold">Sí</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-blue-600">POST</td>
                        <td className="px-4 py-3 text-gray-700">Crear nuevos recursos (transacciones, métodos de pago)</td>
                        <td className="px-4 py-3 text-amber-600 font-semibold">Con Idempotency-Key</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-blue-600">PUT</td>
                        <td className="px-4 py-3 text-gray-700">Actualizar recursos existentes completamente</td>
                        <td className="px-4 py-3 text-green-600 font-semibold">Sí</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-blue-600">DELETE</td>
                        <td className="px-4 py-3 text-gray-700">Cancelar o anular recursos (reembolsos, cancelaciones)</td>
                        <td className="px-4 py-3 text-green-600 font-semibold">Sí</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg mt-6">
                  <p className="text-sm text-gray-800">
                    <strong className="font-semibold text-gray-900">Nota técnica:</strong> Todas las respuestas utilizan formato JSON con codificación UTF-8. Los timestamps se expresan en formato Unix epoch (segundos desde 1970-01-01 00:00:00 UTC).
                  </p>
                </div>
              </div>
            </section>

            {/* Continue with remaining sections... */}
            {/* Due to length, I'll create the remaining sections in a structured format */}
            
            {/* Autenticación */}
            <section ref={el => sectionsRef.current['autenticacion'] = el} className="mb-16 bg-gray-50 -mx-4 lg:-mx-8 px-4 lg:px-8 py-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Autenticación</h2>
              
              <div className="prose prose-gray max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  El sistema de autenticación de Woz Payments LLC utiliza claves API basadas en tokens Bearer para identificar y autorizar solicitudes. Existen dos tipos de claves con diferentes niveles de privilegio y contextos de uso.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Tipos de claves de API</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                      <h4 className="font-semibold text-gray-900">Clave Publicable (Publishable Key)</h4>
                    </div>
                    <code className="block bg-white border border-green-200 rounded px-3 py-2 text-sm font-mono text-gray-900 mb-3 overflow-x-auto">
                      pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxx
                    </code>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong className="font-semibold">Uso:</strong> Código JavaScript del navegador (cliente)
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong className="font-semibold">Permisos:</strong> Crear tokens de método de pago, confirmar PaymentIntents existentes
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong className="font-semibold">Seguridad:</strong> Puede ser expuesta públicamente. No permite operaciones sensibles como reembolsos o acceso a datos de otros clientes.
                    </p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                      <h4 className="font-semibold text-gray-900">Clave Secreta (Secret Key)</h4>
                    </div>
                    <code className="block bg-white border border-red-200 rounded px-3 py-2 text-sm font-mono text-gray-900 mb-3 overflow-x-auto">
                      sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxx
                    </code>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong className="font-semibold">Uso:</strong> Servidor backend (nunca en frontend)
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong className="font-semibold">Permisos:</strong> Acceso completo a todas las operaciones de la API
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong className="font-semibold">Seguridad:</strong> <span className="text-red-700 font-bold">NUNCA debe ser expuesta en código cliente, repositorios públicos o logs.</span> Almacenar en variables de entorno.
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Encabezados HTTP requeridos</h3>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  Toda solicitud a la API debe incluir los siguientes encabezados:
                </p>

                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-6">
                  <pre className="text-sm text-gray-100 font-mono">
{`Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxx
Content-Type: application/json
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000`}
                  </pre>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Descripción de encabezados</h4>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li>
                      <code className="bg-gray-100 px-2 py-1 rounded text-blue-700 font-mono">Authorization</code>
                      <p className="mt-1">Contiene la clave API precedida por "Bearer ". Requerida en todas las solicitudes.</p>
                    </li>
                    <li>
                      <code className="bg-gray-100 px-2 py-1 rounded text-blue-700 font-mono">Content-Type</code>
                      <p className="mt-1">Debe ser siempre "application/json" para solicitudes POST/PUT con cuerpo.</p>
                    </li>
                    <li>
                      <code className="bg-gray-100 px-2 py-1 rounded text-blue-700 font-mono">Idempotency-Key</code>
                      <p className="mt-1">UUID v4 único por solicitud. Previene duplicación de transacciones en reintentos. Obligatorio para operaciones POST que crean recursos financieros.</p>
                    </li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Comportamiento de idempotencia</h3>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  La idempotencia garantiza que múltiples solicitudes idénticas produzcan el mismo resultado que una única solicitud. Esto es crítico para prevenir cobros duplicados en caso de timeout de red o reintentos automáticos.
                </p>

                <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Escenarios de respuesta</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-mono text-xs">201</span>
                      <div>
                        <strong className="text-gray-900">Primera solicitud exitosa</strong>
                        <p className="text-gray-700">El recurso se crea correctamente. Se retorna el objeto creado.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-mono text-xs">200</span>
                      <div>
                        <strong className="text-gray-900">Solicitud duplicada (misma clave)</strong>
                        <p className="text-gray-700">Se retorna el objeto previamente creado sin procesar nuevamente. No se genera duplicado.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded font-mono text-xs">409</span>
                      <div>
                        <strong className="text-gray-900">Conflicto de parámetros</strong>
                        <p className="text-gray-700">La misma clave de idempotencia se usó con parámetros diferentes. Indicación de error en lógica de cliente.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mt-6">
                  <p className="text-sm text-gray-800">
                    <strong className="font-semibold text-gray-900">Gestión de claves de producción:</strong> Las claves secretas deben rotarse cada 90 días como práctica de seguridad. En caso de compromiso, revocar inmediatamente desde el panel de administración y generar nuevas credenciales.
                  </p>
                </div>
              </div>
            </section>

            {/* Woz Elements */}
            <section ref={el => sectionsRef.current['elements'] = el} className="mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Woz Elements</h2>
              
              <div className="prose prose-gray max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Woz Elements es una biblioteca JavaScript que permite integrar formularios de pago seguros directamente en el sitio web del comercio sin que datos sensibles de tarjeta transiten por sus servidores. Esta aproximación reduce significativamente el alcance de cumplimiento PCI DSS requerido.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Arquitectura de tokenización</h3>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  Cuando un cliente ingresa datos de su tarjeta en un elemento de Woz Elements, estos datos son enviados directamente a los servidores de Woz Payments mediante comunicación cifrada. El comercio recibe únicamente un token no sensible que puede ser utilizado para completar la transacción.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Flujo de datos</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-blue-700">Cliente</span>
                      <span>→</span>
                      <span>Ingresa datos de tarjeta</span>
                      <span>→</span>
                      <span className="font-mono text-blue-700">Woz Elements</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-blue-700">Woz Elements</span>
                      <span>→</span>
                      <span>Tokeniza (HTTPS)</span>
                      <span>→</span>
                      <span className="font-mono text-blue-700">Servidores Woz</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-blue-700">Servidores Woz</span>
                      <span>→</span>
                      <span>Retorna token</span>
                      <span>→</span>
                      <span className="font-mono text-blue-700">Sitio del comercio</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-blue-700">Sitio del comercio</span>
                      <span>→</span>
                      <span>Confirma con token</span>
                      <span>→</span>
                      <span className="font-mono text-blue-700">Backend del comercio</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Paso 1: Incluir la biblioteca JavaScript</h3>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  Agregar el script de Woz Elements en el HTML de la página de checkout:
                </p>

                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-6">
                  <pre className="text-sm text-gray-100 font-mono">
{`<script src="https://js.wozpayments.com/v1/woz.js"></script>`}
                  </pre>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Paso 2: Inicializar el cliente de Woz</h3>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  Utilizar la clave publicable para inicializar el objeto Woz en el frontend:
                </p>

                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-6">
                  <pre className="text-sm text-gray-100 font-mono">
{`const woz = Woz('pk_live_xxxxxxxxxxxxxxxxxx');
const elements = woz.elements();`}
                  </pre>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Paso 3: Crear y montar elemento de tarjeta</h3>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  Crear un elemento de tarjeta con estilos personalizados y montarlo en un contenedor del DOM:
                </p>

                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-6">
                  <pre className="text-sm text-gray-100 font-mono">
{`const cardElement = elements.create('card', {
  style: {
    base: {
      fontSize: '16px',
      color: '#1f2937',
      fontFamily: 'system-ui, sans-serif',
      '::placeholder': {
        color: '#9ca3af'
      }
    },
    invalid: {
      color: '#dc2626',
      iconColor: '#dc2626'
    }
  },
  hidePostalCode: true
});

cardElement.mount('#card-element');`}
                  </pre>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Paso 4: Manejo de eventos y validación</h3>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  Escuchar eventos de cambio para validar datos ingresados en tiempo real:
                </p>

                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-6">
                  <pre className="text-sm text-gray-100 font-mono">
{`cardElement.on('change', (event) => {
  const displayError = document.getElementById('card-errors');
  if (event.error) {
    displayError.textContent = event.error.message;
  } else {
    displayError.textContent = '';
  }
});`}
                  </pre>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Paso 5: Crear método de pago y confirmar</h3>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  Al momento de enviar el formulario, crear un método de pago tokenizado y enviarlo al backend:
                </p>

                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-6">
                  <pre className="text-sm text-gray-100 font-mono">
{`const form = document.getElementById('payment-form');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const {paymentMethod, error} = await woz.createPaymentMethod({
    type: 'card',
    card: cardElement,
    billing_details: {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value
    }
  });

  if (error) {
    console.error(error.message);
    return;
  }

  // Enviar paymentMethod.id al backend
  const response = await fetch('/api/process-payment', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      payment_method_id: paymentMethod.id,
      amount: 10000 // centavos
    })
  });

  const result = await response.json();
  
  if (result.status === 'succeeded') {
    window.location.href = '/confirmation';
  }
});`}
                  </pre>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Estructura HTML recomendada</h3>
                
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-6">
                  <pre className="text-sm text-gray-100 font-mono">
{`<form id="payment-form">
  <div class="form-group">
    <label for="name">Nombre del titular</label>
    <input type="text" id="name" required>
  </div>

  <div class="form-group">
    <label for="email">Correo electrónico</label>
    <input type="email" id="email" required>
  </div>

  <div class="form-group">
    <label for="card-element">Datos de tarjeta</label>
    <div id="card-element"></div>
    <div id="card-errors" role="alert"></div>
  </div>

  <button type="submit">Pagar ahora</button>
</form>`}
                  </pre>
                </div>

                <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-r-lg mt-6">
                  <p className="text-sm text-gray-800">
                    <strong className="font-semibold text-gray-900">Ventaja de cumplimiento PCI:</strong> Al utilizar Woz Elements, los datos de tarjeta nunca transitan por el servidor del comercio, reduciendo el alcance de auditoría PCI DSS a nivel SAQ-A (el más simple).
                  </p>
                </div>
              </div>
            </section>

            {/* Integración Backend, Shopify, WooCommerce, etc. - Placeholder sections with proper structure */}
            {/* For brevity, I'll add simplified versions of remaining sections */}

            <section ref={el => sectionsRef.current['backend'] = el} className="mb-16 bg-gray-50 -mx-4 lg:-mx-8 px-4 lg:px-8 py-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Integración Backend</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  La integración backend permite crear PaymentIntents, procesar pagos y gestionar reembolsos desde el servidor del comercio utilizando la clave secreta de API.
                </p>
                
                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Ejemplo Node.js con Axios</h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-6">
                  <pre className="text-sm text-gray-100 font-mono">
{`const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

async function createPayment(amount, currency, paymentMethodId) {
  try {
    const response = await axios.post(
      'https://api.wozpayments.com/v1/payments',
      {
        amount: amount,
        currency: currency,
        payment_method: paymentMethodId,
        description: 'Compra en tienda online'
      },
      {
        headers: {
          'Authorization': \`Bearer \${process.env.WOZ_SECRET_KEY}\`,
          'Content-Type': 'application/json',
          'Idempotency-Key': uuidv4()
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error al procesar pago:', error.response.data);
    throw error;
  }
}`}
                  </pre>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Ejemplo PHP con cURL</h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-6">
                  <pre className="text-sm text-gray-100 font-mono">
{`<?php
function crearPago($monto, $moneda, $metodoPagoId) {
    $apiKey = getenv('WOZ_SECRET_KEY');
    $idempotencyKey = uniqid('', true);
    
    $datos = [
        'amount' => $monto,
        'currency' => $moneda,
        'payment_method' => $metodoPagoId,
        'description' => 'Compra en tienda online'
    ];
    
    $ch = curl_init('https://api.wozpayments.com/v1/payments');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($datos));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json',
        'Idempotency-Key: ' . $idempotencyKey
    ]);
    
    $respuesta = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($respuesta, true);
}
?>`}
                  </pre>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Ejemplo Python con requests</h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-6">
                  <pre className="text-sm text-gray-100 font-mono">
{`import os
import requests
import uuid

def crear_pago(monto, moneda, metodo_pago_id):
    api_key = os.getenv('WOZ_SECRET_KEY')
    
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
        'Idempotency-Key': str(uuid.uuid4())
    }
    
    payload = {
        'amount': monto,
        'currency': moneda,
        'payment_method': metodo_pago_id,
        'description': 'Compra en tienda online'
    }
    
    response = requests.post(
        'https://api.wozpayments.com/v1/payments',
        json=payload,
        headers=headers
    )
    
    return response.json()`}
                  </pre>
                </div>
              </div>
            </section>

            <section ref={el => sectionsRef.current['shopify'] = el} className="mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Integración Shopify (Liquid)</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  La integración con Shopify requiere un App Proxy para comunicarse con el backend del comercio y crear PaymentIntents. El frontend utiliza Liquid templates combinado con JavaScript para capturar el pago.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Estructura de integración</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">1.</span>
                      <span>Crear App Proxy en configuración de Shopify App</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">2.</span>
                      <span>Backend recibe datos del carrito y crea PaymentIntent</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">3.</span>
                      <span>Frontend Liquid renderiza Woz Elements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">4.</span>
                      <span>Confirmación de pago y sincronización con orden Shopify</span>
                    </li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Ejemplo de template Liquid</h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-6">
                  <pre className="text-sm text-gray-100 font-mono">
{`<div id="woz-payment-form">
  <form id="payment-form">
    <input type="text" id="name" placeholder="Nombre completo" required>
    <input type="email" id="email" placeholder="Correo electrónico" required>
    <div id="card-element"></div>
    <div id="card-errors" role="alert"></div>
    <button type="submit">Pagar {{ cart.total_price | money }}</button>
  </form>
</div>

<script src="https://js.wozpayments.com/v1/woz.js"></script>
<script>
const woz = Woz('{{ settings.woz_publishable_key }}');
const elements = woz.elements();
const cardElement = elements.create('card');
cardElement.mount('#card-element');

document.getElementById('payment-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Crear PaymentIntent via App Proxy
  const intentResponse = await fetch('/apps/wozpay/create-intent', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      amount: {{ cart.total_price | times: 100 }},
      currency: '{{ shop.currency }}'
    })
  });
  
  const { client_secret } = await intentResponse.json();
  
  // Confirmar pago
  const result = await woz.confirmCardPayment(client_secret, {
    payment_method: {
      card: cardElement,
      billing_details: {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value
      }
    }
  });
  
  if (result.error) {
    alert(result.error.message);
  } else {
    window.location.href = '/checkout/thank_you';
  }
});
</script>`}
                  </pre>
                </div>
              </div>
            </section>

            <section ref={el => sectionsRef.current['woocommerce'] = el} className="mb-16 bg-gray-50 -mx-4 lg:-mx-8 px-4 lg:px-8 py-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Integración WooCommerce</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  La integración con WooCommerce se realiza mediante un plugin personalizado que utiliza los hooks de procesamiento de pagos de WooCommerce para interactuar con la API de Woz Payments.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Ejemplo de gateway personalizado</h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-6">
                  <pre className="text-sm text-gray-100 font-mono">
{`<?php
add_action('woocommerce_checkout_process', 'woz_procesar_pago');

function woz_procesar_pago() {
    $payment_method_id = $_POST['woz_payment_method_id'];
    $order_total = WC()->cart->total * 100; // convertir a centavos
    
    $respuesta = wp_remote_post('https://api.wozpayments.com/v1/payments', [
        'headers' => [
            'Authorization' => 'Bearer ' . get_option('woz_secret_key'),
            'Content-Type' => 'application/json',
            'Idempotency-Key' => uniqid()
        ],
        'body' => json_encode([
            'amount' => $order_total,
            'currency' => get_woocommerce_currency(),
            'payment_method' => $payment_method_id,
            'metadata' => [
                'order_id' => WC()->session->get('order_awaiting_payment')
            ]
        ])
    ]);
    
    $resultado = json_decode(wp_remote_retrieve_body($respuesta));
    
    if ($resultado->status !== 'succeeded') {
        wc_add_notice('Error al procesar el pago. Intente nuevamente.', 'error');
        return;
    }
    
    // Marcar orden como pagada
    $order = wc_get_order(WC()->session->get('order_awaiting_payment'));
    $order->payment_complete($resultado->id);
}
?>`}
                  </pre>
                </div>
              </div>
            </section>

            <section ref={el => sectionsRef.current['webhooks'] = el} className="mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Webhooks</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Los webhooks son notificaciones HTTP POST que Woz Payments envía a un endpoint del comercio cuando ocurren eventos significativos en las transacciones. Permiten actualizar sistemas backend de manera asíncrona sin necesidad de polling.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Tipos de eventos disponibles</h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Evento</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Descripción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 font-mono text-blue-600 text-xs">payment.created</td>
                        <td className="px-4 py-3 text-gray-700">PaymentIntent creado exitosamente</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-blue-600 text-xs">payment.authorized</td>
                        <td className="px-4 py-3 text-gray-700">Pago autorizado pero no capturado</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-blue-600 text-xs">payment.captured</td>
                        <td className="px-4 py-3 text-gray-700">Pago capturado exitosamente</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-blue-600 text-xs">payment.failed</td>
                        <td className="px-4 py-3 text-gray-700">Pago rechazado o fallido</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-blue-600 text-xs">payment.refunded</td>
                        <td className="px-4 py-3 text-gray-700">Reembolso procesado</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Verificación de firma HMAC SHA-256</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Cada webhook incluye un encabezado <code className="bg-gray-100 px-2 py-1 rounded text-sm">Woz-Signature</code> que contiene una firma HMAC SHA-256 del payload. Es crítico verificar esta firma antes de procesar el evento.
                </p>

                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-6">
                  <pre className="text-sm text-gray-100 font-mono">
{`const crypto = require('crypto');

function verificarFirmaWebhook(payload, firma, secreto) {
  const hmac = crypto.createHmac('sha256', secreto);
  const digest = hmac.update(payload).digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(firma),
    Buffer.from(digest)
  );
}

// Uso en endpoint de webhook
app.post('/webhooks/woz', (req, res) => {
  const firma = req.headers['woz-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verificarFirmaWebhook(payload, firma, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Firma inválida');
  }
  
  // Procesar evento
  const evento = req.body;
  console.log('Evento recibido:', evento.type);
  
  res.status(200).send('OK');
});`}
                  </pre>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Ejemplo de payload de webhook</h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-6">
                  <pre className="text-sm text-gray-100 font-mono">
{`{
  "id": "evt_1a2b3c4d5e",
  "type": "payment.captured",
  "created": 1640995200,
  "data": {
    "object": {
      "id": "pm_9z8y7x6w5v",
      "amount": 10000,
      "currency": "usd",
      "status": "succeeded",
      "payment_method": "card",
      "metadata": {
        "order_id": "12345"
      }
    }
  }
}`}
                  </pre>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mt-6">
                  <p className="text-sm text-gray-800">
                    <strong className="font-semibold text-gray-900">Protección contra replay attacks:</strong> Verifique también el timestamp del evento. Rechace webhooks con timestamps más antiguos de 5 minutos para prevenir ataques de repetición.
                  </p>
                </div>
              </div>
            </section>

            <section ref={el => sectionsRef.current['fraude'] = el} className="mb-16 bg-gray-50 -mx-4 lg:-mx-8 px-4 lg:px-8 py-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Motor de Riesgo y Fraude</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Woz Payments implementa un motor de análisis de riesgo multicapa que evalúa cada transacción en tiempo real utilizando modelos de machine learning y reglas heurísticas para detectar patrones fraudulentos.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Componentes del motor de riesgo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h4 className="font-semibold text-gray-900 mb-2">Controles de velocidad</h4>
                    <p className="text-sm text-gray-700">Limites automáticos de frecuencia transaccional por tarjeta, IP y dispositivo para prevenir carding attacks.</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h4 className="font-semibold text-gray-900 mb-2">Análisis BIN/IIN</h4>
                    <p className="text-sm text-gray-700">Verificación de correspondencia entre país emisor de tarjeta y ubicación geográfica del comprador.</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h4 className="font-semibold text-gray-900 mb-2">Device fingerprinting</h4>
                    <p className="text-sm text-gray-700">Identificación única de dispositivos para detectar patrones de uso sospechosos o dispositivos comprometidos.</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h4 className="font-semibold text-gray-900 mb-2">Geolocalización IP</h4>
                    <p className="text-sm text-gray-700">Detección de anomalías geográficas, uso de VPN/proxy y acceso desde regiones de alto riesgo.</p>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Sistema de scoring de riesgo</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Cada transacción recibe un puntaje de riesgo de 0 a 100:
                </p>

                <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900">0-30: Riesgo Bajo</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">AUTO-APROBADO</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900">31-60: Riesgo Medio</span>
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">REVISIÓN MANUAL</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900">61-100: Riesgo Alto</span>
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">AUTO-RECHAZADO</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Monitoreo de chargebacks</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Los comercios deben mantener ratios de chargeback por debajo de umbrales establecidos:
                </p>

                <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-700">Comercios estándar</span>
                      <span className="font-mono font-semibold text-gray-900">&lt; 1.0%</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-700">Comercios de alto riesgo</span>
                      <span className="font-mono font-semibold text-gray-900">&lt; 2.0%</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-700">
                  Exceder estos umbrales puede resultar en aplicación de reservas rodantes, incremento de comisiones o suspensión de cuenta.
                </p>
              </div>
            </section>

            <section ref={el => sectionsRef.current['rate-limits'] = el} className="mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Rate Limits</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Las solicitudes a la API están sujetas a límites de tasa para garantizar disponibilidad del servicio y prevenir abuso. Los límites varían según el nivel de cuenta del comercio.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Cuenta Estándar</h3>
                    <div className="text-5xl font-bold text-blue-700 mb-2">500</div>
                    <p className="text-sm text-gray-700">solicitudes por minuto</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Cuenta Enterprise</h3>
                    <div className="text-5xl font-bold text-purple-700 mb-2">Custom</div>
                    <p className="text-sm text-gray-700">SLA negociado</p>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Encabezados de respuesta</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Cada respuesta de la API incluye encabezados informativos sobre el estado actual de límites:
                </p>

                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-6">
                  <pre className="text-sm text-gray-100 font-mono">
{`X-RateLimit-Limit: 500
X-RateLimit-Remaining: 487
X-RateLimit-Reset: 1640995200`}
                  </pre>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Respuesta 429 - Too Many Requests</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Cuando se excede el límite, la API retorna un código HTTP 429 con información sobre el tiempo de espera:
                </p>

                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-6">
                  <pre className="text-sm text-gray-100 font-mono">
{`{
  "error": {
    "type": "rate_limit_error",
    "message": "Límite de solicitudes excedido. Reintente después de 60 segundos.",
    "retry_after": 60
  }
}`}
                  </pre>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Estrategias de manejo recomendadas</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Implementar exponential backoff para reintentos automáticos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Cachear respuestas cuando sea apropiado para reducir solicitudes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Utilizar webhooks en lugar de polling para actualizaciones de estado</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Monitorear encabezado X-RateLimit-Remaining proactivamente</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section ref={el => sectionsRef.current['liquidacion'] = el} className="mb-16 bg-gray-50 -mx-4 lg:-mx-8 px-4 lg:px-8 py-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Modelo de Liquidación</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  El modelo de liquidación de Woz Payments define el cronograma y mecanismo mediante el cual los fondos capturados son transferidos desde las cuentas operativas de Woz Payments a las cuentas bancarias designadas por los comercios.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Cálculo de liquidación neta</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  El monto a liquidar se calcula deduciendo automáticamente las comisiones del monto bruto capturado:
                </p>

                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-lg">
                      <span className="text-gray-700">Monto bruto capturado</span>
                      <span className="font-mono font-semibold text-gray-900">100.00 USD</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Comisión porcentual (3.9%)</span>
                      <span className="font-mono">- 3.90 USD</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 pb-3 border-b border-gray-200">
                      <span>Comisión fija</span>
                      <span className="font-mono">- 1.50 USD</span>
                    </div>
                    <div className="flex items-center justify-between text-xl font-bold">
                      <span className="text-gray-900">Liquidación neta</span>
                      <span className="font-mono text-green-600">94.60 USD</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Cronograma T+2</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  El modelo estándar T+2 (Transaction + 2 business days) significa que los fondos son transferidos dos días hábiles después de la captura exitosa:
                </p>

                <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 py-2">
                      <span className="w-24 text-sm font-semibold text-gray-700">Lunes</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-sm text-gray-700">Captura de transacción</span>
                      <span className="text-gray-400">→</span>
                      <span className="w-32 text-sm font-semibold text-blue-700">Miércoles: Pago</span>
                    </div>
                    <div className="flex items-center gap-3 py-2">
                      <span className="w-24 text-sm font-semibold text-gray-700">Viernes</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-sm text-gray-700">Captura de transacción</span>
                      <span className="text-gray-400">→</span>
                      <span className="w-32 text-sm font-semibold text-blue-700">Martes: Pago</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Métodos de pago disponibles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h4 className="font-semibold text-gray-900 mb-2">Transferencia ACH (EE.UU.)</h4>
                    <p className="text-sm text-gray-700 mb-2">Depósito directo a cuenta bancaria estadounidense. Sin costos adicionales.</p>
                    <p className="text-xs text-gray-600">Tiempo de procesamiento: 1-2 días hábiles</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h4 className="font-semibold text-gray-900 mb-2">Wire Transfer Internacional</h4>
                    <p className="text-sm text-gray-700 mb-2">Transferencia bancaria internacional. Tarifa: 25 USD por transferencia.</p>
                    <p className="text-xs text-gray-600">Tiempo de procesamiento: 3-5 días hábiles</p>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Liquidaciones fallidas</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Las liquidaciones pueden fallar por diversos motivos. En estos casos, se aplica el siguiente protocolo:
                </p>

                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span>Reintento automático durante 5 días hábiles consecutivos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span>Notificación por email al comercio en cada intento fallido</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span>Fondos retenidos hasta actualización de datos bancarios</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span>Posibilidad de actualizar cuenta bancaria desde el panel administrativo</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Activación de API */}
            <section ref={el => sectionsRef.current['activacion'] = el} className="mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Activación de API</h2>
              
              <div className="prose prose-gray max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  El acceso a credenciales de producción de la API de Woz Payments LLC se otorga mediante el pago de una suscripción anual. Una vez procesado el pago y completada la verificación institucional, se emiten las credenciales de API con acceso completo a la infraestructura de procesamiento.
                </p>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                  <div className="text-center mb-5">
                    <p className="text-xs font-medium mb-2 text-blue-600 uppercase tracking-wide">Licencia Anual de API</p>
                    <div className="text-3xl font-bold mb-1 text-blue-700">1.500.000 Gs</div>
                    <p className="text-xs text-blue-600">Pago único anual</p>
                  </div>
                  
                  <div className="border-t border-blue-200 pt-5 mt-5">
                    <h4 className="font-semibold text-sm mb-3 text-center text-gray-900">Incluye</h4>
                    <ul className="space-y-2 text-xs text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">✓</span>
                        <span>Credenciales de API de producción (pk_live y sk_live)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">✓</span>
                        <span>Acceso completo a Woz Elements para captura tokenizada</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">✓</span>
                        <span>Panel administrativo con reportería en tiempo real</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">✓</span>
                        <span>Soporte técnico prioritario vía email y documentación</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">✓</span>
                        <span>Webhooks ilimitados para notificaciones asíncronas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">✓</span>
                        <span>Rate limit estándar: 500 solicitudes por minuto</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-base transition-colors shadow-sm">
                    Pagar licencia anual
                  </button>
                  <p className="text-xs text-gray-600 mt-3">
                    Al realizar el pago, acepta los términos contractuales de Woz Payments LLC
                  </p>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Límites operativos de la cuenta estándar</h3>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden mb-5">
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-100">
                        <td className="px-4 py-3 text-gray-700">Monto máximo por transacción</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">1.000.000 USD</td>
                      </tr>
                      <tr className="hover:bg-gray-100">
                        <td className="px-4 py-3 text-gray-700">Solicitudes API por minuto</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">500 req/min</td>
                      </tr>
                      <tr className="hover:bg-gray-100">
                        <td className="px-4 py-3 text-gray-700">Cronograma de liquidación</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">T+2 días hábiles</td>
                      </tr>
                      <tr className="hover:bg-gray-100">
                        <td className="px-4 py-3 text-gray-700">Comisión por transacción</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">3.9% + 1.50 USD</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-gray-100 border-l-4 border-gray-400 p-4 rounded-r-lg mb-6">
                  <p className="text-xs text-gray-700 leading-relaxed">
                    <strong className="font-semibold text-gray-900">Nota sobre límite transaccional:</strong> Transacciones que superen el límite de 1.000.000 USD serán automáticamente rechazadas por el motor de riesgo. Para límites superiores, contactar al equipo Enterprise.
                  </p>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Modelo de flujo de fondos</h3>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  El procesamiento de pagos mediante Woz Payments LLC opera bajo el siguiente esquema de liquidación:
                </p>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-5">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs flex-shrink-0">1</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1 text-sm">Captura de transacción</h4>
                        <p className="text-xs text-gray-600">El cliente final realiza el pago. Los fondos son capturados por Woz Payments y depositados en la cuenta en dólares estadounidenses de Woz Payments LLC.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs flex-shrink-0">2</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1 text-sm">Deducción automática de comisiones</h4>
                        <p className="text-xs text-gray-600">Se aplica la comisión estándar (3.9% + 1.50 USD) sobre el monto bruto capturado. El monto neto se calcula automáticamente.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs flex-shrink-0">3</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1 text-sm">Período de liquidación T+2</h4>
                        <p className="text-xs text-gray-600">Los fondos permanecen en la cuenta de Woz Payments durante dos días hábiles para cubrir posibles contracargos o disputas.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs flex-shrink-0">4</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1 text-sm">Transferencia bancaria al comercio</h4>
                        <p className="text-xs text-gray-600">Una vez cumplido el período T+2, el monto neto es transferido mediante ACH o wire transfer a la cuenta bancaria registrada del comercio.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100 border-l-4 border-gray-400 p-4 rounded-r-lg mb-6">
                  <p className="text-xs text-gray-700 leading-relaxed">
                    <strong className="font-semibold text-gray-900">Importante:</strong> Todos los fondos de transacciones son depositados inicialmente en la cuenta en dólares estadounidenses de Woz Payments LLC. Las liquidaciones al comercio se realizan exclusivamente mediante transferencia bancaria después del período de retención T+2. No se ofrecen retiros instantáneos o anticipados en la modalidad estándar.
                  </p>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Proceso de activación</h3>
                
                <p className="text-gray-700 leading-relaxed mb-6">
                  La activación de la API de Woz Payments LLC requiere completar el pago anual como primer paso. Una vez confirmado el pago, se inicia el proceso de verificación institucional.
                </p>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs flex-shrink-0">1</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1 text-sm">Pago de licencia anual</h4>
                        <p className="text-xs text-gray-600">Realice el pago de 1.500.000 Gs. Este es el primer paso obligatorio para iniciar el proceso de activación.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs flex-shrink-0">2</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1 text-sm">Envío de documentación corporativa</h4>
                        <p className="text-xs text-gray-600">Una vez confirmado el pago, envíe documentos legales de constitución, identificación de beneficiarios finales y registro fiscal al email de soporte.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs flex-shrink-0">3</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1 text-sm">Verificación de sitio web y modelo de negocio</h4>
                        <p className="text-xs text-gray-600">Proporcione URL de sitio web operativo con información clara sobre productos, políticas de privacidad y términos de servicio.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs flex-shrink-0">4</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1 text-sm">Due diligence y aprobación</h4>
                        <p className="text-xs text-gray-600">Verificación institucional por equipo de compliance (3-5 días hábiles).</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs flex-shrink-0">5</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1 text-sm">Emisión de credenciales</h4>
                        <p className="text-xs text-gray-600">Recepción de claves de API (pk_live y sk_live) vía email seguro y acceso al panel administrativo.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                    <span className="text-gray-600">📧</span>
                    Soporte técnico
                  </h4>
                  <p className="text-xs text-gray-600 mb-2">
                    Para consultas sobre el proceso de activación, envío de documentación o asistencia técnica, contactar a nuestro equipo de soporte:
                  </p>
                  <div className="bg-white border border-gray-300 rounded-lg p-2">
                    <a href="mailto:wozparaguay@gmail.com" className="text-blue-600 hover:underline font-semibold text-sm">
                      wozparaguay@gmail.com
                    </a>
                  </div>
                </div>

                <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Cuentas Enterprise</h4>
                  <p className="text-xs text-gray-600 mb-2">
                    Para integraciones de alto volumen con límites transaccionales superiores a 1.000.000 USD por operación, liquidación acelerada (T+0 o T+1), rate limits personalizados o modelo de Payment Facilitator, contactar directamente al equipo enterprise.
                  </p>
                  <p className="text-xs">
                    <strong className="text-gray-900">Email:</strong> <a href="mailto:wozparaguay@gmail.com" className="text-blue-600 hover:underline">wozparaguay@gmail.com</a> (asunto: Enterprise)
                  </p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-gray-200">
              <div className="text-center text-sm text-gray-600 space-y-2">
                <p className="font-semibold text-gray-900">Woz Payments LLC</p>
                <p>Incorporated in the State of Delaware, United States</p>
                <p className="text-xs">Esta documentación es confidencial y de uso exclusivo para comercios autorizados.</p>
                <p className="text-xs text-gray-500 mt-4">© 2024 Woz Payments LLC. Todos los derechos reservados.</p>
              </div>
            </footer>

          </div>
        </main>
      </div>
    </div>
  );
}
