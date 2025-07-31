// Configuración de EmailJS
// IMPORTANTE: Reemplaza estos valores con los tuyos de EmailJS

export const EMAIL_CONFIG = {
  // Obtén estos valores de tu dashboard de EmailJS
  SERVICE_ID: "service_4qh0ct2", // Tu Service ID
  TEMPLATE_ID: "template_dnv793e", // Tu Template ID
  PUBLIC_KEY: "c8jgi3iekmoUVJsT0", // Tu Public Key

  // Email del operador que recibirá las notificaciones
  OPERATOR_EMAIL: "tomasespildeveloper@gmail.com",

  // Configuración del template de email
  TEMPLATE_VARS: {
    to_name: "Operador Nazar",
    from_name: "Sistema Nazar - Chatbot",
    reply_to: "noreply@nazar.cl",
  },
}

// Instrucciones para configurar EmailJS:
/*
1. Ve a https://www.emailjs.com/ y crea una cuenta
2. Crea un nuevo servicio (Gmail, Outlook, etc.)
3. Crea un template de email con las siguientes variables:
   - {{to_email}}
   - {{to_name}}
   - {{subject}}
   - {{viaje_id}}
   - {{cliente}}
   - {{ruta}}
   - {{fecha_viaje}}
   - {{hora_viaje}}
   - {{conductor_nombre}}
   - {{conductor_id}}
   - {{tracto}}
   - {{rampla}}
   - {{horas_estimadas}}
   - {{fecha_creacion}}
   - {{message}}

4. Copia tu Service ID, Template ID y Public Key aquí
5. Reemplaza OPERATOR_EMAIL con el email real del operador
*/
