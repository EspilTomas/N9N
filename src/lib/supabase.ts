import { createClient } from "@supabase/supabase-js"

// Your Supabase project configuration
const supabaseUrl = "https://llpphdvyaycqpcprlzcy.supabase.co"
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxscHBoZHZ5YXljcXBjcHJsemN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMjI3NjUsImV4cCI6MjA2ODY5ODc2NX0.s1adX_BabHWRrYsdyxWa6ILnFUxyAeRciI3_2MVhX5Y"

export const supabase = createClient(supabaseUrl, supabaseKey)

// Tipos de datos basados en tu base de datos
export interface Driver {
  id: string
  nombre: string
  licencia: string
  turno: string
  horas_disponibles: number
  horas_usadas_mes: number
  estado: "disponible" | "ocupado" | "mantenimiento"
  created_at?: string
  updated_at?: string
}

export interface Truck {
  id: string
  patente: string
  modelo: string
  año: string
  color: string
  acreditaciones: string
  estado: "disponible" | "ocupado" | "mantenimiento"
  created_at?: string
  updated_at?: string
}

export interface Trailer {
  id: string
  codigo: string
  tipo: string
  capacidad: string
  rev_tecnica: string
  estado: "disponible" | "ocupado" | "mantenimiento"
  created_at?: string
  updated_at?: string
}

export interface Trip {
  id: string
  id_viaje: string
  cliente: string
  ruta: string
  fecha: string
  hora: string
  conductor_id: string
  conductor_nombre: string
  tracto_patente: string
  rampla_codigo: string
  estado: "agendado" | "en-curso" | "completado"
  horas_estimadas: number
  created_at?: string
  updated_at?: string
}
