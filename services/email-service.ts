import emailjs from "@emailjs/browser"

// Configuración de EmailJS - Reemplaza con tus propios IDs
const EMAIL_CONFIG = {
  SERVICE_ID: "service_4qh0ct2", // Tu Service ID de EmailJS
  TEMPLATE_ID: "template_dnv793e", // Tu Template ID de EmailJS
  PUBLIC_KEY: "c8jgi3iekmoUVJsT0", // Tu Public Key de EmailJS
  OPERATOR_EMAIL: "tomasespildeveloper@gmail.com", // Email del operador
}

export interface TripEmailData {
  idViaje: string
  cliente: string
  ruta: string
  fecha: string
  hora: string
  conductor: string
  conductorId: string
  tracto: string
  rampla: string
  horasEstimadas: number
  fechaCreacion: string
}

export const sendTripNotificationEmail = async (tripData: TripEmailData): Promise<boolean> => {
  try {
    const templateParams = {
      // Destinatario
      to_email: EMAIL_CONFIG.OPERATOR_EMAIL,
      to_name: "Operador Nazar",
      subject: `🚛 Nuevo Viaje Agendado - ${tripData.idViaje} | Sistema Nazar`,

      // Datos del viaje
      viaje_id: tripData.idViaje,
      cliente: tripData.cliente,
      ruta: tripData.ruta,
      fecha_viaje: tripData.fecha,
      hora_viaje: tripData.hora,
      horas_estimadas: tripData.horasEstimadas,

      // Recursos asignados
      conductor_nombre: tripData.conductor,
      conductor_id: tripData.conductorId,
      tracto: tripData.tracto,
      rampla: tripData.rampla,

      // Información adicional
      fecha_creacion: tripData.fechaCreacion,

      // Mensaje adicional (opcional)
      message: `Viaje agendado automáticamente por el chatbot cliente.
      
Detalles completos:
• Cliente: ${tripData.cliente}
• Ruta: ${tripData.ruta}
• Fecha y hora: ${tripData.fecha} a las ${tripData.hora}
• Conductor asignado: ${tripData.conductor} (${tripData.conductorId})
• Vehículos: ${tripData.tracto} + ${tripData.rampla}
• Duración estimada: ${tripData.horasEstimadas} horas

Por favor, revisa el sistema para gestionar este viaje.`,
    }

    console.log("Enviando email con datos:", templateParams)

    const response = await emailjs.send(
      EMAIL_CONFIG.SERVICE_ID,
      EMAIL_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAIL_CONFIG.PUBLIC_KEY,
    )

    console.log("Email enviado exitosamente:", response.status, response.text)
    return true
  } catch (error) {
    console.error("Error enviando email:", error)
    return false
  }
}

// Función para inicializar EmailJS (llamar una vez al inicio de la app)
export const initializeEmailJS = () => {
  emailjs.init(EMAIL_CONFIG.PUBLIC_KEY)
  console.log("EmailJS inicializado correctamente")
}

// Función de prueba para verificar la configuración
export const testEmailConfiguration = async (): Promise<boolean> => {
  const testData: TripEmailData = {
    idViaje: "TEST001",
    cliente: "CLIENTE_PRUEBA",
    ruta: "Santiago-Valparaíso",
    fecha: "01/01/2025",
    hora: "08:00",
    conductor: "Conductor Prueba",
    conductorId: "C999",
    tracto: "TEST-1234",
    rampla: "R999",
    horasEstimadas: 6,
    fechaCreacion: new Date().toLocaleString("es-CL"),
  }

  try {
    const result = await sendTripNotificationEmail(testData)
    console.log("Test de email:", result ? "EXITOSO" : "FALLIDO")
    return result
  } catch (error) {
    console.error("Error en test de email:", error)
    return false
  }
}
