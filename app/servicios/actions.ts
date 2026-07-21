'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function crearServicio(formData: FormData) {
  const supabase = await createClient()

  const vehiculo_id = formData.get('vehiculo_id') as string
  const fecha = formData.get('fecha') as string
  const km_al_servicio = Number(formData.get('km_al_servicio'))
  const tipo_trabajo = formData.get('tipo_trabajo') as string
  const costo = Number(formData.get('costo')) || 0
  const observaciones = (formData.get('observaciones') as string) || null
  const tipo = (formData.get('tipo') as string) || 'mantenimiento'
  const fecha_entrada_taller_manual = (formData.get('fecha_entrada_taller_manual') as string) || null

  if (!vehiculo_id || !fecha || !km_al_servicio || !tipo_trabajo) {
    return { error: 'Faltan campos obligatorios' }
  }
  if (km_al_servicio <= 0) {
    return { error: 'El km al servicio debe ser mayor a 0' }
  }
  if (tipo !== 'mantenimiento' && tipo !== 'reparacion') {
    return { error: 'Tipo de servicio inválido' }
  }

  const { data: estado, error: estadoError } = await supabase
    .from('estado_flota')
    .select('km_actual')
    .eq('vehiculo_id', vehiculo_id)
    .single()

  if (estadoError) {
    console.error('crearServicio:estado_flota', estadoError)
    return { error: 'No se pudo verificar el km actual del vehículo' }
  }

  if (estado?.km_actual != null && km_al_servicio < estado.km_actual) {
    return {
      error: `El km (${km_al_servicio.toLocaleString()}) no puede ser menor al km actual registrado (${estado.km_actual.toLocaleString()}).`,
    }
  }

  const { data: vehiculoInfo } = await supabase
    .from('vehiculos')
    .select('en_taller, fecha_entrada_taller, motivo_taller')
    .eq('id', vehiculo_id)
    .single()

  let fecha_entrada_taller: string | null = null
  if (vehiculoInfo?.en_taller && vehiculoInfo.fecha_entrada_taller) {
    fecha_entrada_taller = vehiculoInfo.fecha_entrada_taller
  } else if (fecha_entrada_taller_manual) {
    fecha_entrada_taller = fecha_entrada_taller_manual
  }

  let dias_en_taller: number | null = null
  if (fecha_entrada_taller) {
    const dias = Math.round(
      (new Date(fecha).getTime() - new Date(fecha_entrada_taller).getTime()) / 86400000
    )
    if (dias >= 0) dias_en_taller = dias
  }

  const motivo_taller = vehiculoInfo?.en_taller ? vehiculoInfo.motivo_taller : null

  const { error } = await supabase.from('servicios').insert({
    vehiculo_id,
    fecha,
    km_al_servicio,
    tipo_trabajo,
    costo,
    observaciones,
    tipo,
    fecha_entrada_taller,
    dias_en_taller,
    motivo_taller,
  })

  if (error) {
    console.error('crearServicio', error)
    return { error: error.message }
  }

  if (vehiculoInfo?.en_taller) {
    await supabase
      .from('vehiculos')
      .update({ en_taller: false, fecha_entrada_taller: null, motivo_taller: null })
      .eq('id', vehiculo_id)
  }

  revalidatePath('/servicios')
  revalidatePath('/vehiculos')
  revalidatePath('/')
  return { success: true }
}

export async function actualizarServicio(id: string, formData: FormData) {
  const supabase = await createClient()

  const fecha = formData.get('fecha') as string
  const km_al_servicio = Number(formData.get('km_al_servicio'))
  const tipo_trabajo = formData.get('tipo_trabajo') as string
  const costo = Number(formData.get('costo')) || 0
  const observaciones = (formData.get('observaciones') as string) || null
  const tipo = (formData.get('tipo') as string) || 'mantenimiento'

  if (!fecha || !km_al_servicio || !tipo_trabajo) {
    return { error: 'Faltan campos obligatorios' }
  }
  if (km_al_servicio <= 0) {
    return { error: 'El km al servicio debe ser mayor a 0' }
  }
  if (tipo !== 'mantenimiento' && tipo !== 'reparacion') {
    return { error: 'Tipo de servicio inválido' }
  }

  const { error } = await supabase
    .from('servicios')
    .update({
      fecha,
      km_al_servicio,
      tipo_trabajo,
      costo,
      observaciones,
      tipo,
    })
    .eq('id', id)

  if (error) {
    console.error('actualizarServicio', error)
    return { error: error.message }
  }

  revalidatePath('/servicios')
  revalidatePath('/vehiculos')
  revalidatePath('/')
  return { success: true }
}

export async function eliminarServicio(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('servicios').delete().eq('id', id)

  if (error) {
    console.error('eliminarServicio', error)
    return { error: error.message }
  }

  revalidatePath('/servicios')
  revalidatePath('/')
  return { success: true }
}