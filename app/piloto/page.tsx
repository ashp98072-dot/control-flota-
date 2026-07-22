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

  let { data: viajeAbierto, error: errViajeAbierto } = await supabase
    .from('registros_viaje')
    .select('id, km_salida, hora_salida, piloto_nombre, destino, vehiculos(id, placa, marca, modelo)')
    .eq('piloto_id', user.id)
    .eq('estado', 'abierto')
    .maybeSingle()

  if (errViajeAbierto) {
    const { data: retryViaje } = await supabase
      .from('registros_viaje')
      .select('id, km_salida, hora_salida, vehiculos(id, placa, marca, modelo)')
      .eq('piloto_id', user.id)
      .eq('estado', 'abierto')
      .maybeSingle()
    viajeAbierto = retryViaje
  }

  let { data: historialReciente, error: errHistorial } = await supabase
    .from('registros_viaje')
    .select('id, fecha, km_salida, km_llegada, hora_salida, hora_llegada, piloto_nombre, estado, destino, vehiculos(placa, marca, modelo)')
    .eq('piloto_id', user.id)
    .order('hora_salida', { ascending: false })
    .limit(5)

  if (errHistorial) {
    const { data: retryHistorial } = await supabase
      .from('registros_viaje')
      .select('id, fecha, km_salida, km_llegada, hora_salida, hora_llegada, estado, vehiculos(placa, marca, modelo)')
      .eq('piloto_id', user.id)
      .order('hora_salida', { ascending: false })
      .limit(5)
    historialReciente = retryHistorial
  }

  const nombrePiloto = perfil?.nombre || user.user_metadata?.nombre || 'Piloto'

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto space-y-6">
      <div className="border-b border-[var(--nav-border)] pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--foreground)]">
            Módulo del Piloto
          </h1>
          <p className="text-xs text-[var(--nav-text)] mt-1">
            Hola, <strong className="text-[var(--foreground)]">{nombrePiloto}</strong>. Registra la entrada y salida de unidades.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-500 font-bold">
          Piloto Activo
        </span>
      </div>

      <FormularioPiloto
        vehiculos={vehiculosConKm}
        viajeAbierto={viajeAbierto as any}
        nombrePilotoDefault={nombrePiloto}
        historialReciente={historialReciente as any[] ?? []}
      />
    </div>
  )
}