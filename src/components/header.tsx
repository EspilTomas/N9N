"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut, User, Shield, Crown } from "lucide-react"
import { ConnectionStatus } from "./connection-status"

interface HeaderProps {
  user?: { name: string; role: string } | null
  onLogout?: () => void
}

export function Header({ user, onLogout }: HeaderProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="w-4 h-4 text-yellow-600" />
      case "operador":
        return <User className="w-4 h-4" />
      case "rrhh":
        return <User className="w-4 h-4" />
      case "taller":
        return <User className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="destructive" className="ml-2 text-black bg-white">
            <Shield className="w-3 h-3 mr-1" />
            ADMIN
          </Badge>
        )
      case "operador":
        return (
          <Badge variant="secondary" className="ml-2">
            OPERADOR
          </Badge>
        )
      case "rrhh":
        return (
          <Badge variant="secondary" className="ml-2">
            RRHH
          </Badge>
        )
      case "taller":
        return (
          <Badge variant="secondary" className="ml-2">
            TALLER
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-5">
      <div className="flex justify-between items-start">
        <div className="text-center flex-1 leading-7 my-0">
          <h1 className="text-4xl font-bold mb-2">🚛 Sistema Nazar</h1>
          <p className="text-lg opacity-90">Agendamiento Inteligente de Camiones</p>
          {user?.role === "admin" && (
            <div className="mt-2 flex justify-center">
              <Badge variant="destructive" className="bg-transparent">
                <Crown className="w-3 h-3 mr-1" />
                Modo Administrador - Acceso Completo
              </Badge>
            </div>
          )}

          {/* Connection Status */}
          <div className="mt-2 flex justify-center">
            <ConnectionStatus />
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              {getRoleIcon(user.role)}
              <div className="text-right">
                <div className="flex items-center">
                  <span>{user.name}</span>
                  {getRoleBadge(user.role)}
                </div>
                {user.role === "admin" && <p className="text-xs text-gray-300">Supervisor del Sistema</p>}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="text-white hover:bg-slate-600 hover:text-white bg-transparent border-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
