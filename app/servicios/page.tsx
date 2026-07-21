import { createClient } from '@/lib/supabase/server'
import FormularioServicio from './FormularioServicio'
import FiltroVehiculo from './FiltroVehiculo'
import BotonEliminarServicio from './BotonEliminarServicio'
import BotonEditarServicio from './BotonEditarServicio'

export default async function ServiciosPage({
  searchParams,
}: {
  searchParams: Promise<{ vehiculo?: string }>
}) {
  const { vehiculo } = await searchParams
  const supabase = await createClient()

  const { data: vehiculosEstado } = await supabase
    .from('estado_flota')
    .select('vehiculo_id, placa, marca, modelo, km_actual, km_ultimo_servicio, fecha_ultimo_servicio')
    .order('placa')

  const { data: tallerInfo } = await supabase
    .from('vehiculos')
    .select('id, en_taller, fecha_entrada_taller')

  const tallerPorId = new Map<any, any>((tallerInfo ?? []).map((t: any) => [t.id, t]))

  const vehiculos = (vehiculosEstado ?? []).map((v: any) => ({
    id: v.vehiculo_id,
    placa: v.placa,
    marca: v.marca,
    modelo: v.modelo,
    km_actual: v.km_actual,
    km_ultimo_servicio: v.km_ultimo_servicio,
    fecha_ultimo_servicio: v.fecha_ultimo_servicio,
    en_taller: tallerPorId.get(v.vehiculo_id)?.en_taller ?? false,
    fecha_entrada_taller: tallerPorId.get(v.vehiculo_id)?.fecha_entrada_taller ?? null,
  }))

  let query = supabase
    .from('servicios')
    .select(
      'id, fecha, km_al_servicio, tipo_trabajo, tipo, costo, observaciones, dias_en_taller, motivo_taller, vehiculo_id, vehiculos(placa, marca, modelo)'
    )
    .order('fecha', { ascending: false })

  if (vehiculo) query = query.eq('vehiculo_id', vehiculo)

  const { data: servicios, error } = await query

  return (
    <div className="p-8 grid gap-8">
      <h1 className="text-xl font-bold">Servicios</h1>

      <FormularioServicio vehiculos={vehiculos} />

      <div className="flex items-center gap-2">
        <label>Filtrar por vehículo:</label>
        <FiltroVehiculo vehiculos={vehiculos} vehiculoActual={vehiculo} />
      </div>

      {error && <p className="text-red-500">Error cargando servicios: {error.message}</p>}

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-sm text-gray-500">
            <th className="border-b p-2">Placa</th>
            <th className="border-b p-2">Fecha</th>
            <th className="border-b p-2">Km</th>
            <th className="border-b p-2">Tipo</th>
            <th className="border-b p-2">Trabajo</th>
            <th className="border-b p-2">Costo</th>
            <th className="border-b p-2">Días en taller</th>
            <th className="border-b p-2">Motivo taller</th>
            <th className="border-b p-2">Observaciones</th>
            <th className="border-b p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {(servicios ?? []).map((s: any) => (
            <tr key={s.id}>
              <td className="border-b p-2 font-semibold">{s.vehiculos?.placa}</td>
              <td className="border-b p-2">{s.fecha}</td>
              <td className="border-b p-2">{s.km_al_servicio}</td>
              <td className="border-b p-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    s.tipo === 'reparacion'
                      ? 'bg-orange-500/15 text-orange-500'
                      : 'bg-blue-500/15 text-blue-500'
                  }`}
                >
                  {s.tipo === 'reparacion' ? 'Reparación' : 'Mantenimiento'}
                </span>
              </td>
              <td className="border-b p-2">{s.tipo_trabajo}</td>
              <td className="border-b p-2">Q{Number(s.costo).toFixed(2)}</td>
              <td className="border-b p-2">{s.dias_en_taller ?? '—'}</td>
              <td className="border-b p-2">{s.motivo_taller ?? '—'}</td>
              <td className="border-b p-2">{s.observaciones}</td>
              <td className="border-b p-2">
                <div className="flex gap-2">
                  <BotonEditarServicio
                    servicio={{
                      id: s.id,
                      fecha: s.fecha,
                      km_al_servicio: s.km_al_servicio,
                      tipo_trabajo: s.tipo_trabajo,
                      tipo: s.tipo,
                      costo: s.costo,
                      observaciones: s.observaciones,
                    }}
                  />
                  <BotonEliminarServicio id={s.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}