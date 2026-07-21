'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORES = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6']

const estiloTooltip = {
  backgroundColor: 'var(--background)',
  border: '1px solid var(--card-border)',
  borderRadius: 6,
  color: 'var(--foreground)',
}

export function GraficaConsolidada({ datos }: { datos: { mes: string; total: number }[] }) {
  return (
    <div className="border border-[var(--card-border)] rounded p-4">
      <h3 className="font-semibold mb-2 text-sm">Costo total de mantenimiento por mes</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
          <XAxis dataKey="mes" fontSize={12} stroke="var(--card-border)" tick={{ fill: 'var(--muted)' }} />
          <YAxis fontSize={12} stroke="var(--card-border)" tick={{ fill: 'var(--muted)' }} tickFormatter={(v) => `Q${v}`} />
          <Tooltip
            contentStyle={estiloTooltip}
            labelStyle={{ color: 'var(--foreground)' }}
            itemStyle={{ color: 'var(--foreground)' }}
            formatter={(v: any) => [`Q${Number(v).toFixed(2)}`, 'Costo']}
          />
          <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function GraficaPorVehiculo({
  datos,
  placas,
}: {
  datos: Record<string, number | string>[]
  placas: string[]
}) {
  return (
    <div className="border border-[var(--card-border)] rounded p-4">
      <h3 className="font-semibold mb-2 text-sm">Costo por vehículo, mes contra mes</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
          <XAxis dataKey="mes" fontSize={12} stroke="var(--card-border)" tick={{ fill: 'var(--muted)' }} />
          <YAxis fontSize={12} stroke="var(--card-border)" tick={{ fill: 'var(--muted)' }} tickFormatter={(v) => `Q${v}`} />
          <Tooltip
            contentStyle={estiloTooltip}
            labelStyle={{ color: 'var(--foreground)' }}
            itemStyle={{ color: 'var(--foreground)' }}
            formatter={(v: any) => [`Q${Number(v).toFixed(2)}`, 'Costo']}
          />
          <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
          {placas.map((placa, i) => (
            <Line
              key={placa}
              type="monotone"
              dataKey={placa}
              stroke={COLORES[i % COLORES.length]}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
