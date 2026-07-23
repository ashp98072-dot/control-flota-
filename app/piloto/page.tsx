import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FormularioPiloto from './FormularioPiloto'

export default async function PilotoPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre, rol')
    .eq('id', user.id)
    .single()

  const { data: vehiculosInfo } = await supabase
    .from('vehiculos')
    .select('id, placa, marca, modelo, en_taller, motivo_taller')
    .eq('activo', true)
    .order('placa')

  const { data: estadoFlota } = await supabase
    .from('estado_flota')
    .select('vehiculo_id, km_actual, fecha_ultimo_servicio')

  const kmPorVehiculo = new Map<string, number>(
    (estadoFlota ?? []).map((e: any) => [e.vehiculo_id, e.km_actual])
  )

  const vehiculosConKm = (vehiculosInfo ?? []).map((v: any) => ({
    ...v,
    km_actual: kmPorVehiculo.get(v.id) ?? 0,
  }))

  let { data: viajesAbiertos, error: errViajesAbiertos } = await supabase
    .from('registros_viaje')
    .select('id, km_salida, hora_salida, piloto_nombre, destino, vehiculo_id, vehiculos(id, placa, marca, modelo)')
    .eq('estado', 'abierto')
    .order('hora_salida', { ascending: false })

  if (errViajesAbiertos) {
    const { data: retryViajes } = await supabase
      .from('registros_viaje')
      .select('id, km_salida, hora_salida, vehiculo_id, vehiculos(id, placa, marca, modelo)')
      .eq('estado', 'abierto')
      .order('hora_salida', { ascending: false })
    viajesAbiertos = retryViajes
  }

  let { data: historialReciente, error: errHistorial } = await supabase
    .from('registros_viaje')
    .select('id, fecha, km_salida, km_llegada, hora_salida, hora_llegada, piloto_nombre, estado, destino, vehiculos(placa, marca, modelo)')
    .order('hora_salida', { ascending: false })
    .limit(8)

  if (errHistorial) {
    const { data: retryHistorial } = await supabase
      .from('registros_viaje')
      .select('id, fecha, km_salida, km_llegada, hora_salida, hora_llegada, estado, vehiculos(placa, marca, modelo)')
      .order('hora_salida', { ascending: false })
      .limit(8)
    historialReciente = retryHistorial
  }

  const nombrePiloto = perfil?.nombre || user.user_metadata?.nombre || 'Piloto'

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto space-y-6">
      <div className="border-b border-[var(--nav-border)] pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--foreground)]">
            Módulo de Control de Unidades (Pilotos)
          </h1>
          <p className="text-xs text-[var(--nav-text)] mt-1">
            Registra la salida o entrada de cualquier unidad ingresando tu nombre completo.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-500 font-bold">
          Modo Multiusuario
        </span>
      </div>

      <FormularioPiloto
        vehiculos={vehiculosConKm}
        viajesAbiertos={(viajesAbiertos as any[]) ?? []}
        nombrePilotoDefault=""
        historialReciente={(historialReciente as any[]) ?? []}
      />
    </div>
  )
}