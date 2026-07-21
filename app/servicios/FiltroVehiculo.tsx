'use client'

import { useRouter } from 'next/navigation'

type Vehiculo = { id: string; placa: string; marca: string; modelo: string }

export default function FiltroVehiculo({
  vehiculos,
  vehiculoActual,
}: {
  vehiculos: Vehiculo[]
  vehiculoActual?: string
}) {
  const router = useRouter()

  return (
    <select
      defaultValue={vehiculoActual ?? ''}
      onChange={(e) => {
        const v = e.target.value
        router.push(v ? `/servicios?vehiculo=${v}` : '/servicios')
      }}
      className="border p-2 rounded"
    >
      <option value="">Todos los vehículos</option>
      {vehiculos.map((v) => (
        <option key={v.id} value={v.id}>
          {v.placa} — {v.marca} {v.modelo}
        </option>
      ))}
    </select>
  )
}