import React from 'react';
import { OrdenTrabajo, ItemOrden, getItemDetalle } from '../types';
import {
  FileCheck,
  Receipt,
  Calendar,
  Phone,
  Shirt,
  CheckCircle2,
  FileText,
  Percent
} from 'lucide-react';

interface PendingInvoicesViewProps {
  ordenes: OrdenTrabajo[];
  onMarcarFacturado: (orden: OrdenTrabajo) => void;
  onPreviewReceipt: (orden: OrdenTrabajo) => void;
  onSendWhatsApp: (orden: OrdenTrabajo) => void;
}

export const PendingInvoicesView: React.FC<PendingInvoicesViewProps> = ({
  ordenes,
  onMarcarFacturado,
  onPreviewReceipt,
  onSendWhatsApp,
}) => {
  const pendientes = ordenes.filter((o) => o.requiereFactura && !o.facturaEmitida);

  if (pendientes.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200/80 max-w-xl mx-auto my-8">
        <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-200">
          <Receipt className="w-9 h-9" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          No hay facturas pendientes de emitir
        </h3>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Todas las órdenes de trabajo marcadas con solicitud de CFDI han sido emitidas y registradas.
        </p>
      </div>
    );
  }

  const totalPorFacturar = pendientes.reduce((acc, o) => acc + o.total, 0);

  return (
    <div className="space-y-6">
      {/* Banner Informativo Vista Facturas */}
      <div className="bg-gradient-to-r from-purple-50 via-fuchsia-50 to-indigo-50 border border-purple-200/90 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-purple-600/10 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Vista 3: Control de Facturas Pendientes (CFDI) ({pendientes.length} {pendientes.length === 1 ? 'orden' : 'órdenes'})
            </h2>
            <p className="text-xs text-slate-600">
              Órdenes marcadas con solicitud fiscal de factura. Una vez generada en el portal del SAT o facturador, presiona <strong className="font-semibold text-purple-900">"Facturado"</strong>.
            </p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-purple-200 text-center shrink-0">
          <span className="text-xs text-slate-500 block">Total a facturar con IVA</span>
          <span className="text-xl font-bold text-purple-800">${totalPorFacturar.toFixed(2)}</span>
        </div>
      </div>

      {/* Lista de Órdenes Pendientes de Facturar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendientes.map((orden) => {
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

          const subtotalCalculado = orden.subtotalGeneral ?? (items.reduce((s, i) => s + (i.precioUnitarioFinal * i.cantidad), 0) + (orden.costoEnvio || 0));
          const ivaCalculado = orden.montoIva ?? (orden.aplicaIva ? subtotalCalculado * 0.16 : 0);

          return (
            <div
              key={orden.id}
              className="bg-purple-50/40 hover:bg-purple-50/70 border border-purple-200/90 rounded-2xl p-5 transition-all shadow-sm hover:shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-purple-800 bg-purple-100/90 px-2 py-0.5 rounded-full border border-purple-200">
                        Folio: {orden.id}
                      </span>
                      {orden.aplicaIva && (
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <Percent className="w-2.5 h-2.5" /> IVA 16% Incluido
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5">{orden.cliente}</h3>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-300 shrink-0">
                    Requiere Factura CFDI
                  </span>
                </div>

                {/* Desglose de Prendas */}
                <div className="space-y-1.5 text-xs text-slate-700 bg-white/80 p-3 rounded-xl border border-purple-100 mb-3">
                  <div className="font-bold text-slate-900 mb-1">Conceptos a facturar:</div>
                  {items.map((item, idx) => (
                    <div key={item.id || idx} className="flex items-center justify-between text-slate-800">
                      <span className="flex items-center gap-1.5">
                        <Shirt className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <strong>{item.cantidad}x</strong> {getItemDetalle(item)}
                      </span>
                      <span className="font-mono text-slate-600">
                        ${(item.precioUnitarioFinal * item.cantidad).toFixed(2)}
                      </span>
                    </div>
                  ))}

                  {orden.costoEnvio > 0 && (
                    <div className="flex items-center justify-between text-slate-800 pt-1 border-t border-purple-100/50">
                      <span>Costo de Envío:</span>
                      <span className="font-mono text-slate-600">${orden.costoEnvio.toFixed(2)}</span>
                    </div>
                  )}

                  {orden.aplicaIva && (
                    <div className="pt-2 border-t border-purple-100 text-[11px] space-y-0.5 text-slate-600">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-mono">${subtotalCalculado.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium text-purple-900">
                        <span>IVA (16%):</span>
                        <span className="font-mono">+${ivaCalculado.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <div className="text-slate-500 flex items-center justify-between pt-2 border-t border-purple-100/60 mt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {fechaStr}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {orden.telefono}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="pt-3 border-t border-purple-200/80 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 block">Total con IVA:</span>
                  <span className="text-sm font-bold text-purple-950 font-mono">
                    ${orden.total.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPreviewReceipt(orden)}
                    title="Ver Recibo y Guía"
                    className="p-2 text-purple-700 bg-white hover:bg-purple-100 active:bg-purple-200 rounded-xl border border-purple-200 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onMarcarFacturado(orden)}
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Facturado</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
