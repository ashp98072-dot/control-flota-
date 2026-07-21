'use client'

import { useActionState } from 'react'
import { actualizarVehiculo } from '../../actions'

export function FormularioEditar({ vehiculo }: { vehiculo: any }) {
  const actualizarConId = actualizarVehiculo.bind(null, vehiculo.id)
  const [estado, formAction, pending] = useActionState(actualizarConId, { error: undefined })

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h1>Editar vehículo</h1>
      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input name="placa" defaultValue={vehiculo.placa} required />
        <input name="chasis" defaultValue={vehiculo.chasis ?? ''} />
        <input name="marca" defaultValue={vehiculo.marca ?? ''} />
        <input name="modelo" defaultValue={vehiculo.modelo ?? ''} />
        <input name="capacidad" defaultValue={vehiculo.capacidad ?? ''} />
        <select name="tipo_combustible" defaultValue={vehiculo.tipo_combustible}>
          <option value="diesel">Diesel</option>
          <option value="gasolina">Gasolina</option>
        </select>
        <input
          name="km_intervalo_servicio"
          type="number"
          defaultValue={vehiculo.km_intervalo_servicio}
          required
        />
        {estado?.error && <p style={{ color: 'red' }}>{estado.error}</p>}
        <button type="submit" disabled={pending}>
          {pending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}