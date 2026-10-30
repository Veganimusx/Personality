import React, { useState } from 'react';
import {
  OrdenTrabajo,
  EstatusOrden,
  ItemOrden,
  getItemDetalle,
} from '../types';
import {
  Printer,
  RefreshCw,
  Search,
  Phone,
  Package,
  Layers,
  CheckCircle2,
  Send,
  Truck,
  Plus,
  Edit3,
  Calendar,
  AlertCircle,
  Receipt,
  Percent
} from 'lucide-react';

interface OrdersViewProps {
  ordenes: OrdenTrabajo[];
  onOpenStatusModal: (orden: OrdenTrabajo) => void;
  onPreviewReceipt: (orden: OrdenTrabajo) => void;
  onOpenNewOrder: () => void;
  onSendWhatsApp: (orden: OrdenTrabajo) => void;
  onAdvanceStatus?: (orden: OrdenTrabajo) => void;
  onEditOrder?: (orden: OrdenTrabajo) => void;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  'Pendiente de Surtir': {
    label: 'Pendiente de Surtir',
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-300',
    dot: 'bg-orange-500',
  },
  'Cotización': {
    label: 'Cotización',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    dot: 'bg-slate-400',
  },
  'Anticipo Recibido': {
    label: 'Anticipo Recibido',
    bg: 'bg-sky-50',
    text: 'text-sky-800',
    border: 'border-sky-300',
    dot: 'bg-sky-500',
  },
  'En Producción': {
    label: 'En Producción',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-300',
    dot: 'bg-blue-600',
  },
  'Listo': {
    label: 'Listo',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-300',
    dot: 'bg-purple-500',
  },
  'Entregado': {
    label: 'Entregado',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
    dot: 'bg-emerald-500',
  },
};

export const OrdersView: React.FC<OrdersViewProps> = ({
  ordenes,
  onOpenStatusModal,
  onPreviewReceipt,
  onOpenNewOrder,
  onSendWhatsApp,
  onAdvanceStatus,
  onEditOrder,
}) => {
  const [filtroEstatus, setFiltroEstatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const ordenesFiltradas = ordenes.filter((o) => {
    const matchEstatus =
      filtroEstatus === 'todos' ||
      o.estatusProduccion === filtroEstatus ||
      o.estatus === filtroEstatus;

    const itemsDesc = (o.items || [])
      .map((i) => `${i.productoNombre} ${i.color} ${i.talla}`)
      .join(' ')
      .toLowerCase();

    const matchBusqueda =
      o.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.telefono.includes(searchTerm) ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itemsDesc.includes(searchTerm.toLowerCase());

    return matchEstatus && matchBusqueda;
  });

  return (
    <div className="relative pb-24">
      {/* Control Bar: Filters & Search */}
      <div className="bg-white rounded-2xl p-4 mb-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente, teléfono o folio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          {/* Status filter pills */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setFiltroEstatus('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filtroEstatus === 'todos'
                  ? 'bg-blue-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({ordenes.length})
            </button>
            {(['Pendiente de Surtir', 'En Producción', 'Listo'] as EstatusOrden[]).map(
              (est) => {
                const count = ordenes.filter(
                  (o) => (o.estatusProduccion || o.estatus) === est
                ).length;
                return (
                  <button
                    key={est}
                    onClick={() => setFiltroEstatus(est)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      filtroEstatus === est
                        ? 'bg-blue-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {est} ({count})
                  </button>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* Orders List */}
      {ordenesFiltradas.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
          <div className="w-16 h-16 bg-blue-50 text-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            No se encontraron órdenes
          </h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            {searchTerm || filtroEstatus !== 'todos'
              ? 'Intenta cambiar los filtros de búsqueda o estatus.'
              : 'Aún no tienes órdenes activas registradas. Haz clic en "Nueva Orden" para registrar la primera.'}
          </p>
          <button
            onClick={onOpenNewOrder}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nueva Orden de Trabajo</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {ordenesFiltradas.map((orden) => {
            const estatusDisplay = orden.estatusProduccion || orden.estatus || 'En Producción';
            const statusStyle = STATUS_CONFIG[estatusDisplay] || STATUS_CONFIG['En Producción'];
            const totalVal = orden.total ?? 0;
            const restantePendiente = orden.restante > 0;
            const fechaIso = orden.fecha || Date.now();

            const items: ItemOrden[] = orden.items && orden.items.length > 0
              ? orden.items
              : [
                  {
                    productoNombre: orden.productoNombre || 'Prenda Textil',
                    color: orden.colorSeleccionado || 'Color',
                    talla: orden.tallaSeleccionada || 'U',
                    cantidad: orden.cantidad || 1,
                    precioUnitarioFinal: orden.precioBaseUnitario || totalVal,
                    logotiposExtras: orden.logotiposExtras || [],
                  },
                ];

            return (
              <div
                key={orden.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                {/* Header of Card: Client & Status */}
                <div className="p-5 pb-3 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h3 className="font-bold text-slate-900 text-base">
                          {orden.cliente}
                        </h3>
                        <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 font-mono">
                          {orden.id}
                        </span>
                        {orden.aplicaIva && (
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-0.5">
                            <Percent className="w-2.5 h-2.5" /> IVA 16%
                          </span>
                        )}
                        {orden.requiereFactura && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                            orden.facturaEmitida
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-purple-100 text-purple-900 border-purple-300'
                          }`}>
                            <Receipt className="w-2.5 h-2.5" />
                            {orden.facturaEmitida ? 'CFDI Emitido' : 'CFDI Pendiente'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{orden.telefono}</span>
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(fechaIso).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div
                      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
                      <span>{estatusDisplay}</span>
                    </div>
                  </div>
                </div>

                {/* Body: Artículos en la orden (Exacto a Flutter: • ${item.cantidad}x ${item.productoNameDetalle()} - P. Unit: $...) */}
                <div className="p-5 py-4 space-y-2 flex-1">
                  <div className="space-y-1.5">
                    {items.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="text-xs text-slate-800 flex items-start justify-between gap-2"
                      >
                        <span className="font-medium">
                          • <strong className="font-bold text-blue-950">{item.cantidad}x</strong> {getItemDetalle(item)}
                        </span>
                        <span className="text-slate-500 shrink-0 font-semibold">
                          P. Unit: <strong className="text-slate-800">${item.precioUnitarioFinal.toFixed(2)}</strong>
                        </span>
                      </div>
                    ))}

                    {orden.costoEnvio > 0 && (
                      <div className="text-xs text-amber-800 flex items-center justify-between font-medium pt-1">
                        <span className="flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-amber-600" />
                          <span>• Envío Local</span>
                        </span>
                        <span>${orden.costoEnvio.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Estado de Inventario */}
                  <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                    <span className="text-slate-500">Inventario:</span>
                    <span
                      className={`font-bold ${
                        orden.estatusInventario === 'Pendiente de surtir' || estatusDisplay === 'Pendiente de Surtir'
                          ? 'text-red-600'
                          : 'text-emerald-700'
                      }`}
                    >
                      {orden.estatusInventario || 'Surtido'}
                    </span>
                  </div>
                </div>

                {/* Footer: Financial Breakdown (Total, Anticipo, Restante) */}
                <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100">
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-white border border-slate-200 mb-3 text-center">
                    <div>
                      <span className="text-[11px] font-medium text-slate-500 block">Total</span>
                      <span className="text-sm sm:text-base font-bold text-slate-900">
                        ${totalVal.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-x border-slate-200 px-1">
                      <span className="text-[11px] font-medium text-slate-500 block">Anticipo</span>
                      <span className="text-sm sm:text-base font-bold text-sky-700">
                        ${orden.anticipo.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-slate-500 block">Restante</span>
                      <span
                        className={`text-sm sm:text-base font-extrabold ${
                          restantePendiente ? 'text-red-600' : 'text-emerald-700'
                        }`}
                      >
                        ${orden.restante.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons matching Flutter UI exactly */}
                  <div className="flex items-center space-x-2 pt-1">
                    {/* Botón Principal: Avanzar Estatus / Marcar Surtido */}
                    <button
                      onClick={() => (onAdvanceStatus ? onAdvanceStatus(orden) : onOpenStatusModal(orden))}
                      className="flex-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 text-xs sm:text-sm font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-2xs"
                      title={
                        estatusDisplay === 'Pendiente de Surtir'
                          ? 'Marcar material como surtido y pasar a producción'
                          : 'Avanzar al siguiente estatus'
                      }
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-blue-700" />
                      <span>
                        {estatusDisplay === 'Pendiente de Surtir'
                          ? 'Marcar Surtido'
                          : 'Avanzar Estatus'}
                      </span>
                    </button>

                    {/* Editar Orden */}
                    {onEditOrder && (
                      <button
                        onClick={() => onEditOrder(orden)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-blue-700 transition-colors shadow-2xs"
                        title="Editar Orden"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}

                    {/* WhatsApp */}
                    <button
                      onClick={() => onSendWhatsApp(orden)}
                      className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center space-x-1.5 transition-colors shadow-2xs"
                      title="Enviar WhatsApp"
                    >
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>

                    {/* Recibo PDF */}
                    <button
                      onClick={() => onPreviewReceipt(orden)}
                      className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition-colors shadow-2xs"
                      title="Compartir PDF"
                    >
                      <Printer className="w-4 h-4" />
                      <span className="hidden sm:inline">PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button (+) */}
      <button
        onClick={onOpenNewOrder}
        className="fixed right-6 bottom-6 z-30 flex items-center space-x-2 px-5 py-3.5 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-0.5"
        title="Crear Nueva Orden de Trabajo"
      >
        <Plus className="w-5 h-5" />
        <span className="font-bold text-sm tracking-wide">Nueva Orden</span>
      </button>
    </div>
  );
};
