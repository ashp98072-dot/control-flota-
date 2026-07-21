import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FormularioPiloto from './FormularioPiloto'

export default async function PilotoPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vehiculos } = await supabase
    .from('vehiculos')
    .select('id, placa, marca, modelo')
    .eq('activo', true)
    .order('placa')

  const { data: viajeAbierto } = await supabase
    .from('registros_viaje')
    .select('id, km_salida, hora_salida, vehiculos(placa, marca, modelo)')
    .eq('piloto_id', user.id)
    .eq('estado', 'abierto')
    .maybeSingle()

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-6">Registro de viaje</h1>
      <FormularioPiloto vehiculos={vehiculos ?? []} viajeAbierto={viajeAbierto as any} />
    </div>
  )
}