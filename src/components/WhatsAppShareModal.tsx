import React, { useState } from 'react';
import { OrdenTrabajo } from '../types';
import { generarReciboPDF, generarMensajeWhatsApp, enviarReciboYPDFPorWhatsAppWeb } from '../services/pdfGenerator';
import {
  X,
  Send,
  Download,
  Copy,
  Check,
  Phone,
  FileText,
  Share2,
  Sparkles
} from 'lucide-react';

import { DatosNegocio } from '../types';

interface WhatsAppShareModalProps {
  orden: OrdenTrabajo | null;
  negocio?: DatosNegocio;
  onClose: () => void;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  orden,
  negocio,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!orden) return null;

  const mensaje = generarMensajeWhatsApp(orden);

  const handleCopy = () => {
    navigator.clipboard.writeText(mensaje);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendAndDownload = async () => {
    await enviarReciboYPDFPorWhatsAppWeb(orden, negocio);
  };

  const handleDownloadOnly = () => {
    generarReciboPDF(orden, negocio, true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-teal-700 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/30 border border-teal-400/40 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg">Enviar PDF y Estatus</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-400/20 text-teal-200 border border-teal-400/30">
                  UNITAP
                </span>
              </div>
              <p className="text-xs text-teal-200">
                Compartir comprobante PDF y actualización a {orden.cliente}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-teal-200 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Target Customer info */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block">Destinatario:</span>
              <span className="font-bold text-slate-900 text-sm">{orden.cliente}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Teléfono WhatsApp:</span>
              <span className="font-bold text-teal-800 flex items-center justify-end space-x-1">
                <Phone className="w-3.5 h-3.5 text-teal-600" />
                <span>{orden.telefono}</span>
              </span>
            </div>
          </div>

          {/* WhatsApp formatted message preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <span>Mensaje listo para WhatsApp:</span>
              </label>
              <button
                onClick={handleCopy}
                className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center space-x-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Texto</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 font-sans text-xs text-slate-800 space-y-1 relative">
              <div className="whitespace-pre-line leading-relaxed font-mono text-[12px]">
                {mensaje}
              </div>
            </div>
          </div>

          {/* Notice about native Flutter share_plus */}
          <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <p>
              En el simulador Flutter, este botón ejecuta <code className="font-bold text-teal-900">Share.shareXFiles</code> con el PDF adjunto generado por <code className="font-bold text-teal-900">path_provider</code>.
              En la web, abrirá WhatsApp con el mensaje y descargará el PDF al instante.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 space-y-2">
            <button
              onClick={handleSendAndDownload}
              className="w-full py-3 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Abrir WhatsApp y Descargar PDF</span>
            </button>

            <button
              onClick={handleDownloadOnly}
              className="w-full py-2.5 px-4 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center space-x-2 transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Solo Descargar PDF del Recibo</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
