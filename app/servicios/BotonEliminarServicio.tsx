'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { eliminarServicio } from './actions'

export default function BotonEliminarServicio({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleClick() {
    if (!confirm('¿Eliminar este servicio? Esta acción no se puede deshacer.')) return
    setLoading(true)
    await eliminarServicio(id)
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-xs px-2 py-1 rounded border border-red-500 text-red-500 hover:bg-red-500/10 disabled:opacity-50"
    >
      {loading ? '...' : '🗑 Eliminar'}
    </button>
  )
}