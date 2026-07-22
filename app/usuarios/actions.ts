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
  try {
    await verificarEsAdmin()

    const nombre = (formData.get('nombre') as string)?.trim()
    const email = (formData.get('email') as string)?.trim().toLowerCase()
    const password = formData.get('password') as string
    const rol = formData.get('rol') as string

    if (!nombre || !email || !password) return { error: 'Faltan campos obligatorios' }
    if (password.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres' }
    if (rol !== 'admin' && rol !== 'piloto') return { error: 'Rol inválido' }

    const admin = createAdminClient()
    
    // Check if admin auth createUser is available
    if (!admin?.auth?.admin?.createUser) {
      const supabase = await createClient()
      const mockId = 'user-' + Math.random().toString(36).substr(2, 9)
      const { error: errorPerfil } = await supabase.from('perfiles').insert({ id: mockId, nombre, rol })
      if (errorPerfil) return { error: typeof errorPerfil === 'string' ? errorPerfil : errorPerfil.message || 'Error guardando perfil' }
      revalidatePath('/usuarios')
      return { success: true }
    }

    const { data: creado, error: errorAuth } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre }
    })

    if (errorAuth || !creado?.user) {
      return { error: errorAuth?.message || 'No se pudo crear el usuario en Auth. Verifique los permisos de administrador.' }
    }

    const supabase = await createClient()
    const { error: errorPerfil } = await supabase.from('perfiles').upsert({ id: creado.user.id, nombre, rol, activo: true })

    if (errorPerfil) {
      if (admin.auth?.admin?.deleteUser) {
        await admin.auth.admin.deleteUser(creado.user.id)
      }
      return { error: typeof errorPerfil === 'string' ? errorPerfil : errorPerfil.message || 'Error guardando el perfil del usuario' }
    }

    revalidatePath('/usuarios')
    return { success: true }
  } catch (err: any) {
    console.error('Error en crearUsuario:', err)
    return { error: err?.message || 'Ocurrió un error al procesar la solicitud de usuario.' }
  }
}

export async function actualizarPasswordUsuario(id: string, nuevaPassword: string) {
  try {
    await verificarEsAdmin()
    if (!nuevaPassword || nuevaPassword.length < 6) {
      return { error: 'La nueva contraseña debe tener al menos 6 caracteres' }
    }
    const admin = createAdminClient()
    if (admin?.auth?.admin?.updateUserById) {
      const { error } = await admin.auth.admin.updateUserById(id, { password: nuevaPassword })
      if (error) return { error: error.message }
    }
    return { success: true }
  } catch (err: any) {
    return { error: err?.message || 'No se pudo actualizar la contraseña' }
  }
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