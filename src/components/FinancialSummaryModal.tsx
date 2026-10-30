import React from 'react';
import { TallerStats, OrdenTrabajo } from '../types';
import {
  X,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  Layers,
  Receipt
} from 'lucide-react';

interface FinancialSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: TallerStats;
  ordenes: OrdenTrabajo[];
}

export const FinancialSummaryModal: React.FC<FinancialSummaryModalProps> = ({
  isOpen,
  onClose,
  stats,
  ordenes,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Balance Financiero del Taller</h3>
              <p className="text-xs text-blue-200">
                Flujo de caja, anticipos y saldos por cobrar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-blue-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Main 3 Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
              <span className="text-xs font-semibold text-sky-800 block">
                Anticipos Cobrados (En Caja)
              </span>
              <span className="text-2xl font-black text-sky-900 block mt-1">
                ${stats.totalAnticiposRecibidos.toFixed(2)}
              </span>
              <span className="text-[10px] text-sky-700 mt-0.5 block">
                Pagos ya recibidos de clientes
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-xs font-semibold text-amber-800 block">
                Restante por Cobrar
              </span>
              <span className="text-2xl font-black text-amber-900 block mt-1">
                ${stats.totalRestantePorCobrar.toFixed(2)}
              </span>
              <span className="text-[10px] text-amber-700 mt-0.5 block">
                Saldo pendiente a liquidar en entrega
              </span>
            </div>
          </div>

          {/* Expected Total */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium block">
                Total Acumulado de Órdenes
              </span>
              <span className="text-xl font-bold">
                ${stats.totalIngresosEsperados.toFixed(2)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-medium block">
                Total de Trabajos
              </span>
              <span className="text-xl font-bold text-blue-400">
                {stats.totalOrdenes} órdenes
              </span>
            </div>
          </div>

          {/* Breakdown by status */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Distribución de Trabajos
            </h4>
            <div className="space-y-1.5 text-xs">
              {(['Cotización', 'Anticipo Recibido', 'En Producción', 'Listo', 'Entregado'] as const).map(
                (st) => {
                  const count = ordenes.filter((o) => o.estatus === st).length;
                  const pct = stats.totalOrdenes > 0 ? Math.round((count / stats.totalOrdenes) * 100) : 0;
                  return (
                    <div
                      key={st}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <span className="font-semibold text-slate-800">{st}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-blue-900">{count} pedidos</span>
                        <span className="text-slate-400">({pct}%)</span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Critical Inventory Alert */}
          {stats.prendasStockCritico > 0 ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-xs text-red-800">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span>
                <strong>Atención:</strong> Tienes {stats.prendasStockCritico} prendas con
                menos de 5 piezas en inventario. Considera reabastecer para no detener
                producción.
              </span>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3 text-xs text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Inventario saludable: todas las prendas superan el umbral de 5 piezas.</span>
            </div>
          )}

          {/* Pending Invoices Alert */}
          {stats.totalFacturasPendientes > 0 && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center space-x-3 text-xs text-purple-900">
              <Receipt className="w-5 h-5 text-purple-600 shrink-0" />
              <span>
                <strong>Facturación CFDI:</strong> Tienes {stats.totalFacturasPendientes} {stats.totalFacturasPendientes === 1 ? 'orden pendiente' : 'órdenes pendientes'} de emitir factura en el SAT.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
