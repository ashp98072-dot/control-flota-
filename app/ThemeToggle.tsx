'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [oscuro, setOscuro] = useState(false)

  // Al montar, lee el estado real que ya dejó el script inline de layout.tsx
  // (evita que el ícono empiece desincronizado del tema aplicado).
  useEffect(() => {
    setOscuro(document.documentElement.classList.contains('dark'))
  }, [])

  function alternar() {
    const nuevoOscuro = !oscuro
    setOscuro(nuevoOscuro)
    document.documentElement.classList.toggle('dark', nuevoOscuro)
    localStorage.setItem('tema', nuevoOscuro ? 'dark' : 'light')
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="text-base leading-none px-2 py-1.5 rounded text-[var(--nav-text)] hover:bg-[var(--card-border)]/40"
    >
      {oscuro ? '☀️' : '🌙'}
    </button>
  )
}
