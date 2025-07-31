"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useDriverStore, type Driver } from "@/store/driver-store"
import { useTripStore } from "@/store/trip-store"

export function DriversSection() {
  const { drivers, updateDriverStatus } = useDriverStore()
  const { addNotification } = useTripStore()

  const handleStatusChange = (driverId: string, newStatus: Driver["estado"]) => {
    const driver = drivers.find((d) => d.id === driverId)
    if (driver) {
      updateDriverStatus(driverId, newStatus)
      addNotification({
        id: Date.now().toString(),
        message: `Estado de ${driver.nombre} cambiado a: ${newStatus}`,
        type: "info",
        timestamp: new Date(),
      })
    }
  }

  const getStatusBadge = (estado: string) => {
    const statusConfig = {
      disponible: { label: "Disponible", className: "bg-green-100 text-green-800" },
      ocupado: { label: "En Ruta", className: "bg-red-100 text-red-800" },
      mantenimiento: { label: "Licencia Médica", className: "bg-yellow-100 text-yellow-800" },
    }

    const config = statusConfig[estado as keyof typeof statusConfig]
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getHoursProgress = (horasUsadas: number) => {
    return (horasUsadas / 180) * 100
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gestión de Conductores</CardTitle>
          <Button>Agregar Conductor</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-semibold bg-gray-50">ID</th>
                <th className="text-left p-3 font-semibold bg-gray-50">Nombre</th>
                <th className="text-left p-3 font-semibold bg-gray-50">Licencia</th>
                <th className="text-left p-3 font-semibold bg-gray-50">Turno</th>
                <th className="text-left p-3 font-semibold bg-gray-50">Horas Disponibles</th>
                <th className="text-left p-3 font-semibold bg-gray-50">Horas Mes (180h máx)</th>
                <th className="text-left p-3 font-semibold bg-gray-50">Estado</th>
                <th className="text-left p-3 font-semibold bg-gray-50">Cambiar Estado</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => {
                const hoursPercentage = getHoursProgress(driver.horas_usadas_mes)
                return (
                  <tr key={driver.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{driver.id}</td>
                    <td className="p-3">{driver.nombre}</td>
                    <td className="p-3">{driver.licencia}</td>
                    <td className="p-3">{driver.turno}</td>
                    <td className="p-3">{driver.horas_disponibles}h</td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{driver.horas_usadas_mes}h / 180h</span>
                          <span>{Math.round(hoursPercentage)}%</span>
                        </div>
                        <Progress value={hoursPercentage} className="h-2" />
                        {hoursPercentage >= 90 && <p className="text-xs text-red-600">⚠️ Cerca del límite</p>}
                      </div>
                    </td>
                    <td className="p-3">{getStatusBadge(driver.estado)}</td>
                    <td className="p-3">
                      <Select
                        value={driver.estado}
                        onValueChange={(value: Driver["estado"]) => handleStatusChange(driver.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disponible">Disponible</SelectItem>
                          <SelectItem value="ocupado">En Ruta</SelectItem>
                          <SelectItem value="mantenimiento">Licencia Médica</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
