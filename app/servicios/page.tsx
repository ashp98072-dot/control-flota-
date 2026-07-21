import { createClient } from '@/lib/supabase/server'
import FormularioServicio from './FormularioServicio'
import TablaServicios from './TablaServicios'
import PanelTaller from './PanelTaller'

export default async function ServiciosPage({
  searchParams,
}: {
  searchParams: Promise<{ vehiculo?: string }>
}) {
  const { vehiculo } = await searchParams
  const supabase = await createClient()

  const { data: vehiculosEstado } = await supabase
    .from('estado_flota')
    .select('vehiculo_id, placa, marca, modelo, km_actual, km_ultimo_servicio, fecha_ultimo_servicio')
    .order('placa')

  const { data: tallerInfo } = await supabase
    .from('vehiculos')
    .select('id, en_taller, fecha_entrada_taller, motivo_taller')

  const tallerPorId = new Map<any, any>((tallerInfo ?? []).map((t: any) => [t.id, t]))

  const vehiculos = (vehiculosEstado ?? []).map((v: any) => ({
    id: v.vehiculo_id,
    placa: v.placa,
    marca: v.marca,
    modelo: v.modelo,
    km_actual: v.km_actual,
    km_ultimo_servicio: v.km_ultimo_servicio,
    fecha_ultimo_servicio: v.fecha_ultimo_servicio,
    en_taller: tallerPorId.get(v.vehiculo_id)?.en_taller ?? false,
    fecha_entrada_taller: tallerPorId.get(v.vehiculo_id)?.fecha_entrada_taller ?? null,
    motivo_taller: tallerPorId.get(v.vehiculo_id)?.motivo_taller ?? null,
  }))

  let query = supabase
    .from('servicios')
    .select(
      'id, fecha, km_al_servicio, tipo_trabajo, tipo, costo, observaciones, dias_en_taller, motivo_taller, vehiculo_id, vehiculos(placa, marca, modelo)'
    )
    .order('fecha', { ascending: false })

  if (vehiculo) query = query.eq('vehiculo_id', vehiculo)

  const { data: servicios, error } = await query

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Cabecera de la página */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Servicios y Taller</h1>
        <p className="text-sm text-[var(--nav-text)]">
          Administra los ingresos/salidas del taller y registra mantenimientos preventivos o correctivos.
        </p>
      </div>

      {/* Control Rápido de Taller */}
      <PanelTaller vehiculos={vehiculos} />

      {/* Formulario de registro */}
      <div className="bg-[var(--nav-bg)] border border-[var(--nav-border)] rounded-2xl p-5 sm:p-6 shadow-xs max-w-xl">
        <FormularioServicio vehiculos={vehiculos} />
      </div>

      {/* Tabla e historial con filtros interactivos */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--foreground)]">Historial de Servicios</h2>
        {error && <p className="text-red-500 text-sm">Error cargando servicios: {error.message}</p>}
        
        <TablaServicios
          servicios={(servicios ?? []) as any}
          vehiculos={vehiculos}
          vehiculoActual={vehiculo}
        />
      </div>
    </div>
  )
}