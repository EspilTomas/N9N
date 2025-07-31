"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Users, Truck, Calendar, Activity } from "lucide-react"
import { useDriverStore } from "@/store/driver-store"
import { useTripStore } from "@/store/trip-store"

export function AdminDashboard() {
  const { drivers } = useDriverStore()
  const { trips, notifications } = useTripStore()

  const stats = {
    totalDrivers: drivers.length,
    availableDrivers: drivers.filter((d) => d.estado === "disponible").length,
    totalTrips: trips.length,
    activeTrips: trips.filter((t) => t.estado === "en-curso").length,
    scheduledTrips: trips.filter((t) => t.estado === "agendado").length,
    unreadNotifications: notifications.filter((n) => !n.read).length,
  }

  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Panel de Administrador</h2>
            <p className="opacity-90">Vista general del sistema Nazar</p>
          </div>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conductores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDrivers}</div>
            <p className="text-xs text-muted-foreground">{stats.availableDrivers} disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viajes Totales</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTrips}</div>
            <p className="text-xs text-muted-foreground">{stats.activeTrips} en curso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viajes Agendados</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduledTrips}</div>
            <p className="text-xs text-muted-foreground">Próximos a ejecutar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notificaciones</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadNotifications}</div>
            <p className="text-xs text-muted-foreground">Sin leer</p>
          </CardContent>
        </Card>
      </div>

      {/* Información de Roles y Permisos */}
      <Card>
        <CardHeader>
          <CardTitle>Roles y Permisos del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-600" />
                  <span className="font-medium">Administrador</span>
                </div>
                <Badge variant="destructive">Acceso Total</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Operador</span>
                </div>
                <Badge variant="secondary">Chatbot + Viajes</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="font-medium">RRHH</span>
                </div>
                <Badge variant="secondary">Conductores</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium">Taller</span>
                </div>
                <Badge variant="secondary">Tractos + Ramplas</Badge>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Funciones del Administrador:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Supervisión completa del sistema
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Acceso a todos los módulos
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Gestión de conductores y recursos
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Monitoreo de viajes y operaciones
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Vista de todas las notificaciones
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Actividad Reciente */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notification) => (
              <div key={notification.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div
                  className={`w-2 h-2 rounded-full ${
                    notification.type === "success"
                      ? "bg-green-500"
                      : notification.type === "warning"
                        ? "bg-yellow-500"
                        : notification.type === "error"
                          ? "bg-red-500"
                          : "bg-blue-500"
                  }`}
                ></div>
                <div className="flex-1">
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-gray-500">{notification.timestamp.toLocaleString("es-CL")}</p>
                </div>
                {!notification.read && (
                  <Badge variant="outline" className="text-xs">
                    Nuevo
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
