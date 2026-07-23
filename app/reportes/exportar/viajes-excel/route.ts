import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { obtenerViajes } from '../../queriesViajes'

function formatearHora(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short' })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const desde = searchParams.get('desde') || ''
  const hasta = searchParams.get('hasta') || ''
  const vehiculo = searchParams.get('vehiculo') || undefined

  if (!desde || !hasta) {
    return NextResponse.json({ error: 'Faltan fechas' }, { status: 400 })
  }

  const viajes = await obtenerViajes({ desde, hasta, vehiculoId: vehiculo })
  const workbook = new ExcelJS.Workbook()
  const hoja = workbook.addWorksheet('Control de Viajes y Pilotos')

  // Title
  hoja.addRow(['REPORTE DE REGISTRO DE VIAJES Y PILOTOS']).font = { bold: true, size: 14 }
  hoja.addRow([`Período: ${desde} al ${hasta}`]).font = { italic: true, size: 10 }
  hoja.addRow([])

  // Headers
  const encabezados = [
    'Placa',
    'Piloto / Responsable',
    'Destino / Ruta',
    'Hora Salida',
    'Km Salida',
    'Hora Llegada',
    'Km Llegada',
    'Km Recorridos',
    'Estado',
    'Observaciones',
  ]
  const anchos = [12, 24, 28, 20, 14, 20, 14, 16, 12, 35]

  const headerRow = hoja.addRow(encabezados)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' },
    }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
  })

  hoja.columns = encabezados.map((_, i) => ({ width: anchos[i] }))

  let totalKmRecorridos = 0

  for (const v of viajes) {
    if (v.km_recorridos) totalKmRecorridos += v.km_recorridos

    const row = hoja.addRow([
      v.placa,
      v.piloto,
      v.destino || '—',
      formatearHora(v.hora_salida),
      v.km_salida,
      formatearHora(v.hora_llegada),
      v.km_llegada != null ? v.km_llegada : '—',
      v.km_recorridos != null ? v.km_recorridos : '—',
      v.estado === 'abierto' ? 'En curso' : 'Cerrado',
      v.observaciones || '',
    ])

    // Right align numbers
    row.getCell(5).alignment = { horizontal: 'right' }
    row.getCell(7).alignment = { horizontal: 'right' }
    row.getCell(8).alignment = { horizontal: 'right' }
  }

  hoja.addRow([])
  const summaryRow = hoja.addRow([
    'TOTALES:',
    `${viajes.length} viaje(s)`,
    '',
    '',
    '',
    '',
    '',
    `${totalKmRecorridos.toLocaleString()} km`,
    '',
    '',
  ])
  summaryRow.font = { bold: true }

  const buffer = await workbook.xlsx.writeBuffer()

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="reporte_viajes_pilotos_${desde}_a_${hasta}.xlsx"`,
    },
  })
}
