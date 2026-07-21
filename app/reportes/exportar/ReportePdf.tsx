import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { VehiculoReporte } from '../queries'

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 9 },
  titulo: { fontSize: 14, fontWeight: 700, marginBottom: 4 },
  subtitulo: { fontSize: 10, color: '#555', marginBottom: 12 },
  vehiculoTitulo: { fontSize: 11, fontWeight: 700, marginTop: 14, marginBottom: 4 },
  fila: { flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#ccc', paddingVertical: 3 },
  filaHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000', paddingVertical: 3, fontWeight: 700 },
  colFecha: { width: '12%' },
  colTipo: { width: '16%' },
  colTrabajo: { width: '30%' },
  colCosto: { width: '12%', textAlign: 'right' },
  colObs: { width: '30%' },
  totalVehiculo: { textAlign: 'right', fontWeight: 700, marginTop: 4 },
  totalGeneral: { textAlign: 'right', fontWeight: 700, fontSize: 11, marginTop: 16, borderTopWidth: 1, paddingTop: 6 },
})

export default function ReportePdf({
  reporte,
  desde,
  hasta,
}: {
  reporte: VehiculoReporte[]
  desde: string
  hasta: string
}) {
  const totalGeneral = reporte.reduce((acc, v) => acc + v.total_costo, 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.titulo}>Reporte de mantenimientos</Text>
        <Text style={styles.subtitulo}>Periodo: {desde} a {hasta}</Text>

        {reporte.length === 0 && <Text>No hay servicios registrados en este periodo.</Text>}

        {reporte.map((v) => (
          <View key={v.vehiculo_id} wrap={false}>
            <Text style={styles.vehiculoTitulo}>{v.placa} — {v.marca} {v.modelo}</Text>
            <View style={styles.filaHeader}>
              <Text style={styles.colFecha}>Fecha</Text>
              <Text style={styles.colTipo}>Tipo</Text>
              <Text style={styles.colTrabajo}>Trabajo</Text>
              <Text style={styles.colCosto}>Costo</Text>
              <Text style={styles.colObs}>Observaciones</Text>
            </View>
            {v.servicios.map((s) => (
              <View key={s.id} style={styles.fila}>
                <Text style={styles.colFecha}>{s.fecha}</Text>
                <Text style={styles.colTipo}>{s.tipo === 'reparacion' ? 'Reparación' : 'Mantenimiento'}</Text>
                <Text style={styles.colTrabajo}>{s.tipo_trabajo}</Text>
                <Text style={styles.colCosto}>Q{s.costo.toFixed(2)}</Text>
                <Text style={styles.colObs}>{s.observaciones ?? '—'}</Text>
              </View>
            ))}
            <Text style={styles.totalVehiculo}>Subtotal: Q{v.total_costo.toFixed(2)}</Text>
          </View>
        ))}

        {reporte.length > 0 && (
          <Text style={styles.totalGeneral}>Total general: Q{totalGeneral.toFixed(2)}</Text>
        )}
      </Page>
    </Document>
  )
}