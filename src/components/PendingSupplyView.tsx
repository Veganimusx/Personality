import React from 'react';
import { OrdenTrabajo, ItemOrden, getItemDetalle } from '../types';
import {
  CheckCircle2,
  Calendar,
  Phone,
  AlertTriangle,
  Shirt,
  RefreshCw
} from 'lucide-react';

interface PendingSupplyViewProps {
  ordenes: OrdenTrabajo[];
  onMarcarSurtido: (orden: OrdenTrabajo) => void;
  onPreviewReceipt: (orden: OrdenTrabajo) => void;
  onSendWhatsApp: (orden: OrdenTrabajo) => void;
}

export const PendingSupplyView: React.FC<PendingSupplyViewProps> = ({
  ordenes,
  onMarcarSurtido,
}) => {
  if (ordenes.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200/80 max-w-xl mx-auto my-8">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          ¡Excelente! No hay piezas pendientes de surtir
        </h3>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Todas las órdenes activas cuentan con inventario asignado en taller y se encuentran en fase de producción o listas.
        </p>
      </div>
    );
  }

  const totalPiezasPendientes = ordenes.reduce((acc, o) => {
    if (o.items && o.items.length > 0) {
      return acc + o.items.reduce((sum, i) => sum + i.cantidad, 0);
    }
    return acc + (o.cantidad || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Banner Informativo */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Vista 2: Piezas Pendientes de Surtir ({ordenes.length} {ordenes.length === 1 ? 'pedido' : 'pedidos'})
            </h2>
            <p className="text-xs text-slate-600">
              Órdenes recibidas sin stock suficiente en almacén. Al recibir mercancía, pulsa <strong className="font-semibold text-slate-800">"Marcar Surtido"</strong> para avanzar la orden a producción.
            </p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xs px-4 py-2 rounded-xl border border-amber-200 text-center shrink-0">
          <span className="text-xs text-slate-500 block">Total piezas a surtir</span>
          <span className="text-xl font-bold text-amber-700">{totalPiezasPendientes} pzas</span>
        </div>
      </div>

      {/* Lista de Órdenes Pendientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ordenes.map((orden) => {
          const fechaObj = new Date(orden.fecha || Date.now());
          const fechaStr = `${fechaObj.getDate()}/${fechaObj.getMonth() + 1}/${fechaObj.getFullYear()}`;

          const items: ItemOrden[] = orden.items && orden.items.length > 0
            ? orden.items
            : [
                {
                  productoNombre: orden.productoNombre || 'Prenda',
                  color: orden.colorSeleccionado || 'Color',
                  talla: orden.tallaSeleccionada || 'U',
                  cantidad: orden.cantidad || 1,
                  precioUnitarioFinal: orden.precioBaseUnitario || orden.total,
                  logotiposExtras: orden.logotiposExtras || [],
                },
              ];

          const piezasEnOrden = items.reduce((s, i) => s + i.cantidad, 0);

          return (
            <div
              key={orden.id}
              className="bg-amber-50/50 hover:bg-amber-50/80 border border-amber-200/80 rounded-2xl p-5 transition-all shadow-sm hover:shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300">
                      Folio: {orden.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{orden.cliente}</h3>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 shrink-0">
                    Faltan {piezasEnOrden} pzas
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 bg-white/70 p-3 rounded-xl border border-amber-100 mb-4">
                  <div className="font-bold text-slate-900 mb-1">Prendas requeridas:</div>
                  {items.map((item, idx) => (
                    <div key={item.id || idx} className="flex items-center space-x-2 text-slate-800">
                      <Shirt className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        <strong>{item.cantidad}x</strong> {getItemDetalle(item)}
                      </span>
                    </div>
                  ))}
                  <div className="text-slate-500 flex items-center gap-2 pt-1 border-t border-amber-100/60 mt-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Fecha del pedido: {fechaStr}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-amber-200/70 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">
                  Total: ${orden.total.toFixed(2)}
                </span>
                <button
                  onClick={() => onMarcarSurtido(orden)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Marcar Surtido</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
