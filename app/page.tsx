import { createClient } from '@/lib/supabase/server'
import { obtenerPerfilActual } from '@/lib/perfil'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Dashboard from './Dashboard'

export default async function Home() {
  const perfil = await obtenerPerfilActual()
  if (perfil?.rol === 'piloto') {
    redirect('/piloto')
  }

  const supabase = await createClient()

  const { data: vehiculosInfo } = await supabase
    .from('vehiculos')
    .select('id, en_taller, fecha_entrada_taller')
    .eq('activo', true)

  const idsActivos = (vehiculosInfo ?? []).map((v: any) => v.id)
  const tallerPorId = new Map<any, any>((vehiculosInfo ?? []).map((v: any) => [v.id, v]))

  let estado: any[] = []
  let error = null

  if (idsActivos.length > 0) {
    const res = await supabase
      .from('estado_flota')
      .select('*')
      .in('vehiculo_id', idsActivos)
      .order('placa')
    estado = res.data ?? []
    error = res.error
  }

  if (error) return <p className="p-8 text-red-500">Error: {error.message}</p>

  const vehiculos = estado.map((v) => ({
    ...v,
    en_taller: tallerPorId.get(v.vehiculo_id)?.en_taller ?? false,
    fecha_entrada_taller: tallerPorId.get(v.vehiculo_id)?.fecha_entrada_taller ?? null,
  }))

  return (
    <div className="p-8 grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard de flota</h1>
        <Link
          href="/lecturas"
          className="bg-black text-white px-4 py-2 rounded hover:opacity-90"
        >
          + Registrar lectura
        </Link>
      </div>
      <Dashboard vehiculos={vehiculos} />
    </div>
  )
}
