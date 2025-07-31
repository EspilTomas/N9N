import { create } from "zustand"
import { dataService } from "@/services/data-service"
import type { Driver } from "@/lib/supabase"

interface DriverStore {
  drivers: Driver[]
  loading: boolean
  error: string | null

  // Acciones
  fetchDrivers: () => Promise<void>
  updateDriverStatus: (id: string, estado: Driver["estado"]) => Promise<void>
  updateDriverHours: (id: string, horasUsadas: number) => Promise<void>
  getAvailableDrivers: () => Driver[]
  refreshData: () => Promise<void>
}

export const useDriverStore = create<DriverStore>((set, get) => ({
  drivers: [],
  loading: false,
  error: null,

  fetchDrivers: async () => {
    set({ loading: true, error: null })
    try {
      const drivers = await dataService.drivers.getAll()
      set({ drivers, loading: false })
    } catch (error) {
      console.error("Error fetching drivers:", error)
      set({
        error: "Error al cargar conductores",
        loading: false,
      })
    }
  },

  updateDriverStatus: async (id: string, estado: Driver["estado"]) => {
    try {
      await dataService.drivers.updateStatus(id, estado)

      // Actualizar estado local
      set((state) => ({
        drivers: state.drivers.map((driver) => (driver.id === id ? { ...driver, estado } : driver)),
      }))

      // Disparar evento para sincronización
      window.dispatchEvent(
        new CustomEvent("driver-status-changed", {
          detail: { id, estado, timestamp: Date.now() },
        }),
      )
    } catch (error) {
      console.error("Error updating driver status:", error)
      set({ error: "Error al actualizar estado del conductor" })
    }
  },

  updateDriverHours: async (id: string, horasUsadas: number) => {
    try {
      await dataService.drivers.updateHours(id, horasUsadas)

      // Actualizar estado local
      set((state) => ({
        drivers: state.drivers.map((driver) =>
          driver.id === id
            ? {
                ...driver,
                horas_usadas_mes: Math.min(driver.horas_usadas_mes + horasUsadas, 180),
                horas_disponibles: driver.horas_usadas_mes + horasUsadas >= 180 ? 0 : driver.horas_disponibles,
              }
            : driver,
        ),
      }))

      // Disparar evento para sincronización
      window.dispatchEvent(
        new CustomEvent("driver-hours-changed", {
          detail: { id, horasUsadas, timestamp: Date.now() },
        }),
      )
    } catch (error) {
      console.error("Error updating driver hours:", error)
      set({ error: "Error al actualizar horas del conductor" })
    }
  },

  getAvailableDrivers: () => {
    const { drivers } = get()
    return drivers.filter(
      (driver) => driver.estado === "disponible" && driver.horas_disponibles > 0 && driver.horas_usadas_mes < 180,
    )
  },

  refreshData: async () => {
    await get().fetchDrivers()
  },
}))

export type { Driver }
