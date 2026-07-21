import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { obtenerReporte } from '../../queries'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const desde = searchParams.get('desde') || ''
  const hasta = searchParams.get('hasta') || ''
  const vehiculo = searchParams.get('vehiculo') || undefined
  const modo = searchParams.get('modo') || 'consolidado' // consolidado | separado

  if (!desde || !hasta) {
    return NextResponse.json({ error: 'Faltan fechas' }, { status: 400 })
  }

  const reporte = await obtenerReporte({ desde, hasta, vehiculoId: vehiculo })
  const workbook = new ExcelJS.Workbook()

  const encabezados = ['Fecha', 'Tipo', 'Trabajo', 'Costo', 'Observaciones']
  const anchos = [12, 14, 30, 12, 40]

  function llenarHoja(hoja: ExcelJS.Worksheet, servicios: typeof reporte[0]['servicios'], placaCol = false) {
    const cols = placaCol ? ['Placa', ...encabezados] : encabezados
    hoja.addRow(cols).font = { bold: true }
    hoja.columns = cols.map((_, i) => ({ width: placaCol ? [10, ...anchos][i] : anchos[i] }))
  }

  if (modo === 'separado') {
    for (const v of reporte) {
      const hoja = workbook.addWorksheet(v.placa.slice(0, 31))
      llenarHoja(hoja, v.servicios)
      for (const s of v.servicios) {
        hoja.addRow([
          s.fecha,
          s.tipo === 'reparacion' ? 'Reparación' : 'Mantenimiento',
          s.tipo_trabajo,
          s.costo,
          s.observaciones ?? '',
        ])
      }
      hoja.addRow([])
      hoja.addRow(['', '', '', 'Total:', v.total_costo]).font = { bold: true }
    }
  } else {
    const hoja = workbook.addWorksheet('Consolidado')
    llenarHoja(hoja, [], true)
    let totalGeneral = 0
    for (const v of reporte) {
      hoja.addRow([`${v.placa} — ${v.marca} ${v.modelo}`]).font = { bold: true }
      for (const s of v.servicios) {
        hoja.addRow([
          v.placa,
          s.fecha,
          s.tipo === 'reparacion' ? 'Reparación' : 'Mantenimiento',
          s.tipo_trabajo,
          s.costo,
          s.observaciones ?? '',
        ])
      }
      hoja.addRow(['', '', '', '', v.total_costo]).font = { bold: true }
      totalGeneral += v.total_costo
    }
    hoja.addRow([])
    hoja.addRow(['', '', '', '', totalGeneral]).font = { bold: true }
  }

  if (reporte.length === 0) {
    workbook.addWorksheet('Sin datos').addRow(['No hay servicios en este periodo'])
  }

  const buffer = await workbook.xlsx.writeBuffer()

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="reporte_${desde}_a_${hasta}.xlsx"`,
    },
  })
}