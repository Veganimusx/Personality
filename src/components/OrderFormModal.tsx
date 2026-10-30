import React, { useState, useEffect } from 'react';
import { ProductoBase, UbicacionLogoExtra, ItemOrden, OrdenTrabajo, getItemDetalle } from '../types';
import {
  X,
  Plus,
  Trash2,
  AlertTriangle,
  DollarSign,
  User,
  Phone,
  Shirt,
  Truck,
  Image as ImageIcon,
  CheckCircle2,
  Layers,
  Sparkles,
  Palette,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventario: ProductoBase[];
  ordenExistente?: OrdenTrabajo | null;
  onSaveOrder: (data: {
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
  }, esEdicion: boolean) => void;
}

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  isOpen,
  onClose,
  inventario,
  ordenExistente,
  onSaveOrder,
}) => {
  const [cliente, setCliente] = useState('');
  const [telefono, setTelefono] = useState('');
  const [costoEnvio, setCostoEnvio] = useState<number>(0);
  const [anticipo, setAnticipo] = useState<number>(0);
  const [aplicaIva, setAplicaIva] = useState<boolean>(false);
  const [requiereFactura, setRequiereFactura] = useState<boolean>(false);
  const [listaItems, setListaItems] = useState<ItemOrden[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Subdialog: Agregar Artículo
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedProdIdx, setSelectedProdIdx] = useState<number>(0);
  const [itemColor, setItemColor] = useState<string>('');
  const [itemTalla, setItemTalla] = useState<string>('');
  const [itemCantidad, setItemCantidad] = useState<number>(1);
  const [itemPrecioBase, setItemPrecioBase] = useState<number>(180);
  const [itemLogos, setItemLogos] = useState<UbicacionLogoExtra[]>([]);

  // Subdialog: Añadir Logo Extra al Artículo
  const [isAddingLogo, setIsAddingLogo] = useState(false);
  const [logoUbicacion, setLogoUbicacion] = useState('Pecho Izquierdo');
  const [logoDescripcion, setLogoDescripcion] = useState('');
  const [logoCostoExtra, setLogoCostoExtra] = useState<number>(25);
  const [logoImagenPath, setLogoImagenPath] = useState<string | undefined>(undefined);

  // Initialize or reset when opened or when ordenExistente changes
  useEffect(() => {
    if (!isOpen) return;

    if (ordenExistente) {
      setCliente(ordenExistente.cliente || '');
      setTelefono(ordenExistente.telefono || '');
      setCostoEnvio(ordenExistente.costoEnvio || 0);
      setAnticipo(ordenExistente.anticipo || 0);
      setAplicaIva(ordenExistente.aplicaIva ?? false);
      setRequiereFactura(ordenExistente.requiereFactura ?? false);

      if (ordenExistente.items && ordenExistente.items.length > 0) {
        setListaItems([...ordenExistente.items]);
      } else {
        // Fallback for legacy single-item format
        const legacyUnitFinal = (ordenExistente.precioBaseUnitario || 180) +
          (ordenExistente.logotiposExtras || []).reduce((s, l) => s + (l.costoExtra || 0), 0);
        setListaItems([
          {
            productoNombre: ordenExistente.productoNombre || inventario[0]?.nombre || 'Prenda',
            color: ordenExistente.colorSeleccionado || 'Azul Marino',
            talla: ordenExistente.tallaSeleccionada || 'M',
            cantidad: ordenExistente.cantidad || 1,
            precioUnitarioFinal: legacyUnitFinal,
            logotiposExtras: ordenExistente.logotiposExtras || [],
          },
        ]);
      }
    } else {
      // New Order default state
      setCliente('');
      setTelefono('');
      setCostoEnvio(0);
      setAnticipo(0);
      setAplicaIva(false);
      setRequiereFactura(false);

      // Default sample item for quick prototyping
      const defaultProd = inventario[0];
      if (defaultProd) {
        setListaItems([
          {
            productoNombre: defaultProd.nombre,
            color: defaultProd.coloresDisponibles[0] || 'Azul Marino',
            talla: defaultProd.tallasDisponibles[0] || 'M',
            cantidad: 5,
            precioUnitarioFinal: defaultProd.precioBase + 25, // 180 + 25 = 205
            logotiposExtras: [
              {
                id: 'logo-init',
                ubicacion: 'Pecho Izquierdo',
                descripcion: 'Logo Institucional Bordado',
                costoExtra: 25.0,
              },
            ],
          },
        ]);
      } else {
        setListaItems([]);
      }
    }

    setErrorMsg('');
  }, [isOpen, ordenExistente, inventario]);

  // Keep item color and size synced when product is selected in subdialog
  const currentProd = inventario[selectedProdIdx] || inventario[0];
  useEffect(() => {
    if (currentProd) {
      if (!itemColor || !currentProd.coloresDisponibles.includes(itemColor)) {
        setItemColor(currentProd.coloresDisponibles[0] || '');
      }
      if (!itemTalla || !currentProd.tallasDisponibles.includes(itemTalla)) {
        setItemTalla(currentProd.tallasDisponibles[0] || '');
      }
      setItemPrecioBase(currentProd.precioBase);
    }
  }, [selectedProdIdx, currentProd]);

  if (!isOpen) return null;

  // Calculos automáticos
  const totalItemsCount = listaItems.reduce((sum, item) => sum + item.cantidad, 0);
  const totalItemsMonto = listaItems.reduce(
    (sum, item) => sum + item.precioUnitarioFinal * item.cantidad,
    0
  );
  const subtotalGeneral = totalItemsMonto + (costoEnvio || 0);
  const montoIva = aplicaIva ? subtotalGeneral * 0.16 : 0;
  const totalOrden = subtotalGeneral + montoIva;
  const restante = Math.max(0, totalOrden - (anticipo || 0));

  const handleOpenAddItem = () => {
    setSelectedProdIdx(0);
    const prod = inventario[0];
    if (prod) {
      setItemColor(prod.coloresDisponibles[0] || '');
      setItemTalla(prod.tallasDisponibles[0] || '');
      setItemPrecioBase(prod.precioBase);
    }
    setItemCantidad(1);
    setItemLogos([]);
    setIsAddingItem(true);
  };

  const handleSaveItem = () => {
    if (!currentProd) return;
    const extrasTotales = itemLogos.reduce((sum, l) => sum + (l.costoExtra || 0), 0);
    const precioUnitarioFinal = (itemPrecioBase || 0) + extrasTotales;

    const nuevoItem: ItemOrden = {
      id: `item-${Date.now()}`,
      productoNombre: currentProd.nombre,
      color: itemColor || currentProd.coloresDisponibles[0] || 'Estándar',
      talla: itemTalla || currentProd.tallasDisponibles[0] || 'Unitalla',
      cantidad: Math.max(1, itemCantidad || 1),
      precioUnitarioFinal,
      logotiposExtras: [...itemLogos],
    };

    setListaItems([...listaItems, nuevoItem]);
    setIsAddingItem(false);
  };

  const handleRemoveItem = (index: number) => {
    setListaItems(listaItems.filter((_, idx) => idx !== index));
  };

  const handleAddLogoToItem = () => {
    if (!logoDescripcion.trim()) return;
    const nuevoLogo: UbicacionLogoExtra = {
      id: `logo-${Date.now()}`,
      ubicacion: logoUbicacion,
      descripcion: logoDescripcion.trim(),
      costoExtra: Math.max(0, logoCostoExtra || 0),
      imagenPath: logoImagenPath,
    };
    setItemLogos([...itemLogos, nuevoLogo]);
    setLogoDescripcion('');
    setLogoCostoExtra(20);
    setLogoImagenPath(undefined);
    setIsAddingLogo(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoImagenPath(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cliente.trim()) {
      setErrorMsg('Por favor ingresa el nombre del cliente');
      return;
    }
    if (listaItems.length === 0) {
      setErrorMsg('Debes añadir al menos un artículo a la orden');
      return;
    }

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // Ignorar si confetti falla
    }

    onSaveOrder(
      {
        cliente: cliente.trim(),
        telefono: telefono.trim() || '81 0000 0000',
        items: listaItems,
        costoEnvio: costoEnvio || 0,
        aplicaIva,
        requiereFactura,
        anticipo: anticipo || 0,
        subtotalGeneral,
        montoIva,
        total: totalOrden,
        restante,
      },
      !!ordenExistente
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Shirt className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {ordenExistente ? 'Editar Orden de Trabajo' : 'Nueva Orden de Trabajo'}
              </h3>
              <p className="text-xs text-blue-200">
                {ordenExistente
                  ? `Folio ${ordenExistente.id} • Modificar prendas, logos o pagos`
                  : 'Multi-artículos con precios unitarios unificados'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Datos del Cliente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nombre del Cliente *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez / Empresa ABC"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Teléfono (WhatsApp)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="81 1234 5678"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 2. Sección: Artículos en la Orden */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-900" />
                <h4 className="font-bold text-sm text-slate-900">
                  Artículos en la Orden ({listaItems.length})
                </h4>
              </div>
              <button
                type="button"
                onClick={handleOpenAddItem}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir Artículo</span>
              </button>
            </div>

            {listaItems.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-xs text-slate-500">
                  No hay artículos agregados todavía. Pulsa <strong>"Añadir Artículo"</strong> para agregar prendas, tallas y logos.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {listaItems.map((item, idx) => {
                  const subtotalItem = item.precioUnitarioFinal * item.cantidad;
                  return (
                    <div
                      key={item.id || idx}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs transition-all flex items-start justify-between gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-900 font-extrabold text-xs flex items-center justify-center shrink-0">
                            {item.cantidad}x
                          </span>
                          <span className="font-bold text-sm text-slate-900">
                            {getItemDetalle(item)}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-600">
                          <span>
                            Precio Final Unitario:{' '}
                            <strong className="text-blue-900">
                              ${item.precioUnitarioFinal.toFixed(2)}
                            </strong>
                          </span>
                          <span>•</span>
                          <span>
                            Subtotal:{' '}
                            <strong className="text-slate-900">
                              ${subtotalItem.toFixed(2)}
                            </strong>
                          </span>
                        </div>

                        {/* Logos extras añadidos a este artículo */}
                        {item.logotiposExtras && item.logotiposExtras.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {item.logotiposExtras.map((lg, lIdx) => (
                              <span
                                key={lg.id || lIdx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[11px] border border-blue-200 font-medium"
                                title={lg.descripcion}
                              >
                                <strong>{lg.ubicacion}:</strong> {lg.descripcion}
                                <span className="text-blue-600 font-bold">(+${lg.costoExtra.toFixed(2)})</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar artículo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Costos Adicionales (Envío y Anticipo) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-slate-500" />
                <span>Costo de Envío $ (Opcional)</span>
              </label>
              <div className="relative">
                <span className="text-slate-400 font-bold text-xs absolute left-3 top-1/2 -translate-y-1/2">$</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={costoEnvio === 0 ? '' : costoEnvio}
                  onChange={(e) => setCostoEnvio(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-sky-600" />
                <span>Anticipo Recibido $</span>
              </label>
              <div className="relative">
                <span className="text-slate-400 font-bold text-xs absolute left-3 top-1/2 -translate-y-1/2">$</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={anticipo === 0 ? '' : anticipo}
                  onChange={(e) => setAnticipo(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-sky-800"
                />
              </div>
            </div>
          </div>

          {/* Switches de Facturación e Impuestos (Material 3 Switches) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl">
            <label className="flex items-center justify-between cursor-pointer p-1 rounded-xl hover:bg-slate-100/70 transition-colors">
              <div className="pr-2">
                <span className="text-xs font-bold text-slate-800 block">Agregar IVA (16%)</span>
                <span className="text-[11px] text-slate-500">Calcula el 16% sobre el subtotal</span>
              </div>
              <input
                type="checkbox"
                checked={aplicaIva}
                onChange={(e) => setAplicaIva(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer accent-blue-600"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-1 rounded-xl hover:bg-slate-100/70 transition-colors">
              <div className="pr-2">
                <span className="text-xs font-bold text-slate-800 block">Requiere Factura (CFDI)</span>
                <span className="text-[11px] text-slate-500">Registra orden en pestaña Facturar</span>
              </div>
              <input
                type="checkbox"
                checked={requiereFactura}
                onChange={(e) => setRequiereFactura(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer accent-purple-600"
              />
            </label>
          </div>

          {/* 4. Resumen Financiero en Vivo */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-inner space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Total Prendas ({totalItemsCount} pzas):</span>
              <span className="font-semibold text-white">${totalItemsMonto.toFixed(2)}</span>
            </div>
            {costoEnvio > 0 && (
              <div className="flex items-center justify-between text-xs text-amber-300">
                <span>Costo de Envío:</span>
                <span className="font-semibold">+${costoEnvio.toFixed(2)}</span>
              </div>
            )}
            {aplicaIva && (
              <>
                <div className="flex items-center justify-between text-xs text-slate-300 pt-1 border-t border-slate-800">
                  <span>Subtotal General:</span>
                  <span className="font-semibold text-white">${subtotalGeneral.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-indigo-300">
                  <span>IVA (16%):</span>
                  <span className="font-semibold text-indigo-300">+${montoIva.toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Anticipo Abonado:</span>
              <span className="font-semibold text-sky-300">-${anticipo.toFixed(2)}</span>
            </div>
            <div className="h-px bg-slate-700" />
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold">Total de la Orden:</span>
              <span className="font-black text-base text-white">${totalOrden.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-slate-200">Restante Pendiente:</span>
              <span
                className={`font-black text-base ${
                  restante > 0 ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                ${restante.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{ordenExistente ? 'Actualizar Orden' : 'Guardar Orden'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ======================================================== */}
      {/* SUB-MODAL 1: AGREGAR ARTÍCULO CON LOGOS EXTRAS           */}
      {/* ======================================================== */}
      {isAddingItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h4 className="font-bold text-base flex items-center gap-2">
                <Shirt className="w-4 h-4 text-blue-400" />
                <span>Agregar Artículo a la Orden</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsAddingItem(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Modelo de Prenda */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Modelo de Prenda
                </label>
                <select
                  value={selectedProdIdx}
                  onChange={(e) => setSelectedProdIdx(parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {inventario.map((p, idx) => (
                    <option key={p.nombre} value={idx}>
                      {p.nombre} (${p.precioBase.toFixed(2)}) • Stock: {p.stockGeneral}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color y Talla */}
              {currentProd && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Palette className="w-3 h-3 text-slate-400" />
                      <span>Color</span>
                    </label>
                    <select
                      value={itemColor}
                      onChange={(e) => setItemColor(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20"
                    >
                      {currentProd.coloresDisponibles.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span>Talla</span>
                    </label>
                    <select
                      value={itemTalla}
                      onChange={(e) => setItemTalla(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20"
                    >
                      {currentProd.tallasDisponibles.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Cantidad y Precio Base Unitario */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={itemCantidad}
                    onChange={(e) => setItemCantidad(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Precio Base Unitario $
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={itemPrecioBase}
                    onChange={(e) => setItemPrecioBase(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Sub-sección: Logos y Nombres Extras */}
              <div className="border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">Logos / Nombres Extras</span>
                  <button
                    type="button"
                    onClick={() => {
                      setLogoUbicacion('Pecho Izquierdo');
                      setLogoDescripcion('');
                      setLogoCostoExtra(25);
                      setLogoImagenPath(undefined);
                      setIsAddingLogo(true);
                    }}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Añadir Logo</span>
                  </button>
                </div>

                {itemLogos.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-1">
                    Sin personalizaciones extras (solo precio base de la prenda).
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {itemLogos.map((logo, lIdx) => (
                      <div
                        key={logo.id || lIdx}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-800">{logo.ubicacion}:</span>{' '}
                          <span className="text-slate-600">{logo.descripcion}</span>
                          <span className="block text-[11px] text-blue-700 font-semibold">
                            Suma al precio unitario: +${logo.costoExtra.toFixed(2)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setItemLogos(itemLogos.filter((_, i) => i !== lIdx))}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cálculo en vivo de este artículo */}
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-600 block">Precio Unitario Final:</span>
                  <strong className="text-sm font-bold text-blue-900">
                    $
                    {(
                      (itemPrecioBase || 0) +
                      itemLogos.reduce((s, l) => s + (l.costoExtra || 0), 0)
                    ).toFixed(2)}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-600 block">Subtotal ({itemCantidad} pzas):</span>
                  <strong className="text-sm font-extrabold text-slate-900">
                    $
                    {(
                      ((itemPrecioBase || 0) +
                        itemLogos.reduce((s, l) => s + (l.costoExtra || 0), 0)) *
                      itemCantidad
                    ).toFixed(2)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAddingItem(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveItem}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-2xs"
              >
                Agregar a la Orden
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-MODAL 2: AÑADIR LOGO / PERSONALIZACIÓN EXTRA         */}
      {/* ======================================================== */}
      {isAddingLogo && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-3 bg-slate-900/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden my-4">
            <div className="px-5 py-3.5 bg-blue-950 text-white flex items-center justify-between">
              <h5 className="font-bold text-sm">Detalle de Logo o Nombre Extra</h5>
              <button
                type="button"
                onClick={() => setIsAddingLogo(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ubicación del Logo
                </label>
                <select
                  value={logoUbicacion}
                  onChange={(e) => setLogoUbicacion(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="Pecho Izquierdo">Pecho Izquierdo</option>
                  <option value="Pecho Derecho">Pecho Derecho</option>
                  <option value="Espalda">Espalda</option>
                  <option value="Manga Izquierda">Manga Izquierda</option>
                  <option value="Manga Derecha">Manga Derecha</option>
                  <option value="Nombre Personalizado">Nombre Personalizado</option>
                  <option value="Frente Completo">Frente Completo</option>
                  <option value="Gorra Frente">Gorra Frente</option>
                  <option value="Gorra Lateral">Gorra Lateral</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  placeholder="Ej. Bordado 3D, DTF foto, Serigrafía 2 tintas..."
                  value={logoDescripcion}
                  onChange={(e) => setLogoDescripcion(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Costo Extra por Prenda $
                </label>
                <input
                  type="number"
                  step="any"
                  value={logoCostoExtra}
                  onChange={(e) => setLogoCostoExtra(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Boceto / Logotipo (Opcional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAddingLogo(false)}
                className="px-3 py-1 text-xs text-slate-600 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddLogoToItem}
                disabled={!logoDescripcion.trim()}
                className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-2xs"
              >
                Añadir al Artículo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
