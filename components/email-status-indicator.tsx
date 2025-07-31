import { Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface EmailStatusIndicatorProps {
  status: "idle" | "sending" | "sent" | "error"
}

export function EmailStatusIndicator({ status }: EmailStatusIndicatorProps) {
  if (status === "idle") return null

  const statusConfig = {
    sending: {
      icon: <Loader2 className="w-3 h-3 animate-spin" />,
      label: "Enviando email...",
      className: "bg-blue-100 text-blue-800",
    },
    sent: {
      icon: <CheckCircle className="w-3 h-3" />,
      label: "Email enviado",
      className: "bg-green-100 text-green-800",
    },
    error: {
      icon: <AlertCircle className="w-3 h-3" />,
      label: "Error enviando email",
      className: "bg-red-100 text-red-800",
    },
  }

  const config = statusConfig[status]

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
      <Mail className="w-4 h-4 text-gray-600" />
      <Badge className={config.className}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </Badge>
    </div>
  )
}
