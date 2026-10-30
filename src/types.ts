export type Talla = 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | 'XXL' | 'CH' | 'G' | 'XG' | 'Unitalla';

export type Tecnica = 'Bordado' | 'Sublimado' | 'DTF' | 'Serigrafía';

export type UbicacionLogo = 
  | 'Pecho'
  | 'Pecho Izquierdo'
  | 'Pecho Derecho'
  | 'Espalda'
  | 'Manga Derecha'
  | 'Manga Izquierda'
  | 'Nombre Personalizado'
  | 'Frente Completo';

export type EstatusProduccion = 
  | 'Pendiente de Surtir'
  | 'En Producción'
  | 'Listo'
  | 'Entregado';

export type EstatusInventario = 'Surtido' | 'Pendiente de surtir';

export type EstatusOrden = EstatusProduccion | 'Cotización' | 'Anticipo Recibido';

export type NavTab = 'activas' | 'por_surtir' | 'facturas' | 'finalizados' | 'inventory';

export interface DatosNegocio {
  nombre: string;
  telefono: string;
  direccion: string;
  logoPath?: string; // Data URL or URL
}

export interface ProductoBase {
  nombre: string;
  precioBase: number;
  coloresDisponibles: string[];
  tallasDisponibles: string[];
  stockGeneral: number;
}

export interface UbicacionLogoExtra {
  id?: string;
  ubicacion: string; // 'Pecho Izquierdo', 'Pecho Derecho', 'Espalda', 'Manga', etc.
  descripcion: string; // Ej. "Logo bordado + Nombre personalizado"
  costoExtra: number;
  imagenPath?: string; // Base64 o URL
}

export interface ItemOrden {
  id?: string;
  productoNombre: string;
  color: string;
  talla: string;
  cantidad: number;
  precioUnitarioFinal: number; // Ya incluye base + extras sumados
  logotiposExtras: UbicacionLogoExtra[];
  subtotal?: number; // helper (precioUnitarioFinal * cantidad)
}

export function getItemDetalle(item: ItemOrden): string {
  return `${item.productoNombre} (${item.color}, Talla ${item.talla})`;
}

export interface OrdenTrabajo {
  id: string;
  cliente: string;
  telefono: string;
  items: ItemOrden[]; // Múltiples artículos por orden
  costoEnvio: number;
  aplicaIva: boolean; // Opción para agregar 16% de IVA
  requiereFactura: boolean; // Para el control de facturas pendientes
  facturaEmitida: boolean;
  anticipo: number;
  estatusProduccion: EstatusProduccion;
  estatusInventario: EstatusInventario;
  fecha: string; // ISO string

  // Calculados
  total: number;
  restante: number; // total - anticipo
  totalItems?: number;
  subtotalGeneral?: number;
  montoIva?: number;

  // Propiedades auxiliares y de compatibilidad previa
  productoNombre?: string;
  colorSeleccionado?: string;
  tallaSeleccionada?: string;
  cantidad?: number;
  precioBaseUnitario?: number;
  logotiposExtras?: UbicacionLogoExtra[];
  tecnica?: string;
  ubicacionLogo?: string;
  imagenDisenoPath?: string;
  productoSeleccionado?: {
    id?: string;
    nombre: string;
    talla: string;
    color: string;
    precio: number;
    stock?: number;
  };
  estatus?: EstatusOrden;
  precioTotal?: number;
  stockYaDescontado?: boolean;
  fechaCreacion?: string;
  notas?: string;
}

export interface TallerStats {
  totalActivas: number;
  totalPorSurtir: number;
  totalFacturasPendientes: number;
  totalFinalizadas: number;
  totalOrdenes: number;
  totalIngresosEsperados: number;
  totalAnticiposRecibidos: number;
  totalRestantePorCobrar: number;
  prendasStockCritico: number;
}
