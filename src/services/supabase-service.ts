import { supabase, type Driver, type Truck, type Trailer, type Trip } from "@/lib/supabase"

// Servicio para Conductores
export const driverService = {
  // Obtener todos los conductores
  async getAll(): Promise<Driver[]> {
    const { data, error } = await supabase.from("conductores").select("*").order("nombre")

    if (error) {
      console.error("Error fetching drivers:", error)
      throw error
    }

    return data || []
  },

  // Obtener conductores disponibles
  async getAvailable(): Promise<Driver[]> {
    const { data, error } = await supabase
      .from("conductores")
      .select("*")
      .eq("estado", "disponible")
      .gt("horas_disponibles", 0)
      .lt("horas_usadas_mes", 180)
      .order("horas_usadas_mes")

    if (error) {
      console.error("Error fetching available drivers:", error)
      throw error
    }

    return data || []
  },

  // Actualizar estado del conductor
  async updateStatus(id: string, estado: Driver["estado"]): Promise<void> {
    const { error } = await supabase
      .from("conductores")
      .update({
        estado,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating driver status:", error)
      throw error
    }
  },

  // Actualizar horas del conductor
  async updateHours(id: string, horasAdicionales: number): Promise<void> {
    // Primero obtenemos las horas actuales
    const { data: driver, error: fetchError } = await supabase
      .from("conductores")
      .select("horas_usadas_mes, horas_disponibles")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Error fetching driver hours:", fetchError)
      throw fetchError
    }

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

    if (error) {
      console.error("Error updating driver hours:", error)
      throw error
    }
  },
}

// Servicio para Tractos
export const truckService = {
  async getAll(): Promise<Truck[]> {
    const { data, error } = await supabase.from("tractos").select("*").order("patente")

    if (error) {
      console.error("Error fetching trucks:", error)
      throw error
    }

    return data || []
  },

  async getAvailable(): Promise<Truck[]> {
    const { data, error } = await supabase.from("tractos").select("*").eq("estado", "disponible").order("patente")

    if (error) {
      console.error("Error fetching available trucks:", error)
      throw error
    }

    return data || []
  },

  async updateStatus(id: string, estado: Truck["estado"]): Promise<void> {
    const { error } = await supabase
      .from("tractos")
      .update({
        estado,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating truck status:", error)
      throw error
    }
  },
}

// Servicio para Ramplas
export const trailerService = {
  async getAll(): Promise<Trailer[]> {
    const { data, error } = await supabase.from("ramplas").select("*").order("codigo")

    if (error) {
      console.error("Error fetching trailers:", error)
      throw error
    }

    return data || []
  },

  async getAvailable(): Promise<Trailer[]> {
    const { data, error } = await supabase.from("ramplas").select("*").eq("estado", "disponible").order("codigo")

    if (error) {
      console.error("Error fetching available trailers:", error)
      throw error
    }

    return data || []
  },

  async updateStatus(id: string, estado: Trailer["estado"]): Promise<void> {
    const { error } = await supabase
      .from("ramplas")
      .update({
        estado,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating trailer status:", error)
      throw error
    }
  },
}

// Servicio para Viajes
export const tripService = {
  async getAll(): Promise<Trip[]> {
    const { data, error } = await supabase.from("viajes").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching trips:", error)
      throw error
    }

    return data || []
  },

  async create(trip: Omit<Trip, "id" | "created_at" | "updated_at">): Promise<Trip> {
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

    if (error) {
      console.error("Error creating trip:", error)
      throw error
    }

    return data
  },

  async updateStatus(id: string, estado: Trip["estado"]): Promise<void> {
    const { error } = await supabase
      .from("viajes")
      .update({
        estado,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating trip status:", error)
      throw error
    }
  },

  async reassign(id: string, conductorId: string, conductorNombre: string): Promise<void> {
    const { error } = await supabase
      .from("viajes")
      .update({
        conductor_id: conductorId,
        conductor_nombre: conductorNombre,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("Error reassigning trip:", error)
      throw error
    }
  },
}
