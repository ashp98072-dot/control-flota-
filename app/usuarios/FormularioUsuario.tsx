'use client'

import { useState, useRef } from 'react'
import { crearUsuario } from './actions'
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function FormularioUsuario() {
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setOk(false)
    setLoading(true)
    const res = await crearUsuario(formData)
    setLoading(false)
    if (res?.error) setError(res.error)
    else {
      setOk(true)
      formRef.current?.reset()
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <div>
        <h2 className="font-bold text-base text-[var(--foreground)] flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-blue-500" />
          <span>Crear Nuevo Usuario</span>
        </h2>
        <p className="text-xs text-[var(--nav-text)] mt-1 leading-relaxed">
          Registra una nueva cuenta en la plataforma. Los pilotos podrán ingresar lecturas de odómetro,
          mientras los administradores tendrán acceso completo a la gestión de flota.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {ok && (
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>Usuario creado correctamente.</span>
        </div>
      )}

      {/* Nombre Completo */}
      <div>
        <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
          Nombre Completo
        </label>
        <input
          type="text"
          name="nombre"
          placeholder="Ejemplo: Carlos Mendoza"
          required
          className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
        />
        <p className="text-[11px] text-[var(--nav-text)] mt-1">
          Nombre e iniciales con las que se identificará al piloto o administrador.
        </p>
      </div>

      {/* Correo Electrónico */}
      <div>
        <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
          Correo Electrónico
        </label>
        <input
          type="email"
          name="email"
          placeholder="usuario@empresa.com"
          required
          className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
        />
        <p className="text-[11px] text-[var(--nav-text)] mt-1">
          Email con el que el usuario iniciará sesión en el sistema.
        </p>
      </div>

      {/* Contraseña */}
      <div>
        <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
          Contraseña
        </label>
        <input
          type="password"
          name="password"
          placeholder="••••••••"
          required
          minLength={6}
          className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
        />
        <p className="text-[11px] text-[var(--nav-text)] mt-1">
          Mínimo 6 caracteres para garantizar la seguridad de la cuenta.
        </p>
      </div>

      {/* Rol de Usuario */}
      <div>
        <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
          Rol de Usuario
        </label>
        <select
          name="rol"
          required
          defaultValue="piloto"
          className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
        >
          <option value="piloto">Piloto / Chofer (registro de odómetro)</option>
          <option value="admin">Administrador (acceso total)</option>
        </select>
        <p className="text-[11px] text-[var(--nav-text)] mt-1">
          "Piloto": sólo puede registrar lectura de kilometraje. "Administrador": puede crear vehículos, servicios y usuarios.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 font-bold text-xs rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-50 shadow-xs"
      >
        {loading ? 'Creando Usuario...' : 'Crear Usuario'}
      </button>
    </form>
  )
}