import React, { useState } from 'react';
import {
  FLUTTER_MAIN_DART,
  PUBSPEC_YAML,
  SUPABASE_SQL,
  ANDROID_MANIFEST_XML,
  BUILD_APK_GUIDE,
  GITHUB_WORKFLOW_YML
} from '../flutterCodeText';
import {
  X,
  Copy,
  Check,
  Download,
  FileCode,
  Terminal,
  ExternalLink,
  Sparkles,
  Smartphone,
  GitBranch
} from 'lucide-react';

interface FlutterCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlutterCodeModal: React.FC<FlutterCodeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'dart' | 'pubspec' | 'workflow' | 'manifest' | 'build_apk' | 'sql'>('dart');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentContent =
    activeTab === 'dart'
      ? FLUTTER_MAIN_DART
      : activeTab === 'pubspec'
      ? PUBSPEC_YAML
      : activeTab === 'workflow'
      ? GITHUB_WORKFLOW_YML
      : activeTab === 'manifest'
      ? ANDROID_MANIFEST_XML
      : activeTab === 'build_apk'
      ? BUILD_APK_GUIDE
      : SUPABASE_SQL;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename =
      activeTab === 'dart'
        ? 'main.dart'
        : activeTab === 'pubspec'
        ? 'pubspec.yaml'
        : activeTab === 'workflow'
        ? 'build_apk.yml'
        : activeTab === 'manifest'
        ? 'AndroidManifest.xml'
        : activeTab === 'build_apk'
        ? 'COMPILAR_APK_GUIA.sh'
        : 'supabase_schema.sql';
    const blob = new Blob([currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-slate-950 text-slate-100 rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl border border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">
                  Código Fuente Flutter (Material 3)
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Dart 3 Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Archivo único listo para probar en el simulador de Flutter
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-700"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Descargar</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="px-6 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between shrink-0 overflow-x-auto">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('dart')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'dart'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              lib/main.dart (Completo)
            </button>
            <button
              onClick={() => setActiveTab('pubspec')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'pubspec'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              pubspec.yaml
            </button>
            <button
              onClick={() => setActiveTab('workflow')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'workflow'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-300 hover:text-white hover:bg-purple-950/40'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>build_apk.yml (GitHub)</span>
            </button>
            <button
              onClick={() => setActiveTab('manifest')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'manifest'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              AndroidManifest.xml
            </button>
            <button
              onClick={() => setActiveTab('build_apk')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'build_apk'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Compilar APK (Guía)</span>
            </button>
            <button
              onClick={() => setActiveTab('sql')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'sql'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Supabase SQL
            </button>
          </div>

          <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-400 shrink-0 ml-2">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono text-[11px]">.github/workflows/build_apk.yml</span>
          </div>
        </div>

        {/* Quick Instructions banner */}
        <div className="px-6 py-2.5 bg-blue-950/40 border-b border-blue-900/50 flex items-center justify-between text-xs text-blue-200 shrink-0">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              {activeTab === 'workflow' ? (
                <>
                  <strong>En GitHub:</strong> Crea un archivo con nombre <code className="text-yellow-300 font-mono">.github/workflows/build_apk.yml</code> y pega este contenido. Se activará solo en GitHub Actions para compilar el APK.
                </>
              ) : activeTab === 'build_apk' ? (
                <>
                  <strong>Comando APK:</strong> Ejecuta <code className="text-emerald-300 font-mono">flutter build apk --release</code> en tu terminal local para generar el instalador en <code className="text-yellow-300 font-mono">build/app/outputs/flutter-apk/app-release.apk</code>.
                </>
              ) : activeTab === 'manifest' ? (
                <>
                  <strong>Configuración Android:</strong> Pega este archivo en <code className="text-yellow-300 font-mono">android/app/src/main/AndroidManifest.xml</code> para habilitar permisos de galería y abrir WhatsApp sin bloqueos.
                </>
              ) : (
                <>
                  <strong>Paso rápido:</strong> Pega este archivo en <code className="text-yellow-300 font-mono">lib/main.dart</code> en tu proyecto Flutter. Ya contiene todos los modelos, vistas M3, IVA (16%), CFDI y PDF printing.
                </>
              )}
            </span>
          </div>
        </div>

        {/* Code Content with syntax viewing */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-950 font-mono text-xs text-slate-300 selection:bg-blue-900 selection:text-white">
          <pre className="leading-relaxed whitespace-pre font-mono">
            <code>{currentContent}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>
            {activeTab === 'dart'
              ? 'Compatible con Flutter 3.19+ y Material 3 (Android, iOS, Web y Desktop)'
              : activeTab === 'pubspec'
              ? 'Dependencias oficiales requeridas: pdf y printing'
              : 'PostgreSQL trigger para deducción automática en Supabase'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
