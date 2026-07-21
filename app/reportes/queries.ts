import { createClient } from '@/lib/supabase/server'

export type ServicioReporte = {
  id: string
  fecha: string
  tipo_trabajo: string
  tipo: string
  costo: number
  observaciones: string | null
}

export type VehiculoReporte = {
  vehiculo_id: string
  placa: string
  marca: string
  modelo: string
  servicios: ServicioReporte[]
  total_costo: number
  cantidad_servicios: number
}

export async function obtenerReporte({
  desde,
  hasta,
  vehiculoId,
}: {
  desde: string
  hasta: string
  vehiculoId?: string
}): Promise<VehiculoReporte[]> {
  const supabase = await createClient()

  let query = supabase
    .from('servicios')
    .select('id, vehiculo_id, fecha, tipo_trabajo, tipo, costo, observaciones, vehiculos(placa, marca, modelo)')
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .order('fecha', { ascending: false })

  if (vehiculoId) query = query.eq('vehiculo_id', vehiculoId)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  const porVehiculo = new Map<string, VehiculoReporte>()

  for (const s of (data ?? []) as any[]) {
    const v = s.vehiculos
    if (!porVehiculo.has(s.vehiculo_id)) {
      porVehiculo.set(s.vehiculo_id, {
        vehiculo_id: s.vehiculo_id,
        placa: v?.placa ?? '—',
        marca: v?.marca ?? '',
        modelo: v?.modelo ?? '',
        servicios: [],
        total_costo: 0,
        cantidad_servicios: 0,
      })
    }
    const grupo = porVehiculo.get(s.vehiculo_id)!
    grupo.servicios.push({
      id: s.id,
      fecha: s.fecha,
      tipo_trabajo: s.tipo_trabajo,
      tipo: s.tipo,
      costo: Number(s.costo) || 0,
      observaciones: s.observaciones,
    })
    grupo.total_costo += Number(s.costo) || 0
    grupo.cantidad_servicios += 1
  }

  return [...porVehiculo.values()].sort((a, b) => a.placa.localeCompare(b.placa))
}