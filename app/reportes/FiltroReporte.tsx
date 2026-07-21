'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Vehiculo = { id: string; placa: string; marca: string; modelo: string }

export default function FiltroReporte({
  vehiculos,
  desde,
  hasta,
  vehiculoActual,
}: {
  vehiculos: Vehiculo[]
  desde: string
  hasta: string
  vehiculoActual?: string
}) {
  const router = useRouter()
  const [desdeVal, setDesdeVal] = useState(desde)
  const [hastaVal, setHastaVal] = useState(hasta)
  const [vehiculoVal, setVehiculoVal] = useState(vehiculoActual ?? '')

  function aplicar(overrides: { desde?: string; hasta?: string }) {
    const d = overrides.desde ?? desdeVal
    const h = overrides.hasta ?? hastaVal
    const params = new URLSearchParams()
    if (d) params.set('desde', d)
    if (h) params.set('hasta', h)
    if (vehiculoVal) params.set('vehiculo', vehiculoVal)
    router.push(`/reportes?${params.toString()}`)
  }

  function seleccionarMes(mes: string) {
    if (!mes) return
    const [anio, m] = mes.split('-').map(Number)
    const d = new Date(anio, m - 1, 1).toISOString().split('T')[0]
    const h = new Date(anio, m, 0).toISOString().split('T')[0]
    setDesdeVal(d)
    setHastaVal(h)
    aplicar({ desde: d, hasta: h })
  }

  return (
    <div className="flex flex-wrap items-end gap-3 border border-[var(--card-border)] p-4 rounded">
      <div>
        <label className="block text-xs text-[var(--muted)] mb-1">Mes rápido</label>
        <input
          type="month"
          onChange={(e) => seleccionarMes(e.target.value)}
          className="border border-[var(--input-border)] bg-transparent p-2 rounded"
        />
      </div>
      <div>
        <label className="block text-xs text-[var(--muted)] mb-1">Desde</label>
        <input
          type="date"
          value={desdeVal}
          onChange={(e) => setDesdeVal(e.target.value)}
          className="border border-[var(--input-border)] bg-transparent p-2 rounded"
        />
      </div>
      <div>
        <label className="block text-xs text-[var(--muted)] mb-1">Hasta</label>
        <input
          type="date"
          value={hastaVal}
          onChange={(e) => setHastaVal(e.target.value)}
          className="border border-[var(--input-border)] bg-transparent p-2 rounded"
        />
      </div>
      <div>
        <label className="block text-xs text-[var(--muted)] mb-1">Vehículo</label>
        <select
          value={vehiculoVal}
          onChange={(e) => setVehiculoVal(e.target.value)}
          className="border border-[var(--input-border)] bg-transparent p-2 rounded"
        >
          <option value="">Todos (consolidado)</option>
          {vehiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.placa} — {v.marca} {v.modelo}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={() => aplicar({})}
        className="bg-[var(--foreground)] text-[var(--background)] px-4 py-2 rounded hover:opacity-90"
      >
        Aplicar
      </button>
    </div>
  )
}
