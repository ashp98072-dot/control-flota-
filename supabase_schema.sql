-- ========================================================
-- SCHEMA BASE DE DATOS PARA CONTROL DE FLOTA EN SUPABASE
-- Copia y pega este script completo en el SQL Editor de Supabase
-- y presiona RUN.
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA PERFILES
CREATE TABLE IF NOT EXISTS public.perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'piloto')),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA VEHICULOS
CREATE TABLE IF NOT EXISTS public.vehiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa TEXT UNIQUE NOT NULL,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  tipo_combustible TEXT DEFAULT 'diesel',
  km_intervalo_servicio INT DEFAULT 5000,
  activo BOOLEAN DEFAULT TRUE,
  en_taller BOOLEAN DEFAULT FALSE,
  fecha_entrada_taller DATE,
  motivo_taller TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA LECTURAS_KM
CREATE TABLE IF NOT EXISTS public.lecturas_km (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehiculo_id UUID NOT NULL REFERENCES public.vehiculos(id) ON DELETE CASCADE,
  fecha DATE DEFAULT CURRENT_DATE,
  km_actual NUMERIC NOT NULL,
  conductor TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA SERVICIOS
CREATE TABLE IF NOT EXISTS public.servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehiculo_id UUID NOT NULL REFERENCES public.vehiculos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  km_al_servicio NUMERIC NOT NULL,
  tipo_trabajo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('mantenimiento', 'reparacion')),
  costo NUMERIC DEFAULT 0,
  observaciones TEXT,
  dias_en_taller INT DEFAULT 0,
  motivo_taller TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA REGISTROS_VIAJE
CREATE TABLE IF NOT EXISTS public.registros_viaje (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE DEFAULT CURRENT_DATE,
  vehiculo_id UUID NOT NULL REFERENCES public.vehiculos(id) ON DELETE CASCADE,
  piloto_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  piloto_nombre TEXT,
  km_salida NUMERIC NOT NULL,
  km_llegada NUMERIC,
  hora_salida TIMESTAMPTZ DEFAULT NOW(),
  hora_llegada TIMESTAMPTZ,
  estado TEXT DEFAULT 'abierto' CHECK (estado IN ('abierto', 'cerrado')),
  destino TEXT,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asegurar columna destino si la tabla ya existía de ejecuciones previas:
ALTER TABLE public.registros_viaje ADD COLUMN IF NOT EXISTS destino TEXT;

-- 6. VISTA ESTADO_FLOTA
DROP VIEW IF EXISTS public.estado_flota CASCADE;
CREATE OR REPLACE VIEW public.estado_flota AS
SELECT 
  v.id AS vehiculo_id,
  v.placa,
  v.marca,
  v.modelo,
  COALESCE((
    SELECT l.km_actual 
    FROM public.lecturas_km l 
    WHERE l.vehiculo_id = v.id 
    ORDER BY l.km_actual DESC, l.created_at DESC 
    LIMIT 1
  ), 0) AS km_actual,
  COALESCE((
    SELECT s.km_al_servicio 
    FROM public.servicios s 
    WHERE s.vehiculo_id = v.id AND s.tipo = 'mantenimiento' 
    ORDER BY s.fecha DESC, s.created_at DESC 
    LIMIT 1
  ), 0) AS km_ultimo_servicio,
  (
    SELECT s.fecha 
    FROM public.servicios s 
    WHERE s.vehiculo_id = v.id AND s.tipo = 'mantenimiento' 
    ORDER BY s.fecha DESC, s.created_at DESC 
    LIMIT 1
  ) AS fecha_ultimo_servicio,
  (
    COALESCE((
      SELECT s.km_al_servicio 
      FROM public.servicios s 
      WHERE s.vehiculo_id = v.id AND s.tipo = 'mantenimiento' 
      ORDER BY s.fecha DESC, s.created_at DESC 
      LIMIT 1
    ), 0) + v.km_intervalo_servicio - COALESCE((
      SELECT l.km_actual 
      FROM public.lecturas_km l 
      WHERE l.vehiculo_id = v.id 
      ORDER BY l.km_actual DESC, l.created_at DESC 
      LIMIT 1
    ), 0)
  ) AS km_pendiente_servicio
FROM public.vehiculos v;

-- 7. FUNCIONES RPC PARA REGISTRO DE VIAJES
CREATE OR REPLACE FUNCTION public.registrar_salida_viaje(
  p_vehiculo_id UUID,
  p_km_salida NUMERIC,
  p_piloto_nombre TEXT DEFAULT NULL,
  p_destino TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_viaje_id UUID := gen_random_uuid();
  v_result JSON;
BEGIN
  INSERT INTO public.registros_viaje (
    id, fecha, vehiculo_id, piloto_id, piloto_nombre, km_salida, hora_salida, estado, destino
  )
  VALUES (
    v_viaje_id, CURRENT_DATE, p_vehiculo_id, v_user_id, p_piloto_nombre, p_km_salida, NOW(), 'abierto', p_destino
  );

  INSERT INTO public.lecturas_km (
    vehiculo_id, fecha, km_actual, conductor, notas
  )
  VALUES (
    p_vehiculo_id, CURRENT_DATE, p_km_salida, p_piloto_nombre, COALESCE('Salida de viaje ' || p_destino, 'Salida de viaje')
  );

  SELECT row_to_json(r) INTO v_result FROM public.registros_viaje r WHERE r.id = v_viaje_id;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.registrar_llegada_viaje(
  p_viaje_id UUID,
  p_km_llegada NUMERIC,
  p_observaciones TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_vehiculo_id UUID;
  v_piloto_nombre TEXT;
  v_result JSON;
BEGIN
  UPDATE public.registros_viaje
  SET 
    km_llegada = p_km_llegada,
    hora_llegada = NOW(),
    estado = 'cerrado',
    observaciones = p_observaciones
  WHERE id = p_viaje_id
  RETURNING vehiculo_id, piloto_nombre INTO v_vehiculo_id, v_piloto_nombre;

  IF v_vehiculo_id IS NOT NULL THEN
    INSERT INTO public.lecturas_km (
      vehiculo_id, fecha, km_actual, conductor, notas
    )
    VALUES (
      v_vehiculo_id, CURRENT_DATE, p_km_llegada, v_piloto_nombre, COALESCE('Llegada de viaje ' || p_observaciones, 'Llegada de viaje')
    );
  END IF;

  SELECT row_to_json(r) INTO v_result FROM public.registros_viaje r WHERE r.id = p_viaje_id;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. TRIGGER AUTOMATICO AL CREAR USUARIO EN SUPABASE AUTH
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre, rol, activo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', SPLIT_PART(NEW.email, '@', 1)),
    'piloto',
    TRUE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. PERMISOS Y POLITICAS DE SEGURIDAD (RLS)
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecturas_km ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_viaje ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso total perfiles" ON public.perfiles;
DROP POLICY IF EXISTS "Acceso total vehiculos" ON public.vehiculos;
DROP POLICY IF EXISTS "Acceso total lecturas_km" ON public.lecturas_km;
DROP POLICY IF EXISTS "Acceso total servicios" ON public.servicios;
DROP POLICY IF EXISTS "Acceso total registros_viaje" ON public.registros_viaje;
DROP POLICY IF EXISTS "Acceso total para usuarios autenticados perfiles" ON public.perfiles;
DROP POLICY IF EXISTS "Acceso total para usuarios autenticados vehiculos" ON public.vehiculos;
DROP POLICY IF EXISTS "Acceso total para usuarios autenticados lecturas_km" ON public.lecturas_km;
DROP POLICY IF EXISTS "Acceso total para usuarios autenticados servicios" ON public.servicios;
DROP POLICY IF EXISTS "Acceso total para usuarios autenticados registros_viaje" ON public.registros_viaje;

CREATE POLICY "Acceso total para usuarios autenticados perfiles" ON public.perfiles FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Acceso total para usuarios autenticados vehiculos" ON public.vehiculos FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Acceso total para usuarios autenticados lecturas_km" ON public.lecturas_km FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Acceso total para usuarios autenticados servicios" ON public.servicios FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Acceso total para usuarios autenticados registros_viaje" ON public.registros_viaje FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
