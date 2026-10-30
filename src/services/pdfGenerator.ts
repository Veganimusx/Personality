import { jsPDF } from 'jspdf';
import { OrdenTrabajo, DatosNegocio, ItemOrden, getItemDetalle } from '../types';

export const DEFAULT_NEGOCIO: DatosNegocio = {
  nombre: 'UNITAP - Bordados y Uniformes',
  telefono: '81 0000 0000',
  direccion: 'Guadalupe, Nuevo León',
};

export function generarReciboPDF(
  orden: OrdenTrabajo,
  negocio: DatosNegocio = DEFAULT_NEGOCIO,
  autoDownload: boolean = true
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const items: ItemOrden[] = orden.items && orden.items.length > 0
    ? orden.items
    : [
        {
          productoNombre: orden.productoNombre || 'Prenda Textil',
          color: orden.colorSeleccionado || 'Color',
          talla: orden.tallaSeleccionada || 'U',
          cantidad: orden.cantidad || 1,
          precioUnitarioFinal: orden.precioBaseUnitario || ((orden.total - (orden.costoEnvio || 0)) / (orden.cantidad || 1)),
          logotiposExtras: orden.logotiposExtras || [],
        },
      ];

  const total = orden.total;
  const anticipo = orden.anticipo;
  const restante = orden.restante;
  const costoEnvio = orden.costoEnvio || 0;

  // ==========================================
  // HOJA 1: NOTA DE PEDIDO Y PRECIOS UNIFICADOS
  // ==========================================
  let y = 16;

  // Encabezado con datos del negocio
  doc.setFillColor(30, 58, 138); // Blue 900
  doc.roundedRect(14, y, pageWidth - 28, 28, 3, 3, 'F');

  let textStartX = 20;
  if (negocio.logoPath) {
    try {
      doc.addImage(negocio.logoPath, 'JPEG', 20, y + 4, 20, 20);
      textStartX = 44;
    } catch {
      textStartX = 20;
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(negocio.nombre.toUpperCase(), textStartX, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Tel: ${negocio.telefono}`, textStartX, y + 16);
  doc.text(`Ubicación: ${negocio.direccion}`, textStartX, y + 21);

  // Recuadro Folio en la esquina superior derecha
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth - 66, y + 4, 48, 20, 2, 2, 'F');
  doc.setTextColor(30, 58, 138);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('NOTA DE PEDIDO', pageWidth - 42, y + 9.5, { align: 'center' });
  doc.setFontSize(11);
  doc.setTextColor(185, 28, 28);
  doc.text(orden.id, pageWidth - 42, y + 18, { align: 'center' });

  y += 34;

  // Datos del Cliente y Fecha
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Cliente: ${orden.cliente}`, 18, y + 7.5);
  doc.text(`Teléfono WhatsApp: ${orden.telefono}`, 18, y + 14.5);

  const fechaObj = new Date(orden.fecha || Date.now());
  const fechaStr = `${fechaObj.getDate()}/${fechaObj.getMonth() + 1}/${fechaObj.getFullYear()}`;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Fecha: ${fechaStr}`, pageWidth - 20, y + 7.5, { align: 'right' });
  doc.text(`Estatus: ${orden.estatusProduccion}`, pageWidth - 20, y + 14.5, { align: 'right' });

  y += 28;

  // Tabla con encabezados exactos: ['Cant.', 'Descripción Prenda', 'P. Unitario Final', 'Subtotal']
  const tableX = 14;
  const tableWidth = pageWidth - 28;

  doc.setFillColor(30, 58, 138);
  doc.rect(tableX, y, tableWidth, 8.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('CANT.', tableX + 4, y + 5.5);
  doc.text('DESCRIPCIÓN PRENDA', tableX + 24, y + 5.5);
  doc.text('P. UNITARIO FINAL', tableX + 115, y + 5.5);
  doc.text('SUBTOTAL', tableX + tableWidth - 4, y + 5.5, { align: 'right' });

  y += 8.5;

  // Filas de Artículos
  items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(tableX, y, tableWidth, 11, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(tableX, y + 11, tableX + tableWidth, y + 11);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`${item.cantidad}`, tableX + 4, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const detalle = getItemDetalle(item);
    doc.text(detalle, tableX + 24, y + 7);

    doc.text(`$${item.precioUnitarioFinal.toFixed(2)}`, tableX + 115, y + 7);

    doc.setFont('helvetica', 'bold');
    const subtotal = item.precioUnitarioFinal * item.cantidad;
    doc.text(`$${subtotal.toFixed(2)}`, tableX + tableWidth - 4, y + 7, { align: 'right' });

    y += 11;
  });

  // Costo de Envío si aplica
  if (costoEnvio > 0) {
    doc.setFillColor(254, 243, 199);
    doc.rect(tableX, y, tableWidth, 9, 'F');
    doc.setDrawColor(253, 230, 138);
    doc.line(tableX, y + 9, tableX + tableWidth, y + 9);

    doc.setTextColor(146, 64, 14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('1', tableX + 4, y + 6);
    doc.text('Servicio de Envío y Paquetería Local', tableX + 24, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(`$${costoEnvio.toFixed(2)}`, tableX + 115, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${costoEnvio.toFixed(2)}`, tableX + tableWidth - 4, y + 6, { align: 'right' });

    y += 9;
  }

  y += 10;

  // Bloque de Totales (Subtotal, IVA 16% si aplica, Total, Anticipo, Restante a pagar en rojo)
  const totalsBoxWidth = 85;
  const totalsBoxX = pageWidth - 14 - totalsBoxWidth;
  const subtotalGeneral = orden.subtotalGeneral ?? (items.reduce((s, i) => s + (i.precioUnitarioFinal * i.cantidad), 0) + costoEnvio);
  const montoIva = orden.montoIva ?? (orden.aplicaIva ? subtotalGeneral * 0.16 : 0);
  const totalsBoxHeight = orden.aplicaIva ? 48 : 34;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(totalsBoxX, y, totalsBoxWidth, totalsBoxHeight, 2, 2, 'FD');

  let currentTotalsY = y + 7;

  if (orden.aplicaIva) {
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', totalsBoxX + 6, currentTotalsY);
    doc.text(`$${subtotalGeneral.toFixed(2)}`, totalsBoxX + totalsBoxWidth - 6, currentTotalsY, { align: 'right' });

    currentTotalsY += 7;
    doc.text('IVA (16%):', totalsBoxX + 6, currentTotalsY);
    doc.text(`$${montoIva.toFixed(2)}`, totalsBoxX + totalsBoxWidth - 6, currentTotalsY, { align: 'right' });

    currentTotalsY += 8;
  }

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text('Total de la Orden:', totalsBoxX + 6, currentTotalsY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`$${total.toFixed(2)}`, totalsBoxX + totalsBoxWidth - 6, currentTotalsY, { align: 'right' });

  currentTotalsY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Anticipo Recibido:', totalsBoxX + 6, currentTotalsY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(3, 105, 161);
  doc.text(`$${anticipo.toFixed(2)}`, totalsBoxX + totalsBoxWidth - 6, currentTotalsY, { align: 'right' });

  currentTotalsY += 5;
  doc.setDrawColor(203, 213, 225);
  doc.line(totalsBoxX + 4, currentTotalsY, totalsBoxX + totalsBoxWidth - 4, currentTotalsY);

  currentTotalsY += 6;
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text('Restante a Pagar:', totalsBoxX + 6, currentTotalsY);
  doc.text(`$${restante.toFixed(2)}`, totalsBoxX + totalsBoxWidth - 6, currentTotalsY, { align: 'right' });

  // Mensaje de pie de hoja 1
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text('¡Gracias por su preferencia!', pageWidth / 2, pageHeight - 16, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Hoja 1 de 2 • Comprobante Fiscal Interno • ${negocio.nombre}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  // ==========================================
  // HOJA 2: GUÍA DE PRODUCCIÓN
  // ==========================================
  doc.addPage();
  y = 16;

  // Banner Hoja 2
  doc.setFillColor(30, 58, 138);
  doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('GUÍA DE PRODUCCIÓN - LOGOS Y UBICACIONES', 20, y + 9);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Cliente: ${orden.cliente}  |  Folio: ${orden.id}  |  Fecha: ${fechaStr}`, 20, y + 16);

  y += 28;

  // Flatten logos from all items
  const todosLosLogos: Array<{
    item: ItemOrden;
    logo: { ubicacion: string; descripcion: string; costoExtra: number; imagenPath?: string };
  }> = [];

  items.forEach((item) => {
    (item.logotiposExtras || []).forEach((logo) => {
      todosLosLogos.push({ item, logo });
    });
  });

  if (todosLosLogos.length === 0) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, pageWidth - 28, 30, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Esta orden no tiene logotipos extras o personalizaciones especificadas.', 20, y + 16);
    y += 38;
  } else {
    todosLosLogos.forEach((entry, idx) => {
      if (y > pageHeight - 50) {
        doc.addPage();
        y = 16;
      }

      const { item, logo } = entry;
      const cardHeight = 26;

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(14, y, pageWidth - 28, cardHeight, 2, 2, 'FD');

      let contentX = 20;

      // Si tiene boceto o imagen
      if (logo.imagenPath) {
        try {
          doc.addImage(logo.imagenPath, 'JPEG', 18, y + 3, 20, 20);
          contentX = 42;
        } catch {
          contentX = 20;
        }
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Prenda: ${getItemDetalle(item)}`, contentX, y + 7);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 58, 138);
      doc.text(`Ubicación: ${logo.ubicacion.toUpperCase()}`, contentX, y + 14);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`Detalle: ${logo.descripcion}`, contentX, y + 21);

      y += cardHeight + 4;
    });
  }

  // Cuadro de Control de Calidad
  const notesY = Math.max(y + 6, pageHeight - 65);
  doc.setFillColor(254, 252, 232);
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(14, notesY, pageWidth - 28, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(146, 64, 14);
  doc.text('CONTROL DE CALIDAD Y MONTAJE EN TALLER:', 20, notesY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('1. Verificar coincidencia de colores de hilo / tintas y ortografía en nombres personalizados.', 20, notesY + 13);
  doc.text('2. Centrar o posicionar según la guía técnica antes del planchado, bordado o fijación térmica.', 20, notesY + 18);
  doc.text('3. Deshebrar, empacar individualmente y cotejar cantidades completas antes de marcar como "Listo".', 20, notesY + 23);

  // Footer Hoja 2
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Hoja 2 de 2 • Guía de Producción y Diseño • Taller ${negocio.nombre} - Control Interno`,
    pageWidth / 2,
    pageHeight - 8,
    { align: 'center' }
  );

  if (autoDownload) {
    const sanitizedClient = orden.cliente.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`orden_${sanitizedClient}.pdf`);
  }

  return doc;
}

export function generarMensajeWhatsApp(orden: OrdenTrabajo): string {
  const items: ItemOrden[] = orden.items && orden.items.length > 0
    ? orden.items
    : [
        {
          productoNombre: orden.productoNombre || 'Prenda',
          color: orden.colorSeleccionado || 'Color',
          talla: orden.tallaSeleccionada || 'U',
          cantidad: orden.cantidad || 1,
          precioUnitarioFinal: orden.precioBaseUnitario || (orden.total / (orden.cantidad || 1)),
          logotiposExtras: orden.logotiposExtras || [],
        },
      ];

  const itemsTexto = items
    .map((i) => `• ${i.cantidad}x ${getItemDetalle(i)} - P. Unit: $${i.precioUnitarioFinal.toFixed(2)}`)
    .join('\n');

  const envioTexto = orden.costoEnvio > 0 ? `• Envío: $${orden.costoEnvio.toFixed(2)}\n` : '';
  const subtotalGeneral = orden.subtotalGeneral ?? (items.reduce((s, i) => s + (i.precioUnitarioFinal * i.cantidad), 0) + (orden.costoEnvio || 0));
  const montoIva = orden.montoIva ?? (orden.aplicaIva ? subtotalGeneral * 0.16 : 0);
  const ivaTexto = orden.aplicaIva
    ? `• Subtotal: $${subtotalGeneral.toFixed(2)}\n• IVA (16%): $${montoIva.toFixed(2)}\n`
    : '';

  return `*UNITAP - Pedido*
Cliente: *${orden.cliente}*
${itemsTexto}
${envioTexto}${ivaTexto}• *Total: $${orden.total.toFixed(2)}*
• Anticipo: $${orden.anticipo.toFixed(2)}
• Restante: $${orden.restante.toFixed(2)}
`;
}

export async function enviarReciboYPDFPorWhatsAppWeb(
  orden: OrdenTrabajo,
  negocio: DatosNegocio = DEFAULT_NEGOCIO
): Promise<void> {
  generarReciboPDF(orden, negocio, true);
  const mensaje = generarMensajeWhatsApp(orden);
  const cleanPhone = orden.telefono.replace(/\D/g, '');
  const phoneParam = cleanPhone.length >= 10 ? `phone=${cleanPhone}&` : '';
  const waUrl = `https://api.whatsapp.com/send?${phoneParam}text=${encodeURIComponent(mensaje)}`;
  window.open(waUrl, '_blank');
}
