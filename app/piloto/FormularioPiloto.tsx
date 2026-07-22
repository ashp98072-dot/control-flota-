'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registrarSalida, registrarLlegada } from './actions'
import { Car, Gauge, MapPin, User, ArrowRight, AlertCircle, CheckCircle2, History, Clock } from 'lucide-react'

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
  vehiculos: { id: string; placa: string; marca: string; modelo: string } | null
} | null

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
  viajeAbierto,
  nombrePilotoDefault = '',
  historialReciente = [],
}: {
  vehiculos: VehiculoConKm[]
  viajeAbierto: ViajeAbierto
  nombrePilotoDefault?: string
  historialReciente?: RegistroHistorial[]
}) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedVehiculoId, setSelectedVehiculoId] = useState<string>('')
  const [pilotoNombre, setPilotoNombre] = useState<string>(
    viajeAbierto?.piloto_nombre || ''
  )
  const [kmSalidaInput, setKmSalidaInput] = useState<string>('')
  const [kmLlegadaInput, setKmLlegadaInput] = useState<string>('')
  const router = useRouter()

  const vehiculoSeleccionado = vehiculos.find((v) => v.id === selectedVehiculoId)

  // Auto-fill km_salida when vehicle changes
  function handleVehiculoChange(id: string) {
    setSelectedVehiculoId(id)
    const veh = vehiculos.find((v) => v.id === id)
    if (veh) {
      setKmSalidaInput(veh.km_actual > 0 ? String(veh.km_actual) : '')
    } else {
      setKmSalidaInput('')
    }
  }

  async function handleSalida(formData: FormData) {
    setError(null)
    setLoading(true)
    const res = await registrarSalida(formData)
    setLoading(false)
    if (res?.error) setError(res.error)
    else {
      setPilotoNombre('')
      setSelectedVehiculoId('')
      setKmSalidaInput('')
      router.refresh()
    }
  }

  async function handleLlegada(formData: FormData) {
    setError(null)
    setLoading(true)
    const res = await registrarLlegada(formData)
    setLoading(false)
    if (res?.error) setError(res.error)
    else {
      setPilotoNombre('')
      setKmLlegadaInput('')
      router.refresh()
    }
  }

  // Calculate distance traveled for active trip
  const kmLlegadaNum = Number(kmLlegadaInput)
  const kmRecorridos =
    viajeAbierto && kmLlegadaNum > viajeAbierto.km_salida
      ? kmLlegadaNum - viajeAbierto.km_salida
      : 0

  return (
    <div className="space-y-6">
      {/* Visual Error Message */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* FORM: REGISTRAR LLEGADA (If open trip exists) */}
      {viajeAbierto ? (
        <form
          key="llegada"
          action={handleLlegada}
          className="bg-[var(--card)] border border-amber-500/30 rounded-2xl p-5 shadow-xs space-y-4 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="font-extrabold text-base text-[var(--foreground)]">
                Registro de Llegada (Cierre de Viaje)
              </h2>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Viaje en Curso
            </span>
          </div>

          {/* Active Trip Info Box */}
          <div className="p-3.5 rounded-xl bg-[var(--background)] border border-[var(--input-border)] space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-[var(--nav-border)] pb-2">
              <span className="text-[var(--nav-text)] font-medium flex items-center gap-1.5">
                <Car className="h-3.5 w-3.5 text-blue-500" />
                Vehículo:
              </span>
              <strong className="text-[var(--foreground)] font-bold text-sm">
                {viajeAbierto.vehiculos?.placa} — {viajeAbierto.vehiculos?.marca} {viajeAbierto.vehiculos?.modelo}
              </strong>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-[var(--nav-text)] block text-[10px] uppercase font-bold tracking-wider">
                  Km de Salida
                </span>
                <strong className="text-sm font-black text-[var(--foreground)]">
                  {viajeAbierto.km_salida.toLocaleString()} km
                </strong>
              </div>
              <div>
                <span className="text-[var(--nav-text)] block text-[10px] uppercase font-bold tracking-wider">
                  Hora de Salida
                </span>
                <span className="font-semibold text-[var(--foreground)]">
                  {new Date(viajeAbierto.hora_salida).toLocaleTimeString('es-GT', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {viajeAbierto.destino && (
              <div className="pt-1 border-t border-[var(--nav-border)] flex items-center gap-1.5 text-[var(--nav-text)]">
                <MapPin className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                <span>Destino registrado: <strong className="text-[var(--foreground)]">{viajeAbierto.destino}</strong></span>
              </div>
            )}
          </div>

          <input type="hidden" name="viaje_id" value={viajeAbierto.id} />

          {/* Driver Name Input */}
          <div>
            <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-blue-500" />
              Piloto / Responsable
            </label>
            <input
              type="text"
              name="piloto_nombre"
              required
              value={pilotoNombre}
              onChange={(e) => setPilotoNombre(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Km Input */}
          <div>
            <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-emerald-500" />
              Kilometraje de Llegada
            </label>
            <input
              type="number"
              name="km_llegada"
              placeholder={`Mínimo: ${viajeAbierto.km_salida}`}
              required
              min={viajeAbierto.km_salida}
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
        </form>
      ) : (
        /* FORM: REGISTRAR SALIDA */
        <form
          key="salida"
          action={handleSalida}
          className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-[var(--nav-border)] pb-3">
            <h2 className="font-extrabold text-base text-[var(--foreground)] flex items-center gap-2">
              <Car className="h-4 w-4 text-blue-500" />
              <span>Registrar Salida de Vehículo</span>
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500">
              Inicio de Ruta
            </span>
          </div>

          {/* Piloto Name */}
          <div>
            <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-blue-500" />
              Nombre de la Persona que Registra
            </label>
            <input
              type="text"
              name="piloto_nombre"
              required
              value={pilotoNombre}
              onChange={(e) => setPilotoNombre(e.target.value)}
              placeholder="Escribe tu nombre completo (ej: Mario Estrada)"
              className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
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
              value={selectedVehiculoId}
              onChange={(e) => handleVehiculoChange(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">-- Selecciona un vehículo --</option>
              {vehiculos.map((v) => (
                <option key={v.id} value={v.id} disabled={v.en_taller}>
                  {v.placa} — {v.marca} {v.modelo} {v.en_taller ? '⛔ (En Taller)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Display last odometer reading card if vehicle is selected */}
          {vehiculoSeleccionado && (
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--nav-text)] font-semibold flex items-center gap-1">
                  <Gauge className="h-4 w-4 text-blue-500" />
                  Último kilometraje registrado:
                </span>
                <strong className="text-sm font-black text-blue-600 dark:text-blue-400 font-mono">
                  {vehiculoSeleccionado.km_actual.toLocaleString()} km
                </strong>
              </div>
              <p className="text-[11px] text-[var(--nav-text)] leading-relaxed">
                El valor inicial sugerido coincide con el odómetro del último registro guardado para la placa{' '}
                <strong>{vehiculoSeleccionado.placa}</strong>.
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
                vehiculoSeleccionado
                  ? `Ej: ${vehiculoSeleccionado.km_actual}`
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
              placeholder="Ej: Entrega de mercadería en Antigua Guatemala"
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

      {/* HISTORIAL RECIENTE SECTION */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-5 shadow-xs space-y-3">
        <h3 className="font-extrabold text-sm text-[var(--foreground)] flex items-center gap-2 border-b border-[var(--nav-border)] pb-2">
          <History className="h-4 w-4 text-purple-500" />
          <span>Historial Reciente de Registros</span>
        </h3>

        {historialReciente.length === 0 ? (
          <p className="text-xs text-[var(--nav-text)] py-4 text-center">
            No hay registros de viajes anteriores para este usuario.
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
