'use client'

import { useState, useRef, useEffect } from 'react'
import { registrarLectura } from './actions'
import { Gauge, Calendar, Car, AlertCircle, CheckCircle2 } from 'lucide-react'

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
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <div>
        <h2 className="font-bold text-base text-[var(--foreground)] flex items-center gap-2">
          <span>Registrar Lectura de Kilometraje</span>
        </h2>
        <p className="text-xs text-[var(--nav-text)] mt-1 leading-relaxed">
          Ingresa la lectura actual del odómetro. El sistema comparará este dato con la referencia
          de mantenimiento para alertar si el vehículo requiere servicio.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {ok && (
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>Lectura de kilometraje guardada exitosamente.</span>
        </div>
      )}

      {/* Campo Vehículo */}
      <div>
        <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
          Vehículo
        </label>
        <select
          name="vehiculo_id"
          required
          value={vehiculoId}
          onChange={(e) => setVehiculoId(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
        >
          <option value="">-- Selecciona unidad por placa --</option>
          {vehiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.placa} — {v.marca} {v.modelo}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-[var(--nav-text)] mt-1">
          Elige la unidad asignada a la ruta o inspección del día.
        </p>
      </div>

      {/* Campo Fecha */}
      <div>
        <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
          Fecha de Lectura
        </label>
        <input
          type="date"
          name="fecha"
          required
          defaultValue={new Date().toISOString().split('T')[0]}
          className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
        />
        <p className="text-[11px] text-[var(--nav-text)] mt-1">
          Fecha exacta en la que se tomó la cifra del odómetro.
        </p>
      </div>

      {/* Campo Kilometraje */}
      <div>
        <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
          Kilometraje Actual (km)
        </label>
        <input
          ref={kmInputRef}
          type="number"
          name="km_actual"
          placeholder="Ejemplo: 125000"
          required
          min={1}
          className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
        />
        <p className="text-[11px] text-[var(--nav-text)] mt-1">
          Ingresa la cifra completa de kilómetros sin puntos ni comas.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 font-bold text-xs rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-50 shadow-xs"
      >
        {loading ? 'Guardando...' : 'Guardar Lectura'}
      </button>
    </form>
  )
}
