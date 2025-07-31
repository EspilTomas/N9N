"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, Database, HardDrive } from "lucide-react"
import { dataService } from "@/services/data-service"

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkConnection = async () => {
      setIsChecking(true)
      try {
        const connected = await dataService.checkConnection()
        setIsConnected(connected)
      } catch (error) {
        setIsConnected(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkConnection()

    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000)

    return () => clearInterval(interval)
  }, [])

  if (isChecking) {
    return (
      <Badge variant="outline" className="animate-pulse">
        <Wifi className="w-3 h-3 mr-1" />
        Verificando...
      </Badge>
    )
  }

  return (
    <Badge variant={isConnected ? "default" : "secondary"} className={isConnected ? "bg-green-600" : "bg-yellow-600"}>
      {isConnected ? (
        <>
          <Database className="w-3 h-3 mr-1" />
          Supabase
        </>
      ) : (
        <>
          <HardDrive className="w-3 h-3 mr-1" />
          Datos Locales
        </>
      )}
    </Badge>
  )
}
