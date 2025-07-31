"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield } from "lucide-react"

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  userRole?: string
}

export function Sidebar({ activeSection, onSectionChange, userRole }: SidebarProps) {
  const allNavItems = [
    { id: "chatbot", label: "💬 Chatbot Cliente", icon: "💬", roles: ["operador", "admin"] },
    { id: "conductores", label: "👨‍💼 Conductores", icon: "👨‍💼", roles: ["rrhh", "admin"] },
    { id: "tractos", label: "🚛 Tractos", icon: "🚛", roles: ["taller", "admin"] },
    { id: "ramplas", label: "🚚 Ramplas", icon: "🚚", roles: ["taller", "admin"] },
    { id: "viajes", label: "📋 Registro Viajes", icon: "📋", roles: ["operador", "admin"] },
    { id: "database-test", label: "🔧 Test BD", icon: "🔧", roles: ["admin"] },
  ]

  const navItems = allNavItems.filter((item) => !userRole || item.roles.includes(userRole))

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-5">
      {/* Indicador de rol de administrador */}
      {userRole === "admin" && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-600" />
            <Badge variant="destructive" className="text-xs">
              ADMINISTRADOR
            </Badge>
          </div>
          <p className="text-xs text-red-600 mt-1">Acceso completo al sistema</p>
        </div>
      )}

      <div className="space-y-2">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? "default" : "ghost"}
            className={`w-full justify-start text-left transition-all duration-200 ${
              activeSection === item.id ? "bg-blue-600 text-white shadow-md" : "hover:bg-gray-100 hover:translate-x-1"
            }`}
            onClick={() => onSectionChange(item.id)}
          >
            <span className="flex items-center justify-between w-full">
              {item.label}
              {userRole === "admin" && (
                <Badge variant="outline" className="text-xs ml-2">
                  Admin
                </Badge>
              )}
            </span>
          </Button>
        ))}
      </div>

      {/* Información de permisos para admin */}
      {userRole === "admin" && (
        <div className="mt-6 p-3 bg-gray-100 rounded-lg">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Permisos de Administrador:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>✅ Chatbot y Viajes (Operador)</li>
            <li>✅ Conductores (RRHH)</li>
            <li>✅ Tractos y Ramplas (Taller)</li>
            <li>✅ Supervisión completa</li>
          </ul>
        </div>
      )}
    </div>
  )
}
