'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registrarSalida, registrarLlegada } from './actions'
import { Car, Gauge, MapPin, User, ArrowRight, AlertCircle, CheckCircle2, History, Clock, Navigation } from 'lucide-react'

type VehiculoConKm = {
  id: string
  placa: string
  marca: string
  modelo: string
  km_actual: number
  en_taller?: boolean
  motivo_taller?: string | null
}

type ViajeAbierto = {
  id: string
  km_salida: number
  hora_salida: string
  piloto_nombre?: string
  destino?: string
  vehiculo_id?: string
  vehiculos: { id: string; placa: string; marca: string; modelo: string } | null
}

type RegistroHistorial = {
  id: string
  fecha: string
  km_salida: number
  km_llegada?: number | null
  hora_salida: string
  hora_llegada?: string | null
  piloto_nombre?: string
  estado: string
  destino?: string | null
  vehiculos?: { placa: string; marca: string; modelo: string } | null
}

export default function FormularioPiloto({
  vehiculos,
  viajesAbiertos = [],
  historialReciente = [],
}: {
  vehiculos: VehiculoConKm[]
  viajesAbiertos?: ViajeAbierto[]
  nombrePilotoDefault?: string
  historialReciente?: RegistroHistorial[]
}) {
  const [activeTab, setActiveTab] = useState<'salida' | 'llegada'>(
    viajesAbiertos.length > 0 ? 'llegada' : 'salida'
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Salida State
  const [selectedVehiculoSalidaId, setSelectedVehiculoSalidaId] = useState<string>('')
  const [pilotoSalidaNombre, setPilotoSalidaNombre] = useState<string>('')
  const [kmSalidaInput, setKmSalidaInput] = useState<string>('')
  const [destinoInput, setDestinoInput] = useState<string>('')

  // Llegada State
  const [selectedViajeLlegadaId, setSelectedViajeLlegadaId] = useState<string>(
    viajesAbiertos[0]?.id || ''
  )
  const [pilotoLlegadaNombre, setPilotoLlegadaNombre] = useState<string>('')
  const [kmLlegadaInput, setKmLlegadaInput] = useState<string>('')
  const [observacionesInput, setObservacionesInput] = useState<string>('')

  const router = useRouter()

  // Find active vehicles on route
  const vehiculosEnRutaIds = new Set(
    viajesAbiertos.map((v) => v.vehiculo_id || v.vehiculos?.id).filter((id): id is string => Boolean(id))
  )

  // Map of active drivers currently on route
  const pilotosEnRutaMap = new Map<string, { placa: string; viajeId: string }>()
  viajesAbiertos.forEach((v) => {
    if (v.piloto_nombre?.trim()) {
      const nameKey = v.piloto_nombre.trim().toLowerCase()
      pilotosEnRutaMap.set(nameKey, {
        placa: v.vehiculos?.placa || 'otra unidad',
        viajeId: v.id,
      })
    }
  })

  // List of unique known driver names for datalist auto-complete
  const pilotosConocidos = Array.from(
    new Set(
      [
        ...viajesAbiertos.map((v) => v.piloto_nombre?.trim()),
        ...historialReciente.map((h) => h.piloto_nombre?.trim()),
      ].filter((n): n is string => Boolean(n && n.length > 1))
    )
  ).sort()

  const pilotoEnRutaActual = pilotoSalidaNombre.trim()
    ? pilotosEnRutaMap.get(pilotoSalidaNombre.trim().toLowerCase())
    : null

  const vehiculoSeleccionadoSalida = vehiculos.find((v) => v.id === selectedVehiculoSalidaId)
  const viajeSeleccionadoLlegada = viajesAbiertos.find((v) => v.id === selectedViajeLlegadaId) || viajesAbiertos[0]

  // Auto-fill km_salida when vehicle changes in departure form
  function handleVehiculoSalidaChange(id: string) {
    setSelectedVehiculoSalidaId(id)
    const veh = vehiculos.find((v) => v.id === id)
    if (veh) {
      setKmSalidaInput(veh.km_actual > 0 ? String(veh.km_actual) : '')
    } else {
      setKmSalidaInput('')
    }
  }

  // Handle active trip selection for return
  function handleViajeLlegadaSelect(viaje: ViajeAbierto) {
    setSelectedViajeLlegadaId(viaje.id)
    setPilotoLlegadaNombre(viaje.piloto_nombre || '')
    setKmLlegadaInput('')
  }

  async function handleSalida(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const res = await registrarSalida(formData)
    setLoading(false)

    if (res?.error) {
      setError(res.error)
    } else {
      setPilotoSalidaNombre('')
      setSelectedVehiculoSalidaId('')
      setKmSalidaInput('')
      setDestinoInput('')
      router.refresh()
    }
  }

  async function handleLlegada(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const res = await registrarLlegada(formData)
    setLoading(false)

    if (res?.error) {
      setError(res.error)
    } else {
      setPilotoLlegadaNombre('')
      setKmLlegadaInput('')
      setObservacionesInput('')
      router.refresh()
    }
  }

  // Calculate distance traveled for active trip
  const kmLlegadaNum = Number(kmLlegadaInput)
  const kmRecorridos =
    viajeSeleccionadoLlegada && kmLlegadaNum > viajeSeleccionadoLlegada.km_salida
      ? kmLlegadaNum - viajeSeleccionadoLlegada.km_salida
      : 0

  return (
    <div className="space-y-6">
      {/* Tab Switcher: Registrar Salida vs Registrar Llegada */}
      <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[var(--card)] border border-[var(--card-border)] text-xs font-bold shadow-xs gap-1">
        <button
          type="button"
          onClick={() => {
            setActiveTab('salida')
            setError(null)
          }}
          className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'salida'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-[var(--nav-text)] hover:bg-[var(--background)]'
          }`}
        >
          <Car className="h-4 w-4" />
          <span>Registrar Salida</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('llegada')
            setError(null)
          }}
          className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 relative ${
            activeTab === 'llegada'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-[var(--nav-text)] hover:bg-[var(--background)]'
          }`}
        >
          <Navigation className="h-4 w-4" />
          <span>Registrar Llegada</span>
          {viajesAbiertos.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-amber-400 text-slate-950 font-black">
              {viajesAbiertos.length}
            </span>
          )}
        </button>
      </div>

      {/* Visual Error Message */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: REGISTRAR SALIDA */}
      {activeTab === 'salida' && (
        <form
          key="salida"
          onSubmit={handleSalida}
          className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-[var(--nav-border)] pb-3">
            <h2 className="font-extrabold text-base text-[var(--foreground)] flex items-center gap-2">
              <Car className="h-4 w-4 text-blue-500" />
              <span>Registrar Salida de Vehículo</span>
            </h2>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500">
              Inicio de Ruta
            </span>
          </div>

          {/* Piloto Name */}
          <div>
            <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-blue-500" />
                Nombre del Piloto / Responsable
              </span>
              {pilotosConocidos.length > 0 && (
                <span className="text-[10px] text-[var(--nav-text)] font-normal">
                  Sugerencias activas de pilotos
                </span>
              )}
            </label>
            <input
              type="text"
              name="piloto_nombre"
              list="lista-pilotos"
              required
              value={pilotoSalidaNombre}
              onChange={(e) => setPilotoSalidaNombre(e.target.value)}
              placeholder="Escribe o selecciona tu nombre completo..."
              className={`w-full px-3 py-2 text-sm rounded-xl border bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 ${
                pilotoEnRutaActual
                  ? 'border-amber-500 ring-2 ring-amber-500/20'
                  : 'border-[var(--input-border)] focus:ring-blue-500/20'
              }`}
            />
            <datalist id="lista-pilotos">
              {pilotosConocidos.map((nombre) => (
                <option key={nombre} value={nombre} />
              ))}
            </datalist>

            {pilotoEnRutaActual && (
              <div className="mt-1.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Piloto con viaje activo:</strong>
                  El piloto <strong>{pilotoSalidaNombre}</strong> ya está conduciendo la unidad{' '}
                  <strong className="underline">{pilotoEnRutaActual.placa}</strong>. Para asignar otro viaje,
                  primero registra la llegada de esa unidad en la pestaña "Registrar Llegada".
                </div>
              </div>
            )}
          </div>

          {/* Select Vehicle */}
          <div>
            <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Car className="h-3.5 w-3.5 text-blue-500" />
              Selecciona Unidad por Placa
            </label>
            <select
              name="vehiculo_id"
              required
              value={selectedVehiculoSalidaId}
              onChange={(e) => handleVehiculoSalidaChange(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">-- Selecciona un vehículo disponible --</option>
              {vehiculos.map((v) => {
                const enRuta = vehiculosEnRutaIds.has(v.id)
                const disabled = v.en_taller || enRuta

                return (
                  <option key={v.id} value={v.id} disabled={disabled}>
                    {v.placa} — {v.marca} {v.modelo}{' '}
                    {enRuta ? '🚚 (En Ruta - Viaje Activo)' : v.en_taller ? '⛔ (En Taller)' : '✅ Disponible'}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Display last odometer reading card if vehicle is selected */}
          {vehiculoSeleccionadoSalida && (
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--nav-text)] font-semibold flex items-center gap-1">
                  <Gauge className="h-4 w-4 text-blue-500" />
                  Último kilometraje registrado:
                </span>
                <strong className="text-sm font-black text-blue-600 dark:text-blue-400 font-mono">
                  {vehiculoSeleccionadoSalida.km_actual.toLocaleString()} km
                </strong>
              </div>
              <p className="text-[11px] text-[var(--nav-text)] leading-relaxed">
                El valor inicial sugerido coincide con el odómetro guardado para la placa{' '}
                <strong>{vehiculoSeleccionadoSalida.placa}</strong>.
              </p>
            </div>
          )}

          {/* Km Salida Input */}
          <div>
            <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-blue-500" />
              Kilometraje de Salida (Odómetro)
            </label>
            <input
              type="number"
              name="km_salida"
              placeholder={
                vehiculoSeleccionadoSalida
                  ? `Ej: ${vehiculoSeleccionadoSalida.km_actual}`
                  : 'Ingresa lectura de odómetro'
              }
              required
              min={0}
              value={kmSalidaInput}
              onChange={(e) => setKmSalidaInput(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Destino / Ruta */}
          <div>
            <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-red-500" />
              Destino / Ruta asignada (Opcional)
            </label>
            <input
              type="text"
              name="destino"
              placeholder="Ej: Entrega de mercadería en Petén"
              value={destinoInput}
              onChange={(e) => setDestinoInput(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 font-bold text-xs rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-50 shadow-xs flex items-center justify-center gap-2"
          >
            {loading ? 'Guardando Salida...' : 'Registrar Salida de Unidad'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}

      {/* TAB 2: REGISTRAR LLEGADA */}
      {activeTab === 'llegada' && (
        <div className="bg-[var(--card)] border border-amber-500/30 rounded-2xl p-5 shadow-xs space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />

          <div className="flex items-center justify-between border-b border-[var(--nav-border)] pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="font-extrabold text-base text-[var(--foreground)]">
                Registro de Llegada (Cierre de Viaje)
              </h2>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
              {viajesAbiertos.length} Unidad(es) en Ruta
            </span>
          </div>

          {viajesAbiertos.length === 0 ? (
            <div className="p-6 text-center space-y-2 border border-dashed border-[var(--nav-border)] rounded-xl bg-[var(--background)]">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-[var(--foreground)]">No hay unidades actualmente en ruta</p>
              <p className="text-xs text-[var(--nav-text)]">
                Todos los vehículos están en predio o en taller. Puedes registrar una salida desde la pestaña anterior.
              </p>
            </div>
          ) : (
            <form onSubmit={handleLlegada} className="space-y-4">
              {/* Trip Selector Cards / List */}
              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-2">
                  Selecciona la unidad que está ingresando
                </label>
                <div className="grid gap-2 max-h-56 overflow-y-auto pr-1">
                  {viajesAbiertos.map((viaje) => {
                    const isSelected = viaje.id === (selectedViajeLlegadaId || viajeSeleccionadoLlegada?.id)
                    const placa = viaje.vehiculos?.placa || 'Placa'
                    const marca = viaje.vehiculos?.marca || ''
                    const modelo = viaje.vehiculos?.modelo || ''

                    return (
                      <button
                        key={viaje.id}
                        type="button"
                        onClick={() => handleViajeLlegadaSelect(viaje)}
                        className={`p-3 rounded-xl text-left border transition-all flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/20'
                            : 'bg-[var(--background)] border-[var(--nav-border)] hover:border-amber-500/50'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <strong className="text-xs font-bold text-[var(--foreground)]">
                              {placa} — {marca} {modelo}
                            </strong>
                          </div>
                          <p className="text-[11px] text-[var(--nav-text)]">
                            Piloto salida: <span className="text-[var(--foreground)] font-medium">{viaje.piloto_nombre || 'Piloto'}</span>
                            {viaje.destino ? ` | Destino: ${viaje.destino}` : ''}
                          </p>
                        </div>
                        <div className="text-right text-[11px]">
                          <span className="block font-mono font-bold text-[var(--foreground)]">
                            {viaje.km_salida.toLocaleString()} km
                          </span>
                          <span className="text-[10px] text-[var(--nav-text)]">
                            {new Date(viaje.hora_salida).toLocaleTimeString('es-GT', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {viajeSeleccionadoLlegada && (
                <>
                  <input type="hidden" name="viaje_id" value={viajeSeleccionadoLlegada.id} />

                  {/* Active Trip Info Summary Box */}
                  <div className="p-3.5 rounded-xl bg-[var(--background)] border border-[var(--input-border)] space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-[var(--nav-border)] pb-2">
                      <span className="text-[var(--nav-text)] font-medium flex items-center gap-1.5">
                        <Car className="h-3.5 w-3.5 text-blue-500" />
                        Unidad Seleccionada:
                      </span>
                      <strong className="text-[var(--foreground)] font-bold text-sm">
                        {viajeSeleccionadoLlegada.vehiculos?.placa} — {viajeSeleccionadoLlegada.vehiculos?.marca}{' '}
                        {viajeSeleccionadoLlegada.vehiculos?.modelo}
                      </strong>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-[var(--nav-text)] block text-[10px] uppercase font-bold tracking-wider">
                          Km de Salida
                        </span>
                        <strong className="text-sm font-black text-[var(--foreground)]">
                          {viajeSeleccionadoLlegada.km_salida.toLocaleString()} km
                        </strong>
                      </div>
                      <div>
                        <span className="text-[var(--nav-text)] block text-[10px] uppercase font-bold tracking-wider">
                          Hora de Salida
                        </span>
                        <span className="font-semibold text-[var(--foreground)]">
                          {new Date(viajeSeleccionadoLlegada.hora_salida).toLocaleTimeString('es-GT', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {viajeSeleccionadoLlegada.destino && (
                      <div className="pt-1 border-t border-[var(--nav-border)] flex items-center gap-1.5 text-[var(--nav-text)]">
                        <MapPin className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                        <span>
                          Destino registrado:{' '}
                          <strong className="text-[var(--foreground)]">{viajeSeleccionadoLlegada.destino}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Driver Name Input */}
                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-blue-500" />
                      Nombre de la Persona que Entrega
                    </label>
                    <input
                      type="text"
                      name="piloto_nombre"
                      list="lista-pilotos"
                      required
                      value={pilotoLlegadaNombre}
                      onChange={(e) => setPilotoLlegadaNombre(e.target.value)}
                      placeholder="Escribe o selecciona tu nombre completo..."
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Km Input */}
                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Gauge className="h-3.5 w-3.5 text-emerald-500" />
                      Kilometraje de Llegada (Odómetro)
                    </label>
                    <input
                      type="number"
                      name="km_llegada"
                      placeholder={`Mínimo: ${viajeSeleccionadoLlegada.km_salida}`}
                      required
                      min={viajeSeleccionadoLlegada.km_salida}
                      value={kmLlegadaInput}
                      onChange={(e) => setKmLlegadaInput(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                    {kmRecorridos > 0 && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Distancia calculada: {kmRecorridos.toLocaleString()} km recorridos en este viaje.
                      </p>
                    )}
                  </div>

                  {/* Observaciones */}
                  <div>
                    <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
                      Observaciones / Novedades (Opcional)
                    </label>
                    <input
                      type="text"
                      name="observaciones"
                      value={observacionesInput}
                      onChange={(e) => setObservacionesInput(e.target.value)}
                      placeholder="Ej: Sin novedades, combustible a nivel 3/4"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 font-bold text-xs rounded-xl bg-amber-600 text-white hover:bg-amber-500 transition-colors disabled:opacity-50 shadow-xs flex items-center justify-center gap-2"
                  >
                    {loading ? 'Guardando Entrada...' : 'Registrar Entrada de Unidad'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      )}

      {/* HISTORIAL RECIENTE SECTION */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-5 shadow-xs space-y-3">
        <h3 className="font-extrabold text-sm text-[var(--foreground)] flex items-center gap-2 border-b border-[var(--nav-border)] pb-2">
          <History className="h-4 w-4 text-purple-500" />
          <span>Historial Reciente de Registros (Toda la Flota)</span>
        </h3>

        {historialReciente.length === 0 ? (
          <p className="text-xs text-[var(--nav-text)] py-4 text-center">
            No hay registros de viajes en el historial.
          </p>
        ) : (
          <div className="space-y-2.5">
            {historialReciente.map((item) => {
              const esAbierto = item.estado === 'abierto'
              const dist =
                item.km_llegada && item.km_llegada > item.km_salida
                  ? item.km_llegada - item.km_salida
                  : 0

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-[var(--nav-border)] bg-[var(--background)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-[var(--foreground)] text-sm font-bold">
                        {item.vehiculos?.placa} — {item.vehiculos?.marca} {item.vehiculos?.modelo}
                      </strong>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          esAbierto
                            ? 'bg-amber-500/15 text-amber-500'
                            : 'bg-emerald-500/15 text-emerald-500'
                        }`}
                      >
                        {esAbierto ? 'En Curso' : 'Completado'}
                      </span>
                    </div>

                    <div className="text-[var(--nav-text)] flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {item.piloto_nombre || 'Piloto'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(item.hora_salida).toLocaleDateString('es-GT', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {item.destino && (
                      <div className="text-[var(--nav-text)] text-[11px]">
                        Destino: <span className="text-[var(--foreground)]">{item.destino}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-right sm:border-l border-[var(--nav-border)] sm:pl-3 space-y-0.5">
                    <div className="text-[var(--nav-text)] text-[11px]">
                      Salida: <strong className="text-[var(--foreground)]">{item.km_salida.toLocaleString()} km</strong>
                    </div>
                    {item.km_llegada ? (
                      <div className="text-[var(--nav-text)] text-[11px]">
                        Llegada: <strong className="text-[var(--foreground)]">{item.km_llegada.toLocaleString()} km</strong>
                      </div>
                    ) : (
                      <div className="text-amber-500 font-semibold text-[11px]">Pendiente de cierre</div>
                    )}
                    {dist > 0 && (
                      <div className="text-emerald-500 font-bold text-[11px]">
                        +{dist.toLocaleString()} km
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
