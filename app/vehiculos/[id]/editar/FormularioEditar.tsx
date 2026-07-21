'use client'

import { useActionState } from 'react'
import { actualizarVehiculo } from '../../actions'
import Link from 'next/link'
import { ArrowLeft, Edit3, AlertCircle } from 'lucide-react'

export function FormularioEditar({ vehiculo }: { vehiculo: any }) {
  const actualizarConId = actualizarVehiculo.bind(null, vehiculo.id)
  const [estado, formAction, pending] = useActionState(actualizarConId, { error: undefined })

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <Link
          href="/vehiculos"
          className="p-2 rounded-xl border border-[var(--nav-border)] bg-[var(--nav-bg)] text-[var(--foreground)] hover:bg-[var(--card-border)]/40 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-blue-500" />
            <span>Editar Vehículo {vehiculo.placa}</span>
          </h1>
          <p className="text-sm text-[var(--nav-text)]">
            Actualiza los datos técnicos o la frecuencia de mantenimiento de la unidad.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form action={formAction} className="bg-[var(--nav-bg)] border border-[var(--nav-border)] rounded-2xl p-6 shadow-xs space-y-5">
        {estado?.error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{estado.error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Placa */}
          <div>
            <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
              Placa *
            </label>
            <input
              name="placa"
              defaultValue={vehiculo.placa}
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 font-mono font-bold uppercase"
            />
            <p className="text-[11px] text-[var(--nav-text)] mt-1">Placa oficial de la unidad.</p>
          </div>

          {/* Chasis */}
          <div>
            <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
              Chasis / VIN
            </label>
            <input
              name="chasis"
              defaultValue={vehiculo.chasis ?? ''}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 font-mono uppercase"
            />
            <p className="text-[11px] text-[var(--nav-text)] mt-1">Número de chasis o serie.</p>
          </div>

          {/* Marca */}
          <div>
            <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
              Marca
            </label>
            <input
              name="marca"
              defaultValue={vehiculo.marca ?? ''}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
            />
            <p className="text-[11px] text-[var(--nav-text)] mt-1">Marca del fabricante.</p>
          </div>

          {/* Modelo */}
          <div>
            <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
              Modelo / Año
            </label>
            <input
              name="modelo"
              defaultValue={vehiculo.modelo ?? ''}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
            />
            <p className="text-[11px] text-[var(--nav-text)] mt-1">Versión o año del modelo.</p>
          </div>

          {/* Capacidad */}
          <div>
            <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
              Capacidad de Carga
            </label>
            <input
              name="capacidad"
              defaultValue={vehiculo.capacidad ?? ''}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
            />
            <p className="text-[11px] text-[var(--nav-text)] mt-1">Capacidad útil de transporte.</p>
          </div>

          {/* Combustible */}
          <div>
            <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
              Tipo de Combustible
            </label>
            <select
              name="tipo_combustible"
              defaultValue={vehiculo.tipo_combustible}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
            >
              <option value="diesel">Diesel</option>
              <option value="gasolina">Gasolina</option>
            </select>
            <p className="text-[11px] text-[var(--nav-text)] mt-1">Combustible del vehículo.</p>
          </div>

          {/* Intervalo de servicio */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
              Intervalo de Servicio (Km) *
            </label>
            <input
              name="km_intervalo_servicio"
              type="number"
              defaultValue={vehiculo.km_intervalo_servicio}
              required
              min={100}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 font-bold"
            />
            <p className="text-[11px] text-[var(--nav-text)] mt-1">
              Cada cuántos kilómetros recorridos requiere servicio técnico preventivo.
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--nav-border)]">
          <Link
            href="/vehiculos"
            className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-[var(--nav-border)] text-[var(--nav-text)] hover:bg-[var(--background)] transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-50 shadow-xs"
          >
            {pending ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}