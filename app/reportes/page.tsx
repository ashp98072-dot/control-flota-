import { createClient } from '@/lib/supabase/server'
import FiltroReporte from './FiltroReporte'
import { obtenerReporte } from './queries'
import { obtenerCostosPorMes } from './costosPorMes'
import { obtenerViajes } from './queriesViajes'
import { GraficaConsolidada, GraficaPorVehiculo } from './GraficaCostos'
import TablaViajes from './TablaViajes'

function primerDiaMes() {
  const f = new Date()
  return new Date(f.getFullYear(), f.getMonth(), 1).toISOString().split('T')[0]
}
function ultimoDiaMes() {
  const f = new Date()
  return new Date(f.getFullYear(), f.getMonth() + 1, 0).toISOString().split('T')[0]
}

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string; vehiculo?: string }>
}) {
  const { desde: desdeParam, hasta: hastaParam, vehiculo } = await searchParams
  const desde = desdeParam || primerDiaMes()
  const hasta = hastaParam || ultimoDiaMes()

  const supabase = await createClient()
  const { data: vehiculos } = await supabase.from('vehiculos').select('id, placa, marca, modelo').order('placa')

  let reporte: Awaited<ReturnType<typeof obtenerReporte>> = []
  let error: string | null = null
  try {
    reporte = await obtenerReporte({ desde, hasta, vehiculoId: vehiculo })
  } catch (e: any) {
    error = e.message
  }

  let viajes: Awaited<ReturnType<typeof obtenerViajes>> = []
  let errorViajes: string | null = null
  try {
    viajes = await obtenerViajes({ desde, hasta, vehiculoId: vehiculo })
  } catch (e: any) {
    errorViajes = e.message
  }

  const totalGeneral = reporte.reduce((acc, v) => acc + v.total_costo, 0)
  const serviciosGeneral = reporte.reduce((acc, v) => acc + v.cantidad_servicios, 0)

  const paramsExcel = new URLSearchParams({ desde, hasta, modo: 'consolidado' })
  if (vehiculo) paramsExcel.set('vehiculo', vehiculo)

  const paramsExcelSeparado = new URLSearchParams({ desde, hasta, modo: 'separado' })

  const paramsPdf = new URLSearchParams({ desde, hasta })
  if (vehiculo) paramsPdf.set('vehiculo', vehiculo)

  const { consolidado, porVehiculo } = await obtenerCostosPorMes({ meses: 6, vehiculoId: vehiculo })
  const placas = Object.keys(porVehiculo[0] ?? {}).filter((k) => k !== 'mes')

  return (
    <div className="p-8 grid gap-6">
      <h1 className="text-xl font-bold">Reportes</h1>

      <FiltroReporte vehiculos={vehiculos ?? []} desde={desde} hasta={hasta} vehiculoActual={vehiculo} />

      {error && <p className="text-red-500">Error: {error}</p>}

      <div className="flex gap-4 text-sm text-[var(--muted)]">
        <span>Periodo: {desde} a {hasta}</span>
        <span>Servicios: <strong className="text-[var(--foreground)]">{serviciosGeneral}</strong></span>
        <span>Costo total: <strong className="text-[var(--foreground)]">Q{totalGeneral.toFixed(2)}</strong></span>
      </div>

      <div className="flex gap-2">
        <a
          href={`/reportes/exportar/excel?${paramsExcel.toString()}`}
          className="text-xs px-3 py-2 rounded border border-green-600 text-green-600 hover:bg-green-600/10"
        >
          📊 Excel (consolidado)
        </a>
        {!vehiculo && (
          <a
            href={`/reportes/exportar/excel?${paramsExcelSeparado.toString()}`}
            className="text-xs px-3 py-2 rounded border border-green-600 text-green-600 hover:bg-green-600/10"
          >
            📊 Excel (hoja por vehículo)
          </a>
        )}
        <a
          href={`/reportes/exportar/pdf?${paramsPdf.toString()}`}
          className="text-xs px-3 py-2 rounded border border-red-600 text-red-600 hover:bg-red-600/10"
        >
          📄 PDF
        </a>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GraficaConsolidada datos={consolidado} />
        {!vehiculo && <GraficaPorVehiculo datos={porVehiculo} placas={placas} />}
      </div>

      {reporte.length === 0 && <p className="text-sm text-[var(--muted)]">No hay servicios registrados en este periodo.</p>}

      {reporte.map((v) => (
        <div key={v.vehiculo_id} className="grid gap-2">
          <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-1">
            <h2 className="font-semibold">{v.placa} — {v.marca} {v.modelo}</h2>
            <span className="text-sm text-[var(--muted)]">
              {v.cantidad_servicios} servicio(s) · Q{v.total_costo.toFixed(2)}
            </span>
          </div>
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="text-xs text-[var(--muted)]">
                <th className="border-b border-[var(--card-border)] p-2">Fecha</th>
                <th className="border-b border-[var(--card-border)] p-2">Tipo</th>
                <th className="border-b border-[var(--card-border)] p-2">Trabajo</th>
                <th className="border-b border-[var(--card-border)] p-2">Costo</th>
                <th className="border-b border-[var(--card-border)] p-2">Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {v.servicios.map((s) => (
                <tr key={s.id}>
                  <td className="border-b border-[var(--card-border)] p-2">{s.fecha}</td>
                  <td className="border-b border-[var(--card-border)] p-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      s.tipo === 'reparacion' ? 'bg-orange-500/15 text-orange-500' : 'bg-blue-500/15 text-blue-500'
                    }`}>
                      {s.tipo === 'reparacion' ? 'Reparación' : 'Mantenimiento'}
                    </span>
                  </td>
                  <td className="border-b border-[var(--card-border)] p-2">{s.tipo_trabajo}</td>
                  <td className="border-b border-[var(--card-border)] p-2">Q{s.costo.toFixed(2)}</td>
                  <td className="border-b border-[var(--card-border)] p-2">{s.observaciones ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {errorViajes && <p className="text-red-500">Error cargando viajes: {errorViajes}</p>}
      <TablaViajes viajes={viajes} />
    </div>
  )
}
