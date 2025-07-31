"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Database, CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { dataService } from "@/services/data-service"

interface TestResult {
  table: string
  success: boolean
  count?: number
  error?: string
}

export function DatabaseTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connected" | "disconnected">("idle")

  const runTests = async () => {
    setIsLoading(true)
    setResults([])

    const tests: TestResult[] = []

    try {
      // Test connection
      const isConnected = await dataService.checkConnection()
      setConnectionStatus(isConnected ? "connected" : "disconnected")

      // Test each table
      const tableTests = [
        { name: "conductores", service: dataService.drivers.getAll },
        { name: "tractos", service: dataService.trucks.getAll },
        { name: "ramplas", service: dataService.trailers.getAll },
        { name: "viajes", service: dataService.trips.getAll },
      ]

      for (const test of tableTests) {
        try {
          const data = await test.service()
          tests.push({
            table: test.name,
            success: true,
            count: data.length,
          })
        } catch (error) {
          tests.push({
            table: test.name,
            success: false,
            error: error instanceof Error ? error.message : "Error desconocido",
          })
        }
      }
    } catch (error) {
      console.error("Error running tests:", error)
    }

    setResults(tests)
    setIsLoading(false)
  }

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case "connected":
        return (
          <Badge className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Conectado a Supabase
          </Badge>
        )
      case "disconnected":
        return (
          <Badge variant="secondary" className="bg-yellow-600">
            <AlertCircle className="w-3 h-3 mr-1" />
            Usando datos locales
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <Database className="w-3 h-3 mr-1" />
            Sin probar
          </Badge>
        )
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Test de Conexión a Base de Datos
        </CardTitle>
        <div className="flex items-center justify-between">
          {getStatusBadge()}
          <Button onClick={runTests} disabled={isLoading} size="sm">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Probando...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Probar Conexión
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            <strong>Configuración actual:</strong>
            <br />• Host: aws-0-sa-east-1.pooler.supabase.com
            <br />• Puerto: 6543
            <br />• Base de datos: postgres
            <br />• Proyecto: llpphdvyaycqpcprlzcy
          </AlertDescription>
        </Alert>

        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Resultados de las pruebas:</h4>
            {results.map((result) => (
              <div
                key={result.table}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="font-medium capitalize">{result.table}</span>
                </div>
                <div className="text-sm">
                  {result.success ? (
                    <Badge variant="outline" className="text-green-700">
                      {result.count} registros
                    </Badge>
                  ) : (
                    <span className="text-red-600">{result.error}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <strong>Para completar la configuración:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Obtén tu Supabase anon key desde el dashboard</li>
            <li>Ejecuta el script SQL en el editor de Supabase</li>
            <li>Actualiza la configuración en lib/supabase.ts</li>
            <li>Ejecuta este test para verificar la conexión</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
