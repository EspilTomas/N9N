"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { testEmailConfiguration } from "@/services/email-service"

export function EmailTestPanel() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null)
  const [message, setMessage] = useState("")

  const handleTestEmail = async () => {
    setIsLoading(true)
    setTestResult(null)
    setMessage("")

    try {
      const success = await testEmailConfiguration()

      if (success) {
        setTestResult("success")
        setMessage("✅ Email de prueba enviado exitosamente. Revisa tu bandeja de entrada.")
      } else {
        setTestResult("error")
        setMessage("❌ Error enviando email de prueba. Verifica la configuración de EmailJS.")
      }
    } catch (error) {
      setTestResult("error")
      setMessage("❌ Error inesperado. Revisa la consola para más detalles.")
      console.error("Error en test:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Test de Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">Prueba la configuración de EmailJS enviando un email de ejemplo.</p>

        <Button onClick={handleTestEmail} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Enviar Email de Prueba
            </>
          )}
        </Button>

        {testResult && (
          <Alert variant={testResult === "success" ? "default" : "destructive"}>
            {testResult === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <strong>Configuración requerida:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Service ID configurado</li>
            <li>Template ID configurado</li>
            <li>Public Key configurado</li>
            <li>Email del operador configurado</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
