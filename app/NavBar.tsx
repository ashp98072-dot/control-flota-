'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Car, LayoutDashboard, Truck, Settings, ClipboardList, BarChart3, Users, Route } from 'lucide-react'
import CerrarSesion from './CerrarSesion'
import ThemeToggle from './ThemeToggle'

const ENLACES_ADMIN = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vehiculos', label: 'Vehículos', icon: Truck },
  { href: '/servicios', label: 'Servicios', icon: Settings },
  { href: '/lecturas', label: 'Lecturas', icon: ClipboardList },
  { href: '/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/usuarios', label: 'Usuarios', icon: Users },
]
const ENLACES_PILOTO = [
  { href: '/piloto', label: 'Registrar viaje', icon: Route }
]

export default function NavBar({ alertas, rol }: { alertas: number; rol: 'admin' | 'piloto' | null }) {
  const pathname = usePathname()
  const [menuAbierto, setMenuAbierto] = useState(false)

  if (pathname === '/login' || !rol) return null

  const enlaces = rol === 'admin' ? ENLACES_ADMIN : ENLACES_PILOTO

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--nav-border)] bg-[var(--nav-bg)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--nav-bg)]/80">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
        {/* Logo / Nombre de la Aplicación */}
        <Link href={rol === 'piloto' ? '/piloto' : '/'} className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
            <Car className="h-5 w-5" />
          </div>
          <span className="font-bold text-base tracking-tight text-[var(--nav-active-text)]">
            Flota
          </span>
        </Link>

        {/* Enlaces de escritorio */}
        <nav className="hidden md:flex items-center gap-1.5">
          {enlaces.map((e) => {
            const Icono = e.icon
            const activo = e.href === '/' ? pathname === '/' : pathname.startsWith(e.href)
            return (
              <Link
                key={e.href}
                href={e.href}
                className={`relative flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  activo
                    ? 'bg-[var(--nav-active-bg)] text-[var(--nav-active-text)] font-semibold shadow-sm'
                    : 'text-[var(--nav-text)] hover:bg-[var(--card-border)]/40 hover:text-[var(--nav-active-text)]'
                }`}
              >
                <Icono className="h-4 w-4 opacity-80" />
                <span>{e.label}</span>
                {e.href === '/' && alertas > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-none rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center font-bold border-2 border-[var(--nav-bg)]">
                    {alertas}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Acciones de Escritorio */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <CerrarSesion />
        </div>

        {/* Controles para Móviles */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          
          {/* Botón de Menú Móvil */}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="relative p-2.5 rounded-lg border border-[var(--nav-border)] text-[var(--nav-text)] hover:bg-[var(--card-border)]/40 transition-colors"
            aria-label="Abrir menú"
          >
            {menuAbierto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            {!menuAbierto && alertas > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-none rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {alertas}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Menú Móvil Desplegable */}
      {menuAbierto && (
        <div className="md:hidden border-t border-[var(--nav-border)] bg-[var(--nav-bg)] px-4 py-3 space-y-1.5 shadow-lg animate-in slide-in-from-top duration-200">
          {enlaces.map((e) => {
            const Icono = e.icon
            const activo = e.href === '/' ? pathname === '/' : pathname.startsWith(e.href)
            return (
              <Link
                key={e.href}
                href={e.href}
                onClick={() => setMenuAbierto(false)}
                className={`flex items-center justify-between text-sm px-4 py-2.5 rounded-lg transition-colors ${
                  activo
                    ? 'bg-[var(--nav-active-bg)] text-[var(--nav-active-text)] font-semibold'
                    : 'text-[var(--nav-text)] hover:bg-[var(--card-border)]/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icono className="h-4 w-4 opacity-80" />
                  <span>{e.label}</span>
                </div>
                {e.href === '/' && alertas > 0 && (
                  <span className="bg-red-500 text-white text-[10px] leading-none rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center font-bold">
                    {alertas}
                  </span>
                )}
              </Link>
            )
          })}
          <div className="pt-2 border-t border-[var(--nav-border)] flex items-center justify-between">
            <span className="text-xs text-[var(--nav-text)] opacity-70">
              Sesión activa ({rol})
            </span>
            <div onClick={() => setMenuAbierto(false)}>
              <CerrarSesion />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

