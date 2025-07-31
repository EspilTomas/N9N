// Configuración de base de datos para el Sistema Nazar
export const DATABASE_CONFIG = {
  // Información de conexión Supabase
  SUPABASE_URL: "https://llpphdvyaycqpcprlzcy.supabase.co",
  SUPABASE_PROJECT_ID: "llpphdvyaycqpcprlzcy",

  // Información de conexión PostgreSQL directa
  POSTGRES_CONNECTION: {
    host: "aws-0-sa-east-1.pooler.supabase.com",
    port: 6543,
    database: "postgres",
    user: "postgres.llpphdvyaycqpcprlzcy",
     password: "Nazar123@123" // Se debe configurar como variable de entorno
  },

  // Configuración de tablas
  TABLES: {
    CONDUCTORES: "conductores",
    TRACTOS: "tractos",
    RAMPLAS: "ramplas",
    VIAJES: "viajes",
  },

  // Configuración de límites
  LIMITS: {
    MAX_MONTHLY_HOURS: 180,
    MAX_DAILY_HOURS: 12,
    MIN_REST_HOURS: 8,
  },

  // Clientes válidos
  VALID_CLIENTS: ["FALABELLA", "CODELCO", "WALMART"],

  // Estados válidos
  VALID_STATES: {
    DRIVER: ["disponible", "ocupado", "mantenimiento"],
    VEHICLE: ["disponible", "ocupado", "mantenimiento"],
    TRIP: ["agendado", "en-curso", "completado"],
  },
}

export default DATABASE_CONFIG
