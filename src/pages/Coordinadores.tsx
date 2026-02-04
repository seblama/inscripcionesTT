import { useState, useEffect } from "react";
import * as XLSX from 'xlsx';
import Navigation from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Lock, Car, Users, Loader2, Download, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FormData } from "@/components/RegistrationForm";
import { supabase } from "@/integrations/supabase/client";

const Coordinadores = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [registrations, setRegistrations] = useState<FormData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const { toast } = useToast();

  // Transform webhook data to FormData format
  const transformCoordinadoresWebhookData = (webhookData: any): FormData[] => {
    const allData: FormData[] = [];
    
    if (webhookData && Array.isArray(webhookData.data)) {
      webhookData.data.forEach((item: any, index: number) => {
          // Get nombre - check multiple possible field names
          const nombre = item['Nombre']?.[0] || item['nombre'] || item['First Name']?.[0] || '';
          const apellido = item['Apellido']?.[0] || item['apellido'] || item['Last Name']?.[0] || '';
          const rut = item.RUN?.[0] || item['RUT']?.[0] || '';
          const fechaSalida = item['Fecha Cerro']?.[0] || '';
          const lugar = item['Cerro']?.[0] || 'Desconocido';
          const nivelDificultad = item['Nivel de dificultad']?.[0] || '';
          // Mail should only come from email-specific fields
          const mail = item['Mail']?.[0] || item['Email']?.[0] || item['email'] || '';
          const telefono = item['Telefono de contacto']?.[0] || '';
          const telefonoEmergencia = item['Telefono de emergencia']?.[0] || '';
          const antecedentesSalud = item['Antecedentes Salud']?.[0] || '';
          const tratamientos = item['Tratamientos']?.[0] || '';
          
          allData.push({
            id: `coord-${rut}-${fechaSalida}-${index}`,
            nombre,
            apellido,
            rut,
            fechaSalida,
            fechaSalidaOptionId: `${fechaSalida}-${lugar}-${nivelDificultad}`,
            puedeAportarAuto: 'no',
            cuantosCupos: '0',
            desdedondePartes: item['¿Desde donde partes?']?.[0] || item['Direccion']?.[0] || '',
            telefonoContacto: telefono,
            nivelDificultad,
            lugar,
            createdAt: new Date(),
            mail,
            telefono,
            telefonoEmergencia,
            antecedentesSalud,
            tratamientos,
            recordId: undefined,
            rutRecordId: undefined,
            assignedDriverId: undefined,
            asiste: undefined,
            percepcion: undefined,
          });
      });
    }
    
    return allData;
  };

  // No Supabase auth check needed - using n8n data table for credentials

  // Fetch data when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: webhookData, error } = await supabase.functions.invoke('webhook-proxy', {
          body: { action: 'staff', data: { action: 'load' } }
        });
        
        if (error) {
          throw new Error('Failed to fetch coordinadores data');
        }

        const transformedData = transformCoordinadoresWebhookData(webhookData);
        setRegistrations(transformedData);
        
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, toast]);

  // Helper to check if a date is today or future
  const isUpcoming = (fecha?: string): boolean => {
    if (!fecha) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fechaDate = new Date(fecha + 'T00:00:00');
    return fechaDate >= today;
  };

  // Filter to only upcoming registrations (today+future)
  const upcomingRegistrations = registrations.filter(r => isUpcoming(r.fechaSalida));

  const handleExportToExcel = () => {
    // Use upcoming registrations as default when no filter is applied
    const dataToExport = filteredRegistrations.length > 0 ? filteredRegistrations : upcomingRegistrations;
    
    const exportData = dataToExport.map(reg => ({
      'Nombre': `${reg.nombre} ${reg.apellido}`,
      'RUT': reg.rut || 'N/A',
      'Correo': reg.mail || 'N/A',
      'Teléfono': reg.telefono || 'N/A',
      'Fecha': reg.fechaSalida ? new Date(reg.fechaSalida + 'T00:00:00').toLocaleDateString('es-ES') : 'N/A',
      'Cerro': reg.lugar || 'N/A',
      'Teléfono Emergencia': reg.telefonoEmergencia || 'N/A',
      'Antecedentes Salud': reg.antecedentesSalud || 'N/A',
      'Tratamientos': reg.tratamientos || 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Coordinadores');
    
    const fileName = selectedDate 
      ? `coordinadores_${selectedDate}${selectedLocation && selectedLocation !== 'all' ? `_${selectedLocation}` : ''}.xlsx`
      : `coordinadores_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    XLSX.writeFile(wb, fileName);
    
    toast({
      title: "Archivo descargado",
      description: "El archivo Excel se ha descargado correctamente",
    });
  };

  const handleAsistenciaChange = (regId: string, value: string) => {
    const updatedRegistrations = registrations.map(reg => 
      reg.id === regId ? { ...reg, asiste: value } : reg
    );
    setRegistrations(updatedRegistrations);
  };

  const handlePercepcionChange = (regId: string, value: string) => {
    const updatedRegistrations = registrations.map(reg => 
      reg.id === regId ? { ...reg, percepcion: value } : reg
    );
    setRegistrations(updatedRegistrations);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Send credentials to n8n for server-side validation
      const { data: webhookData, error } = await supabase.functions.invoke('webhook-proxy', {
        body: { 
          action: 'coordinadores-usuarios',
          data: {
            username: username.trim(),
            password: password
          }
        }
      });
      
      if (error) {
        toast({
          title: "Error",
          description: "No se pudo conectar al servidor",
          variant: "destructive",
        });
        return;
      }
      
      // Debug: log the exact response from webhook
      console.log("coordinadores-usuarios response:", webhookData);
      
      // Check authorization response from webhook
      // Handle multiple possible response formats from n8n
      const isAuthorized = 
        webhookData?.authorized === true || 
        webhookData?.Authorized === true ||
        webhookData?.status === "Authorized" ||
        webhookData === "Authorized" ||
        webhookData?.Authorization === "Authorized" ||
        (Array.isArray(webhookData) && webhookData[0]?.Authorization === "Authorized");

      if (!isAuthorized) {
        toast({
          title: "Credenciales incorrectas",
          description: "Por favor, verifica tu usuario y contraseña",
          variant: "destructive",
        });
        return;
      }
      
      setIsAuthenticated(true);
      setUsername("");
      setPassword("");
      toast({
        title: "Acceso concedido",
        description: `Bienvenido, ${webhookData.nombre || username}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo validar las credenciales",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setRegistrations([]);
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="flex items-center justify-center py-20 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Lock className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>Acceso Restringido</CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder al panel de coordinadores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Ingresar
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const uniqueDates = Array.from(
    new Set(
      registrations
        .map(reg => reg.fechaSalida)
        .filter(fecha => {
          if (!fecha) return false;
          const fechaDate = new Date(fecha + 'T00:00:00');
          return fechaDate >= today;
        })
    )
  ).sort();
  
  const getLocationsForDate = (date: string) => {
    return Array.from(
      new Set(
        registrations
          .filter(reg => reg.fechaSalida === date)
      .map(reg => reg.lugar || null)
          .filter(Boolean)
      )
    );
  };

  const filteredRegistrations = registrations.filter(reg => {
    if (!selectedDate) return true;
    if (reg.fechaSalida !== selectedDate) return false;
    
      if (selectedLocation && selectedLocation !== "all") {
        return reg.lugar === selectedLocation;
      }
    
    return selectedLocation === "all" || !selectedLocation;
  });

  const availableLocations = selectedDate ? getLocationsForDate(selectedDate) : [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold">Panel de Coordinadores</h1>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
          
          <Tabs defaultValue="clientes" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="clientes">Clientes Registrados</TabsTrigger>
              <TabsTrigger value="informacion">Información</TabsTrigger>
            </TabsList>

            <TabsContent value="clientes" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Clientes Registrados</CardTitle>
                  <CardDescription>
                    Filtra por fecha y lugar para ver los clientes registrados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Select value={selectedDate} onValueChange={(value) => {
                        setSelectedDate(value);
                        setSelectedLocation("all");
                      }} disabled={isLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar fecha" />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueDates.map(date => (
                            <SelectItem key={date} value={date}>
                              {new Date(date + 'T00:00:00').toLocaleDateString('es-ES', {
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

                    {availableLocations.length > 0 && (
                      <div className="flex-1">
                        <Select value={selectedLocation || "all"} onValueChange={setSelectedLocation} disabled={isLoading}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todos los lugares" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos los lugares</SelectItem>
                            {availableLocations.map(location => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : selectedDate ? (
                    filteredRegistrations.length > 0 ? (
                      <>
                        <div className="rounded-md border overflow-x-auto">
                          <Table className="min-w-[600px]">
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Transporte</TableHead>
                                <TableHead>Asiste</TableHead>
                                <TableHead>Percepción</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredRegistrations.map((reg) => (
                                <TableRow key={reg.id}>
                                  <TableCell className="font-medium">
                                    {reg.nombre} {reg.apellido}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={reg.puedeAportarAuto === "si" ? "default" : "secondary"}>
                                      {reg.puedeAportarAuto === "si" ? (
                                        <span className="flex items-center gap-1">
                                          <Car className="h-3 w-3" />
                                          Conductor
                                        </span>
                                      ) : (
                                        <span className="flex items-center gap-1">
                                          <Users className="h-3 w-3" />
                                          Pasajero
                                        </span>
                                      )}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Select 
                                      value={(reg as any).asiste || "pendiente"} 
                                      onValueChange={(value) => handleAsistenciaChange(reg.id, value)}
                                    >
                                      <SelectTrigger className="w-28">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pendiente">Pendiente</SelectItem>
                                        <SelectItem value="si">Sí</SelectItem>
                                        <SelectItem value="no">No</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell>
                                    <Select 
                                      value={(reg as any).percepcion || "esperado"} 
                                      onValueChange={(value) => handlePercepcionChange(reg.id, value)}
                                    >
                                      <SelectTrigger className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="sobre">Sobre</SelectItem>
                                        <SelectItem value="esperado">Esperado</SelectItem>
                                        <SelectItem value="bajo">Bajo</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        <div className="flex justify-end mt-4">
                          <Button 
                            onClick={async () => {
                              try {
                                // Prepare data to send to webhook
                                const dataToSend = filteredRegistrations.map(reg => ({
                                  fechaSalidaRecordId: reg.recordId || '',
                                  rut: reg.rut,
                                  nombre: reg.nombre,
                                  apellido: reg.apellido,
                                  asiste: (reg as any).asiste || 'pendiente',
                                  percepcion: (reg as any).percepcion || 'esperado'
                                }));

                                // Send to webhook via edge function
                                const { error } = await supabase.functions.invoke('webhook-proxy', {
                                  body: {
                                    action: 'registro-coordinadores',
                                    data: {
                                      registrations: dataToSend,
                                      fechaSalida: selectedDate,
                                      lugar: selectedLocation !== 'all' ? selectedLocation : undefined
                                    }
                                  }
                                });

                                if (error) {
                                  throw error;
                                }

                                toast({
                                  title: "Datos enviados",
                                  description: "La información se ha enviado correctamente",
                                });
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: "No se pudieron enviar los datos",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            Enviar asistencia y percepción
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No hay registros para la fecha seleccionada
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Selecciona una fecha para ver los registros
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="informacion" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Información de Coordinadores</CardTitle>
                    <CardDescription>
                      Detalles completos de todos los registros
                    </CardDescription>
                  </div>
                  <Button onClick={handleExportToExcel} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Excel
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-x-auto">
                      <Table className="min-w-[1200px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>RUT</TableHead>
                            <TableHead>Correo</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Condición Salud</TableHead>
                            <TableHead>Tratamientos</TableHead>
                            <TableHead>Tel. Emergencia</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {upcomingRegistrations.map((reg) => (
                            <TableRow key={reg.id}>
                              <TableCell className="font-medium">
                                {reg.nombre} {reg.apellido}
                              </TableCell>
                              <TableCell>{reg.rut || 'N/A'}</TableCell>
                              <TableCell>{reg.mail || 'N/A'}</TableCell>
                              <TableCell>{reg.telefono || 'N/A'}</TableCell>
                              <TableCell>{reg.antecedentesSalud || 'N/A'}</TableCell>
                              <TableCell>{reg.tratamientos || 'N/A'}</TableCell>
                              <TableCell>{reg.telefonoEmergencia || 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Coordinadores;
