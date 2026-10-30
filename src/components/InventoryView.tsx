import React, { useState } from 'react';
import { ProductoBase } from '../types';
import {
  AlertTriangle,
  Plus,
  Minus,
  Search,
  Shirt,
  Layers,
  Palette,
  Ruler,
  Check
} from 'lucide-react';

interface InventoryViewProps {
  inventario: ProductoBase[];
  onAdjustStock: (nombreProducto: string, delta: number) => void;
  onAddNewProduct: (producto: ProductoBase) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventario,
  onAdjustStock,
  onAddNewProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [soloCriticas, setSoloCriticas] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New product form state
  const [nombre, setNombre] = useState('');
  const [precioBase, setPrecioBase] = useState<number>(180);
  const [coloresStr, setColoresStr] = useState('Azul Marino, Negro, Blanco');
  const [tallasStr, setTallasStr] = useState('S, M, L, XL');
  const [stockGeneral, setStockGeneral] = useState<number>(20);

  const criticos = inventario.filter((p) => p.stockGeneral < 5);

  const filtrados = inventario.filter((p) => {
    const matchBusqueda =
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.coloresDisponibles.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.tallasDisponibles.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCritica = !soloCriticas || p.stockGeneral < 5;
    return matchBusqueda && matchCritica;
  });

  const handleCrearProducto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const colores = coloresStr
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    const tallas = tallasStr
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onAddNewProduct({
      nombre: nombre.trim(),
      precioBase: Number(precioBase) || 0,
      coloresDisponibles: colores.length > 0 ? colores : ['Estándar'],
      tallasDisponibles: tallas.length > 0 ? tallas : ['Unitalla'],
      stockGeneral: Math.max(0, Number(stockGeneral) || 0),
    });

    setNombre('');
    setPrecioBase(180);
    setColoresStr('Azul Marino, Negro, Blanco');
    setTallasStr('S, M, L, XL');
    setStockGeneral(20);
    setIsModalOpen(false);
  };

  return (
    <div className="pb-20">
      {/* Visual Alert Banner for items < 5 pieces */}
      {criticos.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-red-500/10 border-2 border-red-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse-subtle">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-600/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-900">
                ¡Alerta de Inventario Crítico! ({criticos.length}{' '}
                {criticos.length === 1 ? 'producto base' : 'productos base'})
              </h4>
              <p className="text-xs text-red-700">
                Prendas con menos de 5 piezas disponibles en almacén central:{' '}
                <span className="font-semibold">
                  {criticos.map((p) => `${p.nombre} (${p.stockGeneral} pz)`).join(', ')}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setSoloCriticas(!soloCriticas)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              soloCriticas
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-white text-red-800 border border-red-300 hover:bg-red-50'
            }`}
          >
            {soloCriticas ? 'Ver Catálogo Completo' : 'Filtrar Solo Críticos (<5)'}
          </button>
        </div>
      )}

      {/* Control Bar */}
      <div className="bg-white rounded-2xl p-4 mb-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por prenda, color o talla..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold flex items-center space-x-1.5 shrink-0 shadow-2xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto Base</span>
            </button>
          </div>
        </div>
      </div>

      {/* Garments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtrados.map((producto) => {
          const isCritical = producto.stockGeneral < 5;

          return (
            <div
              key={producto.nombre}
              className={`bg-white rounded-2xl border p-5 transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                isCritical
                  ? 'border-red-300 ring-2 ring-red-100 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              {/* Critical Stock Ribbon Indicator */}
              {isCritical && (
                <div className="absolute top-0 right-0">
                  <div className="bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl shadow-xs flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Stock Crítico (&lt;5)</span>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-start justify-between pr-2 mb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        isCritical
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-blue-50 text-blue-900 border border-blue-200'
                      }`}
                    >
                      <Shirt className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-tight">
                        {producto.nombre}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Precio Base: <span className="font-bold text-slate-900">${producto.precioBase.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Available Colors */}
                <div className="my-2.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1 mb-1">
                    <Palette className="w-3 h-3" />
                    <span>Colores Disponibles:</span>
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {producto.coloresDisponibles.map((color) => (
                      <span
                        key={color}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Available Sizes */}
                <div className="my-2.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1 mb-1">
                    <Ruler className="w-3 h-3" />
                    <span>Tallas Disponibles:</span>
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {producto.tallasDisponibles.map((talla) => (
                      <span
                        key={talla}
                        className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200"
                      >
                        {talla}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stock Counter & Quick Adjustments */}
              <div className="pt-3 border-t border-slate-100 mt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600">
                    Stock General Disponible:
                  </span>
                  <span
                    className={`text-lg font-black px-2.5 py-0.5 rounded-lg ${
                      isCritical
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {producto.stockGeneral} pzas
                  </span>
                </div>

                {/* Stock Controls */}
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => onAdjustStock(producto.nombre, -1)}
                    disabled={producto.stockGeneral <= 0}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-40 text-slate-700 text-xs font-bold flex items-center justify-center space-x-1 transition-colors"
                    title="Restar 1 pieza"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>-1</span>
                  </button>
                  <button
                    onClick={() => onAdjustStock(producto.nombre, 1)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-bold flex items-center justify-center space-x-1 transition-colors"
                    title="Añadir 1 pieza"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+1</span>
                  </button>
                  <button
                    onClick={() => onAdjustStock(producto.nombre, 10)}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition-colors"
                    title="Surtir lote (+10 piezas)"
                  >
                    +10
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Nuevo Producto Base */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-blue-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shirt className="w-5 h-5 text-blue-300" />
                <h3 className="font-bold text-base">Registrar Nuevo Producto Base</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearProducto} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nombre del Producto Base
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sudadera Cuello Redondo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Precio Base ($)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={precioBase}
                    onChange={(e) => setPrecioBase(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Stock Inicial (pzas)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockGeneral}
                    onChange={(e) => setStockGeneral(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Colores Disponibles (separados por coma)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Azul Marino, Negro, Blanco, Rojo"
                  value={coloresStr}
                  onChange={(e) => setColoresStr(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tallas Disponibles (separadas por coma)
                </label>
                <input
                  type="text"
                  required
                  placeholder="S, M, L, XL, XXL"
                  value={tallasStr}
                  onChange={(e) => setTallasStr(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-2xs"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
