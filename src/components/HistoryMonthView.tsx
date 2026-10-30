import React, { useState } from 'react';
import { OrdenTrabajo, ItemOrden, getItemDetalle } from '../types';
import {
  Calendar,
  CheckCircle2,
  Phone,
  FileText,
  DollarSign,
  Printer,
  Search,
  Share2
} from 'lucide-react';

interface HistoryMonthViewProps {
  ordenesFinalizadas: OrdenTrabajo[];
  onPreviewReceipt: (orden: OrdenTrabajo) => void;
  onSendWhatsApp: (orden: OrdenTrabajo) => void;
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const HistoryMonthView: React.FC<HistoryMonthViewProps> = ({
  ordenesFinalizadas,
  onPreviewReceipt,
  onSendWhatsApp,
}) => {
  const now = new Date();
  const [mesSeleccionado, setMesSeleccionado] = useState<number>(now.getMonth() + 1);
  const [anioSeleccionado] = useState<number>(now.getFullYear());
  const [searchTerm, setSearchTerm] = useState('');

  const filtradas = ordenesFinalizadas.filter((o) => {
    const f = new Date(o.fecha || Date.now());
    const matchMes = f.getMonth() + 1 === mesSeleccionado && f.getFullYear() === anioSeleccionado;
    const itemsDesc = (o.items || [])
      .map((i) => `${i.productoNombre} ${i.color} ${i.talla}`)
      .join(' ')
      .toLowerCase();

    const matchSearch =
      o.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itemsDesc.includes(searchTerm.toLowerCase());

    return matchMes && matchSearch;
  });

  const totalVendidoMes = filtradas.reduce((acc, o) => acc + o.total, 0);
  const totalPiezasMes = filtradas.reduce((acc, o) => {
    if (o.items && o.items.length > 0) {
      return acc + o.items.reduce((sum, i) => sum + i.cantidad, 0);
    }
    return acc + (o.cantidad || 0);
  }, 0);

  return (
    <div className="pb-20 space-y-5">
      {/* Selector de Mes y Resumen Financiero */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Month selector dropdown */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Filtrar por Mes:
              </label>
              <select
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(parseInt(e.target.value))}
                className="font-bold text-base text-slate-900 bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
              >
                {MESES.map((nombreMes, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {nombreMes} {anioSeleccionado}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <div>
              <span className="text-[11px] text-slate-500 block">Pedidos Entregados</span>
              <span className="font-extrabold text-slate-900 text-sm">
                {filtradas.length} órdenes ({totalPiezasMes} pzas)
              </span>
            </div>
            <div className="h-7 w-px bg-slate-300" />
            <div>
              <span className="text-[11px] text-slate-500 block">Facturación del Mes</span>
              <span className="font-black text-emerald-700 text-base">
                ${totalVendidoMes.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mt-3 pt-3 border-t border-slate-100 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar en el historial de este mes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Lista de Pedidos Entregados */}
      {filtradas.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            No hay pedidos finalizados en {MESES[mesSeleccionado - 1]}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Cuando marques una orden activa como &quot;Entregado&quot;, aparecerá automáticamente archivada en este historial mensual.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtradas.map((orden) => {
            const f = new Date(orden.fecha || Date.now());
            const fechaStr = `${f.getDate()} de ${MESES[f.getMonth()]}, ${f.getFullYear()}`;
            const totalVal = orden.total;

            const items: ItemOrden[] = orden.items && orden.items.length > 0
              ? orden.items
              : [
                  {
                    productoNombre: orden.productoNombre || 'Prenda',
                    color: orden.colorSeleccionado || 'Color',
                    talla: orden.tallaSeleccionada || 'U',
                    cantidad: orden.cantidad || 1,
                    precioUnitarioFinal: totalVal,
                    logotiposExtras: [],
                  },
                ];

            const cantPiezas = items.reduce((s, i) => s + i.cantidad, 0);

            return (
              <div
                key={orden.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-slate-300 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-900 text-sm">{orden.cliente}</h4>
                      <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {orden.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Total de artículos: <strong className="text-slate-800">{items.length}</strong> ({cantPiezas} pzas) • Entregado el {fechaStr}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="text-right pr-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Total Liquidado
                    </span>
                    <span className="text-base font-black text-slate-900">
                      ${totalVal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onSendWhatsApp(orden)}
                      className="p-2 rounded-xl text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-xs font-semibold flex items-center space-x-1"
                      title="Compartir por WhatsApp"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>

                    <button
                      onClick={() => onPreviewReceipt(orden)}
                      className="p-2 rounded-xl text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-semibold flex items-center space-x-1"
                      title="Ver e Imprimir Recibo"
                    >
                      <Printer className="w-4 h-4" />
                      <span className="hidden sm:inline">Recibo</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
