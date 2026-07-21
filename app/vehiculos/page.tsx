import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BotonesAccion } from './BotonesAccion'
import { Truck, Fuel, Shield, Hammer, Edit2, PlusCircle } from 'lucide-react'

export default async function VehiculosPage() {
  const supabase = await createClient()
  const { data: vehiculos, error } = await supabase
    .from('vehiculos')
    .select('*')
    .order('placa')

  if (error) return <p className="p-8 text-red-500">Error: {error.message}</p>

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Cabecera Responsiva */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Vehículos</h1>
          <p className="text-sm text-[var(--nav-text)]">
            Gestiona la flota de vehículos, sus estados de actividad y envíos a taller.
          </p>
        </div>
        <Link
          href="/vehiculos/nuevo"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-500 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-blue-500/10"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Agregar vehículo</span>
        </Link>
      </div>

      {/* VISTA MÓVIL (Tarjetas) */}
      <div className="grid gap-4 md:hidden">
        {vehiculos && vehiculos.length > 0 ? (
          vehiculos.map((v: any) => (
            <div
              key={v.id}
              className={`bg-[var(--nav-bg)] border border-[var(--nav-border)] rounded-2xl p-4 space-y-4 shadow-sm ${
                v.activo ? '' : 'opacity-60'
              }`}
            >
              {/* Info Superior */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-sm font-bold bg-[var(--background)] border border-[var(--nav-border)] px-2.5 py-1 rounded-lg text-blue-600 dark:text-blue-400">
                    {v.placa}
                  </span>
                  <h3 className="mt-2.5 font-bold text-base text-[var(--foreground)]">
                    {v.marca} {v.modelo}
                  </h3>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    v.activo
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : 'bg-neutral-500/10 text-neutral-500'
                  }`}
                >
                  {v.activo ? '● Activo' : '● Inactivo'}
                </span>
              </div>

              {/* Detalles intermedios */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--nav-border)] text-xs text-[var(--nav-text)]">
                <div className="flex items-center gap-1.5">
                  <Fuel className="h-3.5 w-3.5 opacity-70" />
                  <span className="capitalize">{v.tipo_combustible}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 opacity-70" />
                  <span>Servicio: cada {v.km_intervalo_servicio?.toLocaleString()} km</span>
                </div>
              </div>

              {/* Estado de taller */}
              {v.en_taller && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-2.5 items-start text-xs text-amber-700 dark:text-amber-400">
                  <Hammer className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">En Taller</p>
                    <p className="opacity-90">
                      Desde {v.fecha_entrada_taller}: <span className="font-medium">{v.motivo_taller}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="pt-3 border-t border-[var(--nav-border)] flex flex-wrap gap-2 items-center justify-between">
                <Link
                  href={`/vehiculos/${v.id}/editar`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--nav-border)] text-[var(--foreground)] hover:bg-[var(--card-border)]/40 transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Editar</span>
                </Link>
                <BotonesAccion id={v.id} activo={v.activo} enTaller={v.en_taller} />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-center text-[var(--nav-text)] py-8">
            No hay vehículos registrados todavía.
          </p>
        )}
      </div>

      {/* VISTA ESCRITORIO (Tabla estilizada) */}
      <div className="hidden md:block bg-[var(--nav-bg)] border border-[var(--nav-border)] rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--nav-border)] text-xs font-bold uppercase tracking-wider text-[var(--nav-text)] bg-[var(--background)]/50">
              <th className="px-6 py-4">Placa</th>
              <th className="px-6 py-4">Vehículo</th>
              <th className="px-6 py-4">Combustible</th>
              <th className="px-6 py-4">Intervalo</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Taller</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--nav-border)]">
            {vehiculos && vehiculos.length > 0 ? (
              vehiculos.map((v: any) => (
                <tr
                  key={v.id}
                  className={`hover:bg-[var(--background)]/30 transition-colors ${
                    v.activo ? '' : 'opacity-50'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono font-bold bg-[var(--background)] border border-[var(--nav-border)] px-2 py-1 rounded-lg text-blue-600 dark:text-blue-400">
                      {v.placa}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-[var(--foreground)]">
                    {v.marca} {v.modelo}
                  </td>
                  <td className="px-6 py-4 capitalize text-sm text-[var(--nav-text)]">
                    {v.tipo_combustible}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--nav-text)]">
                    {v.km_intervalo_servicio?.toLocaleString()} km
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium ${
                        v.activo
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'bg-neutral-500/10 text-neutral-500'
                      }`}
                    >
                      {v.activo ? '● Activo' : '● Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {v.en_taller ? (
                      <span
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        title={v.motivo_taller ?? ''}
                      >
                        <Hammer className="h-3.5 w-3.5" />
                        <span>
                          Desde {v.fecha_entrada_taller} — {v.motivo_taller}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--nav-text)] opacity-40">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/vehiculos/${v.id}/editar`}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[var(--nav-border)] text-[var(--foreground)] hover:bg-[var(--card-border)]/40 transition-colors"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Editar</span>
                      </Link>
                      <BotonesAccion id={v.id} activo={v.activo} enTaller={v.en_taller} />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-[var(--nav-text)]">
                  No hay vehículos registrados todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
