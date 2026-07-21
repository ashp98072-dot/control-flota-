'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Fuel, Shield, Hammer, Edit2, AlertCircle } from 'lucide-react'
import { BotonesAccion } from './BotonesAccion'

type Vehiculo = {
  id: string
  placa: string
  marca: string
  modelo: string
  tipo_combustible: string
  km_intervalo_servicio: number
  activo: boolean
  en_taller: boolean
  fecha_entrada_taller: string | null
  motivo_taller: string | null
}

export default function ListaVehiculos({ vehiculos }: { vehiculos: Vehiculo[] }) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos') // todos, activos, inactivos
  const [filtroTaller, setFiltroTaller] = useState('todos') // todos, taller, no_taller

  // Filtrado de vehículos reactivo en el cliente
  const filtrados = useMemo(() => {
    return vehiculos.filter((v) => {
      // 1. Filtro por Estado (activo/inactivo)
      if (filtroEstado === 'activos' && !v.activo) return false
      if (filtroEstado === 'inactivos' && v.activo) return false

      // 2. Filtro por Taller (en taller/fuera de taller)
      if (filtroTaller === 'taller' && !v.en_taller) return false
      if (filtroTaller === 'no_taller' && v.en_taller) return false

      // 3. Filtro por Búsqueda de Texto (placa, marca, modelo)
      const placa = v.placa?.toLowerCase() ?? ''
      const marca = v.marca?.toLowerCase() ?? ''
      const modelo = v.modelo?.toLowerCase() ?? ''
      const query = busqueda.toLowerCase().trim()

      return placa.includes(query) || marca.includes(query) || modelo.includes(query)
    })
  }, [vehiculos, busqueda, filtroEstado, filtroTaller])

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Campo de búsqueda */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--nav-text)] opacity-75">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por placa, marca o modelo de vehículo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--nav-bg)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-[var(--foreground)] placeholder:text-[var(--nav-text)]/60"
          />
        </div>

        {/* selectores adicionales de filtros */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filtro Estado */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-[var(--nav-text)] uppercase tracking-wider whitespace-nowrap">
              Estado:
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="text-xs sm:text-sm px-2.5 py-1.5 rounded-xl border border-[var(--input-border)] bg-[var(--nav-bg)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>

          {/* Filtro Taller */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-[var(--nav-text)] uppercase tracking-wider whitespace-nowrap">
              Taller:
            </label>
            <select
              value={filtroTaller}
              onChange={(e) => setFiltroTaller(e.target.value)}
              className="text-xs sm:text-sm px-2.5 py-1.5 rounded-xl border border-[var(--input-border)] bg-[var(--nav-bg)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
            >
              <option value="todos">Cualquiera</option>
              <option value="taller">En taller</option>
              <option value="no_taller">Fuera de taller</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resultados de Búsqueda Vacíos */}
      {filtrados.length === 0 && (
        <div className="text-center py-12 border border-dashed border-[var(--nav-border)] rounded-2xl bg-[var(--nav-bg)]/30">
          <AlertCircle className="h-8 w-8 mx-auto text-[var(--nav-text)] opacity-75 mb-3" />
          <p className="text-sm font-semibold text-[var(--foreground)]">No se encontraron vehículos</p>
          <p className="text-xs text-[var(--nav-text)] mt-1">Prueba cambiando los filtros o el texto de búsqueda.</p>
        </div>
      )}

      {/* VISTA MÓVIL (Tarjetas) */}
      <div className="grid gap-4 md:hidden">
        {filtrados.map((v) => (
          <div
            key={v.id}
            className={`bg-[var(--nav-bg)] border border-[var(--nav-border)] rounded-2xl p-4 space-y-4 shadow-sm transition-opacity duration-150 ${
              v.activo ? '' : 'opacity-65'
            }`}
          >
            {/* Info Superior */}
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-sm font-bold bg-[var(--background)] border border-[var(--nav-border)] px-2.5 py-1 rounded-lg text-blue-600 dark:text-blue-400">
                  {v.placa}
                </span>
                <h3 className="mt-2.5 font-bold text-base text-[var(--foreground)]">
                  {v.marca} {v.modelo}
                </h3>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                  v.activo
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                    : 'bg-neutral-500/10 text-neutral-500'
                }`}
              >
                {v.activo ? '● Activo' : '● Inactivo'}
              </span>
            </div>

            {/* Detalles intermedios */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--nav-border)] text-xs text-[var(--nav-text)]">
              <div className="flex items-center gap-1.5">
                <Fuel className="h-3.5 w-3.5 opacity-70" />
                <span className="capitalize">{v.tipo_combustible}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 opacity-70" />
                <span>Servicio: cada {v.km_intervalo_servicio?.toLocaleString()} km</span>
              </div>
            </div>

            {/* Estado de taller */}
            {v.en_taller && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-2.5 items-start text-xs text-amber-700 dark:text-amber-400">
                <Hammer className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">En Taller</p>
                  <p className="opacity-90">
                    Desde {v.fecha_entrada_taller}: <span className="font-medium">{v.motivo_taller}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="pt-3 border-t border-[var(--nav-border)] flex flex-wrap gap-2 items-center justify-between">
              <Link
                href={`/vehiculos/${v.id}/editar`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--nav-border)] text-[var(--foreground)] hover:bg-[var(--card-border)]/40 transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Editar</span>
              </Link>
              <BotonesAccion id={v.id} activo={v.activo} enTaller={v.en_taller} />
            </div>
          </div>
        ))}
      </div>

      {/* VISTA ESCRITORIO (Tabla estilizada) */}
      {filtrados.length > 0 && (
        <div className="hidden md:block bg-[var(--nav-bg)] border border-[var(--nav-border)] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--nav-border)] text-xs font-bold uppercase tracking-wider text-[var(--nav-text)] bg-[var(--background)]/50">
                <th className="px-6 py-4">Placa</th>
                <th className="px-6 py-4">Vehículo</th>
                <th className="px-6 py-4">Combustible</th>
                <th className="px-6 py-4">Intervalo de Servicio</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Taller</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nav-border)]">
              {filtrados.map((v) => (
                <tr
                  key={v.id}
                  className={`hover:bg-[var(--background)]/30 transition-colors ${
                    v.activo ? '' : 'opacity-60'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono font-bold bg-[var(--background)] border border-[var(--nav-border)] px-2.5 py-1 rounded-lg text-blue-600 dark:text-blue-400">
                      {v.placa}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-[var(--foreground)]">
                    {v.marca} {v.modelo}
                  </td>
                  <td className="px-6 py-4 capitalize text-sm text-[var(--nav-text)]">
                    {v.tipo_combustible}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--nav-text)]">
                    cada {v.km_intervalo_servicio?.toLocaleString()} km
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-semibold ${
                        v.activo
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'bg-neutral-500/10 text-neutral-500'
                      }`}
                    >
                      {v.activo ? '● Activo' : '● Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {v.en_taller ? (
                      <span
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        title={v.motivo_taller ?? ''}
                      >
                        <Hammer className="h-3.5 w-3.5" />
                        <span>
                          Desde {v.fecha_entrada_taller} — {v.motivo_taller}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--nav-text)] opacity-40">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/vehiculos/${v.id}/editar`}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[var(--nav-border)] text-[var(--foreground)] hover:bg-[var(--card-border)]/40 transition-colors"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Editar</span>
                      </Link>
                      <BotonesAccion id={v.id} activo={v.activo} enTaller={v.en_taller} />
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
