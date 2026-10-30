import React, { useState } from 'react';
import { SUPABASE_SQL } from '../flutterCodeText';
import {
  X,
  Database,
  Copy,
  Check,
  CheckCircle2,
  Terminal,
  ShieldCheck,
  Zap,
  Download
} from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg">Esquema &amp; Triggers Supabase</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  PostgreSQL
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                Lógica en servidor para cálculo de restante y descuento de stock
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-emerald-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          {/* Architecture Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold mb-1">
                <Zap className="w-4 h-4" />
                <span>Trigger Automático</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                El trigger <code className="text-emerald-800 font-bold">trg_descontar_stock</code> resta
                el stock de la prenda cuando la orden tiene anticipo &gt; 0 o estatus &apos;Anticipo Recibido&apos;.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center space-x-2 text-blue-700 font-bold mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Columna Generada</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                <code className="text-blue-900 font-bold">restante</code> se calcula automáticamente en SQL
                con: <code className="bg-slate-200 px-1 rounded">precio_total - anticipo</code>.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center space-x-2 text-purple-700 font-bold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>RLS Habilitado</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Políticas de seguridad Row Level Security (RLS) configuradas para acceso seguro desde Flutter.
              </p>
            </div>
          </div>

          {/* Quick instructions */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
            <strong>Cómo ejecutarlo en Supabase:</strong>
            <ol className="list-decimal list-inside mt-1 space-y-0.5 text-emerald-800">
              <li>Abre el dashboard de tu proyecto en Supabase.</li>
              <li>Ve a la pestaña <strong>SQL Editor</strong>.</li>
              <li>Pega el siguiente script y presiona <strong>Run</strong>.</li>
            </ol>
          </div>

          {/* SQL Code Box */}
          <div className="rounded-2xl bg-slate-950 p-4 font-mono text-[11px] text-slate-300 relative border border-slate-800">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
              <span>supabase/schema.sql</span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-sans text-xs font-semibold flex items-center space-x-1 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-200" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar SQL</span>
                  </>
                )}
              </button>
            </div>
            <pre className="overflow-x-auto whitespace-pre leading-relaxed max-h-64 scrollbar-thin">
              <code>{SUPABASE_SQL}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Script guardado en <code className="font-semibold text-slate-700">/supabase/schema.sql</code>
          </span>
          <div className="flex space-x-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center space-x-1.5"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? '¡Copiado!' : 'Copiar Script SQL'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
