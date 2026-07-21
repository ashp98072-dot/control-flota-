'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Hammer, AlertTriangle, ChevronRight, Fuel, ShieldAlert, CheckCircle, Calendar } from 'lucide-react'

// Umbrales de alerta (en km pendientes para el siguiente servicio).
const UMBRAL_ROJO = 500
const UMBRAL_AMARILLO = 1500

// Días sin ninguna lectura ni servicio registrado antes de mostrar la alerta de "km desactualizado".
const UMBRAL_DIAS_SIN_ACTUALIZAR = 15

// Locale fijo para evitar errores de hidratación
const LOCALE = 'es-GT'

type VehiculoEstado = {
  vehiculo_id: string
  placa: string
  marca: string
  modelo: string
  km_actual: number | null
  km_intervalo_servicio: number
  km_ultimo_servicio: number | null
  fecha_ultimo_servicio: string | null
  km_pendiente_servicio: number | null
  dias_sin_actualizar: number | null
  en_taller: boolean
  fecha_entrada_taller: string | null
}

function estiloAlerta(pendiente: number | null) {
  if (pendiente == null) {
    return {
      badge: 'bg-neutral-500/10 text-neutral-500 dark:text-neutral-400',
      texto: 'Sin datos',
      linea: 'Sin datos para calcular el próximo servicio',
      colorIcono: 'text-neutral-400'
    }
  }
  if (pendiente <= 0) {
    const excedido = Math.abs(pendiente).toLocaleString(LOCALE)
    return {
      badge: 'bg-red-500/10 text-red-600 dark:text-red-400',
      texto: `Vencido (${excedido} km)`,
      linea: `Servicio vencido por ${excedido} km`,
      colorIcono: 'text-red-500'
    }
  }
  const faltan = pendiente.toLocaleString(LOCALE)
  if (pendiente <= UMBRAL_ROJO) {
    return {
      badge: 'bg-red-500/10 text-red-600 dark:text-red-400',
      texto: `Faltan ${faltan} km`,
      linea: `Crítico: Faltan ${faltan} km para servicio`,
      colorIcono: 'text-red-500'
    }
  }
  if (pendiente <= UMBRAL_AMARILLO) {
    return {
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      texto: `Faltan ${faltan} km`,
      linea: `Próximo: Faltan ${faltan} km para servicio`,
      colorIcono: 'text-amber-500'
    }
  }
  return {
    badge: 'bg-green-500/10 text-green-600 dark:text-green-400',
    texto: `Faltan ${faltan} km`,
    linea: `Al día: Faltan ${faltan} km para servicio`,
    colorIcono: 'text-green-500'
  }
}

export default function Dashboard({ vehiculos }: { vehiculos: VehiculoEstado[] }) {
  const [busqueda, setBusqueda] = useState('')

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return vehiculos
    return vehiculos.filter(
      (v) =>
        v.placa?.toLowerCase().includes(q) ||
        v.marca?.toLowerCase().includes(q) ||
        v.modelo?.toLowerCase().includes(q)
    )
  }, [busqueda, vehiculos])

  return (
    <div className="space-y-6">
      {/* Barra de Búsqueda */}
      <div className="relative max-w-md w-full">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--nav-text)] opacity-75">
          <Search className="h-4.5 w-4.5" />
        </span>
        <input
          type="text"
          placeholder="Buscar vehículo por placa, marca o modelo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--nav-bg)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-[var(--foreground)] placeholder:text-[var(--nav-text)]/65"
        />
      </div>

      {/* Resultados de Búsqueda Vacíos */}
      {filtrados.length === 0 && (
        <div className="text-center py-12 border border-dashed border-[var(--nav-border)] rounded-2xl bg-[var(--nav-bg)]/30">
          <AlertTriangle className="h-8 w-8 mx-auto text-amber-500 opacity-85 mb-3" />
          <p className="text-sm font-semibold text-[var(--foreground)]">No hay resultados</p>
          <p className="text-xs text-[var(--nav-text)] mt-1">Intenta con otra placa o palabra clave.</p>
        </div>
      )}

      {/* Rejilla de Vehículos */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtrados.map((v) => {
          const alerta = estiloAlerta(v.km_pendiente_servicio)
          return (
            <div
              key={v.vehiculo_id}
              className="group relative bg-[var(--nav-bg)] border border-[var(--nav-border)] rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all duration-200"
            >
              <div className="space-y-4">
                {/* Placa y Estado/Taller */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold bg-[var(--background)] border border-[var(--nav-border)] px-2.5 py-1 rounded-lg text-blue-600 dark:text-blue-400">
                    {v.placa}
                  </span>
                  
                  {v.en_taller ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Hammer className="h-3 w-3" />
                      Taller
                    </span>
                  ) : (
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${alerta.badge}`}>
                      {alerta.texto}
                    </span>
                  )}
                </div>

                {/* Marca / Modelo */}
                <div>
                  <h3 className="font-bold text-base text-[var(--foreground)] tracking-tight">
                    {v.marca}
                  </h3>
                  <p className="text-xs text-[var(--nav-text)] font-medium">
                    {v.modelo}
                  </p>
                </div>

                {/* Métricas e Info de Kilometraje */}
                <div className="space-y-2.5 pt-3 border-t border-[var(--nav-border)]/60">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--nav-text)]">Kilometraje actual</span>
                    <span className="font-bold text-[var(--foreground)]">
                      {(v.km_actual ?? 0).toLocaleString(LOCALE)} km
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--nav-text)]">Frecuencia de servicio</span>
                    <span className="font-medium text-[var(--foreground)]">
                      cada {v.km_intervalo_servicio?.toLocaleString(LOCALE)} km
                    </span>
                  </div>

                  <div className="flex justify-between items-start text-xs pt-1">
                    <span className="text-[var(--nav-text)]">Último servicio</span>
                    <span className="text-right font-medium text-[var(--foreground)]">
                      {v.fecha_ultimo_servicio ? (
                        <>
                          <span className="block">{v.fecha_ultimo_servicio}</span>
                          <span className="text-[10px] text-[var(--nav-text)] opacity-75">
                            ({(v.km_ultimo_servicio ?? 0).toLocaleString(LOCALE)} km)
                          </span>
                        </>
                      ) : (
                        <span className="text-[var(--nav-text)] italic">Sin registro</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Línea Informativa / Alerta */}
                <div className="pt-3 border-t border-[var(--nav-border)]/60">
                  {v.en_taller ? (
                    <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/5 rounded-xl p-2.5 border border-amber-500/10">
                      <Hammer className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold block">Taller Activo</span>
                        {v.fecha_entrada_taller && (
                          <span className="text-[10px] opacity-85 block">Ingreso: {v.fecha_entrada_taller}</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className={`flex items-start gap-2 text-xs rounded-xl p-2.5 border ${
                      v.km_pendiente_servicio != null && v.km_pendiente_servicio <= UMBRAL_ROJO
                        ? 'bg-red-500/5 border-red-500/10 text-red-600 dark:text-red-400'
                        : v.km_pendiente_servicio != null && v.km_pendiente_servicio <= UMBRAL_AMARILLO
                        ? 'bg-amber-500/5 border-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-green-500/5 border-green-500/10 text-green-600 dark:text-green-400'
                    }`}>
                      {v.km_pendiente_servicio != null && v.km_pendiente_servicio <= UMBRAL_ROJO ? (
                        <ShieldAlert className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      )}
                      <span className="font-medium leading-normal">
                        {alerta.linea}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botón de acción para desactualizados */}
              {!v.en_taller &&
                v.dias_sin_actualizar != null &&
                v.dias_sin_actualizar >= UMBRAL_DIAS_SIN_ACTUALIZAR && (
                  <div className="mt-4 pt-3 border-t border-[var(--nav-border)]/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400">
                      <Calendar className="h-3.5 w-3.5" />
                      {v.dias_sin_actualizar} días sin actualizar
                    </span>
                    <Link
                      href={`/lecturas?vehiculo=${v.vehiculo_id}`}
                      className="inline-flex items-center justify-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 active:scale-[0.98] text-white transition-all cursor-pointer whitespace-nowrap shadow-sm shadow-sky-500/10"
                    >
                      <span>Registrar km</span>
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

