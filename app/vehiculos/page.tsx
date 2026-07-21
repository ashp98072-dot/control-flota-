import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import ListaVehiculos from './ListaVehiculos'

export default async function VehiculosPage() {
  const supabase = await createClient()
  const { data: vehiculos, error } = await supabase
    .from('vehiculos')
    .select('*')
    .order('placa')

  if (error) return <p className="p-8 text-red-500">Error: {error.message}</p>

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Cabecera Responsiva */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Vehículos</h1>
          <p className="text-sm text-[var(--nav-text)]">
            Gestiona la flota de vehículos, sus estados de actividad y envíos a taller.
          </p>
        </div>
        <Link
          href="/vehiculos/nuevo"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-500 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-blue-500/10"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Agregar vehículo</span>
        </Link>
      </div>

      {/* Listado con filtros interactivos de búsqueda en cliente */}
      <ListaVehiculos vehiculos={(vehiculos ?? []) as any} />
    </div>
  )
}
