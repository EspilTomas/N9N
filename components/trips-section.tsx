import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTripStore } from "@/store/trip-store"
import { th } from "date-fns/locale"

export function TripsSection() {
  const { trips } = useTripStore()

  const getStatusBadge = (estado: string) => {
    const statusConfig = {
      agendado: { label: "Agendado", className: "bg-blue-100 text-blue-800" },
      "en-curso": { label: "En Curso", className: "bg-orange-100 text-orange-800" },
      completado: { label: "Completado", className: "bg-green-100 text-green-800" },
    }

    const config = statusConfig[estado as keyof typeof statusConfig]
    return <Badge className={config.className}>{config.label}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Registro de Viajes</CardTitle>
          <Button>Nuevo Viaje</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-semibold bg-gray-50">ID Viaje</th>
                <th className="text-left p-3 font-semibold bg-gray-50">Cliente</th>
                <th className="text-left p-3 font-semibold bg-gray-50">Ruta</th>
                <th className="text-left p-3 font-semibold bg-gray-50">Fecha</th>
                <th className="text-left p-3 font-semibold bg-gray-50">Conductor</th>
                <th className="text-left p-3 font-semibold bg-gray-50">Tracto</th>
                <th className="text-left p-3 font-semibold bg-gray-50">Rampla</th>
                <th className="text-left p-3 font-semibold bg-gray-50">Estado</th>
                <th className="text-left p-3 font-semibold bg-gray-50">Horas Est.</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip.id_viaje} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono">{trip.id_viaje}</td>
                  <td className="p-3">{trip.cliente}</td>
                  <td className="p-3">{trip.ruta}</td>
                  <td className="p-3">{trip.fecha}</td>
                  <td className="p-3">{trip.conductor_nombre}</td>
                  <td className="p-3 font-mono">{trip.tracto_patente}</td>
                  <td className="p-3">{trip.rampla_codigo}</td>
                  <td className="p-3">{getStatusBadge(trip.estado)}</td>
                  <td className="p-3">{trip.horas_estimadas}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
