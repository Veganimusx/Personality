import React, { useState } from 'react';
import { DatosNegocio } from '../types';
import {
  X,
  Building2,
  Phone,
  MapPin,
  Image as ImageIcon,
  Check,
  Upload
} from 'lucide-react';

interface BusinessSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  negocio: DatosNegocio;
  onSave: (negocio: DatosNegocio) => void;
}

export const BusinessSettingsModal: React.FC<BusinessSettingsModalProps> = ({
  isOpen,
  onClose,
  negocio,
  onSave,
}) => {
  const [nombre, setNombre] = useState(negocio.nombre);
  const [telefono, setTelefono] = useState(negocio.telefono);
  const [direccion, setDireccion] = useState(negocio.direccion);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(negocio.logoPath);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      direccion: direccion.trim(),
      logoPath: logoPreview,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">Datos del Negocio &amp; Membrete</h3>
              <p className="text-xs text-blue-200">
                Aparecerán en la cabecera de las 2 hojas del PDF
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-blue-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nombre Comercial del Negocio *
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                placeholder="Ej. UNITAP - Bordados y Uniformes"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Teléfono de Contacto *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Ej. 81 0000 0000"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ubicación / Dirección *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Ej. Guadalupe, Nuevo León"
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Logotipo del Taller
            </label>
            <div className="flex items-center space-x-3">
              {logoPreview ? (
                <div className="relative w-14 h-14 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                  <button
                    type="button"
                    onClick={() => setLogoPreview(undefined)}
                    className="absolute top-0.5 right-0.5 bg-red-600 text-white p-0.5 rounded-full"
                    title="Eliminar logo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl border border-dashed border-slate-300 flex items-center justify-center bg-slate-50 text-slate-400 shrink-0">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}

              <label className="flex-1 cursor-pointer py-2 px-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors">
                <Upload className="w-4 h-4" />
                <span>{logoPreview ? 'Cambiar Logotipo' : 'Subir Logotipo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
