import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { FormularioEditar } from './FormularioEditar'

export default async function EditarVehiculoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: vehiculo } = await supabase.from('vehiculos').select('*').eq('id', id).single()

  if (!vehiculo) notFound()

  return <FormularioEditar vehiculo={vehiculo} />
}