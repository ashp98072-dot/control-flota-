'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type EstadoFormulario = { error?: string }

function leerCamposBase(formData: FormData) {
  return {
    placa: (formData.get('placa') as string)?.trim().toUpperCase(),
    chasis: (formData.get('chasis') as string)?.trim(),
    marca: (formData.get('marca') as string)?.trim(),
    modelo: (formData.get('modelo') as string)?.trim(),
    capacidad: (formData.get('capacidad') as string)?.trim(),
    tipo_combustible: formData.get('tipo_combustible') as string,
    km_intervalo_servicio: Number(formData.get('km_intervalo_servicio')),
  }
}

export async function crearVehiculo(
  prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const campos = leerCamposBase(formData)

  if (!campos.placa) return { error: 'La placa es obligatoria' }
  if (!campos.km_intervalo_servicio || campos.km_intervalo_servicio <= 0) {
    return { error: 'El intervalo de servicio debe ser mayor a 0' }
  }

  const km_inicial_raw = (formData.get('km_inicial') as string)?.trim()
  const km_referencia_servicio_raw = (formData.get('km_referencia_servicio') as string)?.trim()
  const fecha_referencia_servicio_raw = (formData.get('fecha_referencia_servicio') as string)?.trim()

  if (!km_inicial_raw) return { error: 'El km actual es obligatorio' }

  const km_inicial = Number(km_inicial_raw)
  if (!Number.isFinite(km_inicial) || km_inicial < 0) {
    return { error: 'El km actual debe ser un número válido mayor o igual a 0' }
  }

  let km_referencia_servicio: number | null = null
  if (km_referencia_servicio_raw) {
    km_referencia_servicio = Number(km_referencia_servicio_raw)
    if (!Number.isFinite(km_referencia_servicio) || km_referencia_servicio < 0) {
      return { error: 'El km del último servicio debe ser un número válido' }
    }
    if (km_referencia_servicio > km_inicial) {
      return { error: 'El km del último servicio no puede ser mayor al km actual' }
    }
  }

  const fecha_referencia_servicio =
    km_referencia_servicio !== null ? fecha_referencia_servicio_raw || null : null

  const supabase = await createClient()
  const { error } = await supabase.from('vehiculos').insert({
    ...campos,
    km_inicial,
    km_referencia_servicio,
    fecha_referencia_servicio,
  })

  if (error) {
    if (error.code === '23505') return { error: 'Ya existe un vehículo con esa placa' }
    return { error: error.message }
  }

  revalidatePath('/vehiculos')
  redirect('/vehiculos')
}

export async function actualizarVehiculo(
  id: string,
  prevState: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const campos = leerCamposBase(formData)

  if (!campos.placa) return { error: 'La placa es obligatoria' }
  if (!campos.km_intervalo_servicio || campos.km_intervalo_servicio <= 0) {
    return { error: 'El intervalo de servicio debe ser mayor a 0' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('vehiculos').update(campos).eq('id', id)

  if (error) {
    if (error.code === '23505') return { error: 'Ya existe un vehículo con esa placa' }
    return { error: error.message }
  }

  revalidatePath('/vehiculos')
  redirect('/vehiculos')
}

export async function toggleActivo(id: string, activoActual: boolean) {
  const supabase = await createClient()
  await supabase.from('vehiculos').update({ activo: !activoActual }).eq('id', id)
  revalidatePath('/vehiculos')
}

export async function eliminarVehiculo(id: string) {
  const supabase = await createClient()
  await supabase.from('vehiculos').delete().eq('id', id)
  revalidatePath('/vehiculos')
}

export async function enviarATaller(id: string, motivo: string) {
  const supabase = await createClient()
  const hoy = new Date().toISOString().split('T')[0]
  await supabase
    .from('vehiculos')
    .update({ en_taller: true, fecha_entrada_taller: hoy, motivo_taller: motivo })
    .eq('id', id)
  revalidatePath('/vehiculos')
  revalidatePath('/servicios')
}

export async function cancelarEnvioTaller(id: string) {
  const supabase = await createClient()
  await supabase
    .from('vehiculos')
    .update({ en_taller: false, fecha_entrada_taller: null, motivo_taller: null })
    .eq('id', id)
  revalidatePath('/vehiculos')
  revalidatePath('/servicios')
}