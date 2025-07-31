# 📧 Guía Completa de Configuración EmailJS para Sistema Nazar

## Paso 1: Crear Cuenta en EmailJS

1. Ve a [https://www.emailjs.com/](https://www.emailjs.com/)
2. Crea una cuenta gratuita
3. Verifica tu email

## Paso 2: Configurar Servicio de Email

1. En el dashboard, ve a **"Email Services"**
2. Click **"Add New Service"**
3. Selecciona tu proveedor:
   - **Gmail** (recomendado)
   - **Outlook**
   - **Yahoo**
   - **Otro**

### Para Gmail:
1. Selecciona "Gmail"
2. Autoriza el acceso a tu cuenta Gmail
3. Copia el **Service ID** generado

## Paso 3: Crear Template de Email

1. Ve a **"Email Templates"**
2. Click **"Create New Template"**
3. Usa el template HTML proporcionado arriba
4. Configura:
   - **Template Name**: `template_viaje_nazar`
   - **Subject**: `🚛 Nuevo Viaje Agendado - {{viaje_id}} | Sistema Nazar`
   - **From Name**: `Sistema Nazar`
   - **Reply To**: `noreply@nazar.cl`

## Paso 4: Obtener Credenciales

1. **Service ID**: En "Email Services", copia el ID de tu servicio
2. **Template ID**: En "Email Templates", copia el ID de tu template
3. **Public Key**: En "Account" → "General", copia tu Public Key

## Paso 5: Actualizar Configuración

Reemplaza en `services/email-service.ts`:

\`\`\`typescript
const EMAIL_CONFIG = {
  SERVICE_ID: "tu_service_id_aqui",
  TEMPLATE_ID: "tu_template_id_aqui", 
  PUBLIC_KEY: "tu_public_key_aqui",
  OPERATOR_EMAIL: "tu_email_operador@empresa.com",
}
\`\`\`

## Paso 6: Probar Configuración

1. Usa el componente `EmailTestPanel` 
2. Envía un email de prueba
3. Verifica que llegue correctamente

## Variables del Template

Asegúrate de que tu template incluya estas variables:

- `{{to_name}}` - Nombre destinatario
- `{{to_email}}` - Email destinatario  
- `{{subject}}` - Asunto
- `{{viaje_id}}` - ID del viaje
- `{{cliente}}` - Cliente
- `{{ruta}}` - Ruta
- `{{fecha_viaje}}` - Fecha
- `{{hora_viaje}}` - Hora
- `{{conductor_nombre}}` - Conductor
- `{{conductor_id}}` - ID conductor
- `{{tracto}}` - Tracto
- `{{rampla}}` - Rampla
- `{{horas_estimadas}}` - Horas estimadas
- `{{fecha_creacion}}` - Fecha creación

## Límites del Plan Gratuito

- **200 emails/mes** gratis
- Para más volumen, considera plan pagado
- Monitorea uso en dashboard EmailJS

## Troubleshooting

### Error: "Service not found"
- Verifica que el Service ID sea correcto
- Asegúrate de que el servicio esté activo

### Error: "Template not found"  
- Verifica que el Template ID sea correcto
- Asegúrate de que el template esté publicado

### Error: "Invalid public key"
- Verifica que el Public Key sea correcto
- Regenera la key si es necesario

### Emails no llegan
- Revisa spam/promociones
- Verifica que el email del operador sea correcto
- Prueba con otro email

## Seguridad

- ✅ Public Key es segura para frontend
- ✅ No expongas credenciales privadas
- ✅ Usa variables de entorno en producción
