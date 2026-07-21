'use client'

import { useState } from 'react'
import { Hammer, PlusCircle, ArrowRightLeft, CheckCircle2, AlertTriangle, X } from 'lucide-react'
import { enviarATaller, cancelarEnvioTaller } from '../vehiculos/actions'

type VehiculoTaller = {
  id: string
  placa: string
  marca: string
  modelo: string
  en_taller: boolean
  fecha_entrada_taller: string | null
  motivo_taller: string | null
}

export default function PanelTaller({
  vehiculos,
  onSeleccionarVehiculoParaServicio,
}: {
  vehiculos: VehiculoTaller[]
  onSeleccionarVehiculoParaServicio?: (id: string) => void
}) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [vehiculoId, setVehiculoId] = useState('')
  const [motivo, setMotivo] = useState('')
  const [cargando, setCargando] = useState(false)

  // Vehículos actualmente en taller
  const vehiculosEnTaller = vehiculos.filter((v) => v.en_taller)

  // Vehículos disponibles para ingresar al taller
  const vehiculosFueraTaller = vehiculos.filter((v) => !v.en_taller)

  async function handleEnviarTaller(e: React.FormEvent) {
    e.preventDefault()
    if (!vehiculoId || !motivo.trim()) return

    setCargando(true)
    await enviarATaller(vehiculoId, motivo.trim())
    setCargando(false)
    setModalAbierto(false)
    setVehiculoId('')
    setMotivo('')
  }

  async function handleSacarDeTaller(id: string) {
    if (confirm('¿Deseas sacar este vehículo del taller sin registrar costo de servicio?')) {
      setCargando(true)
      await cancelarEnvioTaller(id)
      setCargando(false)
    }
  }

  return (
    <div className="bg-[var(--nav-bg)] border border-amber-500/20 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Encabezado del Panel de Taller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--nav-border)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Hammer className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--foreground)] flex items-center gap-2">
              <span>Control de Vehículos en Taller</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                {vehiculosEnTaller.length} en taller
              </span>
            </h3>
            <p className="text-xs text-[var(--nav-text)] mt-0.5">
              Ingresa unidades al taller o registra su mantenimiento de salida.
            </p>
          </div>
        </div>

        {/* Botón para abrir modal de envío rápido */}
        <button
          onClick={() => setModalAbierto(true)}
          className="inline-flex items-center justify-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl bg-amber-500 text-black hover:bg-amber-400 transition-all shadow-xs"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Ingresar a Taller</span>
        </button>
      </div>

      {/* Lista de Vehículos en Taller */}
      {vehiculosEnTaller.length === 0 ? (
        <div className="text-center py-4 text-xs text-[var(--nav-text)] italic opacity-80">
          No hay vehículos registrados en taller actualmente. Toda la flota está operativa.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {vehiculosEnTaller.map((v) => (
            <div
              key={v.id}
              className="p-3.5 rounded-xl bg-[var(--background)] border border-amber-500/20 space-y-2.5 shadow-2xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-amber-700 dark:text-amber-300">
                    {v.placa}
                  </span>
                  <p className="font-bold text-xs text-[var(--foreground)] mt-1">
                    {v.marca} {v.modelo}
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  Ingreso: {v.fecha_entrada_taller ?? 'Hoy'}
                </span>
              </div>

              {v.motivo_taller && (
                <p className="text-xs text-[var(--nav-text)] bg-[var(--nav-bg)] p-2 rounded-lg border border-[var(--nav-border)] italic">
                  "{v.motivo_taller}"
                </p>
              )}

              <div className="flex items-center justify-between gap-2 pt-1">
                {onSeleccionarVehiculoParaServicio && (
                  <button
                    onClick={() => onSeleccionarVehiculoParaServicio(v.id)}
                    className="flex-1 inline-flex items-center justify-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Registrar Salida</span>
                  </button>
                )}

                <button
                  onClick={() => handleSacarDeTaller(v.id)}
                  disabled={cargando}
                  className="text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-[var(--nav-border)] text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Sacar de taller sin guardar costo de servicio"
                >
                  Sacar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE INGRESO A TALLER */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--nav-bg)] border border-[var(--nav-border)] rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--nav-border)]">
              <h3 className="font-bold text-base text-[var(--foreground)] flex items-center gap-2">
                <Hammer className="h-4 w-4 text-amber-500" />
                <span>Ingresar Vehículo a Taller</span>
              </h3>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-[var(--nav-text)] hover:text-[var(--foreground)] p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEnviarTaller} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
                  Seleccionar Vehículo
                </label>
                <select
                  required
                  value={vehiculoId}
                  onChange={(e) => setVehiculoId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="">-- Elige una unidad libre --</option>
                  {vehiculosFueraTaller.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.placa} — {v.marca} {v.modelo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
                  Motivo o Falla Detectada
                </label>
                <textarea
                  required
                  rows={3}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ej. Fuga de refrigerante, mantenimiento mayor, cambio de clutch..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--nav-border)]">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl border border-[var(--nav-border)] text-[var(--nav-text)] hover:bg-[var(--background)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargando || !vehiculoId || !motivo.trim()}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-50"
                >
                  {cargando ? 'Guardando...' : 'Confirmar Ingreso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
