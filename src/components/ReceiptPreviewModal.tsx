import React, { useState } from 'react';
import { OrdenTrabajo, DatosNegocio, ItemOrden, getItemDetalle } from '../types';
import { generarReciboPDF, DEFAULT_NEGOCIO } from '../services/pdfGenerator';
import {
  X,
  Printer,
  Download,
  FileText,
  Phone,
  Compass,
  Image as ImageIcon,
  CheckCircle2,
  Layers,
  Sparkles,
  Truck,
  Shirt
} from 'lucide-react';

interface ReceiptPreviewModalProps {
  orden: OrdenTrabajo | null;
  negocio?: DatosNegocio;
  onClose: () => void;
}

export const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({
  orden,
  negocio = DEFAULT_NEGOCIO,
  onClose,
}) => {
  const [activeSheet, setActiveSheet] = useState<1 | 2>(1);

  if (!orden) return null;

  const handleDownloadPDF = () => {
    generarReciboPDF(orden, negocio, true);
  };

  const handlePrint = () => {
    window.print();
  };

  const items: ItemOrden[] = orden.items && orden.items.length > 0
    ? orden.items
    : [
        {
          productoNombre: orden.productoNombre || 'Prenda Textil',
          color: orden.colorSeleccionado || 'Color',
          talla: orden.tallaSeleccionada || 'U',
          cantidad: orden.cantidad || 1,
          precioUnitarioFinal: orden.precioBaseUnitario || orden.total,
          logotiposExtras: orden.logotiposExtras || [],
        },
      ];

  const total = orden.total;
  const anticipo = orden.anticipo;
  const restante = orden.restante;
  const restantePendiente = restante > 0;
  const fechaIso = orden.fecha || Date.now();
  const fechaObj = new Date(fechaIso);
  const fechaStr = `${fechaObj.getDate()}/${fechaObj.getMonth() + 1}/${fechaObj.getFullYear()}`;

  // Count total logos
  const totalLogos = items.reduce((sum, item) => sum + (item.logotiposExtras?.length || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 print:shadow-none print:border-none print:m-0 print:max-w-none">
        {/* Modal Top Bar (Hidden during print) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-base">Comprobante y Guía de Taller</h3>
              <p className="text-xs text-slate-300">Folio: {orden.id} • PDF Oficial UNITAP</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-700"
              title="Imprimir directamente"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-2xs"
              title="Descargar archivo PDF"
            >
              <Download className="w-4 h-4" />
              <span>Descargar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switch for Hoja 1 and Hoja 2 */}
        <div className="bg-slate-100 px-6 py-2 border-b border-slate-200 flex items-center space-x-2 print:hidden">
          <button
            onClick={() => setActiveSheet(1)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeSheet === 1
                ? 'bg-blue-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Hoja 1: Nota de Pedido ({items.length} artículos)</span>
          </button>
          <button
            onClick={() => setActiveSheet(2)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeSheet === 2
                ? 'bg-blue-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Hoja 2: Guía de Producción ({totalLogos} logos)</span>
          </button>
        </div>

        {/* Printable Order Sheet */}
        <div className="p-8 bg-white print:p-6" id="printable-receipt">
          {activeSheet === 1 ? (
            /* ==================================================== */
            /* HOJA 1: NOTA DE PEDIDO Y PRECIOS UNIFICADOS         */
            /* ==================================================== */
            <div>
              {/* Header */}
              <div className="flex items-start justify-between pb-6 border-b-2 border-slate-800">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden shadow-sm">
                    {negocio.logoPath ? (
                      <img src={negocio.logoPath} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      'U'
                    )}
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">
                      {negocio.nombre.toUpperCase()}
                    </h1>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Especialistas en Uniformes, Bordado, Sublimación, DTF y Serigrafía
                    </p>
                    <p className="text-xs text-slate-500">
                      Tel: {negocio.telefono} • Ubicación: {negocio.direccion}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block border-2 border-blue-900 rounded-xl p-2.5 bg-blue-50/50">
                    <span className="text-[10px] uppercase font-bold text-blue-900 block">
                      NOTA DE PEDIDO
                    </span>
                    <span className="text-base font-black text-red-700 block font-mono">
                      {orden.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer & Date Details */}
              <div className="grid grid-cols-2 gap-6 my-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Datos del Cliente
                  </span>
                  <p className="text-sm font-bold text-slate-900">{orden.cliente}</p>
                  <p className="text-slate-600 flex items-center space-x-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{orden.telefono}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Información de Orden
                  </span>
                  <p className="text-slate-700">
                    Fecha: <strong className="text-slate-900">{fechaStr}</strong>
                  </p>
                  <p className="text-slate-700 mt-0.5">
                    Estatus:{' '}
                    <strong className="text-blue-900 font-bold">
                      {orden.estatusProduccion || 'En Producción'}
                    </strong>
                  </p>
                </div>
              </div>

              {/* Garment Details & Multi-Item Table */}
              <div className="overflow-hidden rounded-xl border border-slate-200 mb-5">
                <table className="w-full text-left text-xs">
                  <thead className="bg-blue-900 text-white font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3 text-center">Cant.</th>
                      <th className="py-2.5 px-4">Descripción Prenda</th>
                      <th className="py-2.5 px-3 text-right">P. Unitario Final</th>
                      <th className="py-2.5 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {items.map((item, idx) => {
                      const subtotal = item.precioUnitarioFinal * item.cantidad;
                      return (
                        <tr key={item.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                          <td className="py-2.5 px-3 text-center font-extrabold text-blue-900 text-sm">
                            {item.cantidad}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-slate-800">
                            {getItemDetalle(item)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                            ${item.precioUnitarioFinal.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                            ${subtotal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Fila Envío si aplica */}
                    {orden.costoEnvio > 0 && (
                      <tr className="bg-amber-50/60">
                        <td className="py-2 px-3 text-center font-bold text-amber-800">1</td>
                        <td className="py-2 px-4 font-semibold text-amber-900 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-amber-600" />
                          <span>Costo de Envío / Entrega a Domicilio</span>
                        </td>
                        <td className="py-2 px-3 text-right font-medium text-amber-800">
                          ${orden.costoEnvio.toFixed(2)}
                        </td>
                        <td className="py-2 px-4 text-right font-bold text-amber-900">
                          ${orden.costoEnvio.toFixed(2)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Financial Breakdown Card */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-5">
                {/* Status Stamp */}
                <div
                  className={`p-3 rounded-xl border text-center w-full sm:w-auto ${
                    !restantePendiente
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-amber-50 border-amber-300 text-amber-900'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-wider block">
                    Estado de la Cuenta
                  </span>
                  <span className="text-sm font-extrabold block">
                    {!restantePendiente ? 'TOTALMENTE LIQUIDADO' : 'ANTICIPO RECIBIDO'}
                  </span>
                  <span className="text-[11px] block mt-0.5 text-slate-600">
                    {!restantePendiente
                      ? 'Sin saldo pendiente de pago'
                      : `Restante a pagar: $${restante.toFixed(2)}`}
                  </span>
                </div>

                {/* Numbers */}
                <div className="w-full sm:w-64 space-y-1.5 text-xs text-right">
                  {orden.aplicaIva && (
                    <>
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal:</span>
                        <span className="font-semibold text-slate-900">
                          ${(orden.subtotalGeneral ?? (items.reduce((s, i) => s + (i.precioUnitarioFinal * i.cantidad), 0) + (orden.costoEnvio || 0))).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-indigo-700">
                        <span>IVA (16%):</span>
                        <span className="font-semibold">
                          +${(orden.montoIva ?? ((orden.subtotalGeneral ?? (items.reduce((s, i) => s + (i.precioUnitarioFinal * i.cantidad), 0) + (orden.costoEnvio || 0))) * 0.16)).toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Total de la Orden:</span>
                    <span className="font-bold text-slate-900">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sky-700">
                    <span>Anticipo Recibido:</span>
                    <span className="font-bold">-${anticipo.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-300 flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-800">RESTANTE A PAGAR:</span>
                    <span
                      className={`font-black text-lg ${
                        restantePendiente ? 'text-red-700' : 'text-emerald-700'
                      }`}
                    >
                      ${restante.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gracias por su preferencia */}
              <div className="text-center italic text-slate-600 font-medium my-3 text-xs">
                ¡Gracias por su preferencia!
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-12 mt-5 pt-3 text-center text-xs text-slate-600 border-t border-slate-200">
                <div>
                  <div className="border-b border-slate-400 w-44 mx-auto mb-2" />
                  <p className="font-semibold">Firma del Cliente</p>
                  <p className="text-[10px] text-slate-400">Aceptación y recibido</p>
                </div>
                <div>
                  <div className="border-b border-slate-400 w-44 mx-auto mb-2" />
                  <p className="font-semibold">Sello / Firma {negocio.nombre}</p>
                  <p className="text-[10px] text-slate-400">{negocio.nombre}</p>
                </div>
              </div>
            </div>
          ) : (
            /* ==================================================== */
            /* HOJA 2: GUÍA DE PRODUCCIÓN - LOGOS Y UBICACIONES     */
            /* ==================================================== */
            <div className="space-y-6">
              <div className="text-center border-b pb-4 border-slate-200">
                <span className="text-xs font-bold text-blue-800 tracking-wider uppercase block">
                  HOJA 2 • GUÍA TÉCNICA DE TALLER
                </span>
                <h2 className="text-2xl font-black text-blue-900 tracking-tight">
                  GUÍA DE PRODUCCIÓN - LOGOS Y UBICACIONES
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Cliente: <span className="font-bold text-slate-900">{orden.cliente}</span> • Folio: <span className="font-bold text-red-700">{orden.id}</span>
                </p>
              </div>

              {/* Render de logotipos agrupados por artículo */}
              {totalLogos > 0 ? (
                <div className="space-y-4">
                  {items.map((item, iIdx) => {
                    const itemLogos = item.logotiposExtras || [];
                    if (itemLogos.length === 0) return null;

                    return (
                      <div key={item.id || iIdx} className="space-y-3">
                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                          <Shirt className="w-3.5 h-3.5 text-blue-700" />
                          <span>Prenda: {getItemDetalle(item)} ({item.cantidad} pzas)</span>
                        </div>

                        {itemLogos.map((logo, lIdx) => (
                          <div
                            key={logo.id || lIdx}
                            className="border border-slate-300 rounded-2xl p-4 bg-slate-50 flex items-start gap-4"
                          >
                            {logo.imagenPath ? (
                              <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-300 bg-white shrink-0 p-1">
                                <img
                                  src={logo.imagenPath}
                                  alt={logo.ubicacion}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center shrink-0 text-slate-400">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                            )}

                            <div className="flex-1 text-xs">
                              <span className="text-[10px] text-slate-500 block">
                                Prenda: {getItemDetalle(item)}
                              </span>
                              <span className="font-black text-sm text-blue-900 uppercase block mt-0.5">
                                UBICACIÓN: {logo.ubicacion.toUpperCase()}
                              </span>
                              <p className="text-slate-700 text-xs font-medium mt-1">
                                <strong>Detalle:</strong> {logo.descripcion}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500">
                  Esta orden no cuenta con especificaciones de logos o personalizaciones adicionales.
                </div>
              )}

              {/* Control de Calidad en Taller */}
              <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 space-y-1">
                <span className="font-bold text-amber-900 block mb-1">
                  CONTROL DE CALIDAD Y MONTAJE EN TALLER:
                </span>
                <p>1. Verificar coincidencia de colores de hilo / tintas y ortografía en nombres personalizados.</p>
                <p>2. Centrar o posicionar según la guía técnica antes del planchado, bordado o fijación térmica.</p>
                <p>3. Deshebrar, empacar individualmente y cotejar cantidades completas antes de marcar como "Listo".</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
