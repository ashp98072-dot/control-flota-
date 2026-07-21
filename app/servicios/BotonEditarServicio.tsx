'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { actualizarServicio } from './actions'

type Servicio = {
  id: string
  fecha: string
  km_al_servicio: number
  tipo_trabajo: string
  tipo: string
  costo: number
  observaciones: string | null
}

export default function BotonEditarServicio({ servicio }: { servicio: Servicio }) {
  const [abierto, setAbierto] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    const res = await actualizarServicio(servicio.id, formData)
    setLoading(false)
    if (res?.error) {
      setError(res.error)
    } else {
      setAbierto(false)
      router.refresh()
    }
  }

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="text-xs px-2 py-1 rounded border border-blue-500 text-blue-500 hover:bg-blue-500/10"
      >
        ✏️ Editar
      </button>

      {abierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background text-foreground border border-[var(--card-border)] rounded p-4 w-full max-w-md grid gap-3 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold">Editar servicio</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
              Modifica los datos de este servicio ya registrado. El vehículo asociado no se puede
              cambiar; si te equivocaste de vehículo, elimina este registro y crea uno nuevo.
            </p>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <form action={handleSubmit} className="grid gap-3">
              <div>
                <select
                  name="tipo"
                  required
                  defaultValue={servicio.tipo}
                  className="border p-2 rounded w-full"
                >
                  <option value="mantenimiento">Mantenimiento programado (reinicia el contador)</option>
                  <option value="reparacion">Reparación (no reinicia el contador)</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">Fecha del servicio</label>
                <input
                  type="date"
                  name="fecha"
                  required
                  defaultValue={servicio.fecha}
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <input
                  type="number"
                  name="km_al_servicio"
                  placeholder="Km al momento del servicio"
                  required
                  min={1}
                  defaultValue={servicio.km_al_servicio}
                  className="border p-2 rounded w-full"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Kilometraje del odómetro registrado para este servicio.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  name="tipo_trabajo"
                  placeholder="Tipo de trabajo (ej. cambio de aceite)"
                  required
                  defaultValue={servicio.tipo_trabajo}
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <input
                  type="number"
                  name="costo"
                  placeholder="Costo"
                  step="0.01"
                  min={0}
                  defaultValue={servicio.costo}
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <textarea
                  name="observaciones"
                  placeholder="Observaciones"
                  defaultValue={servicio.observaciones ?? ''}
                  className="border p-2 rounded w-full"
                />
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  disabled={loading}
                  className="px-3 py-2 rounded border border-[var(--card-border)] disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-black text-white px-3 py-2 rounded disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
