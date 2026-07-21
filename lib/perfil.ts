import { createClient } from '@/lib/supabase/server'

export type Perfil = { id: string; nombre: string; rol: 'admin' | 'piloto'; activo: boolean }

export async function obtenerPerfilActual(): Promise<Perfil | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('perfiles').select('*').eq('id', user.id).single()
  return data
}