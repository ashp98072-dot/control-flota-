import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FormularioUsuario from './FormularioUsuario'
import TablaUsuarios from './TablaUsuarios'

export default async function UsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: miPerfil } = await supabase.from('perfiles').select('rol').eq('id', user.id).single()
  if (miPerfil?.rol !== 'admin') redirect('/')

  const { data: perfiles } = await supabase.from('perfiles').select('*').order('created_at')

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Cabecera de la página */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Usuarios</h1>
        <p className="text-sm text-[var(--nav-text)]">
          Administra las cuentas, roles y accesos activos de los pilotos y personal de administración.
        </p>
      </div>

      {/* Formulario de Registro */}
      <div className="bg-[var(--nav-bg)] border border-[var(--nav-border)] rounded-2xl p-5 sm:p-6 shadow-xs max-w-md">
        <FormularioUsuario />
      </div>

      {/* Listado y Búsqueda */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--foreground)]">Directorio de Usuarios</h2>
        <TablaUsuarios perfiles={(perfiles ?? []) as any} />
      </div>
    </div>
  )
}