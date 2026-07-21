import type { ViajeReporte } from './queriesViajes'

function formatearHora(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short' })
}

export default function TablaViajes({ viajes }: { viajes: ViajeReporte[] }) {
  return (
    <div className="grid gap-2">
      <h2 className="font-semibold border-b border-[var(--card-border)] pb-1">Registro de viajes (pilotos)</h2>

      {viajes.length === 0 && (
        <p className="text-sm text-[var(--muted)]">No hay viajes registrados en este periodo.</p>
      )}

      {viajes.length > 0 && (
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="text-xs text-[var(--muted)]">
              <th className="border-b border-[var(--card-border)] p-2">Placa</th>
              <th className="border-b border-[var(--card-border)] p-2">Piloto</th>
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
                <td className="border-b border-[var(--card-border)] p-2">{v.piloto}</td>
                <td className="border-b border-[var(--card-border)] p-2">{formatearHora(v.hora_salida)}</td>
                <td className="border-b border-[var(--card-border)] p-2">{v.km_salida.toLocaleString()}</td>
                <td className="border-b border-[var(--card-border)] p-2">{formatearHora(v.hora_llegada)}</td>
                <td className="border-b border-[var(--card-border)] p-2">{v.km_llegada != null ? v.km_llegada.toLocaleString() : '—'}</td>
                <td className="border-b border-[var(--card-border)] p-2">{v.km_recorridos != null ? v.km_recorridos.toLocaleString() : '—'}</td>
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
