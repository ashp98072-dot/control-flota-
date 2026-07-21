'use client'

import { useState } from 'react'
import { enviarATaller } from './actions'

export function ModalEnviarTaller({ id }: { id: string }) {
  const [abierto, setAbierto] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [guardando, setGuardando] = useState(false)

  async function confirmar() {
    if (!motivo.trim()) return
    setGuardando(true)
    await enviarATaller(id, motivo.trim())
    setGuardando(false)
    setAbierto(false)
    setMotivo('')
  }

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="text-xs px-2 py-1 rounded border border-amber-500 text-amber-500 hover:bg-amber-500/10"
      >
        🔧 Enviar a taller
      </button>

      {abierto && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 w-full max-w-sm grid gap-3">
            <h3 className="font-bold">Enviar vehículo a taller</h3>
            <label className="text-sm text-gray-300">
              ¿Por qué entra al taller?
              <textarea
                autoFocus
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ej. fuga de aceite, falla de frenos..."
                className="w-full mt-1 border border-gray-500 rounded p-2 bg-transparent"
                rows={3}
              />
            </label>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setAbierto(false)}
                className="text-xs px-3 py-2 rounded border border-gray-400 text-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={confirmar}
                disabled={!motivo.trim() || guardando}
                className="text-xs px-3 py-2 rounded bg-amber-500 text-black font-medium disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}