'use client'

import { useState, useMemo } from 'react'
import { Search, Calendar, ChevronRight, AlertCircle, Car, ArrowUpRight } from 'lucide-react'

type Lectura = {
  id: string | number
  fecha: string
  km_actual: number
  vehiculo_id: string
  vehiculos: {
    placa: string
    marca: string
    modelo: string
  } | null
}

export default function TablaLecturas({
  lecturas,
  vehiculos,
}: {
  lecturas: Lectura[]
  vehiculos: { id: string; placa: string; marca: string; modelo: string }[]
}) {
  const [busqueda, setBusqueda] = useState('')
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState('')

  // Filtrado reactivo en el cliente
  const filtradas = useMemo(() => {
    return lecturas.filter((l) => {
      // 1. Filtro por Vehículo específico
      if (vehiculoSeleccionado && l.vehiculo_id !== vehiculoSeleccionado) {
        return false
      }

      // 2. Filtro por búsqueda de texto
      const placa = l.vehiculos?.placa?.toLowerCase() ?? ''
      const marca = l.vehiculos?.marca?.toLowerCase() ?? ''
      const modelo = l.vehiculos?.modelo?.toLowerCase() ?? ''
      const km = l.km_actual?.toString() ?? ''
      const fecha = l.fecha ?? ''
      const query = busqueda.toLowerCase().trim()

      return (
        placa.includes(query) ||
        marca.includes(query) ||
        modelo.includes(query) ||
        km.includes(query) ||
        fecha.includes(query)
      )
    })
  }, [lecturas, busqueda, vehiculoSeleccionado])

  return (
    <div className="space-y-4">
      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Input de Búsqueda */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--nav-text)] opacity-75">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por placa, kilometraje o fecha..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--nav-bg)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-[var(--foreground)] placeholder:text-[var(--nav-text)]/60"
          />
        </div>

        {/* Dropdown de Vehículos */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-[var(--nav-text)] uppercase tracking-wider whitespace-nowrap">
            Filtrar Vehículo:
          </label>
          <select
            value={vehiculoSeleccionado}
            onChange={(e) => setVehiculoSeleccionado(e.target.value)}
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

      {/* Caso vacío */}
      {filtradas.length === 0 && (
        <div className="text-center py-12 border border-dashed border-[var(--nav-border)] rounded-2xl bg-[var(--nav-bg)]/30">
          <AlertCircle className="h-8 w-8 mx-auto text-[var(--nav-text)] opacity-75 mb-3" />
          <p className="text-sm font-semibold text-[var(--foreground)]">No se encontraron lecturas</p>
          <p className="text-xs text-[var(--nav-text)] mt-1">
            Registra una nueva lectura arriba o cambia los términos del filtro.
          </p>
        </div>
      )}

      {/* VISTA MÓVIL (Tarjetas de lecturas) */}
      <div className="grid gap-3 md:hidden">
        {filtradas.map((l, index) => (
          <div
            key={`${l.id}-${index}`}
            className="bg-[var(--nav-bg)] border border-[var(--nav-border)] rounded-xl p-4 flex justify-between items-center shadow-xs"
          >
            <div className="space-y-1">
              <span className="font-mono text-xs font-bold bg-[var(--background)] border border-[var(--nav-border)] px-2 py-0.5 rounded text-blue-600 dark:text-blue-400">
                {l.vehiculos?.placa ?? 'Sin placa'}
              </span>
              <p className="text-xs font-semibold text-[var(--foreground)]">
                {l.vehiculos ? `${l.vehiculos.marca} ${l.vehiculos.modelo}` : 'Vehículo'}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--nav-text)] pt-1">
                <Calendar className="h-3 w-3" />
                <span>{l.fecha}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-[var(--foreground)] tracking-tight">
                {l.km_actual.toLocaleString()}
              </p>
              <p className="text-[10px] text-[var(--nav-text)] uppercase font-semibold">Km actual</p>
            </div>
          </div>
        ))}
      </div>

      {/* VISTA ESCRITORIO (Tabla elegante) */}
      {filtradas.length > 0 && (
        <div className="hidden md:block bg-[var(--nav-bg)] border border-[var(--nav-border)] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--nav-border)] text-xs font-bold uppercase tracking-wider text-[var(--nav-text)] bg-[var(--background)]/50">
                <th className="px-6 py-4">Vehículo</th>
                <th className="px-6 py-4">Placa</th>
                <th className="px-6 py-4">Fecha de Lectura</th>
                <th className="px-6 py-4 text-right">Kilometraje Registrado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nav-border)] text-sm">
              {filtradas.map((l, index) => (
                <tr key={`${l.id}-${index}`} className="hover:bg-[var(--background)]/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-[var(--foreground)]">
                      {l.vehiculos ? `${l.vehiculos.marca} ${l.vehiculos.modelo}` : '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs font-bold bg-[var(--background)] border border-[var(--nav-border)] px-2.5 py-1 rounded-md text-blue-600 dark:text-blue-400">
                      {l.vehiculos?.placa ?? 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[var(--nav-text)] whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 opacity-70 text-blue-500" />
                      <span>{l.fecha}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap font-bold text-[var(--foreground)] text-base">
                    <div className="flex items-center justify-end gap-1.5">
                      <span>{l.km_actual.toLocaleString()} km</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-green-500 opacity-80" />
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
