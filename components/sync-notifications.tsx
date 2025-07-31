"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { X, Users, Truck, Bell } from "lucide-react"

interface SyncNotification {
  id: string
  type: "driver" | "trip" | "notification"
  message: string
  timestamp: number
}

export function SyncNotifications() {
  const [notifications, setNotifications] = useState<SyncNotification[]>([])

  useEffect(() => {
    const handleDriverChange = (e: CustomEvent) => {
      const notification: SyncNotification = {
        id: Date.now().toString(),
        type: "driver",
        message: `Estado de conductor actualizado`,
        timestamp: Date.now(),
      }
      setNotifications((prev) => [notification, ...prev.slice(0, 4)])

      // Auto-remove después de 5 segundos
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
      }, 5000)
    }

    const handleTripAdded = (e: CustomEvent) => {
      const notification: SyncNotification = {
        id: Date.now().toString(),
        type: "trip",
        message: `Nuevo viaje agregado: ${e.detail.trip?.idViaje}`,
        timestamp: Date.now(),
      }
      setNotifications((prev) => [notification, ...prev.slice(0, 4)])

      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
      }, 5000)
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "driver-store") {
        const notification: SyncNotification = {
          id: Date.now().toString(),
          type: "driver",
          message: "Datos de conductores sincronizados",
          timestamp: Date.now(),
        }
        setNotifications((prev) => [notification, ...prev.slice(0, 4)])

        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
        }, 3000)
      }

      if (e.key === "trip-store") {
        const notification: SyncNotification = {
          id: Date.now().toString(),
          type: "trip",
          message: "Datos de viajes sincronizados",
          timestamp: Date.now(),
        }
        setNotifications((prev) => [notification, ...prev.slice(0, 4)])

        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
        }, 3000)
      }
    }

    window.addEventListener("driver-status-changed", handleDriverChange as EventListener)
    window.addEventListener("trip-added", handleTripAdded as EventListener)
    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("driver-status-changed", handleDriverChange as EventListener)
      window.removeEventListener("trip-added", handleTripAdded as EventListener)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case "driver":
        return <Users className="w-4 h-4" />
      case "trip":
        return <Truck className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case "driver":
        return "bg-blue-500"
      case "trip":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <Card key={notification.id} className="animate-in slide-in-from-right-full duration-300 shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getColor(notification.type)}`}></div>
                {getIcon(notification.type)}
                <span className="text-sm font-medium">Sincronizado</span>
              </div>
              <button
                onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notification.id))}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
