import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function TrucksSection() {
  const trucks = [
    {
      patente: "AB-1234",
      modelo: "Volvo FH",
      año: "2020",
      color: "Blanco",
      acreditaciones: "Puerto, Zona Franca",
      estado: "disponible",
    },
    {
      patente: "CD-5678",
      modelo: "Scania R450",
      año: "2019",
      color: "Azul",
      acreditaciones: "General",
      estado: "ocupado",
    },
    {
      patente: "EF-9012",
      modelo: "Mercedes Actros",
      año: "2021",
      color: "Blanco",
      acreditaciones: "Puerto",
      estado: "mantenimiento",
    },
  ]

  const getStatusBadge = (estado: string) => {
    const statusConfig = {
      disponible: { label: "Disponible", className: "bg-green-100 text-green-800" },
      ocupado: { label: "En Ruta", className: "bg-red-100 text-red-800" },
      mantenimiento: { label: "Mantenimiento", className: "bg-yellow-100 text-yellow-800" },
    }

    const config = statusConfig[estado as keyof typeof statusConfig]
    return <Badge className={config.className}>{config.label}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gestión de Tractos</CardTitle>
          <Button>Agregar Tracto</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-semibold bg-gray-50">Patente</th>
                <th className="text-left p-3 font-semibold bg-gray-50">Modelo</th>
                <th className="text-left p-3 font-semibold bg-gray-50">Año</th>
                <th className="text-left p-3 font-semibold bg-gray-50">Color</th>
                <th className="text-left p-3 font-semibold bg-gray-50">Acreditaciones</th>
                <th className="text-left p-3 font-semibold bg-gray-50">Estado</th>
                <th className="text-left p-3 font-semibold bg-gray-50">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {trucks.map((truck) => (
                <tr key={truck.patente} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono">{truck.patente}</td>
                  <td className="p-3">{truck.modelo}</td>
                  <td className="p-3">{truck.año}</td>
                  <td className="p-3">{truck.color}</td>
                  <td className="p-3">{truck.acreditaciones}</td>
                  <td className="p-3">{getStatusBadge(truck.estado)}</td>
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
