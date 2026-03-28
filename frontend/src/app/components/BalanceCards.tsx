interface BalanceCardsProps {
  balanceGuaranies: number;
  balanceDollars: number;
}

export function BalanceCards({ balanceGuaranies, balanceDollars }: BalanceCardsProps) {
  return (
    <div className="bg-white px-4 pt-4 pb-3">
      <div className="max-w-md mx-auto">
        <p className="text-sm text-gray-600 font-medium mb-3">Tu dinero disponible</p>
        
        <div className="flex gap-3">
          <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-3.5">
            <p className="text-xs text-gray-600 font-medium mb-1">Guaraníes</p>
            <p className="text-xl font-bold text-gray-900 tracking-tight">
              Gs {balanceGuaranies.toLocaleString('es-PY')}
            </p>
          </div>
          <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-3.5">
            <p className="text-xs text-gray-600 font-medium mb-1">Dólares</p>
            <p className="text-xl font-bold text-gray-900 tracking-tight">
              USD {balanceDollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}