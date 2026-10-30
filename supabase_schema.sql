-- ==========================================
-- UNITAP UNIFORMES - ESQUEMA SUPABASE SQL ACTUALIZADO (MULTI-ARTÍCULOS + IVA + CFDI)
-- Tablas: datos_negocio, productos_base, ordenes_trabajo
-- ==========================================

-- 1. Configuración del Negocio y Logotipo
CREATE TABLE IF NOT EXISTS public.datos_negocio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL DEFAULT 'UNITAP - Bordados y Uniformes',
  telefono TEXT NOT NULL DEFAULT '81 0000 0000',
  direccion TEXT NOT NULL DEFAULT 'Guadalupe, Nuevo León',
  logo_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Catálogo Base de Prendas e Inventario
CREATE TABLE IF NOT EXISTS public.productos_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  precio_base NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  colores_disponibles TEXT[] NOT NULL DEFAULT '{}',
  tallas_disponibles TEXT[] NOT NULL DEFAULT '{}',
  stock_general INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Órdenes de Trabajo con Multi-Artículos (ItemOrden) e IVA y Facturación CFDI
CREATE TABLE IF NOT EXISTS public.ordenes_trabajo (
  id TEXT PRIMARY KEY,
  cliente TEXT NOT NULL,
  telefono TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  costo_envio NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  aplica_iva BOOLEAN NOT NULL DEFAULT false,
  requiere_factura BOOLEAN NOT NULL DEFAULT false,
  factura_emitida BOOLEAN NOT NULL DEFAULT false,
  anticipo NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  restante NUMERIC(10, 2) GENERATED ALWAYS AS (total - anticipo) STORED,
  estatus_produccion TEXT NOT NULL DEFAULT 'En Producción',
  estatus_inventario TEXT NOT NULL DEFAULT 'Surtido',
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Políticas RLS
ALTER TABLE public.datos_negocio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordenes_trabajo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de productos" ON public.productos_base FOR SELECT USING (true);
CREATE POLICY "Escritura autenticada de productos" ON public.productos_base FOR ALL USING (true);
CREATE POLICY "Lectura y escritura de órdenes" ON public.ordenes_trabajo FOR ALL USING (true);
CREATE POLICY "Lectura y escritura de negocio" ON public.datos_negocio FOR ALL USING (true);
