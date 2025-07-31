import { create } from "zustand"
import { dataService } from "@/services/data-service"
import type { Truck, Trailer } from "@/lib/supabase"

interface VehicleStore {
  trucks: Truck[]
  trailers: Trailer[]
  loading: boolean
  error: string | null

  // Acciones para Tractos
  fetchTrucks: () => Promise<void>
  updateTruckStatus: (id: string, estado: Truck["estado"]) => Promise<void>
  getAvailableTrucks: () => Truck[]

  // Acciones para Ramplas
  fetchTrailers: () => Promise<void>
  updateTrailerStatus: (id: string, estado: Trailer["estado"]) => Promise<void>
  getAvailableTrailers: () => Trailer[]

  // Acciones generales
  refreshData: () => Promise<void>
}

export const useVehicleStore = create<VehicleStore>((set, get) => ({
  trucks: [],
  trailers: [],
  loading: false,
  error: null,

  // Tractos
  fetchTrucks: async () => {
    set({ loading: true, error: null })
    try {
      const trucks = await dataService.trucks.getAll()
      set((state) => ({ ...state, trucks, loading: false }))
    } catch (error) {
      console.error("Error fetching trucks:", error)
      set({ error: "Error al cargar tractos", loading: false })
    }
  },

  updateTruckStatus: async (id: string, estado: Truck["estado"]) => {
    try {
      await dataService.trucks.updateStatus(id, estado)

      set((state) => ({
        trucks: state.trucks.map((truck) => (truck.id === id ? { ...truck, estado } : truck)),
      }))
    } catch (error) {
      console.error("Error updating truck status:", error)
      set({ error: "Error al actualizar estado del tracto" })
    }
  },

  getAvailableTrucks: () => {
    const { trucks } = get()
    return trucks.filter((truck) => truck.estado === "disponible")
  },

  // Ramplas
  fetchTrailers: async () => {
    set({ loading: true, error: null })
    try {
      const trailers = await dataService.trailers.getAll()
      set((state) => ({ ...state, trailers, loading: false }))
    } catch (error) {
      console.error("Error fetching trailers:", error)
      set({ error: "Error al cargar ramplas", loading: false })
    }
  },

  updateTrailerStatus: async (id: string, estado: Trailer["estado"]) => {
    try {
      await dataService.trailers.updateStatus(id, estado)

      set((state) => ({
        trailers: state.trailers.map((trailer) => (trailer.id === id ? { ...trailer, estado } : trailer)),
      }))
    } catch (error) {
      console.error("Error updating trailer status:", error)
      set({ error: "Error al actualizar estado de la rampla" })
    }
  },

  getAvailableTrailers: () => {
    const { trailers } = get()
    return trailers.filter((trailer) => trailer.estado === "disponible")
  },

  refreshData: async () => {
    await Promise.all([get().fetchTrucks(), get().fetchTrailers()])
  },
}))

export type { Truck, Trailer }
