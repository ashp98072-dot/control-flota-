import type { ViajeReporte } from './queriesViajes'

function formatearHora(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short' })
}

export default function TablaViajes({
  viajes,
  desde,
  hasta,
  vehiculoId,
}: {
  viajes: ViajeReporte[]
  desde?: string
  hasta?: string
  vehiculoId?: string
}) {
  const totalKm = viajes.reduce((acc, v) => acc + (v.km_recorridos || 0), 0)
  const viajesEnCurso = viajes.filter((v) => v.estado === 'abierto').length

  const params = new URLSearchParams()
  if (desde) params.set('desde', desde)
  if (hasta) params.set('hasta', hasta)
  if (vehiculoId) params.set('vehiculo', vehiculoId)

  return (
    <div className="grid gap-3 pt-4 border-t border-[var(--card-border)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--card-border)] pb-2">
        <div>
          <h2 className="font-bold text-base text-[var(--foreground)]">
            Registro y Control de Viajes (Pilotos)
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Total en periodo: <strong>{viajes.length}</strong> viajes | En curso:{' '}
            <strong>{viajesEnCurso}</strong> | Recorrido acumulado:{' '}
            <strong className="text-emerald-500">{totalKm.toLocaleString()} km</strong>
          </p>
        </div>

        {desde && hasta && (
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <a
              href={`/reportes/exportar/viajes-pdf?${params.toString()}`}
              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-red-600/30 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors inline-flex items-center gap-1.5"
            >
              📄 Exportar Viajes (PDF)
            </a>
            <a
              href={`/reportes/exportar/viajes-excel?${params.toString()}`}
              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-600/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors inline-flex items-center gap-1.5"
            >
              📊 Exportar Viajes (Excel)
            </a>
          </div>
        )}
      </div>

      {viajes.length === 0 && (
        <p className="text-sm text-[var(--muted)]">No hay viajes registrados en este periodo.</p>
      )}

      {viajes.length > 0 && (
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="text-xs text-[var(--muted)]">
              <th className="border-b border-[var(--card-border)] p-2">Placa</th>
              <th className="border-b border-[var(--card-border)] p-2">Piloto / Responsable</th>
              <th className="border-b border-[var(--card-border)] p-2">Destino / Ruta</th>
              <th className="border-b border-[var(--card-border)] p-2">Salida</th>
              <th className="border-b border-[var(--card-border)] p-2">Km salida</th>
              <th className="border-b border-[var(--card-border)] p-2">Llegada</th>
              <th className="border-b border-[var(--card-border)] p-2">Km llegada</th>
              <th className="border-b border-[var(--card-border)] p-2">Km recorridos</th>
              <th className="border-b border-[var(--card-border)] p-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {viajes.map((v) => (
              <tr key={v.id}>
                <td className="border-b border-[var(--card-border)] p-2 font-medium">{v.placa}</td>
                <td className="border-b border-[var(--card-border)] p-2 font-semibold">{v.piloto}</td>
                <td className="border-b border-[var(--card-border)] p-2 text-xs">{v.destino || '—'}</td>
                <td className="border-b border-[var(--card-border)] p-2">{formatearHora(v.hora_salida)}</td>
                <td className="border-b border-[var(--card-border)] p-2">{v.km_salida.toLocaleString()}</td>
                <td className="border-b border-[var(--card-border)] p-2">{formatearHora(v.hora_llegada)}</td>
                <td className="border-b border-[var(--card-border)] p-2">{v.km_llegada != null ? v.km_llegada.toLocaleString() : '—'}</td>
                <td className="border-b border-[var(--card-border)] p-2 font-bold text-emerald-600 dark:text-emerald-400">
                  {v.km_recorridos != null ? `+${v.km_recorridos.toLocaleString()} km` : '—'}
                </td>
                <td className="border-b border-[var(--card-border)] p-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    v.estado === 'abierto' ? 'bg-yellow-500/15 text-yellow-500' : 'bg-green-500/15 text-green-500'
                  }`}>
                    {v.estado === 'abierto' ? 'En curso' : 'Cerrado'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
