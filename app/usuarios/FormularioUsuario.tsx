'use client'

import { useState, useRef } from 'react'
import { crearUsuario } from './actions'

export default function FormularioUsuario() {
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    setError(null); setOk(false); setLoading(true)
    const res = await crearUsuario(formData)
    setLoading(false)
    if (res?.error) setError(res.error)
    else { setOk(true); formRef.current?.reset() }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="grid gap-3 max-w-md border p-4 rounded">
      <h2 className="font-bold">Crear usuario</h2>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {ok && <p className="text-green-500 text-sm">Usuario creado</p>}
      <input type="text" name="nombre" placeholder="Nombre completo" required className="border p-2 rounded" />
      <input type="email" name="email" placeholder="Correo" required className="border p-2 rounded" />
      <input type="password" name="password" placeholder="Contraseña (mín. 6 caracteres)" required minLength={6} className="border p-2 rounded" />
      <select name="rol" required defaultValue="piloto" className="border p-2 rounded">
        <option value="piloto">Piloto (solo registra km)</option>
        <option value="admin">Administrador (acceso total)</option>
      </select>
      <button type="submit" disabled={loading} className="bg-black text-white p-2 rounded disabled:opacity-50">
        {loading ? 'Creando...' : 'Crear usuario'}
      </button>
    </form>
  )
}