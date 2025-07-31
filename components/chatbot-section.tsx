"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Bell, MessageSquare, Calendar as CalendarSchedule } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useDriverStore } from "@/store/driver-store"
import { useTripStore } from "@/store/trip-store"
import { sendTripNotificationEmail, type TripEmailData } from "@/services/email-service"

interface Message {
  text: string
  sender: "user" | "bot"
  timestamp: Date
  buttons?: Array<{ text: string; value: string }>
  showCalendar?: boolean
  showTimePicker?: boolean
}

interface TripData {
  clienteId: string
  rutaSeleccionada: string
  fechaSeleccionada: Date | undefined
  horaSeleccionada: string
}

type ChatMode = "menu" | "schedule" | "consulta"

export function ChatbotSection() {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "¡Hola! Soy el asistente virtual de Nazar. ¿En qué puedo ayudarte hoy?",
      sender: "bot",
      timestamp: new Date(),
      buttons: [
        { text: "📅 Agendar Viaje", value: "schedule" },
        { text: "💬 Consultar Información", value: "consulta" }
      ]
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [chatMode, setChatMode] = useState<ChatMode>("menu")
  const [chatStep, setChatStep] = useState(0)
  const [sessionId, setSessionId] = useState("")
  const [isLoadingN8n, setIsLoadingN8n] = useState(false)
  const [tripData, setTripData] = useState<TripData>({
    clienteId: "",
    rutaSeleccionada: "",
    fechaSeleccionada: undefined,
    horaSeleccionada: "",
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

  const { getAvailableDrivers, updateDriverHours } = useDriverStore()
  const { addTrip, addNotification, getUnreadNotifications } = useTripStore()
  const unreadNotifications = getUnreadNotifications()

  const clientesRutas = {
    FALABELLA: ["Santiago-Valparaíso", "Santiago-Concepción", "Santiago-La Serena", "Santiago-Temuco"],
    CODELCO: ["Santiago-Antofagasta", "Santiago-Calama", "Antofagasta-Santiago", "Calama-Santiago"],
    WALMART: ["Santiago-Valparaíso", "Santiago-Rancagua", "Santiago-Talca", "Valparaíso-Santiago"],
  }

  const horariosDisponibles = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
  ]

  // Generar sessionId único al iniciar modo consulta
  useEffect(() => {
    if (chatMode === "consulta" && !sessionId) {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setSessionId(newSessionId)
    }
  }, [chatMode, sessionId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (text: string, sender: "user" | "bot", options?: Partial<Message>) => {
    const newMessage: Message = {
      text,
      sender,
      timestamp: new Date(),
      ...options,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  // Función para llamar al endpoint de n8n
  const queryN8nWorkflow = async (prompt: string) => {
    setIsLoadingN8n(true)
    try {
      const response = await fetch('https://soperon891.app.n8n.cloud/webhook-test/778ebce0-5a0e-4f3d-9feb-278764135eeb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          sessionId: sessionId
        })
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      return data.output || "Lo siento, no pude obtener una respuesta del sistema."
    } catch (error) {
      console.error('Error consultando n8n workflow:', error)
      return "Lo siento, hubo un problema al procesar tu consulta. Por favor intenta de nuevo."
    } finally {
      setIsLoadingN8n(false)
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim()) return

    addMessage(inputValue, "user")
    const message = inputValue.trim()
    setInputValue("")

    if (chatMode === "consulta") {
      // Modo consulta - usar n8n workflow
      const response = await queryN8nWorkflow(message)
      setTimeout(() => {
        addMessage(response, "bot", {
          buttons: [
            { text: "🔙 Volver al menú", value: "back_to_menu" },
            { text: "❓ Otra consulta", value: "new_query" }
          ]
        })
      }, 500)
    } else {
      // Modo agendamiento - lógica original
      setTimeout(() => {
        processSchedulingMessage(message)
      }, 500)
    }
  }

  const handleButtonClick = (value: string) => {
    addMessage(value, "user")
    setTimeout(() => {
      processButtonAction(value)
    }, 500)
  }

  const processButtonAction = (value: string) => {
    switch (value) {
      case "schedule":
        setChatMode("schedule")
        setChatStep(0)
        addMessage("Perfecto! Para agendar un viaje, necesito que te identifiques. Por favor, ingresa tu ID de cliente.", "bot")
        break

      case "consulta":
        setChatMode("consulta")
        addMessage("Perfecto! Ahora puedes hacerme cualquier consulta sobre la información de la empresa. Por ejemplo: '¿Cuántos tractos hay disponibles?' o '¿Qué conductores están libres?'", "bot")
        break

      case "back_to_menu":
        resetToMenu()
        break

      case "new_query":
        addMessage("Perfecto! Puedes hacerme otra consulta:", "bot")
        break

      default:
        if (chatMode === "schedule") {
          processSchedulingMessage(value)
        }
        break
    }
  }

  const resetToMenu = () => {
    setChatMode("menu")
    setChatStep(0)
    setSessionId("")
    setEmailStatus("idle")
    setTripData({
      clienteId: "",
      rutaSeleccionada: "",
      fechaSeleccionada: undefined,
      horaSeleccionada: "",
    })
    addMessage("¿En qué más puedo ayudarte?", "bot", {
      buttons: [
        { text: "📅 Agendar Viaje", value: "schedule" },
        { text: "💬 Consultar Información", value: "consulta" }
      ]
    })
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setTripData((prev) => ({ ...prev, fechaSeleccionada: date }))
      const formattedDate = format(date, "dd/MM/yyyy", { locale: es })
      addMessage(formattedDate, "user")

      setTimeout(() => {
        setChatStep(3)
        addMessage("Perfecto! Fecha seleccionada. Ahora elige la hora para tu viaje:", "bot", {
          buttons: horariosDisponibles.map((hora) => ({ text: hora, value: hora })),
        })
      }, 500)
    }
  }

  const processSchedulingMessage = (message: string) => {
    switch (chatStep) {
      case 0: // Waiting for client ID
        if (clientesRutas[message.toUpperCase() as keyof typeof clientesRutas]) {
          const clienteId = message.toUpperCase()
          setTripData((prev) => ({ ...prev, clienteId }))
          setChatStep(1)
          const rutas = clientesRutas[clienteId as keyof typeof clientesRutas]
          addMessage(`¡Perfecto! Cliente ${clienteId} identificado. Selecciona tu ruta de destino:`, "bot", {
            buttons: rutas.map((ruta) => ({ text: ruta, value: ruta })),
          })
        } else {
          addMessage(
            "Lo siento, no encuentro ese ID de cliente. Los clientes disponibles son: FALABELLA, CODELCO, WALMART. Por favor, intenta de nuevo.",
            "bot",
          )
        }
        break

      case 1: // Waiting for route selection
        const rutasDisponibles = clientesRutas[tripData.clienteId as keyof typeof clientesRutas]
        if (rutasDisponibles.includes(message)) {
          setTripData((prev) => ({ ...prev, rutaSeleccionada: message }))
          setChatStep(2)
          addMessage(`Excelente! Ruta seleccionada: ${message}. Ahora selecciona la fecha para tu viaje:`, "bot", {
            showCalendar: true,
          })
        } else {
          addMessage(`Por favor, selecciona una de las rutas disponibles usando los botones.`, "bot")
        }
        break

      case 2:
  // Nada que hacer aquí. La selección de fecha se maneja en handleDateSelect.
  break


      case 3: // Waiting for time selection
        if (horariosDisponibles.includes(message)) {
          setTripData((prev) => ({ ...prev, horaSeleccionada: message }))
          setChatStep(4)
          mostrarResumenYConfirmar(message)
        } else {
          addMessage("Por favor, selecciona una de las horas disponibles usando los botones.", "bot")
        }
        break

      case 4: // Confirmation
        if (message.toLowerCase() === "confirmar") {
          agendarViaje()
        } else if (message.toLowerCase() === "cancelar") {
          resetToMenu()
        }
        break
    }
  }

  const mostrarResumenYConfirmar = (hora: string) => {
  const resumen = `📋 **Resumen de tu viaje:**

👤 **Cliente:** ${tripData.clienteId}
🛣️ **Ruta:** ${tripData.rutaSeleccionada}
📅 **Fecha:** ${format(tripData.fechaSeleccionada!, "dd/MM/yyyy", { locale: es })}
🕐 **Hora:** ${hora}

¿Confirmas el agendamiento del viaje?`

  addMessage(resumen, "bot", {
    buttons: [
      { text: "✅ Confirmar", value: "confirmar" },
      { text: "❌ Cancelar", value: "cancelar" },
    ],
  })
}

  // Función para crear viaje usando el endpoint de n8n
  const createTripWithN8n = async (tripPrompt: string) => {
    try {
      const response = await fetch('https://soperon891.app.n8n.cloud/webhook-test/insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: tripPrompt,
          sessionId: `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        })
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        sqlOutput: data.output || "Viaje creado exitosamente"
      }
    } catch (error) {
      console.error('Error creando viaje con n8n:', error)
      return {
        success: false,
        error: "Error al crear el viaje en la base de datos"
      }
    }
  }

  const agendarViaje = async () => {
    setEmailStatus("sending")
    addMessage("⏳ Procesando tu solicitud...", "bot")

    // Buscar conductores disponibles
    const conductoresDisponibles = getAvailableDrivers()

    if (conductoresDisponibles.length === 0) {
      addMessage(
        "❌ Lo siento, no hay conductores disponibles para esa fecha y hora. Por favor intenta con otro horario.",
        "bot",
      )
      setChatStep(3)
      addMessage("Selecciona otra hora:", "bot", {
        buttons: horariosDisponibles.map((hora) => ({ text: hora, value: hora })),
      })
      return
    }

    // Asignar primer conductor disponible
    const conductorAsignado = conductoresDisponibles[0]

    // Generar ID único para el viaje
    const viajeId = `VIA-${Date.now()}`

    // Preparar prompt para n8n con el resumen del viaje
    const fechaFormateada = format(tripData.fechaSeleccionada!, "dd/MM/yyyy", { locale: es })
    const tripPrompt = `generame un viaje en base a estos datos: 'Resumen de tu viaje: Cliente: ${tripData.clienteId} Ruta: ${tripData.rutaSeleccionada} Fecha: ${fechaFormateada} Hora: ${tripData.horaSeleccionada}'`

    // Llamar al endpoint de n8n para crear el viaje
    addMessage("🤖 Creando viaje en la base de datos...", "bot")
    const result = await createTripWithN8n(tripPrompt)

    if (result.success) {
      // Actualizar horas del conductor localmente
      updateDriverHours(conductorAsignado.id, conductorAsignado.horasDisponibles - 8)

      // Preparar datos para email
      const emailData: TripEmailData = {
        idViaje: viajeId,
        cliente: tripData.clienteId,
        ruta: tripData.rutaSeleccionada,
        fecha: fechaFormateada,
        hora: tripData.horaSeleccionada,
        conductor: conductorAsignado.nombre,
        conductorId: conductorAsignado.id,
        tracto: "Asignado automáticamente",
        rampla: "Asignada automáticamente",
        horasEstimadas: 8, // Valor por defecto para la demo
        fechaCreacion: format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })
      }

      // Enviar email de notificación
      try {
        setEmailStatus("sending")
        const emailSent = await sendTripNotificationEmail(emailData)

        if (emailSent) {
          setEmailStatus("sent")
          addMessage(
            `✅ ¡Viaje creado exitosamente en la base de datos!

📋 **ID del viaje:** ${viajeId}
👨‍💼 **Conductor asignado:** ${conductorAsignado.nombre}
🚛 **Tracto y Rampla:** Asignados automáticamente por IA
📧 **Email enviado:** Operador notificado

La IA se encargó de asignar el tracto y rampla más adecuados.`,
            "bot",
            {
              buttons: [
                { text: "🆕 Nuevo viaje", value: "schedule" },
                { text: "🔙 Menú principal", value: "back_to_menu" }
              ]
            }
          )

          addNotification({
            id: Date.now().toString(),
            message: `✅ Nuevo viaje creado con IA: ${viajeId} - ${tripData.rutaSeleccionada} (Base de datos + Email)`,
            type: "success",
            timestamp: new Date(),
          })
        } else {
          setEmailStatus("error")
          addMessage(
            `✅ ¡Viaje creado exitosamente en la base de datos!

📋 **ID del viaje:** ${viajeId}
👨‍💼 **Conductor asignado:** ${conductorAsignado.nombre}
🚛 **Tracto y Rampla:** Asignados automáticamente por IA

⚠️ El viaje fue creado correctamente, pero hubo un problema enviando el email. El operador será notificado por otros medios.`,
            "bot",
            {
              buttons: [
                { text: "🆕 Nuevo viaje", value: "schedule" },
                { text: "🔙 Menú principal", value: "back_to_menu" }
              ]
            }
          )

          addNotification({
            id: Date.now().toString(),
            message: `⚠️ Viaje ${viajeId} creado con IA - Error enviando email de notificación`,
            type: "warning",
            timestamp: new Date(),
          })
        }
      } catch (error) {
        setEmailStatus("error")
        addMessage(
          `✅ ¡Viaje creado exitosamente en la base de datos!

📋 **ID del viaje:** ${viajeId}
👨‍💼 **Conductor asignado:** ${conductorAsignado.nombre}
🚛 **Tracto y Rampla:** Asignados automáticamente por IA

⚠️ El viaje fue creado correctamente, pero hubo un problema enviando el email. El operador será notificado por otros medios.`,
          "bot",
          {
            buttons: [
              { text: "🆕 Nuevo viaje", value: "schedule" },
              { text: "🔙 Menú principal", value: "back_to_menu" }
            ]
          }
        )

        addNotification({
          id: Date.now().toString(),
          message: `⚠️ Viaje ${viajeId} creado con IA - Error enviando email de notificación`,
          type: "warning",
          timestamp: new Date(),
        })
      }
    } else {
      // Error al crear el viaje
      setEmailStatus("error")
      addMessage(
        `❌ **Error al crear el viaje**

Hubo un problema al crear el viaje en la base de datos. Por favor intenta de nuevo o contacta al administrador.

**Error:** ${result.error}`,
        "bot",
        {
          buttons: [
            { text: "🔄 Reintentar", value: "confirmar" },
            { text: "🔙 Menú principal", value: "back_to_menu" }
          ]
        }
      )

      addNotification({
        id: Date.now().toString(),
        message: `❌ Error al crear viaje: ${tripData.rutaSeleccionada} - ${result.error}`,
        type: "error",
        timestamp: new Date(),
      })
    }

    // Resetear estado del email después de un tiempo
    setTimeout(() => {
      setEmailStatus("idle")
    }, 5000)
  }

  const handleQuickAction = (clientId: string) => {
    setChatMode("schedule")
    setChatStep(0)
    setInputValue(clientId)
    setTimeout(() => sendMessage(), 100)
  }

  return (
    <div className="space-y-4">
      {/* Notificaciones */}
      {unreadNotifications.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-orange-600" />
              <span className="font-semibold text-orange-800">Notificaciones ({unreadNotifications.length})</span>
            </div>
            <div className="space-y-2">
              {unreadNotifications.slice(0, 3).map((notif) => (
                <div key={notif.id} className="text-sm text-orange-700 bg-white p-2 rounded">
                  {notif.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="h-full">
        <CardHeader className="bg-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              {chatMode === "schedule" && <CalendarSchedule className="w-5 h-5" />}
              {chatMode === "consulta" && <MessageSquare className="w-5 h-5" />}
              <span className="text-xl font-bold">Asistente Virtual Nazar</span>
            </div>
            <p className="text-sm opacity-90 font-normal">
              {chatMode === "menu" && "¿Cómo puedo ayudarte hoy?"}
              {chatMode === "schedule" && "Agenda tu viaje de manera fácil y rápida"}
              {chatMode === "consulta" && "Consulta información de la empresa"}
            </p>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-[500px] flex flex-col">
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((message, index) => (
              <div key={index} className="space-y-2">
                <div
                  className={`max-w-[70%] p-3 rounded-2xl animate-in slide-in-from-bottom-2 duration-300 ${
                    message.sender === "bot"
                      ? "bg-blue-50 self-start rounded-bl-sm"
                      : "bg-blue-600 text-white self-end rounded-br-sm ml-auto"
                  }`}
                >
                  <p className="whitespace-pre-line">{message.text}</p>
                </div>

                {/* Botones de opciones */}
                {message.buttons && message.sender === "bot" && (
                  <div className="flex flex-wrap gap-2 max-w-[70%]">
                    {message.buttons.map((button, btnIndex) => (
                      <Button
                        key={btnIndex}
                        variant="outline"
                        size="sm"
                        onClick={() => handleButtonClick(button.value)}
                        className="text-xs"
                      >
                        {button.text}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Calendario */}
                {message.showCalendar && message.sender === "bot" && (
                  <div className="max-w-[70%]">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {tripData.fechaSeleccionada
                            ? format(tripData.fechaSeleccionada, "PPP", { locale: es })
                            : "Selecciona una fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={tripData.fechaSeleccionada}
                          onSelect={handleDateSelect}
                          disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            ))}

            {/* Indicador de carga para consultas n8n */}
            {isLoadingN8n && (
              <div className="max-w-[70%] p-3 rounded-2xl bg-blue-50 self-start rounded-bl-sm animate-pulse">
                <p className="text-blue-600">🤖 Consultando información...</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder={
                  chatMode === "consulta" 
                    ? "Escribe tu consulta aquí..." 
                    : "Escribe tu mensaje..."
                }
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !isLoadingN8n && sendMessage()}
                className="flex-1"
                disabled={isLoadingN8n}
              />
              <Button 
                onClick={sendMessage} 
                disabled={!inputValue.trim() || isLoadingN8n}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Enviar
              </Button>
            </div>

            {/* Botones de acceso rápido solo en modo agendamiento */}
            {chatMode === "schedule" && chatStep === 0 && (
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction("FALABELLA")}
                  className="text-xs"
                >
                  FALABELLA
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction("CODELCO")}
                  className="text-xs"
                >
                  CODELCO
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction("WALMART")}
                  className="text-xs"
                >
                  WALMART
                </Button>
              </div>
            )}

            {/* Información del sessionId para modo consulta (solo para debug, puedes quitarlo) */}
            {chatMode === "consulta" && sessionId && (
              <div className="mt-2 text-xs text-gray-500">
                Session: {sessionId}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}