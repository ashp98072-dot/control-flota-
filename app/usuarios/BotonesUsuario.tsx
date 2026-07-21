'use client'

import { desactivarUsuario, eliminarUsuario } from './actions'

export default function BotonesUsuario({ id, activo }: { id: string; activo: boolean }) {
  return (
    <div className="flex gap-2">
      <button onClick={() => desactivarUsuario(id, activo)} className="text-xs px-2 py-1 rounded border border-gray-400 text-gray-300 hover:bg-gray-400/10">
        {activo ? '⏸ Desactivar' : '▶ Activar'}
      </button>
      <button
        onClick={() => { if (confirm('¿Eliminar este usuario definitivamente?')) eliminarUsuario(id) }}
        className="text-xs px-2 py-1 rounded border border-red-500 text-red-500 hover:bg-red-500/10"
      >
        🗑 Eliminar
      </button>
    </div>
  )
}