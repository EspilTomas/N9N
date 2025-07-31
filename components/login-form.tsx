"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Truck, Lock, User, Shield } from "lucide-react"

interface LoginFormProps {
  onLogin: (credentials: { username: string; password: string }) => boolean
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = onLogin({ username, password })
      if (!success) {
        setError("Credenciales incorrectas. Intenta de nuevo.")
      }
    } catch (err) {
      setError("Error al iniciar sesión. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-5">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Sistema Nazar</CardTitle>
          <p className="text-gray-600">Acceso para Usuarios del Sistema</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-3">Credenciales de Demo:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200">
                <Shield className="w-4 h-4 text-red-600" />
                <div>
                  <p className="text-xs text-red-800 font-semibold">
                    <strong>Administrador:</strong> <code className="bg-red-100 px-1 rounded">admin</code> /{" "}
                    <code className="bg-red-100 px-1 rounded">nazar2025</code>
                  </p>
                  <p className="text-xs text-red-600">Acceso completo a todo el sistema</p>
                </div>
              </div>

              <p className="text-xs text-blue-600">
                <strong>Operador:</strong> <code className="bg-blue-100 px-1 rounded">operador</code> /{" "}
                <code className="bg-blue-100 px-1 rounded">nazar2025</code>
              </p>
              <p className="text-xs text-blue-600">
                <strong>RRHH:</strong> <code className="bg-blue-100 px-1 rounded">rrhh</code> /{" "}
                <code className="bg-blue-100 px-1 rounded">nazar2025</code>
              </p>
              <p className="text-xs text-blue-600">
                <strong>Taller:</strong> <code className="bg-blue-100 px-1 rounded">taller</code> /{" "}
                <code className="bg-blue-100 px-1 rounded">nazar2025</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
