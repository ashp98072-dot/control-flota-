import { createClient } from '@/lib/supabase/server'
import FormularioLectura from './FormularioLectura'
import TablaLecturas from './TablaLecturas'

export default async function LecturasPage({
  searchParams,
}: {
  searchParams: Promise<{ vehiculo?: string }>
}) {
  const { vehiculo } = await searchParams
  const supabase = await createClient()

  // Obtener todos los vehículos para el buscador/mapeo
  const { data: todosVehiculos } = await supabase
    .from('vehiculos')
    .select('id, placa, marca, modelo, activo')
    .order('placa')

  const vehiculosActivos = (todosVehiculos ?? []).filter((v: any) => v.activo)

  // Obtener el historial de lecturas de kilometraje
  const { data: lecturas } = await supabase
    .from('lecturas_km')
    .select('id, fecha, km_actual, vehiculo_id, vehiculos(placa, marca, modelo)')
    .order('fecha', { ascending: false })

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Cabecera */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Lecturas de Kilometraje</h1>
        <p className="text-sm text-[var(--nav-text)]">
          Registra y audita el kilometraje diario de la flota para calcular los vencimientos de servicios.
        </p>
      </div>

      {/* Grid de Formulario */}
      <div className="bg-[var(--nav-bg)] border border-[var(--nav-border)] rounded-2xl p-5 sm:p-6 shadow-xs max-w-md">
        <FormularioLectura vehiculos={vehiculosActivos} vehiculoInicial={vehiculo} />
      </div>

      {/* Historial de lecturas filtrable */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-[var(--foreground)]">Historial de Lecturas</h2>
        <TablaLecturas
          lecturas={(lecturas ?? []) as any}
          vehiculos={(todosVehiculos ?? []) as any}
        />
      </div>
    </div>
  )
}
