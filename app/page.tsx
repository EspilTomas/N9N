"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ChatbotSection } from "@/components/chatbot-section"
import { DriversSection } from "@/components/drivers-section"
import { TrucksSection } from "@/components/trucks-section"
import { TrailersSection } from "@/components/trailers-section"
import { TripsSection } from "@/components/trips-section"
import { SyncNotifications } from "@/components/sync-notifications"
import { useDriverStore } from "@/store/driver-store"
import { useTripStore } from "@/store/trip-store"
import { useVehicleStore } from "@/store/vehicle-store"
import { useCrossTabSync } from "@/hooks/use-cross-tab-sync"
import { initializeEmailJS } from "@/services/email-service"
import { DatabaseTest } from "@/components/database-test"

export default function Home() {
  const [isClient, setIsClient] = useState(false)
  const [activeSection, setActiveSection] = useState("chatbot")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)

  const { drivers, updateDriverStatus, fetchDrivers } = useDriverStore()
  const { trips, reassignTrip, addNotification, fetchTrips } = useTripStore()
  const { fetchTrucks, fetchTrailers } = useVehicleStore()

  // Hook para sincronización entre pestañas
  useCrossTabSync()

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Inicializar EmailJS al cargar la aplicación
  useEffect(() => {
    initializeEmailJS()
  }, [])

  // Verificar reasignaciones cuando cambie el estado de conductores
  useEffect(() => {
    const checkReassignments = () => {
      trips.forEach((trip) => {
        if (trip.estado === "agendado" || trip.estado === "en-curso") {
          const conductor = drivers.find((d) => d.id === trip.conductorId)
          if (conductor && conductor.estado !== "disponible") {
            // Buscar conductor disponible para reasignar
            const conductorDisponible = drivers.find(
              (d) => d.estado === "disponible" && d.horasDisponibles > 0 && d.id !== conductor.id,
            )

            if (conductorDisponible) {
              reassignTrip(trip.idViaje, conductorDisponible.id, conductorDisponible.nombre)
              addNotification({
                id: Date.now().toString(),
                message: `Viaje ${trip.idViaje} reasignado de ${conductor.nombre} a ${conductorDisponible.nombre} debido a cambio de estado`,
                type: "warning",
                timestamp: new Date(),
              })
            } else {
              addNotification({
                id: Date.now().toString(),
                message: `⚠️ Viaje ${trip.idViaje} requiere reasignación manual - No hay conductores disponibles`,
                type: "error",
                timestamp: new Date(),
              })
            }
          }
        }
      })
    }

    checkReassignments()
  }, [drivers, trips, reassignTrip, addNotification])

  const handleLogin = (credentials: { username: string; password: string }) => {
    // Simulación de login - en producción sería una API real
    const users = {
      admin: { name: "Administrador Nazar", role: "admin" },
      operador: { name: "Operador Nazar", role: "operador" },
      rrhh: { name: "RRHH Nazar", role: "rrhh" },
      taller: { name: "Jefe Taller", role: "taller" },
    }

    if (credentials.password === "nazar2025" && users[credentials.username as keyof typeof users]) {
      const userData = users[credentials.username as keyof typeof users]
      setUser(userData)
      setIsLoggedIn(true)
      return true
    }
    return false
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
  }

  const getFirstAllowedSection = () => {
    if (!user) return null

    const permissions = {
      admin: ["chatbot", "viajes", "conductores", "tractos", "ramplas"], // Admin ve todo
      operador: ["chatbot", "viajes"],
      rrhh: ["conductores"],
      taller: ["tractos", "ramplas"],
    }

    return permissions[user.role as keyof typeof permissions]?.[0] || null
  }

  const renderActiveSection = () => {
    // Verificar permisos según el rol
    const hasPermission = (section: string) => {
      if (!user) return false

      const permissions = {
        admin: ["chatbot", "viajes", "conductores", "tractos", "ramplas"], // Admin tiene acceso a todo
        operador: ["chatbot", "viajes"],
        rrhh: ["conductores"],
        taller: ["tractos", "ramplas"],
      }

      return permissions[user.role as keyof typeof permissions]?.includes(section) || false
    }

    if (!hasPermission(activeSection)) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Acceso Restringido</h3>
            <p className="text-gray-500">No tienes permisos para acceder a esta sección.</p>
          </div>
        </div>
      )
    }

    switch (activeSection) {
      case "chatbot":
        return <ChatbotSection />
      case "conductores":
        return <DriversSection />
      case "tractos":
        return <TrucksSection />
      case "ramplas":
        return <TrailersSection />
      case "viajes":
        return <TripsSection />
      case "database-test":
        return <DatabaseTest />
      default:
        // Redirigir a la primera sección permitida
        const firstAllowedSection = getFirstAllowedSection()
        if (firstAllowedSection && firstAllowedSection !== activeSection) {
          setActiveSection(firstAllowedSection)
        }
        return <div>Cargando...</div>
    }
  }

  // Establecer sección inicial según el rol
  useEffect(() => {
    if (user) {
      const firstAllowed = getFirstAllowedSection()
      if (firstAllowed) {
        setActiveSection(firstAllowed)
      }
    }
  }, [user])

  // Cargar datos iniciales de Supabase
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          drivers.length === 0 && fetchDrivers(),
          trips.length === 0 && fetchTrips(),
          fetchTrucks(),
          fetchTrailers(),
        ])
      } catch (error) {
        console.error("Error loading initial data:", error)
      }
    }

    if (isLoggedIn) {
      loadInitialData()
    }
  }, [isLoggedIn])

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-5">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <Header user={user} onLogout={handleLogout} />
        <div className="flex min-h-[600px]">
          <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} userRole={user?.role} />
          <div className="flex-1 p-5">{renderActiveSection()}</div>
        </div>
      </div>

      {/* Notificaciones de sincronización */}
      {isClient && <SyncNotifications />}
    </div>
  )
}
