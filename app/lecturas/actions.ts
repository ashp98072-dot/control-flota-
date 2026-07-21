'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function registrarLectura(formData: FormData) {
  const supabase = await createClient()

  const vehiculo_id = formData.get('vehiculo_id') as string
  const fecha = formData.get('fecha') as string
  const km_actual = Number(formData.get('km_actual'))

  if (!vehiculo_id || !fecha || !km_actual) {
    return { error: 'Faltan campos obligatorios' }
  }
  if (km_actual <= 0) {
    return { error: 'El km debe ser mayor a 0' }
  }

  const { error } = await supabase.from('lecturas_km').insert({ vehiculo_id, fecha, km_actual })

  if (error) {
    console.error('registrarLectura', error)
    return { error: error.message }
  }

  revalidatePath('/lecturas')
  revalidatePath('/')
  return { success: true }
}