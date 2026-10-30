import { ProductoBase, OrdenTrabajo } from './types';

export const INITIAL_PRODUCTOS_BASE: ProductoBase[] = [
  {
    nombre: 'Polo Piqué Dry-Fit',
    precioBase: 180.0,
    coloresDisponibles: ['Azul Marino', 'Negro', 'Blanco', 'Rojo'],
    tallasDisponibles: ['S', 'M', 'L', 'XL', 'XXL'],
    stockGeneral: 15,
  },
  {
    nombre: 'Playera Cuello Redondo Algodón',
    precioBase: 120.0,
    coloresDisponibles: ['Gris', 'Negro', 'Azul Rey', 'Blanco'],
    tallasDisponibles: ['M', 'L', 'XL'],
    stockGeneral: 2, // Alerta stock < 3
  },
  {
    nombre: 'Sudadera Felpa con Capucha',
    precioBase: 340.0,
    coloresDisponibles: ['Negro', 'Vino Tinto', 'Gris Jaspe'],
    tallasDisponibles: ['S', 'M', 'L', 'XL'],
    stockGeneral: 8,
  },
  {
    nombre: 'Camisa de Mezclilla Trabajo',
    precioBase: 290.0,
    coloresDisponibles: ['Azul Índigo', 'Celeste'],
    tallasDisponibles: ['CH', 'M', 'G', 'XG'],
    stockGeneral: 2, // Alerta stock
  },
  {
    nombre: 'Gorra Gabardina Bordada',
    precioBase: 95.0,
    coloresDisponibles: ['Negro', 'Blanco', 'Azul Marino'],
    tallasDisponibles: ['Unitalla'],
    stockGeneral: 35,
  },
];

export const INITIAL_ORDENES: OrdenTrabajo[] = [
  {
    id: '1730248800001',
    cliente: 'Constructora del Norte S.A.',
    telefono: '81 1234 5678',
    items: [
      {
        id: 'item-1',
        productoNombre: 'Polo Piqué Dry-Fit',
        color: 'Azul Marino',
        talla: 'M',
        cantidad: 10,
        precioUnitarioFinal: 255.0, // 180 + 25 + 15 + 35
        logotiposExtras: [
          {
            id: 'logo-1',
            ubicacion: 'Pecho Izquierdo',
            descripcion: 'Logo Institucional Bordado (3 colores)',
            costoExtra: 25.0,
          },
          {
            id: 'logo-2',
            ubicacion: 'Manga Derecha',
            descripcion: 'Bandera de México bordada 5cm',
            costoExtra: 15.0,
          },
          {
            id: 'logo-3',
            ubicacion: 'Espalda',
            descripcion: 'Rótulo "SUPERVISOR DE OBRA" Bordado',
            costoExtra: 35.0,
          },
        ],
      },
      {
        id: 'item-2',
        productoNombre: 'Gorra Gabardina Bordada',
        color: 'Negro',
        talla: 'Unitalla',
        cantidad: 5,
        precioUnitarioFinal: 125.0, // 95 + 30
        logotiposExtras: [
          {
            id: 'logo-4',
            ubicacion: 'Frente Completo',
            descripcion: 'Logo Constructora 3D',
            costoExtra: 30.0,
          },
        ],
      },
    ],
    costoEnvio: 150.0,
    aplicaIva: true,
    requiereFactura: true,
    facturaEmitida: false,
    // (255 * 10) + (125 * 5) + 150 = 3325.0 subtotal, iva 532.0, total 3857.0
    subtotalGeneral: 3325.0,
    montoIva: 532.0,
    total: 3857.0,
    anticipo: 2000.0,
    restante: 1857.0,
    estatusProduccion: 'En Producción',
    estatusInventario: 'Surtido',
    fecha: new Date(Date.now() - 86400000 * 2).toISOString(),
    // Compatibilidad previa
    productoNombre: 'Polo Piqué Dry-Fit',
    colorSeleccionado: 'Azul Marino',
    tallaSeleccionada: 'M',
    cantidad: 15,
    precioBaseUnitario: 180.0,
    logotiposExtras: [
      {
        id: 'logo-1',
        ubicacion: 'Pecho Izquierdo',
        descripcion: 'Logo Institucional Bordado',
        costoExtra: 25.0,
      },
    ],
    tecnica: 'Bordado',
    ubicacionLogo: 'Pecho Izquierdo, Manga Derecha, Espalda',
    estatus: 'En Producción',
    precioTotal: 3857.0,
    stockYaDescontado: true,
    notas: 'Bordados industriales de alta durabilidad.',
  },
  {
    id: '1730248800002',
    cliente: 'Cafetería La Selva',
    telefono: '81 9876 5432',
    items: [
      {
        id: 'item-3',
        productoNombre: 'Playera Cuello Redondo Algodón',
        color: 'Negro',
        talla: 'L',
        cantidad: 8,
        precioUnitarioFinal: 155.0, // 120 + 20 + 15
        logotiposExtras: [
          {
            id: 'logo-5',
            ubicacion: 'Pecho Izquierdo',
            descripcion: 'Logo La Selva DTF Calidad Fotográfica',
            costoExtra: 20.0,
          },
          {
            id: 'logo-6',
            ubicacion: 'Nombre Personalizado',
            descripcion: 'Nombre de Barista en Vinil Textil',
            costoExtra: 15.0,
          },
        ],
      },
    ],
    costoEnvio: 0.0,
    aplicaIva: false,
    requiereFactura: false,
    facturaEmitida: false,
    // 155 * 8 = 1240.0
    subtotalGeneral: 1240.0,
    montoIva: 0.0,
    total: 1240.0,
    anticipo: 620.0,
    restante: 620.0,
    estatusProduccion: 'Pendiente de Surtir',
    estatusInventario: 'Pendiente de surtir',
    fecha: new Date(Date.now() - 86400000).toISOString(),
    // Compatibilidad
    productoNombre: 'Playera Cuello Redondo Algodón',
    colorSeleccionado: 'Negro',
    tallaSeleccionada: 'L',
    cantidad: 8,
    precioBaseUnitario: 120.0,
    logotiposExtras: [
      {
        id: 'logo-5',
        ubicacion: 'Pecho Izquierdo',
        descripcion: 'Logo La Selva DTF',
        costoExtra: 20.0,
      },
    ],
    tecnica: 'DTF',
    ubicacionLogo: 'Pecho Izquierdo + Nombre Personalizado',
    estatus: 'Pendiente de Surtir',
    precioTotal: 1240.0,
    stockYaDescontado: false,
    notas: 'Esperando llegada de rollos o playeras negras.',
  },
  {
    id: '1730248800003',
    cliente: 'Colegio México Siglo XXI',
    telefono: '81 4433 2211',
    items: [
      {
        id: 'item-4',
        productoNombre: 'Sudadera Felpa con Capucha',
        color: 'Vino Tinto',
        talla: 'M',
        cantidad: 6,
        precioUnitarioFinal: 375.0, // 340 + 35
        logotiposExtras: [
          {
            id: 'logo-7',
            ubicacion: 'Pecho Izquierdo',
            descripcion: 'Escudo Escolar bordado 3D',
            costoExtra: 35.0,
          },
        ],
      },
      {
        id: 'item-5',
        productoNombre: 'Gorra Gabardina Bordada',
        color: 'Negro',
        talla: 'Unitalla',
        cantidad: 6,
        precioUnitarioFinal: 125.0, // 95 + 30
        logotiposExtras: [
          {
            id: 'logo-8',
            ubicacion: 'Frente Completo',
            descripcion: 'Monograma Escolar bordado',
            costoExtra: 30.0,
          },
        ],
      },
    ],
    costoEnvio: 100.0,
    aplicaIva: true,
    requiereFactura: true,
    facturaEmitida: true,
    // (375 * 6) + (125 * 6) + 100 = 2250 + 750 + 100 = 3100.0 subtotal, iva 496.0, total 3596.0
    subtotalGeneral: 3100.0,
    montoIva: 496.0,
    total: 3596.0,
    anticipo: 3596.0,
    restante: 0.0,
    estatusProduccion: 'Entregado',
    estatusInventario: 'Surtido',
    fecha: new Date(Date.now() - 86400000 * 5).toISOString(),
    // Compatibilidad
    productoNombre: 'Sudadera Felpa con Capucha',
    colorSeleccionado: 'Vino Tinto',
    tallaSeleccionada: 'M',
    cantidad: 12,
    precioBaseUnitario: 340.0,
    tecnica: 'Bordado',
    ubicacionLogo: 'Pecho + Frente',
    estatus: 'Entregado',
    precioTotal: 3596.0,
    stockYaDescontado: true,
    notas: 'Liquidado en su totalidad y entregado al colegio.',
  },
];

export const INITIAL_PRENDAS = INITIAL_PRODUCTOS_BASE.map((p, idx) => ({
  id: `p${idx + 1}`,
  nombre: p.nombre,
  talla: p.tallasDisponibles[0] as any,
  color: p.coloresDisponibles[0],
  stock: p.stockGeneral,
  precio: p.precioBase,
}));
