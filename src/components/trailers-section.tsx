import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function TrailersSection() {
  const trailers = [
    {
      id: "R001",
      tipo: "Rampla Seca",
      capacidad: "25 ton",
      revTecnica: "2025-12-15",
      estado: "disponible",
    },
    {
      id: "R002",
      tipo: "Multitemperatura",
      capacidad: "20 ton",
      revTecnica: "2025-11-20",
      estado: "ocupado",
    },
    {
      id: "R003",
      tipo: "Cisterna",
      capacidad: "30 ton",
      revTecnica: "2025-08-10",
      estado: "mantenimiento",
    },
  ]

  const getStatusBadge = (estado: string) => {
    const statusConfig = {
      disponible: { label: "Disponible", className: "bg-green-100 text-green-800" },
      ocupado: { label: "En Ruta", className: "bg-red-100 text-red-800" },
      mantenimiento: { label: "Revisión Técnica", className: "bg-yellow-100 text-yellow-800" },
    }

    const config = statusConfig[estado as keyof typeof statusConfig]
    return <Badge className={config.className}>{config.label}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gestión de Ramplas</CardTitle>
          <Button>Agregar Rampla</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-semibold bg-gray-50">ID</th>
                <th className="text-left p-3 font-semibold bg-gray-50">Tipo</th>
                <th className="text-left p-3 font-semibold bg-gray-50">Capacidad</th>
                <th className="text-left p-3 font-semibold bg-gray-50">Rev. Técnica</th>
                <th className="text-left p-3 font-semibold bg-gray-50">Estado</th>
                <th className="text-left p-3 font-semibold bg-gray-50">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {trailers.map((trailer) => (
                <tr key={trailer.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{trailer.id}</td>
                  <td className="p-3">{trailer.tipo}</td>
                  <td className="p-3">{trailer.capacidad}</td>
                  <td className="p-3">{trailer.revTecnica}</td>
                  <td className="p-3">{getStatusBadge(trailer.estado)}</td>
                  <td className="p-3">
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
