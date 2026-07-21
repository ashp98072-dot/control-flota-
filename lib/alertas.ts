import { createClient } from '@/lib/supabase/server'

export async function contarAlertas(): Promise<number> {
  const supabase = await createClient()

  const { data: vehiculosInfo } = await supabase
    .from('vehiculos')
    .select('id, en_taller')
    .eq('activo', true)

  const idsActivos = (vehiculosInfo ?? []).map((v: any) => v.id)
  if (idsActivos.length === 0) return 0

  const enTallerPorId = new Map<any, any>((vehiculosInfo ?? []).map((v: any) => [v.id, v.en_taller]))

  const { data: estado } = await supabase
    .from('estado_flota')
    .select('vehiculo_id, km_pendiente_servicio')
    .in('vehiculo_id', idsActivos)

  return (estado ?? []).filter(
    (v: any) =>
      !enTallerPorId.get(v.vehiculo_id) &&
      v.km_pendiente_servicio != null &&
      v.km_pendiente_servicio <= 0
  ).length
}