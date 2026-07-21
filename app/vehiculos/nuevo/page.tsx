'use client'

import { useActionState } from 'react'
import { crearVehiculo } from '../actions'

export default function NuevoVehiculoPage() {
  const [estado, formAction, pending] = useActionState(crearVehiculo, { error: undefined })

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h1>Nuevo vehículo</h1>
      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input name="placa" placeholder="Placa" required />
        <input name="chasis" placeholder="Chasis" />
        <input name="marca" placeholder="Marca" />
        <input name="modelo" placeholder="Modelo" />
        <input name="capacidad" placeholder="Capacidad (ej. 10 toneladas)" />
        <select name="tipo_combustible" defaultValue="diesel">
          <option value="diesel">Diesel</option>
          <option value="gasolina">Gasolina</option>
        </select>
        <input
          name="km_intervalo_servicio"
          type="number"
          placeholder="Cada cuántos km se hace servicio"
          required
        />

        <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #ddd' }} />
        <p style={{ fontSize: 13, color: '#555', margin: 0 }}>
          Punto de partida para calcular el pendiente de servicio mientras no
          haya ninguna lectura o servicio registrado todavía.
        </p>

        <input
          name="km_inicial"
          type="number"
          placeholder="Km actual del vehículo (obligatorio)"
          required
        />
        <input
          name="km_referencia_servicio"
          type="number"
          placeholder="Km del último servicio real (opcional)"
        />
        <input
          name="fecha_referencia_servicio"
          type="date"
          placeholder="Fecha de ese último servicio (opcional)"
        />
        <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
          Si dejas los dos últimos en blanco, el intervalo completo empieza a
          contar desde el km actual.
        </p>

        {estado?.error && <p style={{ color: 'red' }}>{estado.error}</p>}
        <button type="submit" disabled={pending}>
          {pending ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
    </div>
  )
}
