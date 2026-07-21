'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function registrarSalida(formData: FormData) {
  const supabase = await createClient()
  const vehiculo_id = formData.get('vehiculo_id') as string
  const km_salida = Number(formData.get('km_salida'))

  if (!vehiculo_id || !Number.isFinite(km_salida)) return { error: 'Faltan campos obligatorios' }

  const { error } = await supabase.rpc('registrar_salida_viaje', {
    p_vehiculo_id: vehiculo_id,
    p_km_salida: km_salida,
  })
  if (error) return { error: error.message }

  revalidatePath('/piloto')
  return { success: true }
}

export async function registrarLlegada(formData: FormData) {
  const supabase = await createClient()
  const viaje_id = formData.get('viaje_id') as string
  const km_llegada = Number(formData.get('km_llegada'))

  if (!viaje_id || !Number.isFinite(km_llegada)) return { error: 'Faltan campos obligatorios' }

  const { error } = await supabase.rpc('registrar_llegada_viaje', {
    p_viaje_id: viaje_id,
    p_km_llegada: km_llegada,
  })
  if (error) return { error: error.message }

  revalidatePath('/piloto')
  revalidatePath('/')
  return { success: true }
}