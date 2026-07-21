'use client'

import { useState, useMemo } from 'react'
import { Search, Users, AlertCircle, Shield, User, CircleDot } from 'lucide-react'
import BotonesUsuario from './BotonesUsuario'

type Perfil = {
  id: string
  nombre: string
  rol: 'admin' | 'piloto'
  activo: boolean
}

export default function TablaUsuarios({ perfiles }: { perfiles: Perfil[] }) {
  const [busqueda, setBusqueda] = useState('')
  const [rolFiltro, setRolFiltro] = useState('')

  // Filtrado de usuarios
  const filtrados = useMemo(() => {
    return perfiles.filter((p) => {
      // Filtro de rol
      if (rolFiltro && p.rol !== rolFiltro) {
        return false
      }

      // Filtro de texto
      const nombre = p.nombre?.toLowerCase() ?? ''
      const rol = p.rol?.toLowerCase() ?? ''
      const query = busqueda.toLowerCase().trim()

      return nombre.includes(query) || rol.includes(query)
    })
  }, [perfiles, busqueda, rolFiltro])

  return (
    <div className="space-y-4">
      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Input de Búsqueda */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--nav-text)] opacity-75">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar usuario por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--nav-bg)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-[var(--foreground)] placeholder:text-[var(--nav-text)]/60"
          />
        </div>

        {/* Selector de Rol */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-[var(--nav-text)] uppercase tracking-wider whitespace-nowrap">
            Rol:
          </label>
          <select
            value={rolFiltro}
            onChange={(e) => setRolFiltro(e.target.value)}
            className="text-xs sm:text-sm px-3 py-2 rounded-xl border border-[var(--input-border)] bg-[var(--nav-bg)] text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
          >
            <option value="">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="piloto">Pilotos</option>
          </select>
        </div>
      </div>

      {/* Caso Vacío */}
      {filtrados.length === 0 && (
        <div className="text-center py-12 border border-dashed border-[var(--nav-border)] rounded-2xl bg-[var(--nav-bg)]/30">
          <AlertCircle className="h-8 w-8 mx-auto text-[var(--nav-text)] opacity-75 mb-3" />
          <p className="text-sm font-semibold text-[var(--foreground)]">No se encontraron usuarios</p>
          <p className="text-xs text-[var(--nav-text)] mt-1">Prueba cambiando los criterios de búsqueda.</p>
        </div>
      )}

      {/* VISTA MÓVIL (Tarjetas) */}
      <div className="grid gap-3 md:hidden">
        {filtrados.map((p) => (
          <div
            key={p.id}
            className={`bg-[var(--nav-bg)] border border-[var(--nav-border)] rounded-xl p-4 space-y-3 shadow-xs transition-opacity ${
              p.activo ? '' : 'opacity-60'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  p.rol === 'admin' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'
                }`}>
                  {p.rol === 'admin' ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--foreground)]">{p.nombre}</h4>
                  <p className="text-[10px] uppercase font-bold text-[var(--nav-text)] tracking-wider mt-0.5">
                    {p.rol === 'admin' ? 'Administrador' : 'Piloto / Chofer'}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  p.activo
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                    : 'bg-neutral-500/10 text-neutral-500'
                }`}
              >
                <CircleDot className="h-2 w-2" />
                {p.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <div className="pt-2 border-t border-[var(--nav-border)]/50 flex justify-end">
              <BotonesUsuario id={p.id} activo={p.activo} />
            </div>
          </div>
        ))}
      </div>

      {/* VISTA ESCRITORIO (Tabla elegante) */}
      {filtrados.length > 0 && (
        <div className="hidden md:block bg-[var(--nav-bg)] border border-[var(--nav-border)] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--nav-border)] text-xs font-bold uppercase tracking-wider text-[var(--nav-text)] bg-[var(--background)]/50">
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Nombre Completo</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nav-border)] text-sm">
              {filtrados.map((p) => (
                <tr
                  key={p.id}
                  className={`hover:bg-[var(--background)]/30 transition-colors ${
                    p.activo ? '' : 'opacity-60'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        p.rol === 'admin' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {p.rol === 'admin' ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-[var(--foreground)]">{p.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        p.rol === 'admin'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {p.rol === 'admin' ? 'Administrador' : 'Piloto'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        p.activo
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'bg-neutral-500/10 text-neutral-500'
                      }`}
                    >
                      {p.activo ? '● Activo' : '● Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <BotonesUsuario id={p.id} activo={p.activo} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
