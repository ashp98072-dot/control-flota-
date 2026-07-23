// Mock Supabase Client for Control de Flota
// Enables local, credential-free previews and testing

export interface Perfil {
  id: string
  nombre: string
  rol: 'admin' | 'piloto'
  activo: boolean
  created_at: string
}

export interface Vehiculo {
  id: string
  placa: string
  marca: string
  modelo: string
  tipo_combustible: 'diesel' | 'gasolina' | 'electrico' | 'hibrido'
  km_intervalo_servicio: number
  activo: boolean
  en_taller: boolean
  fecha_entrada_taller: string | null
  motivo_taller: string | null
}

export interface EstadoFlota {
  vehiculo_id: string
  placa: string
  marca: string
  modelo: string
  km_actual: number
  km_ultimo_servicio: number
  fecha_ultimo_servicio: string | null
  km_pendiente_servicio: number
}

export interface LecturaKm {
  id: string
  vehiculo_id: string
  fecha: string
  km_actual: number
  created_at: string
  conductor?: string
  notas?: string
}

export interface RegistroViaje {
  id: string
  fecha: string
  vehiculo_id: string
  piloto_id: string
  piloto_nombre?: string
  km_salida: number
  km_llegada?: number | null
  hora_salida: string
  hora_llegada?: string | null
  estado: 'abierto' | 'cerrado'
  destino?: string | null
  observaciones?: string | null
  vehiculos?: {
    placa: string
    marca: string
    modelo: string
  }
}

export interface Servicio {
  id: string
  vehiculo_id: string
  fecha: string
  km_al_servicio: number
  tipo_trabajo: string
  tipo: 'mantenimiento' | 'reparacion'
  costo: number
  observaciones: string
  dias_en_taller: number | null
  motivo_taller: string | null
  evidencias?: any[] | string | null
  vehiculos?: {
    placa: string
    marca: string
    modelo: string
  }
}

// In-Memory Database Storage
class MockDatabase {
  perfiles: Perfil[] = [
    { id: 'admin-id', nombre: 'Administrador Principal', rol: 'admin', activo: true, created_at: '2026-01-01T00:00:00Z' },
    { id: 'piloto-id', nombre: 'Juan Pérez (Piloto)', rol: 'piloto', activo: true, created_at: '2026-01-02T00:00:00Z' }
  ]

  vehiculos: Vehiculo[] = [
    { id: 'v1', placa: 'P-123ABC', marca: 'Toyota', modelo: 'Hilux 2022', tipo_combustible: 'diesel', km_intervalo_servicio: 5000, activo: true, en_taller: false, fecha_entrada_taller: null, motivo_taller: null },
    { id: 'v2', placa: 'P-456DEF', marca: 'Hino', modelo: '300 Series 2021', tipo_combustible: 'diesel', km_intervalo_servicio: 10000, activo: true, en_taller: true, fecha_entrada_taller: '2026-07-15', motivo_taller: 'Cambio de embrague' },
    { id: 'v3', placa: 'P-789GHI', marca: 'Isuzu', modelo: 'NPR 2023', tipo_combustible: 'diesel', km_intervalo_servicio: 8000, activo: true, en_taller: false, fecha_entrada_taller: null, motivo_taller: null }
  ]

  lecturas_km: LecturaKm[] = [
    { id: 'l1', vehiculo_id: 'v1', fecha: '2026-07-20', km_actual: 4800, created_at: '2026-07-20T12:00:00Z' },
    { id: 'l2', vehiculo_id: 'v2', fecha: '2026-07-19', km_actual: 10200, created_at: '2026-07-19T10:00:00Z' },
    { id: 'l3', vehiculo_id: 'v3', fecha: '2026-07-21', km_actual: 8200, created_at: '2026-07-21T08:00:00Z' }
  ]

  servicios: Servicio[] = [
    { id: 's1', vehiculo_id: 'v2', fecha: '2026-06-05', km_al_servicio: 10000, tipo_trabajo: 'Cambio de aceite y filtros', tipo: 'mantenimiento', costo: 1500, observaciones: 'Filtro original Hino', dias_en_taller: 1, motivo_taller: null }
  ]

  registros_viaje: RegistroViaje[] = [
    { id: 'viaje-1', fecha: '2026-07-21', vehiculo_id: 'v1', piloto_id: 'piloto-id', piloto_nombre: 'Juan Pérez (Piloto)', km_salida: 4500, km_llegada: 4800, hora_salida: '2026-07-21T07:30:00Z', hora_llegada: '2026-07-21T17:00:00Z', estado: 'cerrado', destino: 'Ruta Sur - Escuintla' },
    { id: 'viaje-2', fecha: '2026-07-22', vehiculo_id: 'v3', piloto_id: 'piloto-id', piloto_nombre: 'Juan Pérez (Piloto)', km_salida: 8200, km_llegada: null, hora_salida: '2026-07-22T08:00:00Z', hora_llegada: null, estado: 'abierto', destino: 'Ruta Nororiente - Zacapa' }
  ]

  // Dynamic View: estado_flota
  getEstadoFlota(): EstadoFlota[] {
    return this.vehiculos.map(v => {
      // Find latest km reading
      const readings = this.lecturas_km
        .filter(l => l.vehiculo_id === v.id)
        .sort((a, b) => b.km_actual - a.km_actual)
      const km_actual = readings[0]?.km_actual ?? 0

      // Find latest service info
      const services = this.servicios
        .filter(s => s.vehiculo_id === v.id && s.tipo === 'mantenimiento')
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      const latestService = services[0]
      const km_ultimo_servicio = latestService?.km_al_servicio ?? 0
      const fecha_ultimo_servicio = latestService?.fecha ?? null

      // Calculate km pending for next service
      const km_pendiente_servicio = km_ultimo_servicio + v.km_intervalo_servicio - km_actual

      return {
        vehiculo_id: v.id,
        placa: v.placa,
        marca: v.marca,
        modelo: v.modelo,
        km_actual,
        km_ultimo_servicio,
        fecha_ultimo_servicio,
        km_pendiente_servicio
      }
    })
  }

  getTableData(table: string): any[] {
    if (table === 'perfiles') return this.perfiles
    if (table === 'vehiculos') return this.vehiculos
    if (table === 'lecturas_km') return this.lecturas_km
    if (table === 'servicios') {
      return this.servicios.map(s => {
        const v = this.vehiculos.find(veh => veh.id === s.vehiculo_id)
        return {
          ...s,
          vehiculos: v ? { placa: v.placa, marca: v.marca, modelo: v.modelo } : undefined
        }
      })
    }
    if (table === 'registros_viaje') {
      return this.registros_viaje.map(r => {
        const v = this.vehiculos.find(veh => veh.id === r.vehiculo_id)
        return {
          ...r,
          vehiculos: v ? { placa: v.placa, marca: v.marca, modelo: v.modelo } : undefined
        }
      })
    }
    if (table === 'estado_flota') return this.getEstadoFlota()
    return []
  }

  addRecord(table: string, record: any) {
    if (table === 'perfiles') this.perfiles.push(record)
    else if (table === 'vehiculos') {
      this.vehiculos.push({
        en_taller: false,
        fecha_entrada_taller: null,
        motivo_taller: null,
        activo: true,
        ...record
      })
    }
    else if (table === 'lecturas_km') {
      this.lecturas_km.push(record)
    }
    else if (table === 'servicios') this.servicios.push(record)
    else if (table === 'registros_viaje') this.registros_viaje.push(record)
  }

  updateRecord(table: string, id: string, record: any) {
    const list = this.getTableData(table)
    const item = list.find(x => x.id === id)
    if (item) {
      Object.assign(item, record)
    }
  }

  deleteRecord(table: string, id: string) {
    if (table === 'perfiles') this.perfiles = this.perfiles.filter(x => x.id !== id)
    else if (table === 'vehiculos') this.vehiculos = this.vehiculos.filter(x => x.id !== id)
    else if (table === 'lecturas_km') this.lecturas_km = this.lecturas_km.filter(x => x.id !== id)
    else if (table === 'servicios') this.servicios = this.servicios.filter(x => x.id !== id)
    else if (table === 'registros_viaje') this.registros_viaje = this.registros_viaje.filter(x => x.id !== id)
  }
}

// Global variable persists in Node process memory during dev
const globalStorage = (globalThis as any)._mock_db || new MockDatabase()
if (!(globalThis as any)._mock_db) {
  ;(globalThis as any)._mock_db = globalStorage
}

class MockQueryBuilder {
  private table: string
  private data: any[]

  constructor(table: string) {
    this.table = table
    this.data = JSON.parse(JSON.stringify(globalStorage.getTableData(table)))
  }

  select(fields?: string) {
    return this
  }

  eq(field: string, value: any) {
    this.data = this.data.filter(x => x[field] === value)
    return this
  }

  neq(field: string, value: any) {
    this.data = this.data.filter(x => x[field] !== value)
    return this
  }

  in(field: string, values: any[]) {
    this.data = this.data.filter(x => values.includes(x[field]))
    return this
  }

  order(field: string, options?: { ascending?: boolean }) {
    const asc = options?.ascending !== false
    this.data.sort((a, b) => {
      const valA = a[field]
      const valB = b[field]
      if (valA < valB) return asc ? -1 : 1
      if (valA > valB) return asc ? 1 : -1
      return 0
    })
    return this
  }

  single() {
    return Promise.resolve({ data: this.data[0] || null, error: null })
  }

  maybeSingle() {
    return Promise.resolve({ data: this.data[0] || null, error: null })
  }

  limit(n: number) {
    this.data = this.data.slice(0, n)
    return this
  }

  async insert(record: any) {
    const newRecord = {
      id: record.id || Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      ...record
    }
    globalStorage.addRecord(this.table, newRecord)
    return { data: newRecord, error: null }
  }

  async upsert(record: any) {
    const list = globalStorage.getTableData(this.table)
    const existing = record.id ? list.find((x: any) => x.id === record.id) : null
    if (existing) {
      globalStorage.updateRecord(this.table, record.id, record)
      return { data: record, error: null }
    } else {
      return this.insert(record)
    }
  }

  async update(record: any) {
    this.data.forEach(item => {
      globalStorage.updateRecord(this.table, item.id, record)
    })
    return { data: this.data, error: null }
  }

  async delete() {
    this.data.forEach(item => {
      globalStorage.deleteRecord(this.table, item.id)
    })
    return { data: this.data, error: null }
  }

  // Chainable direct await support
  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return Promise.resolve({ data: this.data, error: null }).then(onfulfilled, onrejected)
  }
}

let currentMockUser: any = {
  id: 'admin-id',
  email: 'admin@controlflota.com',
  user_metadata: { nombre: 'Administrador Principal' }
}

export const mockSupabase = {
  from(table: string) {
    return new MockQueryBuilder(table)
  },

  async rpc(fnName: string, params: any) {
    if (fnName === 'registrar_salida_viaje') {
      const user = currentMockUser
      const piloto = globalStorage.perfiles.find((p: any) => p.id === user?.id) || { nombre: 'Piloto' }
      const viaje = {
        id: 'viaje-' + Math.random().toString(36).substr(2, 8),
        fecha: new Date().toISOString().split('T')[0],
        vehiculo_id: params.p_vehiculo_id,
        piloto_id: user?.id || 'piloto-id',
        piloto_nombre: params.p_piloto_nombre || piloto.nombre,
        km_salida: Number(params.p_km_salida),
        hora_salida: new Date().toISOString(),
        estado: 'abierto',
        destino: params.p_destino || null
      }
      globalStorage.addRecord('registros_viaje', viaje)
      globalStorage.addRecord('lecturas_km', {
        id: 'l-' + Math.random().toString(36).substr(2, 8),
        vehiculo_id: params.p_vehiculo_id,
        fecha: new Date().toISOString().split('T')[0],
        km_actual: Number(params.p_km_salida),
        created_at: new Date().toISOString(),
        conductor: viaje.piloto_nombre,
        notas: `Salida de viaje${viaje.destino ? ` (${viaje.destino})` : ''}`
      })
      return { data: viaje, error: null }
    }

    if (fnName === 'registrar_llegada_viaje') {
      const viaje = globalStorage.registros_viaje.find((v: any) => v.id === params.p_viaje_id)
      if (viaje) {
        viaje.km_llegada = Number(params.p_km_llegada)
        viaje.hora_llegada = new Date().toISOString()
        viaje.estado = 'cerrado'
        viaje.observaciones = params.p_observaciones || null

        globalStorage.addRecord('lecturas_km', {
          id: 'l-' + Math.random().toString(36).substr(2, 8),
          vehiculo_id: viaje.vehiculo_id,
          fecha: new Date().toISOString().split('T')[0],
          km_actual: Number(params.p_km_llegada),
          created_at: new Date().toISOString(),
          conductor: viaje.piloto_nombre || 'Piloto',
          notas: `Llegada de viaje${viaje.observaciones ? ` (${viaje.observaciones})` : ''}`
        })
      }
      return { data: viaje, error: null }
    }
    return { data: null, error: null }
  },

  auth: {
    async getUser() {
      return {
        data: { user: currentMockUser },
        error: null
      }
    },

    async signInWithPassword({ email }: { email: string }) {
      const emailLower = email.toLowerCase()
      let user = globalStorage.perfiles.find((p: Perfil) => p.nombre.toLowerCase().includes(emailLower.split('@')[0]))
      if (!user) {
        if (emailLower.includes('piloto')) {
          user = globalStorage.perfiles.find((p: Perfil) => p.rol === 'piloto')
        } else {
          user = globalStorage.perfiles.find((p: Perfil) => p.rol === 'admin')
        }
      }
      if (user) {
        currentMockUser = {
          id: user.id,
          email: email,
          user_metadata: { nombre: user.nombre }
        }
        return {
          data: { user: currentMockUser },
          error: null
        }
      }
      return { data: { user: null }, error: { message: 'Usuario no encontrado' } }
    },

    async signOut() {
      currentMockUser = {
        id: 'admin-id',
        email: 'admin@controlflota.com',
        user_metadata: { nombre: 'Administrador Principal' }
      }
      return { error: null }
    },

    admin: {
      async createUser({ email, password, user_metadata }: any) {
        const newId = 'user-' + Math.random().toString(36).substr(2, 9)
        const nombre = user_metadata?.nombre || email.split('@')[0]
        return {
          data: {
            user: {
              id: newId,
              email,
              user_metadata: { nombre }
            }
          },
          error: null
        }
      },
      async deleteUser(id: string) {
        return { data: { user: null }, error: null }
      }
    },

    onAuthStateChange(callback: any) {
      return { data: { subscription: { unsubscribe: () => {} } } }
    }
  }
}
