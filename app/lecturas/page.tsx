import { createClient } from '@/lib/supabase/server'
import FormularioLectura from './FormularioLectura'

export default async function LecturasPage({
  searchParams,
}: {
  searchParams: Promise<{ vehiculo?: string }>
}) {
  const { vehiculo } = await searchParams
  const supabase = await createClient()

  const { data: vehiculos } = await supabase
    .from('vehiculos')
    .select('id, placa, marca, modelo')
    .eq('activo', true)
    .order('placa')

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-6">Lecturas de kilometraje</h1>
      <FormularioLectura vehiculos={vehiculos ?? []} vehiculoInicial={vehiculo} />
    </div>
  )
}
