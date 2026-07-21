'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registrarSalida, registrarLlegada } from './actions'

type Vehiculo = { id: string; placa: string; marca: string; modelo: string }
type ViajeAbierto = {
  id: string
  km_salida: number
  hora_salida: string
  vehiculos: { placa: string; marca: string; modelo: string } | null
} | null

export default function FormularioPiloto({
  vehiculos,
  viajeAbierto,
}: {
  vehiculos: Vehiculo[]
  viajeAbierto: ViajeAbierto
}) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSalida(formData: FormData) {
    setError(null)
    setLoading(true)
    const res = await registrarSalida(formData)
    setLoading(false)
    if (res?.error) setError(res.error)
    else router.refresh()
  }

  async function handleLlegada(formData: FormData) {
    setError(null)
    setLoading(true)
    const res = await registrarLlegada(formData)
    setLoading(false)
    if (res?.error) setError(res.error)
    else router.refresh()
  }

  // El "key" en cada <form> es lo que evita el warning de React sobre
  // inputs controlados/no controlados: sin él, React trata de reusar
  // el mismo <input> del DOM al alternar entre este formulario y el de
  // llegada, aunque tengan props muy distintas (uno con value, otro sin).
  // Con key distinto, React los desmonta y monta como árboles separados.

  if (viajeAbierto) {
    return (
      <form key="llegada" action={handleLlegada} className="grid gap-3 border border-[var(--card-border)] p-4 rounded">
        <h2 className="font-bold">Registrar llegada</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="text-sm border border-[var(--card-border)] rounded p-2 grid gap-1">
          <span>
            Vehículo: <strong>{viajeAbierto.vehiculos?.placa}</strong> —{' '}
            {viajeAbierto.vehiculos?.marca} {viajeAbierto.vehiculos?.modelo}
          </span>
          <span>
            Km de salida: <strong>{viajeAbierto.km_salida.toLocaleString()}</strong>
          </span>
          <span>
            Hora de salida:{' '}
            <strong>{new Date(viajeAbierto.hora_salida).toLocaleString('es-GT')}</strong>
          </span>
        </div>
        <input type="hidden" name="viaje_id" value={viajeAbierto.id} />
        <input
          type="number"
          name="km_llegada"
          placeholder="Km al llegar"
          required
          min={viajeAbierto.km_salida}
          className="border border-[var(--input-border)] bg-transparent p-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[var(--foreground)] text-[var(--background)] p-2 rounded disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Registrar llegada'}
        </button>
      </form>
    )
  }

  return (
    <form key="salida" action={handleSalida} className="grid gap-3 border border-[var(--card-border)] p-4 rounded">
      <h2 className="font-bold">Registrar salida</h2>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <select name="vehiculo_id" required className="border border-[var(--input-border)] bg-transparent p-2 rounded">
        <option value="">Selecciona vehículo (placa)</option>
        {vehiculos.map((v) => (
          <option key={v.id} value={v.id}>
            {v.placa} — {v.marca} {v.modelo}
          </option>
        ))}
      </select>
      <input
        type="number"
        name="km_salida"
        placeholder="Km al salir"
        required
        min={0}
        className="border border-[var(--input-border)] bg-transparent p-2 rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-[var(--foreground)] text-[var(--background)] p-2 rounded disabled:opacity-50"
      >
        {loading ? 'Guardando...' : 'Registrar salida'}
      </button>
    </form>
  )
}
