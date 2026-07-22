'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function registrarSalida(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const vehiculo_id = formData.get('vehiculo_id') as string
    const km_salida = Number(formData.get('km_salida'))
    const piloto_nombre = (formData.get('piloto_nombre') as string)?.trim() || 'Piloto'
    const destino = (formData.get('destino') as string)?.trim() || ''

    if (!vehiculo_id || !Number.isFinite(km_salida)) return { error: 'Faltan campos obligatorios' }

    // Try RPC first
    const { error: rpcErr } = await supabase.rpc('registrar_salida_viaje', {
      p_vehiculo_id: vehiculo_id,
      p_km_salida: km_salida,
      p_piloto_nombre: piloto_nombre,
      p_destino: destino,
    })

    if (rpcErr) {
      // Fallback direct insert
      const hoy = new Date().toISOString().split('T')[0]
      const ahora = new Date().toISOString()
      
      let { error: insErr } = await supabase.from('registros_viaje').insert({
        vehiculo_id,
        piloto_id: user?.id || 'piloto-id',
        piloto_nombre,
        km_salida,
        hora_salida: ahora,
        fecha: hoy,
        estado: 'abierto',
        destino
      })

      if (insErr && insErr.message?.includes("'destino'")) {
        const { error: retryErr } = await supabase.from('registros_viaje').insert({
          vehiculo_id,
          piloto_id: user?.id || 'piloto-id',
          piloto_nombre,
          km_salida,
          hora_salida: ahora,
          fecha: hoy,
          estado: 'abierto'
        })
        insErr = retryErr
      }

      if (insErr) {
        console.error('Error insertando viaje:', insErr)
        return { error: insErr.message }
      }

      // Also record reading in lecturas_km
      await supabase.from('lecturas_km').insert({
        vehiculo_id,
        fecha: hoy,
        km_actual: km_salida,
        conductor: piloto_nombre,
        notas: `Salida de viaje${destino ? ` - ${destino}` : ''}`
      })
    }

    revalidatePath('/piloto')
    revalidatePath('/reportes')
    revalidatePath('/')
    return { success: true }
  } catch (e: any) {
    return { error: e.message || 'Error al registrar la salida' }
  }
}

export async function registrarLlegada(formData: FormData) {
  try {
    const supabase = await createClient()
    const viaje_id = formData.get('viaje_id') as string
    const km_llegada = Number(formData.get('km_llegada'))
    const piloto_nombre = (formData.get('piloto_nombre') as string)?.trim() || ''
    const observaciones = (formData.get('observaciones') as string)?.trim() || ''

    if (!viaje_id || !Number.isFinite(km_llegada)) return { error: 'Faltan campos obligatorios' }

    const { error: rpcErr } = await supabase.rpc('registrar_llegada_viaje', {
      p_viaje_id: viaje_id,
      p_km_llegada: km_llegada,
      p_observaciones: observaciones
    })

    if (rpcErr) {
      // Fallback
      const ahora = new Date().toISOString()
      const { data: viaje } = await supabase
        .from('registros_viaje')
        .select('vehiculo_id, piloto_nombre')
        .eq('id', viaje_id)
        .single()

      const { error: upErr } = await supabase
        .from('registros_viaje')
        .update({
          km_llegada,
          hora_llegada: ahora,
          estado: 'cerrado',
          observaciones
        })
        .eq('id', viaje_id)

      if (upErr) return { error: upErr.message }

      if (viaje?.vehiculo_id) {
        await supabase.from('lecturas_km').insert({
          vehiculo_id: viaje.vehiculo_id,
          fecha: new Date().toISOString().split('T')[0],
          km_actual: km_llegada,
          conductor: piloto_nombre || viaje.piloto_nombre || 'Piloto',
          notas: `Llegada de viaje${observaciones ? ` - ${observaciones}` : ''}`
        })
      }
    }

    revalidatePath('/piloto')
    revalidatePath('/reportes')
    revalidatePath('/')
    return { success: true }
  } catch (e: any) {
    return { error: e.message || 'Error al registrar la llegada' }
  }
}