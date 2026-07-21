import { createClient } from '@/lib/supabase/server'

export type CostoMensual = {
  mes: string // 'YYYY-MM'
  total: number
}

export type CostoMensualPorVehiculo = {
  mes: string
  [placa: string]: number | string
}

export async function obtenerCostosPorMes({
  meses = 6,
  vehiculoId,
}: {
  meses?: number
  vehiculoId?: string
} = {}): Promise<{ consolidado: CostoMensual[]; porVehiculo: CostoMensualPorVehiculo[] }> {
  const supabase = await createClient()

  const hoy = new Date()
  const desde = new Date(hoy.getFullYear(), hoy.getMonth() - (meses - 1), 1)
  const desdeStr = desde.toISOString().split('T')[0]

  let query = supabase
    .from('servicios')
    .select('fecha, costo, vehiculo_id, vehiculos(placa)')
    .gte('fecha', desdeStr)
    .order('fecha', { ascending: true })

  if (vehiculoId) query = query.eq('vehiculo_id', vehiculoId)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  // Genera la lista de meses en orden, aunque no tengan datos
  const listaMeses: string[] = []
  for (let i = meses - 1; i >= 0; i--) {
    const f = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
    listaMeses.push(`${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`)
  }

  const consolidadoMap = new Map(listaMeses.map((m) => [m, 0]))
  const porVehiculoMap = new Map<string, CostoMensualPorVehiculo>(
    listaMeses.map((m) => [m, { mes: m }])
  )
  const placasVistas = new Set<string>()

  for (const s of (data ?? []) as any[]) {
    const mes = s.fecha.slice(0, 7) // 'YYYY-MM'
    if (!consolidadoMap.has(mes)) continue // fuera del rango solicitado

    consolidadoMap.set(mes, (consolidadoMap.get(mes) ?? 0) + Number(s.costo || 0))

    const placa = s.vehiculos?.placa ?? 'Sin placa'
    placasVistas.add(placa)
    const fila = porVehiculoMap.get(mes)!
    fila[placa] = (Number(fila[placa]) || 0) + Number(s.costo || 0)
  }

  // Asegura que todas las placas tengan 0 en los meses donde no gastaron
  for (const fila of porVehiculoMap.values()) {
    for (const placa of placasVistas) {
      if (fila[placa] === undefined) fila[placa] = 0
    }
  }

  return {
    consolidado: listaMeses.map((m) => ({ mes: m, total: consolidadoMap.get(m) ?? 0 })),
    porVehiculo: [...porVehiculoMap.values()],
  }
}