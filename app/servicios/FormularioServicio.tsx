'use client'

import { useState, useRef, useMemo } from 'react'
import { crearServicio } from './actions'

type Vehiculo = {
  id: string
  placa: string
  marca: string
  modelo: string
  km_actual: number | null
  km_ultimo_servicio: number | null
  fecha_ultimo_servicio: string | null
  en_taller: boolean
  fecha_entrada_taller: string | null
}

function diasEntre(desde: string, hasta: string) {
  const dias = Math.round((new Date(hasta).getTime() - new Date(desde).getTime()) / 86400000)
  return dias >= 0 ? dias : null
}

export default function FormularioServicio({ vehiculos }: { vehiculos: Vehiculo[] }) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [vehiculoId, setVehiculoId] = useState('')
  const [fecha, setFecha] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const vehiculoSeleccionado = useMemo(
    () => vehiculos.find((v) => v.id === vehiculoId) ?? null,
    [vehiculoId, vehiculos]
  )

  const duracionTaller = useMemo(() => {
    if (!vehiculoSeleccionado?.en_taller || !vehiculoSeleccionado.fecha_entrada_taller || !fecha) {
      return null
    }
    return diasEntre(vehiculoSeleccionado.fecha_entrada_taller, fecha)
  }, [vehiculoSeleccionado, fecha])

  async function handleSubmit(formData: FormData) {
    setError(null)

    const kmIngresado = Number(formData.get('km_al_servicio'))
    if (vehiculoSeleccionado?.km_actual != null && kmIngresado < vehiculoSeleccionado.km_actual) {
      setError(
        `El km no puede ser menor al km actual registrado (${vehiculoSeleccionado.km_actual.toLocaleString()} km).`
      )
      return
    }

    setLoading(true)
    const res = await crearServicio(formData)
    setLoading(false)
    if (res?.error) {
      setError(res.error)
    } else {
      formRef.current?.reset()
      setVehiculoId('')
      setFecha('')
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="grid gap-3 max-w-xl border p-4 rounded">
      <h2 className="font-bold">Registrar servicio</h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
        Registra aquí cada mantenimiento o reparación realizada a un vehículo. Esto actualiza
        automáticamente su kilometraje y el historial de servicios.
      </p>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div>
        <select
          name="vehiculo_id"
          required
          className="border p-2 rounded w-full"
          value={vehiculoId}
          onChange={(e) => setVehiculoId(e.target.value)}
        >
          <option value="">Selecciona vehículo (placa)</option>
          {vehiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.placa} — {v.marca} {v.modelo}
              {v.en_taller ? ' (en taller)' : ''}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Elige el vehículo al que le harás el servicio. Si dice "(en taller)", ya tiene una
          entrada al taller registrada y no necesitas poner la fecha manual más abajo.
        </p>
      </div>

      {vehiculoSeleccionado && (
        <div className="text-sm border rounded p-2 bg-gray-50 text-gray-700 grid gap-1">
          <span>
            Km actual: <strong>{(vehiculoSeleccionado.km_actual ?? 0).toLocaleString()}</strong>
          </span>
          <span>
            Último mantenimiento:{' '}
            {vehiculoSeleccionado.km_ultimo_servicio != null ? (
              <strong>
                {vehiculoSeleccionado.km_ultimo_servicio.toLocaleString()} km
                {vehiculoSeleccionado.fecha_ultimo_servicio
                  ? ` (${vehiculoSeleccionado.fecha_ultimo_servicio})`
                  : ''}
              </strong>
            ) : (
              <strong>sin registrar</strong>
            )}
          </span>
          {vehiculoSeleccionado.en_taller && (
            <span className="text-amber-700">
              En taller desde <strong>{vehiculoSeleccionado.fecha_entrada_taller}</strong>
              {duracionTaller != null && <> — lleva <strong>{duracionTaller} día(s)</strong></>}
            </span>
          )}
        </div>
      )}

      <div>
        <select name="tipo" required defaultValue="mantenimiento" className="border p-2 rounded w-full">
          <option value="mantenimiento">Mantenimiento programado (reinicia el contador)</option>
          <option value="reparacion">Reparación (no reinicia el contador)</option>
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          "Mantenimiento" es para servicios de rutina como cambio de aceite: esto reinicia el
          contador de kilometraje para el próximo servicio. "Reparación" es para arreglos puntuales
          que no afectan ese ciclo.
        </p>
      </div>

      <div>
        <label className="text-sm text-gray-600 dark:text-gray-300">Fecha del servicio</label>
        <input
          type="date"
          name="fecha"
          required
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      {vehiculoSeleccionado && !vehiculoSeleccionado.en_taller && (
        <div>
          <label className="text-sm text-gray-600">
            Si estuvo en el taller y no lo marcaste antes, ¿cuándo entró? (opcional)
          </label>
          <input type="date" name="fecha_entrada_taller_manual" className="border p-2 rounded w-full" />
        </div>
      )}

      <div>
        <input
          type="number"
          name="km_al_servicio"
          placeholder="Km al momento del servicio"
          required
          min={vehiculoSeleccionado?.km_actual ?? 1}
          className="border p-2 rounded w-full"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Pon el kilometraje que marca el odómetro del vehículo hoy, al momento de hacer este
          servicio. No puede ser menor al último kilometraje ya registrado.
        </p>
      </div>

      <div>
        <input
          type="text"
          name="tipo_trabajo"
          placeholder="Tipo de trabajo (ej. cambio de aceite)"
          required
          className="border p-2 rounded w-full"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Describe brevemente qué se le hizo al vehículo: cambio de aceite, cambio de llantas,
          revisión de frenos, etc.
        </p>
      </div>

      <div>
        <input
          type="number"
          name="costo"
          placeholder="Costo"
          step="0.01"
          min={0}
          className="border p-2 rounded w-full"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Costo total del servicio en quetzales. Puedes dejarlo en 0 si aún no tienes la factura.
        </p>
      </div>

      <div>
        <textarea
          name="observaciones"
          placeholder="Observaciones"
          className="border p-2 rounded w-full"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Espacio opcional para cualquier detalle adicional: repuestos usados, taller donde se
          hizo, recomendaciones para el próximo servicio, etc.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white p-2 rounded disabled:opacity-50"
      >
        {loading ? 'Guardando...' : 'Guardar servicio'}
      </button>
    </form>
  )
}