'use client'

import { useActionState } from 'react'
import { crearVehiculo } from '../actions'
import Link from 'next/link'
import { ArrowLeft, Car, AlertCircle, ShieldAlert, Info } from 'lucide-react'

export default function NuevoVehiculoPage() {
  const [estado, formAction, pending] = useActionState(crearVehiculo, { error: undefined })

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      {/* Botón Volver y Título */}
      <div className="flex items-center gap-3">
        <Link
          href="/vehiculos"
          className="p-2 rounded-xl border border-[var(--nav-border)] bg-[var(--nav-bg)] text-[var(--foreground)] hover:bg-[var(--card-border)]/40 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2">
            <Car className="h-6 w-6 text-blue-500" />
            <span>Registrar Nuevo Vehículo</span>
          </h1>
          <p className="text-sm text-[var(--nav-text)]">
            Agrega una nueva unidad a la flota con sus especificaciones técnicas y ciclo de servicio.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form action={formAction} className="bg-[var(--nav-bg)] border border-[var(--nav-border)] rounded-2xl p-6 shadow-xs space-y-6">
        {estado?.error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{estado.error}</span>
          </div>
        )}

        {/* Sección 1: Datos Principales */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)] border-b border-[var(--nav-border)] pb-2">
            1. Datos de Identificación de la Unidad
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Placa */}
            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
                Placa de Matrícula *
              </label>
              <input
                name="placa"
                placeholder="Ej. P-123ABC"
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 uppercase font-mono font-bold"
              />
              <p className="text-[11px] text-[var(--nav-text)] mt-1">
                Número de placa oficial con el que se identificará en reportes.
              </p>
            </div>

            {/* Chasis / VIN */}
            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
                Chasis / Nro. Serie (VIN)
              </label>
              <input
                name="chasis"
                placeholder="Ej. 936A129038102391"
                className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 uppercase font-mono"
              />
              <p className="text-[11px] text-[var(--nav-text)] mt-1">
                Número de serie impreso en el chasis del vehículo.
              </p>
            </div>

            {/* Marca */}
            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
                Marca
              </label>
              <input
                name="marca"
                placeholder="Ej. Toyota, Hino, Isuzu, Volvo"
                className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
              />
              <p className="text-[11px] text-[var(--nav-text)] mt-1">
                Fabricante o marca del camión/vehículo.
              </p>
            </div>

            {/* Modelo */}
            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
                Modelo / Año
              </label>
              <input
                name="modelo"
                placeholder="Ej. Hilux 2023, 300 Series"
                className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
              />
              <p className="text-[11px] text-[var(--nav-text)] mt-1">
                Línea o versión del modelo.
              </p>
            </div>

            {/* Capacidad */}
            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
                Capacidad de Carga
              </label>
              <input
                name="capacidad"
                placeholder="Ej. 10 Toneladas, 5 M3"
                className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
              />
              <p className="text-[11px] text-[var(--nav-text)] mt-1">
                Carga máxima autorizada para transporte.
              </p>
            </div>

            {/* Combustible */}
            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
                Tipo de Combustible
              </label>
              <select
                name="tipo_combustible"
                defaultValue="diesel"
                className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
              >
                <option value="diesel">Diesel</option>
                <option value="gasolina">Gasolina</option>
              </select>
              <p className="text-[11px] text-[var(--nav-text)] mt-1">
                Combustible requerido para reabastecimiento.
              </p>
            </div>
          </div>
        </div>

        {/* Sección 2: Configuración de Mantenimiento */}
        <div className="space-y-4 pt-2 border-t border-[var(--nav-border)]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)] border-b border-[var(--nav-border)] pb-2">
            2. Intervalo de Mantenimiento Preventivo
          </h3>

          <div>
            <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
              Frecuencia de Servicio (Kilómetros) *
            </label>
            <input
              name="km_intervalo_servicio"
              type="number"
              placeholder="Ej. 5000"
              required
              min={100}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 font-bold"
            />
            <p className="text-[11px] text-[var(--nav-text)] mt-1">
              Cada cuántos kilómetros recorridos debe enviarse la unidad a servicio preventivo (ej. 5,000 km o 10,000 km).
            </p>
          </div>
        </div>

        {/* Sección 3: Odómetro e Historial Inicial */}
        <div className="space-y-4 pt-2 border-t border-[var(--nav-border)]">
          <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 p-3.5 rounded-xl text-blue-700 dark:text-blue-300 text-xs">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p className="leading-relaxed">
              <strong>Punto de partida de kilometraje:</strong> Define el estado actual del odómetro. Si el vehículo ya cuenta con mantenimiento previo, ingresa su kilometraje para iniciar el cálculo sin descuadres.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Km Actual */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
                Kilometraje Actual de la Unidad *
              </label>
              <input
                name="km_inicial"
                type="number"
                placeholder="Ej. 45000"
                required
                min={0}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 font-bold text-base"
              />
              <p className="text-[11px] text-[var(--nav-text)] mt-1">
                Lectura actual del odómetro al momento de registrarlo en el sistema.
              </p>
            </div>

            {/* Km Referencia Mantenimiento */}
            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
                Km del Último Servicio Real (Opcional)
              </label>
              <input
                name="km_referencia_servicio"
                type="number"
                placeholder="Ej. 40000"
                min={0}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
              />
              <p className="text-[11px] text-[var(--nav-text)] mt-1">
                Si se le hizo servicio recientemente, ingresa en qué kilometraje fue. Si se deja en blanco, el conteo inicia desde el km actual.
              </p>
            </div>

            {/* Fecha Referencia Mantenimiento */}
            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
                Fecha del Último Servicio (Opcional)
              </label>
              <input
                name="fecha_referencia_servicio"
                type="date"
                className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
              />
              <p className="text-[11px] text-[var(--nav-text)] mt-1">
                Fecha de la factura o comprobante de ese último servicio.
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
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
            {pending ? 'Guardando...' : 'Guardar Vehículo'}
          </button>
        </div>
      </form>
    </div>
  )
}
