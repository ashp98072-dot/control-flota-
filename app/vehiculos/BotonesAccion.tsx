'use client'

import { toggleActivo, eliminarVehiculo, cancelarEnvioTaller } from './actions'
import { ModalEnviarTaller } from './ModalEnviarTaller'

export function BotonesAccion({
  id,
  activo,
  enTaller,
}: {
  id: string
  activo: boolean
  enTaller: boolean
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {enTaller ? (
        <button
          onClick={() => {
            if (
              confirm(
                'Esto cancela el taller SIN registrar un servicio (no queda historial de días ni motivo). Si ya hiciste el trabajo, mejor regístralo en Servicios: eso cierra el taller automáticamente.\n\n¿Cancelar de todas formas?'
              )
            ) {
              cancelarEnvioTaller(id)
            }
          }}
          title="Cancela el taller sin registrar servicio. Para dejar historial, registra el servicio en /servicios."
          className="text-xs px-2 py-1 rounded border border-amber-500 text-amber-500 hover:bg-amber-500/10"
        >
          ✕ Cancelar taller (sin servicio)
        </button>
      ) : (
        <ModalEnviarTaller id={id} />
      )}

      <button
        onClick={() => toggleActivo(id, activo)}
        className="text-xs px-2 py-1 rounded border border-gray-400 text-gray-300 hover:bg-gray-400/10"
      >
        {activo ? '⏸ Desactivar' : '▶ Activar'}
      </button>

      <button
        onClick={() => {
          if (
            confirm(
              '¿Eliminar este vehículo definitivamente? Esto borrará también su historial de servicios.'
            )
          ) {
            eliminarVehiculo(id)
          }
        }}
        className="text-xs px-2 py-1 rounded border border-red-500 text-red-500 hover:bg-red-500/10"
      >
        🗑 Eliminar
      </button>
    </div>
  )
}