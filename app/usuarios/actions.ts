'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function verificarEsAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', user.id).single()
  if (perfil?.rol !== 'admin') throw new Error('No autorizado')
}

export async function crearUsuario(formData: FormData) {
  await verificarEsAdmin()

  const nombre = (formData.get('nombre') as string)?.trim()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string
  const rol = formData.get('rol') as string

  if (!nombre || !email || !password) return { error: 'Faltan campos obligatorios' }
  if (password.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres' }
  if (rol !== 'admin' && rol !== 'piloto') return { error: 'Rol inválido' }

  // --- DIAGNÓSTICO TEMPORAL ---
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  console.log('service key presente:', !!key)
  console.log('service key longitud:', key?.length)
  console.log('service key primeros 15 chars:', key?.slice(0, 15))
  // --- FIN DIAGNÓSTICO ---

  const admin = createAdminClient()
  const { data: creado, error: errorAuth } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
  })
  if (errorAuth || !creado.user) {
    console.log('error completo de auth:', JSON.stringify(errorAuth, null, 2))
    return { error: errorAuth?.message || 'No se pudo crear el usuario' }
  }

  const supabase = await createClient()
  const { error: errorPerfil } = await supabase.from('perfiles').insert({ id: creado.user.id, nombre, rol })

  if (errorPerfil) {
    await admin.auth.admin.deleteUser(creado.user.id)
    return { error: errorPerfil.message }
  }

  revalidatePath('/usuarios')
  return { success: true }
}

export async function desactivarUsuario(id: string, activoActual: boolean) {
  await verificarEsAdmin()
  const supabase = await createClient()
  await supabase.from('perfiles').update({ activo: !activoActual }).eq('id', id)
  revalidatePath('/usuarios')
}

export async function eliminarUsuario(id: string) {
  await verificarEsAdmin()
  const admin = createAdminClient()
  await admin.auth.admin.deleteUser(id)
  revalidatePath('/usuarios')
}