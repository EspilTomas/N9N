import { supabase, type Driver, type Truck, type Trailer, type Trip } from "@/lib/supabase"

// Mock data as fallback
const mockDrivers: Driver[] = [
  {
    id: "c001",
    nombre: "Juan Pérez",
    licencia: "A3-A4",
    turno: "Mañana",
    horas_disponibles: 8,
    horas_usadas_mes: 120,
    estado: "disponible",
  },
  {
    id: "c002",
    nombre: "María González",
    licencia: "A3-A4",
    turno: "Tarde",
    horas_disponibles: 0,
    horas_usadas_mes: 160,
    estado: "ocupado",
  },
  {
    id: "c003",
    nombre: "Carlos Rodríguez",
    licencia: "A3-A4",
    turno: "Noche",
    horas_disponibles: 6,
    horas_usadas_mes: 90,
    estado: "mantenimiento",
  },
  {
    id: "c004",
    nombre: "Ana López",
    licencia: "A3-A4",
    turno: "Mañana",
    horas_disponibles: 8,
    horas_usadas_mes: 45,
    estado: "disponible",
  },
]

const mockTrucks: Truck[] = [
  {
    id: "t001",
    patente: "AB-1234",
    modelo: "Volvo FH",
    año: "2020",
    color: "Blanco",
    acreditaciones: "Puerto, Zona Franca",
    estado: "disponible",
  },
  {
    id: "t002",
    patente: "CD-5678",
    modelo: "Scania R450",
    año: "2019",
    color: "Azul",
    acreditaciones: "General",
    estado: "ocupado",
  },
  {
    id: "t003",
    patente: "EF-9012",
    modelo: "Mercedes Actros",
    año: "2021",
    color: "Blanco",
    acreditaciones: "Puerto",
    estado: "mantenimiento",
  },
]

const mockTrailers: Trailer[] = [
  {
    id: "r001",
    codigo: "R001",
    tipo: "Rampla Seca",
    capacidad: "25 ton",
    rev_tecnica: "2025-12-15",
    estado: "disponible",
  },
  {
    id: "r002",
    codigo: "R002",
    tipo: "Multitemperatura",
    capacidad: "20 ton",
    rev_tecnica: "2025-11-20",
    estado: "ocupado",
  },
  {
    id: "r003",
    codigo: "R003",
    tipo: "Cisterna",
    capacidad: "30 ton",
    rev_tecnica: "2025-08-10",
    estado: "mantenimiento",
  },
]

const mockTrips: Trip[] = [
  {
    id: "v001",
    id_viaje: "V001",
    cliente: "FALABELLA",
    ruta: "Santiago-Valparaíso",
    fecha: "2025-07-02",
    hora: "08:00",
    conductor_id: "c001",
    conductor_nombre: "Juan Pérez",
    tracto_patente: "AB-1234",
    rampla_codigo: "R001",
    estado: "agendado",
    horas_estimadas: 6,
  },
  {
    id: "v002",
    id_viaje: "V002",
    cliente: "CODELCO",
    ruta: "Santiago-Antofagasta",
    fecha: "2025-07-01",
    hora: "14:00",
    conductor_id: "c002",
    conductor_nombre: "María González",
    tracto_patente: "CD-5678",
    rampla_codigo: "R002",
    estado: "en-curso",
    horas_estimadas: 16,
  },
]

// Check if Supabase is properly configured
let isSupabaseAvailable = false

const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from("conductores").select("count").limit(1)
    if (error) {
      console.warn("Supabase connection failed, using mock data:", error.message)
      return false
    }
    console.log("✅ Supabase connection successful")
    return true
  } catch (error) {
    console.warn("Supabase connection failed, using mock data:", error)
    return false
  }
}

// Initialize connection check
checkSupabaseConnection().then((available) => {
  isSupabaseAvailable = available
})

// Unified data service that handles both Supabase and mock data
export const dataService = {
  // Driver services
  drivers: {
    async getAll(): Promise<Driver[]> {
      if (isSupabaseAvailable) {
        try {
          const { data, error } = await supabase.from("conductores").select("*").order("nombre")
          if (error) throw error
          return data || []
        } catch (error) {
          console.warn("Falling back to mock data for drivers:", error)
          isSupabaseAvailable = false
        }
      }
      return [...mockDrivers]
    },

    async getAvailable(): Promise<Driver[]> {
      const drivers = await this.getAll()
      return drivers.filter(
        (driver) => driver.estado === "disponible" && driver.horas_disponibles > 0 && driver.horas_usadas_mes < 180,
      )
    },

    async updateStatus(id: string, estado: Driver["estado"]): Promise<void> {
      if (isSupabaseAvailable) {
        try {
          const { error } = await supabase
            .from("conductores")
            .update({ estado, updated_at: new Date().toISOString() })
            .eq("id", id)
          if (error) throw error
          return
        } catch (error) {
          console.warn("Falling back to mock update for driver status:", error)
          isSupabaseAvailable = false
        }
      }
      // Update mock data
      const driver = mockDrivers.find((d) => d.id === id)
      if (driver) {
        driver.estado = estado
      }
    },

    async updateHours(id: string, horasAdicionales: number): Promise<void> {
      if (isSupabaseAvailable) {
        try {
          const { data: driver, error: fetchError } = await supabase
            .from("conductores")
            .select("horas_usadas_mes, horas_disponibles")
            .eq("id", id)
            .single()

          if (fetchError) throw fetchError

          const nuevasHorasUsadas = Math.min(driver.horas_usadas_mes + horasAdicionales, 180)
          const nuevasHorasDisponibles = nuevasHorasUsadas >= 180 ? 0 : driver.horas_disponibles

          const { error } = await supabase
            .from("conductores")
            .update({
              horas_usadas_mes: nuevasHorasUsadas,
              horas_disponibles: nuevasHorasDisponibles,
              updated_at: new Date().toISOString(),
            })
            .eq("id", id)

          if (error) throw error
          return
        } catch (error) {
          console.warn("Falling back to mock update for driver hours:", error)
          isSupabaseAvailable = false
        }
      }
      // Update mock data
      const driver = mockDrivers.find((d) => d.id === id)
      if (driver) {
        driver.horas_usadas_mes = Math.min(driver.horas_usadas_mes + horasAdicionales, 180)
        driver.horas_disponibles = driver.horas_usadas_mes >= 180 ? 0 : driver.horas_disponibles
      }
    },
  },

  // Truck services
  trucks: {
    async getAll(): Promise<Truck[]> {
      if (isSupabaseAvailable) {
        try {
          const { data, error } = await supabase.from("tractos").select("*").order("patente")
          if (error) throw error
          return data || []
        } catch (error) {
          console.warn("Falling back to mock data for trucks:", error)
          isSupabaseAvailable = false
        }
      }
      return [...mockTrucks]
    },

    async getAvailable(): Promise<Truck[]> {
      const trucks = await this.getAll()
      return trucks.filter((truck) => truck.estado === "disponible")
    },

    async updateStatus(id: string, estado: Truck["estado"]): Promise<void> {
      if (isSupabaseAvailable) {
        try {
          const { error } = await supabase
            .from("tractos")
            .update({ estado, updated_at: new Date().toISOString() })
            .eq("id", id)
          if (error) throw error
          return
        } catch (error) {
          console.warn("Falling back to mock update for truck status:", error)
          isSupabaseAvailable = false
        }
      }
      // Update mock data
      const truck = mockTrucks.find((t) => t.id === id)
      if (truck) {
        truck.estado = estado
      }
    },
  },

  // Trailer services
  trailers: {
    async getAll(): Promise<Trailer[]> {
      if (isSupabaseAvailable) {
        try {
          const { data, error } = await supabase.from("ramplas").select("*").order("codigo")
          if (error) throw error
          return data || []
        } catch (error) {
          console.warn("Falling back to mock data for trailers:", error)
          isSupabaseAvailable = false
        }
      }
      return [...mockTrailers]
    },

    async getAvailable(): Promise<Trailer[]> {
      const trailers = await this.getAll()
      return trailers.filter((trailer) => trailer.estado === "disponible")
    },

    async updateStatus(id: string, estado: Trailer["estado"]): Promise<void> {
      if (isSupabaseAvailable) {
        try {
          const { error } = await supabase
            .from("ramplas")
            .update({ estado, updated_at: new Date().toISOString() })
            .eq("id", id)
          if (error) throw error
          return
        } catch (error) {
          console.warn("Falling back to mock update for trailer status:", error)
          isSupabaseAvailable = false
        }
      }
      // Update mock data
      const trailer = mockTrailers.find((t) => t.id === id)
      if (trailer) {
        trailer.estado = estado
      }
    },
  },

  // Trip services
  trips: {
    async getAll(): Promise<Trip[]> {
      if (isSupabaseAvailable) {
        try {
          const { data, error } = await supabase.from("viajes").select("*").order("created_at", { ascending: false })
          if (error) throw error
          return data || []
        } catch (error) {
          console.warn("Falling back to mock data for trips:", error)
          isSupabaseAvailable = false
        }
      }
      return [...mockTrips]
    },

    async create(trip: Omit<Trip, "id" | "created_at" | "updated_at">): Promise<Trip> {
      if (isSupabaseAvailable) {
        try {
          const { data, error } = await supabase
            .from("viajes")
            .insert([
              {
                ...trip,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ])
            .select()
            .single()

          if (error) throw error
          return data
        } catch (error) {
          console.warn("Falling back to mock create for trip:", error)
          isSupabaseAvailable = false
        }
      }
      // Create in mock data
      const newTrip: Trip = {
        ...trip,
        id: `mock_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      mockTrips.unshift(newTrip)
      return newTrip
    },

    async updateStatus(id: string, estado: Trip["estado"]): Promise<void> {
      if (isSupabaseAvailable) {
        try {
          const { error } = await supabase
            .from("viajes")
            .update({ estado, updated_at: new Date().toISOString() })
            .eq("id", id)
          if (error) throw error
          return
        } catch (error) {
          console.warn("Falling back to mock update for trip status:", error)
          isSupabaseAvailable = false
        }
      }
      // Update mock data
      const trip = mockTrips.find((t) => t.id === id)
      if (trip) {
        trip.estado = estado
      }
    },

    async reassign(id: string, conductorId: string, conductorNombre: string): Promise<void> {
      if (isSupabaseAvailable) {
        try {
          const { error } = await supabase
            .from("viajes")
            .update({
              conductor_id: conductorId,
              conductor_nombre: conductorNombre,
              updated_at: new Date().toISOString(),
            })
            .eq("id", id)

          if (error) throw error
          return
        } catch (error) {
          console.warn("Falling back to mock reassign for trip:", error)
          isSupabaseAvailable = false
        }
      }
      // Update mock data
      const trip = mockTrips.find((t) => t.id === id)
      if (trip) {
        trip.conductor_id = conductorId
        trip.conductor_nombre = conductorNombre
      }
    },
  },

  // Utility functions
  async checkConnection(): Promise<boolean> {
    isSupabaseAvailable = await checkSupabaseConnection()
    return isSupabaseAvailable
  },

  isConnected(): boolean {
    return isSupabaseAvailable
  },
}
