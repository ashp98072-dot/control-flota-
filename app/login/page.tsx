'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Car, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCargando(true)
    
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError('Correo o contraseña incorrectos')
        setCargando(false)
        return
      }
      router.push('/')
      router.refresh()
    } catch (err) {
      setError('Ocurrió un error inesperado al iniciar sesión')
      setCargando(false)
    }
  }

  const llenarCredenciales = (rol: 'admin' | 'piloto') => {
    if (rol === 'admin') {
      setEmail('admin@controlflota.com')
      setPassword('admin123')
    } else {
      setEmail('piloto@controlflota.com')
      setPassword('piloto123')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-radial from-[var(--nav-bg)] to-[var(--background)] px-4 sm:px-6">
      <div className="w-full max-w-md space-y-8">
        {/* Cabecera / Branding */}
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/35 mb-4 animate-bounce-slow">
            <Car className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
            Control de Flota
          </h1>
          <p className="mt-2 text-sm text-[var(--nav-text)] max-w-xs mx-auto">
            Inicia sesión para gestionar vehículos, mantenimientos y lecturas en tiempo real.
          </p>
        </div>

        {/* Tarjeta de Formulario */}
        <div className="bg-[var(--nav-bg)] border border-[var(--nav-border)] rounded-2xl p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Campo de Correo */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--nav-text)]">
                Correo Electrónico
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--nav-text)] opacity-70">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  placeholder="ejemplo@controlflota.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-[var(--foreground)]"
                  required
                />
              </div>
            </div>

            {/* Campo de Contraseña */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--nav-text)]">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--nav-text)] opacity-70">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[var(--input-border)] bg-[var(--background)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-[var(--foreground)]"
                  required
                />
              </div>
            </div>

            {/* Alerta de Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Botón de Envío */}
            <button
              type="submit"
              disabled={cargando}
              className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Separador */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--nav-border)]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--nav-bg)] px-3 text-[var(--nav-text)] font-medium">
                Acceso Rápido Demo
              </span>
            </div>
          </div>

          {/* Botones de Acceso Rápido (UX Genio) */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => llenarCredenciales('admin')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-[var(--nav-border)] hover:bg-[var(--card-border)]/40 text-[var(--foreground)] transition-colors cursor-pointer"
            >
              <Sparkles className="h-3 w-3 text-blue-500" />
              Administrador
            </button>
            <button
              type="button"
              onClick={() => llenarCredenciales('piloto')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-[var(--nav-border)] hover:bg-[var(--card-border)]/40 text-[var(--foreground)] transition-colors cursor-pointer"
            >
              <Sparkles className="h-3 w-3 text-emerald-500" />
              Piloto (Chofer)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
