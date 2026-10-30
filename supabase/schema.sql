-- =====================================================================
-- ESQUEMA DE BASE DE DATOS PARA SUPABASE
-- Sistema de Uniformes y Órdenes de Trabajo Textil
-- =====================================================================

-- 1. Tabla de Prendas / Productos en Inventario
CREATE TABLE IF NOT EXISTS public.prendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    talla TEXT NOT NULL CHECK (talla IN ('XS', 'S', 'M', 'L', 'XL', '2XL', 'Unitalla')),
    color TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    precio NUMERIC(10, 2) NOT NULL DEFAULT 0.0 CHECK (precio >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Órdenes de Trabajo
CREATE TABLE IF NOT EXISTS public.ordenes_trabajo (
    id TEXT PRIMARY KEY, -- Ej: ORD-1001
    cliente TEXT NOT NULL,
    telefono TEXT NOT NULL,
    prenda_id UUID NOT NULL REFERENCES public.prendas(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_total NUMERIC(10, 2) NOT NULL CHECK (precio_total >= 0),
    anticipo NUMERIC(10, 2) NOT NULL DEFAULT 0.0 CHECK (anticipo >= 0),
    -- Campo generado automáticamente para el restante
    restante NUMERIC(10, 2) GENERATED ALWAYS AS (precio_total - anticipo) STORED,
    tecnica TEXT NOT NULL CHECK (tecnica IN ('Bordado', 'Sublimado', 'DTF', 'Serigrafía')),
    estatus TEXT NOT NULL DEFAULT 'Cotización' CHECK (
        estatus IN ('Cotización', 'Anticipo Recibido', 'En Producción', 'Listo', 'Entregado')
    ),
    stock_ya_descontado BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Trigger en PostgreSQL para descontar automáticamente el Stock al registrar anticipo
CREATE OR REPLACE FUNCTION public.fn_descontar_stock_orden()
RETURNS TRIGGER AS $$
BEGIN
    -- Si la orden entra con anticipo > 0 o estatus 'Anticipo Recibido', y no ha sido descontada
    IF (NEW.anticipo > 0 OR NEW.estatus = 'Anticipo Recibido') AND (NEW.stock_ya_descontado = FALSE) THEN
        UPDATE public.prendas
        SET stock = GREATEST(0, stock - NEW.cantidad),
            updated_at = NOW()
        WHERE id = NEW.prenda_id;
        
        NEW.stock_ya_descontado := TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_descontar_stock ON public.ordenes_trabajo;
CREATE TRIGGER trg_descontar_stock
BEFORE INSERT OR UPDATE ON public.ordenes_trabajo
FOR EACH ROW
EXECUTE FUNCTION public.fn_descontar_stock_orden();

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE public.prendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordenes_trabajo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura publica o autenticada" ON public.prendas
    FOR ALL USING (true);

CREATE POLICY "Permitir gestion de ordenes" ON public.ordenes_trabajo
    FOR ALL USING (true);

-- 5. Semilla de datos iniciales
INSERT INTO public.prendas (nombre, talla, color, stock, precio) VALUES
('Polo Piqué Algodón Premium', 'M', 'Azul Marino', 18, 220.00),
('Polo Piqué Algodón Premium', 'L', 'Blanco Óptico', 4, 220.00), -- Alerta < 5
('Playera Dry-Fit Deportiva', 'S', 'Negro', 3, 140.00), -- Alerta < 5
('Playera Cuello Redondo 100% Algodón', 'XL', 'Gris Jaspe', 25, 130.00),
('Sudadera con Capucha Felpa', 'L', 'Vino Tinto', 9, 380.00),
('Camisa Gabardina Trabajo Rudo', 'M', 'Caqui', 2, 310.00) -- Alerta < 5
ON CONFLICT DO NOTHING;
