"use client"

import { useEffect } from "react"
import { useDriverStore } from "@/store/driver-store"
import { useTripStore } from "@/store/trip-store"

export function useCrossTabSync() {
  const driverStore = useDriverStore()
  const tripStore = useTripStore()

  useEffect(() => {
    // Función para manejar cambios en localStorage desde otras pestañas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "driver-store" && e.newValue) {
        console.log("🔄 Sincronizando conductores desde otra pestaña...")
        driverStore.syncFromStorage()
      }

      if (e.key === "trip-store" && e.newValue) {
        console.log("🔄 Sincronizando viajes desde otra pestaña...")
        tripStore.syncFromStorage()
      }
    }

    // Función para manejar eventos personalizados en la misma pestaña
    const handleDriverStatusChange = (e: CustomEvent) => {
      console.log("👨‍💼 Estado de conductor cambiado:", e.detail)
      // Mostrar notificación toast si es necesario
    }

    const handleTripAdded = (e: CustomEvent) => {
      console.log("🚛 Nuevo viaje agregado:", e.detail)
      // Mostrar notificación toast si es necesario
    }

    const handleNotificationAdded = (e: CustomEvent) => {
      console.log("🔔 Nueva notificación:", e.detail)
      // Mostrar notificación toast si es necesario
    }

    // Escuchar cambios en localStorage (entre pestañas)
    window.addEventListener("storage", handleStorageChange)

    // Escuchar eventos personalizados (misma pestaña)
    window.addEventListener("driver-status-changed", handleDriverStatusChange as EventListener)
    window.addEventListener("trip-added", handleTripAdded as EventListener)
    window.addEventListener("notification-added", handleNotificationAdded as EventListener)

    // Cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("driver-status-changed", handleDriverStatusChange as EventListener)
      window.removeEventListener("trip-added", handleTripAdded as EventListener)
      window.removeEventListener("notification-added", handleNotificationAdded as EventListener)
    }
  }, [driverStore, tripStore])

  // Función para forzar sincronización manual
  const forcSync = () => {
    console.log("🔄 Forzando sincronización manual...")
    driverStore.syncFromStorage()
    tripStore.syncFromStorage()
  }

  return { forcSync }
}
