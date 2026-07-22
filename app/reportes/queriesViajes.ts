import { createClient } from '@/lib/supabase/server'

export type ViajeReporte = {
  id: string
  fecha: string
  placa: string
  piloto: string
  km_salida: number
  km_llegada: number | null
  hora_salida: string
  hora_llegada: string | null
  estado: string
  km_recorridos: number | null
  destino?: string | null
  observaciones?: string | null
}

export async function obtenerViajes({
  desde,
  hasta,
  vehiculoId,
}: {
  desde: string
  hasta: string
  vehiculoId?: string
}): Promise<ViajeReporte[]> {
  const supabase = await createClient()

  let query = supabase
    .from('registros_viaje')
    .select('id, fecha, km_salida, km_llegada, hora_salida, hora_llegada, estado, vehiculo_id, piloto_id, piloto_nombre, destino, observaciones, vehiculos(placa)')
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .order('fecha', { ascending: false })
    .order('hora_salida', { ascending: false })

  if (vehiculoId) query = query.eq('vehiculo_id', vehiculoId)

  let { data, error } = await query

  if (error && error.message?.includes("'destino'")) {
    let queryFallback = supabase
      .from('registros_viaje')
      .select('id, fecha, km_salida, km_llegada, hora_salida, hora_llegada, estado, vehiculo_id, piloto_id, piloto_nombre, observaciones, vehiculos(placa)')
      .gte('fecha', desde)
      .lte('fecha', hasta)
      .order('fecha', { ascending: false })
      .order('hora_salida', { ascending: false })

    if (vehiculoId) queryFallback = queryFallback.eq('vehiculo_id', vehiculoId)
    const fallbackRes = await queryFallback
    data = fallbackRes.data
    error = fallbackRes.error
  }

  if (error) throw new Error(error.message)

  const filas = (data ?? []) as any[]
  const pilotoIds = [...new Set(filas.map((f) => f.piloto_id).filter(Boolean))]

  const { data: perfiles } = pilotoIds.length
    ? await supabase.from('perfiles').select('id, nombre').in('id', pilotoIds)
    : { data: [] as { id: string; nombre: string }[] }

  const nombrePorId = new Map<any, any>((perfiles ?? []).map((p: any) => [p.id, p.nombre]))

  return filas.map((r) => ({
    id: r.id,
    fecha: r.fecha,
    placa: r.vehiculos?.placa ?? '—',
    piloto: r.piloto_nombre || nombrePorId.get(r.piloto_id) || '—',
    km_salida: Number(r.km_salida),
    km_llegada: r.km_llegada != null ? Number(r.km_llegada) : null,
    hora_salida: r.hora_salida,
    hora_llegada: r.hora_llegada,
    estado: r.estado,
    km_recorridos: r.km_llegada != null ? Number(r.km_llegada) - Number(r.km_salida) : null,
    destino: r.destino,
    observaciones: r.observaciones,
  }))
}