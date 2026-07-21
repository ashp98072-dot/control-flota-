import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FormularioUsuario from './FormularioUsuario'
import BotonesUsuario from './BotonesUsuario'

export default async function UsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: miPerfil } = await supabase.from('perfiles').select('rol').eq('id', user.id).single()
  if (miPerfil?.rol !== 'admin') redirect('/')

  const { data: perfiles } = await supabase.from('perfiles').select('*').order('created_at')

  return (
    <div className="p-8 grid gap-6">
      <h1 className="text-xl font-bold">Usuarios</h1>
      <FormularioUsuario />
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-sm text-gray-500">
            <th className="border-b p-2">Nombre</th>
            <th className="border-b p-2">Rol</th>
            <th className="border-b p-2">Estado</th>
            <th className="border-b p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {(perfiles ?? []).map((p: any) => (
            <tr key={p.id} className={p.activo ? '' : 'opacity-50'}>
              <td className="border-b p-2 font-semibold">{p.nombre}</td>
              <td className="border-b p-2 capitalize">{p.rol}</td>
              <td className="border-b p-2">{p.activo ? '● Activo' : '● Inactivo'}</td>
              <td className="border-b p-2"><BotonesUsuario id={p.id} activo={p.activo} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}