/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ProductoBase,
  OrdenTrabajo,
  EstatusOrden,
  TallerStats,
  EstatusProduccion,
  EstatusInventario,
  DatosNegocio,
  NavTab,
  ItemOrden,
} from './types';
import { INITIAL_PRODUCTOS_BASE, INITIAL_ORDENES } from './mockData';
import { DEFAULT_NEGOCIO } from './services/pdfGenerator';
import { M3TopBar } from './components/M3TopBar';
import { OrdersView } from './components/OrdersView';
import { PendingSupplyView } from './components/PendingSupplyView';
import { PendingInvoicesView } from './components/PendingInvoicesView';
import { HistoryMonthView } from './components/HistoryMonthView';
import { InventoryView } from './components/InventoryView';
import { OrderFormModal } from './components/OrderFormModal';
import { StatusChangeModal } from './components/StatusChangeModal';
import { ReceiptPreviewModal } from './components/ReceiptPreviewModal';
import { WhatsAppShareModal } from './components/WhatsAppShareModal';
import { FlutterCodeModal } from './components/FlutterCodeModal';
import { SupabaseModal } from './components/SupabaseModal';
import { FinancialSummaryModal } from './components/FinancialSummaryModal';
import { BusinessSettingsModal } from './components/BusinessSettingsModal';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [inventario, setInventario] = useState<ProductoBase[]>(INITIAL_PRODUCTOS_BASE);
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>(INITIAL_ORDENES);
  const [negocio, setNegocio] = useState<DatosNegocio>(DEFAULT_NEGOCIO);
  const [activeTab, setActiveTab] = useState<NavTab>('activas');

  // Modal States
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrdenTrabajo | null>(null);
  const [statusModalOrder, setStatusModalOrder] = useState<OrdenTrabajo | null>(null);
  const [receiptModalOrder, setReceiptModalOrder] = useState<OrdenTrabajo | null>(null);
  const [whatsAppOrder, setWhatsAppOrder] = useState<OrdenTrabajo | null>(null);
  const [isFlutterCodeOpen, setIsFlutterCodeOpen] = useState(false);
  const [isSupabaseOpen, setIsSupabaseOpen] = useState(false);
  const [isFinancialsOpen, setIsFinancialsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Guardar o Actualizar Orden con Reglas de Negocio UNITAP y Descuento de Stock
  const handleSaveOrder = (
    data: {
      cliente: string;
      telefono: string;
      items: ItemOrden[];
      costoEnvio: number;
      aplicaIva: boolean;
      requiereFactura: boolean;
      anticipo: number;
      subtotalGeneral: number;
      montoIva: number;
      total: number;
      restante: number;
    },
    esEdicion: boolean
  ) => {
    // Verificar stock por cada artículo
    let tieneStockSuficiente = true;
    for (const item of data.items) {
      const prod = inventario.find((p) => p.nombre === item.productoNombre);
      if (!prod || prod.stockGeneral < item.cantidad) {
        tieneStockSuficiente = false;
        break;
      }
    }

    if (!esEdicion && tieneStockSuficiente) {
      setInventario((prev) =>
        prev.map((p) => {
          const itemMatch = data.items.find((i) => i.productoNombre === p.nombre);
          if (itemMatch) {
            return {
              ...p,
              stockGeneral: Math.max(0, p.stockGeneral - itemMatch.cantidad),
            };
          }
          return p;
        })
      );
    }

    const estatusProduccion: EstatusProduccion = tieneStockSuficiente
      ? 'En Producción'
      : 'Pendiente de Surtir';
    const estatusInventario: EstatusInventario = tieneStockSuficiente
      ? 'Surtido'
      : 'Pendiente de surtir';

    if (esEdicion && editingOrder) {
      setOrdenes((prev) =>
        prev.map((o) =>
          o.id === editingOrder.id
            ? {
                ...o,
                cliente: data.cliente,
                telefono: data.telefono,
                items: data.items,
                costoEnvio: data.costoEnvio,
                aplicaIva: data.aplicaIva,
                requiereFactura: data.requiereFactura,
                anticipo: data.anticipo,
                subtotalGeneral: data.subtotalGeneral,
                montoIva: data.montoIva,
                total: data.total,
                restante: data.restante,
              }
            : o
        )
      );
      showToast(`Orden ${editingOrder.id} actualizada correctamente.`);
    } else {
      const nuevaOrden: OrdenTrabajo = {
        id: Date.now().toString(),
        cliente: data.cliente,
        telefono: data.telefono,
        items: data.items,
        costoEnvio: data.costoEnvio,
        aplicaIva: data.aplicaIva,
        requiereFactura: data.requiereFactura,
        facturaEmitida: false,
        anticipo: data.anticipo,
        subtotalGeneral: data.subtotalGeneral,
        montoIva: data.montoIva,
        total: data.total,
        restante: data.restante,
        estatusProduccion,
        estatusInventario,
        fecha: new Date().toISOString(),
        stockYaDescontado: tieneStockSuficiente,
      };

      setOrdenes([nuevaOrden, ...ordenes]);
      showToast(
        tieneStockSuficiente
          ? `Orden ${nuevaOrden.id} guardada con ${data.items.length} artículo(s). Stock descontado.`
          : `Orden ${nuevaOrden.id} guardada como 'Pendiente de Surtir' (insuficiente stock).`
      );
    }

    setEditingOrder(null);
  };

  // Marcar Facturado (desde Vista Facturas Pendientes CFDI)
  const handleMarcarFacturado = (orden: OrdenTrabajo) => {
    setOrdenes((prev) =>
      prev.map((o) =>
        o.id === orden.id
          ? {
              ...o,
              facturaEmitida: true,
            }
          : o
      )
    );
    showToast(`Orden ${orden.id} marcada como FACTURADA (CFDI emitido).`);
  };

  // Marcar Surtido (desde Vista 2 o botón en tarjeta)
  const handleMarcarSurtido = (orden: OrdenTrabajo) => {
    if (!orden.stockYaDescontado && orden.items) {
      setInventario((prev) =>
        prev.map((p) => {
          const itemMatch = orden.items.find((i) => i.productoNombre === p.nombre);
          if (itemMatch) {
            return {
              ...p,
              stockGeneral: Math.max(0, p.stockGeneral - itemMatch.cantidad),
            };
          }
          return p;
        })
      );
    }

    setOrdenes((prev) =>
      prev.map((o) =>
        o.id === orden.id
          ? {
              ...o,
              estatusInventario: 'Surtido',
              estatusProduccion: 'En Producción',
              estatus: 'En Producción',
              stockYaDescontado: true,
            }
          : o
      )
    );

    showToast(`Orden ${orden.id} marcada como SURTIDA y movida a "En Producción".`);
  };

  // Botón Rápido: Avanzar Estatus
  // 'Pendiente de Surtir' -> 'En Producción' -> 'Listo' -> 'Entregado'
  const handleAdvanceStatus = (orden: OrdenTrabajo) => {
    let nextProd: EstatusProduccion;
    let nextInv: EstatusInventario = orden.estatusInventario || 'Surtido';
    let descontar = false;

    const actual = orden.estatusProduccion;

    if (actual === 'Pendiente de Surtir') {
      nextProd = 'En Producción';
      nextInv = 'Surtido';
      descontar = !orden.stockYaDescontado;
    } else if (actual === 'En Producción') {
      nextProd = 'Listo';
    } else if (actual === 'Listo') {
      nextProd = 'Entregado';
    } else {
      nextProd = 'Entregado';
    }

    if (descontar && orden.items) {
      setInventario((prev) =>
        prev.map((p) => {
          const itemMatch = orden.items.find((i) => i.productoNombre === p.nombre);
          if (itemMatch) {
            return {
              ...p,
              stockGeneral: Math.max(0, p.stockGeneral - itemMatch.cantidad),
            };
          }
          return p;
        })
      );
    }

    setOrdenes((prevOrdenes) =>
      prevOrdenes.map((o) => {
        if (o.id === orden.id) {
          return {
            ...o,
            estatusProduccion: nextProd,
            estatusInventario: nextInv,
            stockYaDescontado: o.stockYaDescontado || descontar,
          };
        }
        return o;
      })
    );

    showToast(
      nextProd === 'Entregado'
        ? `Orden ${orden.id} marcada como "Entregado" y archivada en Historial.`
        : `Orden ${orden.id} avanzada a "${nextProd}".`
    );
  };

  const handleUpdateStatus = (ordenId: string, nuevoEstatus: EstatusOrden) => {
    const ordenTarget = ordenes.find((o) => o.id === ordenId);
    if (!ordenTarget) return;

    let descontar = false;
    if (
      !ordenTarget.stockYaDescontado &&
      ordenTarget.items &&
      (nuevoEstatus === 'Anticipo Recibido' ||
        nuevoEstatus === 'En Producción' ||
        nuevoEstatus === 'Listo' ||
        nuevoEstatus === 'Entregado')
    ) {
      descontar = true;
      setInventario((prev) =>
        prev.map((p) => {
          const itemMatch = ordenTarget.items.find((i) => i.productoNombre === p.nombre);
          if (itemMatch) {
            return {
              ...p,
              stockGeneral: Math.max(0, p.stockGeneral - itemMatch.cantidad),
            };
          }
          return p;
        })
      );
    }

    setOrdenes((prevOrdenes) =>
      prevOrdenes.map((o) => {
        if (o.id === ordenId) {
          return {
            ...o,
            estatusProduccion: (nuevoEstatus as EstatusProduccion) || 'En Producción',
            estatusInventario: 'Surtido',
            stockYaDescontado: o.stockYaDescontado || descontar,
          };
        }
        return o;
      })
    );

    showToast(`Estatus actualizado a "${nuevoEstatus}".`);
  };

  const handleAdjustStock = (nombreProducto: string, delta: number) => {
    setInventario((prev) =>
      prev.map((p) => {
        if (p.nombre === nombreProducto) {
          const nuevoStock = Math.max(0, p.stockGeneral + delta);
          return { ...p, stockGeneral: nuevoStock };
        }
        return p;
      })
    );
  };

  const handleAddNewProduct = (producto: ProductoBase) => {
    setInventario([...inventario, producto]);
    showToast(`Producto base "${producto.nombre}" registrado en inventario.`);
  };

  // 5 Vistas del modelo UNITAP
  // Vista 1: Activas (no entregadas)
  const ordenesActivas = ordenes.filter(
    (o) => o.estatusProduccion !== 'Entregado'
  );
  // Vista 2: Por Surtir
  const ordenesPorSurtir = ordenes.filter(
    (o) => o.estatusInventario === 'Pendiente de surtir' || o.estatusProduccion === 'Pendiente de Surtir'
  );
  // Vista 3: Facturas Pendientes (CFDI)
  const ordenesFacturasPendientes = ordenes.filter(
    (o) => o.requiereFactura && !o.facturaEmitida
  );
  // Vista 4: Finalizados (Entregadas)
  const ordenesFinalizadas = ordenes.filter(
    (o) => o.estatusProduccion === 'Entregado'
  );

  // Stats calculation
  const totalActivas = ordenesActivas.length;
  const totalPorSurtir = ordenesPorSurtir.length;
  const totalFacturasPendientes = ordenesFacturasPendientes.length;
  const totalFinalizadas = ordenesFinalizadas.length;
  const totalIngresosEsperados = ordenes.reduce(
    (acc, o) => acc + o.total,
    0
  );
  const totalAnticiposRecibidos = ordenes.reduce((acc, o) => acc + o.anticipo, 0);
  const totalRestantePorCobrar = ordenesActivas.reduce(
    (acc, o) => acc + o.restante,
    0
  );
  const prendasStockCritico = inventario.filter((p) => p.stockGeneral < 3).length;

  const stats: TallerStats = {
    totalActivas,
    totalPorSurtir,
    totalFacturasPendientes,
    totalFinalizadas,
    totalOrdenes: ordenes.length,
    totalIngresosEsperados,
    totalAnticiposRecibidos,
    totalRestantePorCobrar,
    prendasStockCritico,
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col selection:bg-blue-200">
      {/* Material 3 Top Navigation Bar with 5 destinations */}
      <M3TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        negocio={negocio}
        onOpenNewOrder={() => {
          setEditingOrder(null);
          setIsOrderFormOpen(true);
        }}
        onOpenFlutterCode={() => setIsFlutterCodeOpen(true)}
        onOpenSupabase={() => setIsSupabaseOpen(true)}
        onOpenFinancials={() => setIsFinancialsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Vista 1: Activas */}
        {activeTab === 'activas' && (
          <OrdersView
            ordenes={ordenesActivas}
            onOpenStatusModal={(o) => setStatusModalOrder(o)}
            onPreviewReceipt={(o) => setReceiptModalOrder(o)}
            onOpenNewOrder={() => {
              setEditingOrder(null);
              setIsOrderFormOpen(true);
            }}
            onSendWhatsApp={(o) => setWhatsAppOrder(o)}
            onAdvanceStatus={handleAdvanceStatus}
            onEditOrder={(o) => {
              setEditingOrder(o);
              setIsOrderFormOpen(true);
            }}
          />
        )}

        {/* Vista 2: Por Surtir */}
        {activeTab === 'por_surtir' && (
          <PendingSupplyView
            ordenes={ordenesPorSurtir}
            onMarcarSurtido={handleMarcarSurtido}
            onPreviewReceipt={(o) => setReceiptModalOrder(o)}
            onSendWhatsApp={(o) => setWhatsAppOrder(o)}
          />
        )}

        {/* Vista 3: Facturas Pendientes (CFDI) */}
        {activeTab === 'facturas' && (
          <PendingInvoicesView
            ordenes={ordenes}
            onMarcarFacturado={handleMarcarFacturado}
            onPreviewReceipt={(o) => setReceiptModalOrder(o)}
            onSendWhatsApp={(o) => setWhatsAppOrder(o)}
          />
        )}

        {/* Vista 4: Finalizados */}
        {activeTab === 'finalizados' && (
          <HistoryMonthView
            ordenesFinalizadas={ordenesFinalizadas}
            onPreviewReceipt={(o) => setReceiptModalOrder(o)}
            onSendWhatsApp={(o) => setWhatsAppOrder(o)}
          />
        )}

        {/* Vista 4: Inventario / Stock */}
        {activeTab === 'inventory' && (
          <InventoryView
            inventario={inventario}
            onAdjustStock={handleAdjustStock}
            onAddNewProduct={handleAddNewProduct}
          />
        )}
      </main>

      {/* Modals */}
      <OrderFormModal
        isOpen={isOrderFormOpen}
        onClose={() => {
          setIsOrderFormOpen(false);
          setEditingOrder(null);
        }}
        inventario={inventario}
        ordenExistente={editingOrder}
        onSaveOrder={handleSaveOrder}
      />

      <StatusChangeModal
        orden={statusModalOrder}
        onClose={() => setStatusModalOrder(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      <ReceiptPreviewModal
        orden={receiptModalOrder}
        negocio={negocio}
        onClose={() => setReceiptModalOrder(null)}
      />

      <WhatsAppShareModal
        orden={whatsAppOrder}
        negocio={negocio}
        onClose={() => setWhatsAppOrder(null)}
      />

      <FlutterCodeModal
        isOpen={isFlutterCodeOpen}
        onClose={() => setIsFlutterCodeOpen(false)}
      />

      <SupabaseModal
        isOpen={isSupabaseOpen}
        onClose={() => setIsSupabaseOpen(false)}
      />

      <FinancialSummaryModal
        isOpen={isFinancialsOpen}
        onClose={() => setIsFinancialsOpen(false)}
        stats={stats}
        ordenes={ordenes}
      />

      <BusinessSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        negocio={negocio}
        onSave={(nuevo) => {
          setNegocio(nuevo);
          showToast('Datos del negocio y logotipo actualizados con éxito.');
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs sm:text-sm font-semibold border border-slate-700 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
