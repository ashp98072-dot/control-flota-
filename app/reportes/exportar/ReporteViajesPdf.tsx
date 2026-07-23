import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { ViajeReporte } from '../queriesViajes'

function formatearHora(iso: string | null) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 8, fontFamily: 'Helvetica' },
  header: { marginBottom: 12 },
  titulo: { fontSize: 13, fontWeight: 'bold', marginBottom: 2, color: '#1E293B' },
  subtitulo: { fontSize: 9, color: '#64748B' },
  resumenBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  resumenItem: { fontSize: 8, color: '#334155' },
  resumenVal: { fontWeight: 'bold', color: '#0F172A' },
  tabla: { width: '100%' },
  filaHeader: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  textHeader: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 7.5 },
  fila: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: '#E2E8F0',
    paddingVertical: 4,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  colPlaca: { width: '10%' },
  colPiloto: { width: '18%' },
  colDestino: { width: '18%' },
  colSalida: { width: '14%' },
  colKmSalida: { width: '9%', textAlign: 'right' },
  colLlegada: { width: '14%' },
  colKmLlegada: { width: '9%', textAlign: 'right' },
  colRecorrido: { width: '8%', textAlign: 'right' },
  colEstado: { width: '0%' }, // optional or combined
  badgeAbierto: { color: '#D97706', fontWeight: 'bold' },
  badgeCerrado: { color: '#059669', fontWeight: 'bold' },
  totalesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 6,
    borderTopWidth: 1,
    borderColor: '#0F172A',
  },
  totalText: { fontSize: 9, fontWeight: 'bold', color: '#0F172A' },
})

export default function ReporteViajesPdf({
  viajes,
  desde,
  hasta,
}: {
  viajes: ViajeReporte[]
  desde: string
  hasta: string
}) {
  const totalKm = viajes.reduce((acc, v) => acc + (v.km_recorridos || 0), 0)
  const viajesEnCurso = viajes.filter((v) => v.estado === 'abierto').length
  const viajesCompletados = viajes.filter((v) => v.estado === 'cerrado').length

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.titulo}>REPORTE DE REGISTRO DE VIAJES Y PILOTOS</Text>
          <Text style={styles.subtitulo}>Período de consulta: {desde} al {hasta}</Text>
        </View>

        {/* Cajas de resumen */}
        <View style={styles.resumenBox}>
          <Text style={styles.resumenItem}>
            Total de viajes: <Text style={styles.resumenVal}>{viajes.length}</Text>
          </Text>
          <Text style={styles.resumenItem}>
            Completados: <Text style={styles.resumenVal}>{viajesCompletados}</Text>
          </Text>
          <Text style={styles.resumenItem}>
            En curso: <Text style={styles.resumenVal}>{viajesEnCurso}</Text>
          </Text>
          <Text style={styles.resumenItem}>
            Kilometraje total acumulado: <Text style={styles.resumenVal}>{totalKm.toLocaleString()} km</Text>
          </Text>
        </View>

        {/* Tabla */}
        <View style={styles.tabla}>
          <View style={styles.filaHeader}>
            <Text style={[styles.colPlaca, styles.textHeader]}>Placa</Text>
            <Text style={[styles.colPiloto, styles.textHeader]}>Piloto / Responsable</Text>
            <Text style={[styles.colDestino, styles.textHeader]}>Destino / Ruta</Text>
            <Text style={[styles.colSalida, styles.textHeader]}>Hora Salida</Text>
            <Text style={[styles.colKmSalida, styles.textHeader]}>Km Salida</Text>
            <Text style={[styles.colLlegada, styles.textHeader]}>Hora Llegada</Text>
            <Text style={[styles.colKmLlegada, styles.textHeader]}>Km Llegada</Text>
            <Text style={[styles.colRecorrido, styles.textHeader]}>Recorrido</Text>
          </View>

          {viajes.length === 0 && (
            <View style={styles.fila}>
              <Text style={{ fontStyle: 'italic', color: '#64748B' }}>
                No hay viajes registrados en el período seleccionado.
              </Text>
            </View>
          )}

          {viajes.map((v) => (
            <View key={v.id} style={styles.fila} wrap={false}>
              <Text style={[styles.colPlaca, { fontWeight: 'bold' }]}>{v.placa}</Text>
              <Text style={styles.colPiloto}>{v.piloto}</Text>
              <Text style={styles.colDestino}>{v.destino || '—'}</Text>
              <Text style={styles.colSalida}>{formatearHora(v.hora_salida)}</Text>
              <Text style={styles.colKmSalida}>{v.km_salida.toLocaleString()}</Text>
              <Text style={styles.colLlegada}>{v.hora_llegada ? formatearHora(v.hora_llegada) : 'Pendiente'}</Text>
              <Text style={styles.colKmLlegada}>
                {v.km_llegada != null ? v.km_llegada.toLocaleString() : '—'}
              </Text>
              <Text style={[styles.colRecorrido, { fontWeight: 'bold' }]}>
                {v.km_recorridos != null ? `+${v.km_recorridos.toLocaleString()} km` : '—'}
              </Text>
            </View>
          ))}
        </View>

        {/* Totales */}
        <View style={styles.totalesRow}>
          <Text style={styles.totalText}>Total viajes: {viajes.length}</Text>
          <Text style={styles.totalText}>Distancia acumulada: {totalKm.toLocaleString()} km</Text>
        </View>
      </Page>
    </Document>
  )
}
