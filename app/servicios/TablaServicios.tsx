'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Hammer, Wrench, Settings, AlertCircle, Edit2, Trash2 } from 'lucide-react'
import BotonEditarServicio from './BotonEditarServicio'
import BotonEliminarServicio from './BotonEliminarServicio'

type Vehiculo = { id: string; placa: string; marca: string; modelo: string }

type Servicio = {
  id: string
  fecha: string
  km_al_servicio: number
  tipo_trabajo: string
  tipo: string
  costo: number
  observaciones: string | null
  dias_en_taller: number | null
  motivo_taller: string | null
  vehiculo_id: string
  vehiculos: {
    placa: string
    marca: string
    modelo: string
  } | null
}

export default function TablaServicios({
  servicios,
  vehiculos,
  vehiculoActual,
}: {
  servicios: Servicio[]
  vehiculos: Vehiculo[]
  vehiculoActual?: string
}) {
  const router = useRouter()
  const [busqueda, setBusqueda] = useState('')

  // Filtrado por texto (búsqueda interactiva en el cliente)
  const filtrados = useMemo(() => {
    return servicios.filter((s) => {
      const placa = s.vehiculos?.placa?.toLowerCase() ?? ''
      const marca = s.vehiculos?.marca?.toLowerCase() ?? ''
      const modelo = s.vehiculos?.modelo?.toLowerCase() ?? ''
      const trabajo = s.tipo_trabajo?.toLowerCase() ?? ''
      const obs = s.observaciones?.toLowerCase() ?? ''
      const query = busqueda.toLowerCase().trim()

      return (
        placa.includes(query) ||
        marca.includes(query) ||
        modelo.includes(query) ||
        trabajo.includes(query) ||
        obs.includes(query)
      )
    })
  }, [servicios, busqueda])

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Campo de búsqueda */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--nav-text)] opacity-75">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por placa, trabajo, marca u observaciones..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--nav-bg)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-[var(--foreground)] placeholder:text-[var(--nav-text)]/60"
          />
        </div>

        {/* Selector de vehículo */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-[var(--nav-text)] uppercase tracking-wider whitespace-nowrap">
            Vehículo:
          </label>
          <select
            value={vehiculoActual ?? ''}
            onChange={(e) => {
              const v = e.target.value
              router.push(v ? `/servicios?vehiculo=${v}` : '/servicios')
            }}
            className="text-xs sm:text-sm px-3 py-2 rounded-xl border border-[var(--input-border)] bg-[var(--nav-bg)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
          >
            <option value="">Todos los vehículos</option>
            {vehiculos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.placa} — {v.marca} {v.modelo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resultados de Búsqueda Vacíos */}
      {filtrados.length === 0 && (
        <div className="text-center py-12 border border-dashed border-[var(--nav-border)] rounded-2xl bg-[var(--nav-bg)]/30">
          <AlertCircle className="h-8 w-8 mx-auto text-[var(--nav-text)] opacity-75 mb-3" />
          <p className="text-sm font-semibold text-[var(--foreground)]">No se encontraron servicios</p>
          <p className="text-xs text-[var(--nav-text)] mt-1">Prueba refinando la búsqueda o seleccionando otro vehículo.</p>
        </div>
      )}

      {/* VISTA MÓVIL (Tarjetas de Servicios) */}
      <div className="grid gap-4 md:hidden">
        {filtrados.map((s) => (
          <div
            key={s.id}
            className="bg-[var(--nav-bg)] border border-[var(--nav-border)] rounded-2xl p-4 space-y-3.5 shadow-sm"
          >
            {/* Cabecera Tarjeta */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-xs font-bold bg-[var(--background)] border border-[var(--nav-border)] px-2 py-0.5 rounded-md text-blue-600 dark:text-blue-400">
                  {s.vehiculos?.placa ?? 'N/A'}
                </span>
                <p className="text-xs text-[var(--nav-text)] mt-1 font-medium">
                  {s.vehiculos ? `${s.vehiculos.marca} ${s.vehiculos.modelo}` : 'Vehículo no identificado'}
                </p>
              </div>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  s.tipo === 'reparacion'
                    ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                }`}
              >
                {s.tipo === 'reparacion' ? 'Reparación' : 'Mantenimiento'}
              </span>
            </div>

            {/* Detalles */}
            <div className="space-y-1.5 text-xs text-[var(--nav-text)] pt-2 border-t border-[var(--nav-border)]/60">
              <div className="flex justify-between">
                <span>Fecha:</span>
                <span className="font-medium text-[var(--foreground)]">{s.fecha}</span>
              </div>
              <div className="flex justify-between">
                <span>Kilometraje:</span>
                <span className="font-medium text-[var(--foreground)]">{s.km_al_servicio.toLocaleString()} km</span>
              </div>
              <div className="flex justify-between">
                <span>Trabajo:</span>
                <span className="font-semibold text-[var(--foreground)] text-right">{s.tipo_trabajo}</span>
              </div>
              <div className="flex justify-between">
                <span>Costo:</span>
                <span className="font-bold text-green-600 dark:text-green-400">Q{Number(s.costo).toFixed(2)}</span>
              </div>
              {s.dias_en_taller != null && (
                <div className="flex justify-between text-amber-600 dark:text-amber-400 font-medium">
                  <span>Días en taller:</span>
                  <span>{s.dias_en_taller} día(s)</span>
                </div>
              )}
            </div>

            {/* Observaciones */}
            {s.observaciones && (
              <div className="p-2.5 rounded-xl bg-[var(--background)] text-xs text-[var(--nav-text)] leading-relaxed italic border border-[var(--nav-border)]/50">
                {s.observaciones}
              </div>
            )}

            {/* Acciones */}
            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--nav-border)]/50">
              <BotonEditarServicio
                servicio={{
                  id: s.id,
                  fecha: s.fecha,
                  km_al_servicio: s.km_al_servicio,
                  tipo_trabajo: s.tipo_trabajo,
                  tipo: s.tipo,
                  costo: s.costo,
                  observaciones: s.observaciones,
                }}
              />
              <BotonEliminarServicio id={s.id} />
            </div>
          </div>
        ))}
      </div>

      {/* VISTA ESCRITORIO (Tabla Estilizada) */}
      {filtrados.length > 0 && (
        <div className="hidden md:block bg-[var(--nav-bg)] border border-[var(--nav-border)] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--nav-border)] text-xs font-bold uppercase tracking-wider text-[var(--nav-text)] bg-[var(--background)]/50">
                <th className="px-4 py-3.5">Placa</th>
                <th className="px-4 py-3.5">Vehículo</th>
                <th className="px-4 py-3.5">Fecha</th>
                <th className="px-4 py-3.5">Kilometraje</th>
                <th className="px-4 py-3.5">Tipo</th>
                <th className="px-4 py-3.5">Trabajo Realizado</th>
                <th className="px-4 py-3.5">Costo</th>
                <th className="px-4 py-3.5">Taller</th>
                <th className="px-4 py-3.5">Observaciones</th>
                <th className="px-4 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nav-border)]">
              {filtrados.map((s) => (
                <tr key={s.id} className="hover:bg-[var(--background)]/30 transition-colors text-sm">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-mono text-xs font-bold bg-[var(--background)] border border-[var(--nav-border)] px-2 py-1 rounded-md text-blue-600 dark:text-blue-400">
                      {s.vehiculos?.placa ?? 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--foreground)] whitespace-nowrap">
                    {s.vehiculos ? `${s.vehiculos.marca} ${s.vehiculos.modelo}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-[var(--nav-text)] whitespace-nowrap">{s.fecha}</td>
                  <td className="px-4 py-3 text-[var(--nav-text)] whitespace-nowrap">
                    {s.km_al_servicio.toLocaleString()} km
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        s.tipo === 'reparacion'
                          ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {s.tipo === 'reparacion' ? 'Reparación' : 'Mantenimiento'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-[var(--foreground)]">{s.tipo_trabajo}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-bold text-green-600 dark:text-green-400">
                    Q{Number(s.costo).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--nav-text)] whitespace-nowrap">
                    {s.dias_en_taller != null ? (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold" title={s.motivo_taller ?? ''}>
                        🛠️ {s.dias_en_taller} d
                      </span>
                    ) : (
                      <span className="opacity-40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate text-xs text-[var(--nav-text)] italic" title={s.observaciones ?? ''}>
                    {s.observaciones ?? <span className="opacity-40">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <BotonEditarServicio
                        servicio={{
                          id: s.id,
                          fecha: s.fecha,
                          km_al_servicio: s.km_al_servicio,
                          tipo_trabajo: s.tipo_trabajo,
                          tipo: s.tipo,
                          costo: s.costo,
                          observaciones: s.observaciones,
                        }}
                      />
                      <BotonEliminarServicio id={s.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
