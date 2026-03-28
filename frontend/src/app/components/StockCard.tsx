import { CheckCircle2 } from 'lucide-react';

interface StockCardProps {
  companyName: string;
  companyType: string;
  pricePerShare: number;
  isVerified: boolean;
}

export function StockCard({ companyName, companyType, pricePerShare, isVerified }: StockCardProps) {
  // Simular ingresos (esto podría ser un prop en el futuro)
  const revenue = 245; // en millones

  return (
    <div className="relative bg-white/40 backdrop-blur-xl rounded-xl p-3 shadow-lg border border-white/40 hover:shadow-xl hover:bg-white/50 hover:border-blue-200/60 transition-all min-w-[140px] flex-shrink-0 overflow-hidden">
      {/* Efecto glassmorphism con gradiente sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white/10 to-purple-50/20 pointer-events-none"></div>
      
      {/* Contenido */}
      <div className="relative z-10">
        {/* Título */}
        <h4 className="font-bold text-xs text-gray-900 mb-1.5 leading-tight">{companyName}</h4>
        
        {/* Verificada */}
        {isVerified && (
          <div className="flex items-center gap-1 mb-1.5">
            <CheckCircle2 size={10} className="text-green-600" />
            <span className="text-[9px] font-semibold text-green-700">Verificada</span>
          </div>
        )}
        
        {/* Tipo de empresa */}
        <p className="text-[10px] text-gray-500 mb-2.5">{companyType}</p>
        
        {/* Línea gris */}
        <div className="border-t border-gray-300/50 mb-2.5"></div>
        
        {/* Precio: label a la izquierda, monto a la derecha */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-gray-600">Precio</span>
          <span className="text-[10px] text-gray-900">
            {pricePerShare.toLocaleString('es-PY')} GS
          </span>
        </div>
        
        {/* Línea separadora entre precio e ingresos */}
        <div className="border-t border-gray-300/50 mb-2"></div>
        
        {/* Ingresos: label a la izquierda, monto a la derecha */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-600">Ingresos</span>
          <span className="text-[10px] text-gray-900">
            {revenue}MM
          </span>
        </div>
      </div>
      
      {/* Brillo sutil en la esquina */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-100/20 to-transparent rounded-full blur-xl pointer-events-none"></div>
    </div>
  );
}