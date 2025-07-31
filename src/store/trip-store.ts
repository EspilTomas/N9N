import { create } from "zustand"
import { dataService } from "@/services/data-service"
import type { Trip } from "@/lib/supabase"

export interface Notification {
  id: string
  message: string
  type: "info" | "warning" | "error" | "success"
  timestamp: Date
  read?: boolean
}

interface TripStore {
  trips: Trip[]
  notifications: Notification[]
  loading: boolean
  error: string | null

  // Acciones
  fetchTrips: () => Promise<void>
  addTrip: (trip: Omit<Trip, "id" | "created_at" | "updated_at">) => Promise<void>
  reassignTrip: (tripId: string, newConductorId: string, newConductorName: string) => Promise<void>
  addNotification: (notification: Notification) => void
  markNotificationAsRead: (id: string) => void
  getUnreadNotifications: () => Notification[]
  refreshData: () => Promise<void>
}

export const useTripStore = create<TripStore>((set, get) => ({
  trips: [],
  notifications: [],
  loading: false,
  error: null,

  fetchTrips: async () => {
    set({ loading: true, error: null })
    try {
      const trips = await dataService.trips.getAll()
      set({ trips, loading: false })
    } catch (error) {
      console.error("Error fetching trips:", error)
      set({
        error: "Error al cargar viajes",
        loading: false,
      })
    }
  },

  addTrip: async (tripData) => {
    try {
      const newTrip = await dataService.trips.create(tripData)

      set((state) => ({
        trips: [newTrip, ...state.trips],
      }))

      // Disparar evento para sincronización
      window.dispatchEvent(
        new CustomEvent("trip-added", {
          detail: { trip: newTrip, timestamp: Date.now() },
        }),
      )
    } catch (error) {
      console.error("Error adding trip:", error)
      set({ error: "Error al crear viaje" })
      throw error
    }
  },

  reassignTrip: async (tripId, newConductorId, newConductorName) => {
    try {
      await dataService.trips.reassign(tripId, newConductorId, newConductorName)

      set((state) => ({
        trips: state.trips.map((trip) =>
          trip.id_viaje === tripId
            ? { ...trip, conductor_id: newConductorId, conductor_nombre: newConductorName }
            : trip,
        ),
      }))

      // Disparar evento para sincronización
      window.dispatchEvent(
        new CustomEvent("trip-reassigned", {
          detail: { tripId, newConductorId, newConductorName, timestamp: Date.now() },
        }),
      )
    } catch (error) {
      console.error("Error reassigning trip:", error)
      set({ error: "Error al reasignar viaje" })
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
    }))

    // Disparar evento para sincronización
    window.dispatchEvent(
      new CustomEvent("notification-added", {
        detail: { notification, timestamp: Date.now() },
      }),
    )
  },

  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
    })),

  getUnreadNotifications: () => {
    const { notifications } = get()
    return notifications.filter((notif) => !notif.read)
  },

  refreshData: async () => {
    await get().fetchTrips()
  },
}))

export type { Trip }
