import React from 'react';
import {
  Shirt,
  FileCode2,
  Database,
  BarChart3,
  AlertTriangle,
  Plus,
  History,
  Layers,
  Settings,
  PackageCheck,
  Boxes,
  Receipt
} from 'lucide-react';
import { TallerStats, DatosNegocio, NavTab } from '../types';

interface M3TopBarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  stats: TallerStats;
  negocio: DatosNegocio;
  onOpenNewOrder: () => void;
  onOpenFlutterCode: () => void;
  onOpenSupabase: () => void;
  onOpenFinancials: () => void;
  onOpenSettings: () => void;
}

export const M3TopBar: React.FC<M3TopBarProps> = ({
  activeTab,
  setActiveTab,
  stats,
  negocio,
  onOpenNewOrder,
  onOpenFlutterCode,
  onOpenSupabase,
  onOpenFinancials,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-md shadow-blue-950/20 overflow-hidden">
              {negocio.logoPath ? (
                <img src={negocio.logoPath} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Shirt className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">
                  {negocio.nombre}
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
                  Material 3
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Gestión de Uniformes & Órdenes de Trabajo • {negocio.telefono}
              </p>
            </div>
          </div>

          {/* Action Buttons & Tabs */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Stock Alert Badge */}
            {stats.prendasStockCritico > 0 && (
              <button
                onClick={() => setActiveTab('inventory')}
                className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 hover:bg-red-200 transition-colors"
                title={`${stats.prendasStockCritico} prendas tienen menos de 5 piezas en inventario`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span>{stats.prendasStockCritico} stock bajo</span>
              </button>
            )}

            {/* Financial Balance Button */}
            <button
              onClick={onOpenFinancials}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              title="Ver Balance Financiero"
            >
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Balance</span>
            </button>

            {/* Supabase Schema Button */}
            <button
              onClick={onOpenSupabase}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              title="Configuración y SQL de Supabase"
            >
              <Database className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Supabase</span>
            </button>

            {/* Flutter Code Button */}
            <button
              onClick={onOpenFlutterCode}
              className="px-3 py-1.5 rounded-xl text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-2xs"
            >
              <FileCode2 className="w-4 h-4 text-blue-700" />
              <span>Flutter Dart</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              title="Configurar Datos del Negocio y Logo"
            >
              <Settings className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Negocio</span>
            </button>

            {/* New Order Button */}
            <button
              onClick={onOpenNewOrder}
              className="px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white text-xs sm:text-sm font-semibold flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Orden</span>
            </button>
          </div>
        </div>

        {/* 4 Bottom Navigation Bar Destinations matching Flutter */}
        <div className="flex border-t border-slate-100 py-1.5 overflow-x-auto scrollbar-none">
          <nav className="flex space-x-1.5 sm:space-x-2">
            {/* Vista 1: Activas */}
            <button
              onClick={() => setActiveTab('activas')}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'activas'
                  ? 'bg-blue-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Activas ({stats.totalActivas})</span>
            </button>

            {/* Vista 2: Por Surtir */}
            <button
              onClick={() => setActiveTab('por_surtir')}
              className={`relative px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'por_surtir'
                  ? 'bg-orange-600 text-white shadow-2xs'
                  : 'text-orange-700 hover:text-orange-900 hover:bg-orange-50'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5 text-orange-400 group-hover:text-orange-600" />
              <span>Por Surtir</span>
              {stats.totalPorSurtir > 0 && (
                <span className={`ml-1 inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                  activeTab === 'por_surtir' ? 'bg-white text-orange-700' : 'bg-orange-600 text-white'
                }`}>
                  {stats.totalPorSurtir}
                </span>
              )}
            </button>

            {/* Vista 3: Facturar (CFDI) */}
            <button
              onClick={() => setActiveTab('facturas')}
              className={`relative px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'facturas'
                  ? 'bg-purple-700 text-white shadow-2xs'
                  : 'text-purple-700 hover:text-purple-900 hover:bg-purple-50'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Facturar</span>
              {stats.totalFacturasPendientes > 0 && (
                <span className={`ml-1 inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                  activeTab === 'facturas' ? 'bg-white text-purple-700' : 'bg-purple-600 text-white'
                }`}>
                  {stats.totalFacturasPendientes}
                </span>
              )}
            </button>

            {/* Vista 3: Finalizados */}
            <button
              onClick={() => setActiveTab('finalizados')}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'finalizados'
                  ? 'bg-blue-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Finalizados ({stats.totalFinalizadas})</span>
            </button>

            {/* Vista 4: Stock / Inventario */}
            <button
              onClick={() => setActiveTab('inventory')}
              className={`relative px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'inventory'
                  ? 'bg-blue-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Stock ({stats.prendasStockCritico > 0 ? `${stats.prendasStockCritico} bajo` : 'OK'})</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
