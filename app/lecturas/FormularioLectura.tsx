'use client'

import { useState, useRef, useEffect } from 'react'
import { registrarLectura } from './actions'

type Vehiculo = { id: string; placa: string; marca: string; modelo: string }

export default function FormularioLectura({
  vehiculos,
  vehiculoInicial,
}: {
  vehiculos: Vehiculo[]
  vehiculoInicial?: string
}) {
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const [loading, setLoading] = useState(false)
  const [vehiculoId, setVehiculoId] = useState(vehiculoInicial ?? '')
  const formRef = useRef<HTMLFormElement>(null)
  const kmInputRef = useRef<HTMLInputElement>(null)

  // Si se llega desde el link "Registrar km" del dashboard, enfoca
  // directamente el campo de km ya que el vehículo viene preseleccionado.
  useEffect(() => {
    if (vehiculoInicial) {
      kmInputRef.current?.focus()
    }
  }, [vehiculoInicial])

  async function handleSubmit(formData: FormData) {
    setError(null)
    setOk(false)
    setLoading(true)
    const res = await registrarLectura(formData)
    setLoading(false)
    if (res?.error) {
      setError(res.error)
    } else {
      setOk(true)
      formRef.current?.reset()
      setVehiculoId('')
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="grid gap-3 max-w-md border p-4 rounded">
      <h2 className="font-bold">Registrar lectura de kilometraje</h2>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {ok && <p className="text-green-500 text-sm">Lectura registrada</p>}

      <select
        name="vehiculo_id"
        required
        className="border p-2 rounded"
        value={vehiculoId}
        onChange={(e) => setVehiculoId(e.target.value)}
      >
        <option value="">Selecciona vehículo (placa)</option>
        {vehiculos.map((v) => (
          <option key={v.id} value={v.id}>
            {v.placa} — {v.marca} {v.modelo}
          </option>
        ))}
      </select>

      <input type="date" name="fecha" required className="border p-2 rounded" />

      <input
        ref={kmInputRef}
        type="number"
        name="km_actual"
        placeholder="Km actual"
        required
        min={1}
        className="border p-2 rounded"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white p-2 rounded disabled:opacity-50"
      >
        {loading ? 'Guardando...' : 'Guardar lectura'}
      </button>
    </form>
  )
}
