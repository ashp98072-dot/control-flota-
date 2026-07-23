import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { obtenerViajes } from '../../queriesViajes'
import ReporteViajesPdf from '../ReporteViajesPdf'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const desde = searchParams.get('desde') || ''
  const hasta = searchParams.get('hasta') || ''
  const vehiculo = searchParams.get('vehiculo') || undefined

  if (!desde || !hasta) {
    return NextResponse.json({ error: 'Faltan fechas' }, { status: 400 })
  }

  const viajes = await obtenerViajes({ desde, hasta, vehiculoId: vehiculo })
  const buffer = await renderToBuffer(<ReporteViajesPdf viajes={viajes} desde={desde} hasta={hasta} />)

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="reporte_viajes_pilotos_${desde}_a_${hasta}.pdf"`,
    },
  })
}
