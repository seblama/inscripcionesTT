import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Car, User, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Registration {
  id: string;
  nombre: string;
  lugar: string;
  tipo: "auto" | "pasajero";
  cupos?: number;
  estado: "confirmado" | "pendiente";
  driver_id?: string;
  contact_info?: string;
  fechaSalida: string;
  rut: string;
}

interface LocationGroup {
  registrations: Registration[];
  dificultad: string;
  coordinador: string;
}

const RegistrationTable = () => {
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState<Registration[]>([]);
  const [locationGroups, setLocationGroups] = useState<Record<string, LocationGroup>>({});
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    fetchRegistrations();
  }, [selectedDate]);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("get-registrations");
      
      if (error) throw error;
      
      if (data) {
        // Extract unique dates and sort them
        const dates = Array.from(new Set(data.map((r: any) => r.FechaSalida)))
          .filter(Boolean)
          .sort((a: any, b: any) => new Date(a).getTime() - new Date(b).getTime()) as string[];
        
        setAvailableDates(dates);

        // If no date selected, select the nearest future date
        if (!selectedDate && dates.length > 0) {
          const today = new Date();
          const futureDate = dates.find(d => new Date(d) >= today) || dates[dates.length - 1];
          setSelectedDate(futureDate);
          return; // The effect will run again with the selected date
        }

        // Filter by selected date
        const filteredData = selectedDate 
          ? data.filter((r: any) => r.FechaSalida === selectedDate)
          : [];

        const mappedRegistrations = filteredData.map((r: any) => ({
          id: r.id,
          nombre: r.Nombre,
          lugar: r.Lugar,
          tipo: r.TipoTransporte === "auto" ? "auto" : "pasajero",
          cupos: r.CuposDisponibles ? parseInt(r.CuposDisponibles) : 0,
          estado: r.Estado || "pendiente",
          driver_id: r.DriverID,
          contact_info: r.Telefono,
          fechaSalida: r.FechaSalida,
          rut: r.RUT
        }));

        setRegistrations(mappedRegistrations);
        setDrivers(mappedRegistrations.filter((r: Registration) => r.tipo === "auto"));

        // Group by location
        const groups: Record<string, LocationGroup> = {};
        filteredData.forEach((item: any) => {
          if (!groups[item.Lugar]) {
            groups[item.Lugar] = {
              registrations: [],
              dificultad: item.Dificultad || "N/A",
              coordinador: item.Coordinador || "Por asignar"
            };
          }
          groups[item.Lugar].registrations.push({
            id: item.id,
            nombre: item.Nombre,
            lugar: item.Lugar,
            tipo: item.TipoTransporte === "auto" ? "auto" : "pasajero",
            cupos: item.CuposDisponibles ? parseInt(item.CuposDisponibles) : 0,
            estado: item.Estado || "pendiente",
            driver_id: item.DriverID,
            contact_info: item.Telefono,
            fechaSalida: item.FechaSalida,
            rut: item.RUT
          });
        });
        setLocationGroups(groups);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las inscripciones",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDriverAssignment = async (passengerId: string, driverRut: string) => {
    try {
      const passenger = registrations.find(r => r.id === passengerId);
      const driver = registrations.find(r => r.rut === driverRut);

      if (!passenger) return;

      const { error } = await supabase.functions.invoke("webhook-proxy", {
        body: {
          action: "registro-asignar",
          data: {
            passengerRut: passenger.rut,
            driverRut: driver?.rut || "", // If empty string, it unassigns
            fechaSalida: passenger.fechaSalida || "", // Ensure fechaSalida is included
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Asignación actualizada",
        description: "Se ha actualizado la asignación del pasajero correctamente.",
      });

      // Refresh data
      fetchRegistrations();
    } catch (error) {
      console.error("Error assigning driver:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la asignación",
      });
    }
  };

  const renderLocationContent = (locationRegistrations: Registration[], locationName: string) => {
    const locationDrivers = locationRegistrations.filter(r => r.tipo === "auto");
    const locationPassengers = locationRegistrations.filter(r => r.tipo === "pasajero");

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locationDrivers.map((driver) => {
            const assignedPassengers = locationPassengers.filter(p => p.driver_id === driver.rut);
            const availableSpots = (driver.cupos || 0) - assignedPassengers.length;
            
            return (
              <Card key={driver.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <Car className="h-5 w-5 text-primary" />
                        {driver.nombre}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {driver.contact_info}
                      </p>
                    </div>
                    <Badge variant={availableSpots > 0 ? "secondary" : "destructive"}>
                      {availableSpots} cupos
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Pasajeros asignados ({assignedPassengers.length})
                  </h4>
                  {assignedPassengers.length > 0 ? (
                    <ul className="space-y-2">
                      {assignedPassengers.map(passenger => (
                        <li key={passenger.id} className="text-sm bg-accent/50 p-2 rounded flex justify-between items-center group">
                          <span>{passenger.nombre}</span>
                          <Button
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDriverAssignment(passenger.id, "")}
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Desasignar"
                          >
                            ×
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Sin pasajeros asignados
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {locationPassengers.filter(p => !p.driver_id).length > 0 && (
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Pasajeros sin asignar</h3>
              <div className="relative w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Asignar a conductor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locationPassengers
                      .filter(p => !p.driver_id)
                      .map((passenger) => (
                        <TableRow key={passenger.id}>
                          <TableCell className="font-medium">{passenger.nombre}</TableCell>
                          <TableCell>{passenger.contact_info}</TableCell>
                          <TableCell>
                            <Select
                              onValueChange={(value) => handleDriverAssignment(passenger.id, value)}
                            >
                              <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Seleccionar conductor" />
                              </SelectTrigger>
                              <SelectContent>
                                {locationDrivers
                                  .filter(d => {
                                    const spots = (d.cupos || 0) - locationPassengers.filter(p => p.driver_id === d.rut).length;
                                    return spots > 0;
                                  })
                                  .map((driver) => (
                                    <SelectItem key={driver.id} value={driver.rut}>
                                      {driver.nombre} ({driver.cupos! - locationPassengers.filter(p => p.driver_id === driver.rut).length} disp.)
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const locations = Object.keys(locationGroups);

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-6">
        <div className="w-full max-w-xs space-y-2">
          <label className="text-sm font-medium flex items-center gap-2 justify-center text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Fecha de Salida
          </label>
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una fecha" />
            </SelectTrigger>
            <SelectContent>
              {availableDates.map((date) => (
                <SelectItem key={date} value={date}>
                  {new Date(date).toLocaleDateString("es-CL", {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="w-full max-w-6xl mx-auto backdrop-blur-sm bg-white/50 dark:bg-slate-950/50">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Estado de Inscripciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="hidden">
            {/* Debug info */}
            <div>Selected Date: {selectedDate}</div>
            <div>Available Dates: {availableDates.join(", ")}</div>
            <div>
              Drivers available for manual test:
              <select onChange={(e) => {
                const driver = drivers.find(d => d.rut === e.target.value);
                console.log("Selected driver:", driver);
              }}>
                <option value="">Select a driver</option>
                {drivers.map(d => {
                  const assignedCount = registrations.filter(r => r.driver_id === d.rut).length;
                  const available = (d.cupos || 0) - assignedCount;
                  return (
                    <option key={d.id} value={d.rut}>
                      {d.nombre} ({available} cupos) - RUT: {d.rut}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {locations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Selecciona una fecha para ver las coordinaciones
            </div>
          ) : locations.length === 1 ? (
            <div>
              <div className="mb-4 text-lg font-semibold text-foreground">
                {locations[0]} - {locationGroups[locations[0]].dificultad}
              </div>
              {renderLocationContent(locationGroups[locations[0]].registrations, locations[0])}
            </div>
          ) : (
            <Tabs defaultValue={locations[0]} className="w-full">
              <TabsList className="mb-4 flex-wrap h-auto">
                {locations.map(lugar => (
                  <TabsTrigger key={lugar} value={lugar} className="max-w-[200px]">
                    <span className="truncate">
                      {lugar} - {locationGroups[lugar].dificultad}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
              {locations.map(lugar => (
                <TabsContent key={lugar} value={lugar}>
                  {renderLocationContent(locationGroups[lugar].registrations, lugar)}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationTable;