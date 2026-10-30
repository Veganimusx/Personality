import React from 'react';
import { OrdenTrabajo, EstatusOrden } from '../types';
import {
  X,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface StatusChangeModalProps {
  orden: OrdenTrabajo | null;
  onClose: () => void;
  onUpdateStatus: (ordenId: string, nuevoEstatus: EstatusOrden) => void;
}

const ESTATUS_OPTIONS: {
  estatus: EstatusOrden;
  desc: string;
  badgeBg: string;
  badgeText: string;
  icon: string;
}[] = [
  {
    estatus: 'Cotización',
    desc: 'Propuesta de costos enviada al cliente. No descuenta stock a menos que se confirme anticipo.',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    icon: '📋',
  },
  {
    estatus: 'Anticipo Recibido',
    desc: 'Pago parcial registrado. Descuenta inmediatamente la cantidad del stock en almacén.',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-800',
    icon: '💵',
  },
  {
    estatus: 'En Producción',
    desc: 'Prendas en mesa de corte, bordado, estampado o sublimación.',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    icon: '⚙️',
  },
  {
    estatus: 'Listo',
    desc: 'Trabajo terminado, empacado y listo para retiro en sucursal o envío.',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    icon: '✨',
  },
  {
    estatus: 'Entregado',
    desc: 'Orden recibida a conformidad por el cliente con liquidación de saldo.',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    icon: '📦',
  },
];

export const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  orden,
  onClose,
  onUpdateStatus,
}) => {
  if (!orden) return null;

  const handleSelect = (nuevoEstatus: EstatusOrden) => {
    onUpdateStatus(orden.id, nuevoEstatus);
    onClose();
  };

  const willTriggerDeduction =
    !orden.stockYaDescontado &&
    (orden.estatus === 'Cotización');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Actualizar Estatus de Orden</h3>
            <p className="text-xs text-slate-300">
              {orden.id} • {orden.cliente}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Order quick summary */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block">Prendas de la orden:</span>
              <span className="font-bold text-slate-900">
                {orden.items && orden.items.length > 0
                  ? `${orden.items.length} artículo(s) (${orden.items.reduce((s, i) => s + i.cantidad, 0)} pzas)`
                  : `${orden.productoNombre || 'Prenda'} (${orden.cantidad || 1} pzas)`}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Estatus actual:</span>
              <span className="font-bold text-blue-900">
                {orden.estatusProduccion || orden.estatus || 'En Producción'}
              </span>
            </div>
          </div>

          {/* Rule Notice */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Regla de Stock:</p>
              <p className="text-blue-800">
                {orden.stockYaDescontado
                  ? 'El stock ya fue descontado previamente cuando se registró el anticipo o se inició la orden.'
                  : 'Si pasas a "Anticipo Recibido" o "En Producción", se descontarán automáticamente las ' +
                    orden.cantidad +
                    ' piezas del almacén.'}
              </p>
            </div>
          </div>

          {/* Status List */}
          <div className="space-y-2 pt-2">
            {ESTATUS_OPTIONS.map((item) => {
              const isCurrent = orden.estatus === item.estatus;
              return (
                <button
                  key={item.estatus}
                  onClick={() => handleSelect(item.estatus)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    isCurrent
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {item.estatus}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-700 text-white">
                            Actual
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
