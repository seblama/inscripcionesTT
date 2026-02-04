import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import RegistrationTable from "@/components/RegistrationTable";
import Navigation from "@/components/Navigation";
import { FormData } from "@/components/RegistrationForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CoordinatorData {
  [key: string]: { coordinador1: string; coordinador2: string };
}

const TableView = () => {
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  const [registrations, setRegistrations] = useState<FormData[]>([]);
  const [coordinators, setCoordinators] = useState<CoordinatorData>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Transform webhook data to FormData interface
  const transformWebhookData = (webhookData: any[]): FormData[] => {
    return webhookData.map((item, index) => {
      const nombre = (item.Nombre?.[0] || '').trim();
      const apellido = (item.Apellido?.[0] || '').trim();
      const rut = (item.RUN?.[0] || '').trim();
      const fechaSalida = (item['Fecha Cerro']?.[0] || '').trim();
      const nivelDificultad = (item['Nivel de dificultad']?.[0] || '').trim();
      const puedeAportarAuto = item['¿Puedes aportar con auto?'] === 'si' ? 'si' : 'no';
      const cuantosCupos = String(item['¿Cuántos cupos tienes?'] || 0);
      const desdedondePartes = item['¿Desde donde partes?'] || '';
      
      // Extract location from the Cerro field in webhook response - trim to remove trailing spaces
      const lugar = (item['Cerro']?.[0] || 'Desconocido').trim();
      
      return {
        id: `webhook-${rut}-${fechaSalida}-${index}`,
        nombre,
        apellido,
        rut,
        fechaSalida,
        fechaSalidaOptionId: `${fechaSalida}-${lugar}-${nivelDificultad}-${index}`,
        puedeAportarAuto,
        cuantosCupos,
        desdedondePartes,
        telefonoContacto: (() => {
          const phoneFields = [
            item['Teléfono'],
            item['Telefono'],
            Array.isArray(item['Telefono de contacto']) ? item['Telefono de contacto'][0] : item['Telefono de contacto'],
            item['Phone'],
            item['phone'],
            item['telefono']
          ];
          const phone = phoneFields.find(p => p && typeof p === 'string' && /^\+?\d[\d\s-]{6,}$/.test(p.trim()));
          return phone?.toString().trim() || '';
        })(),
        nivelDificultad,
        createdAt: new Date(),
        // Store lugar directly for coordinator matching
        lugar,
        // Optional fields
        recordId: undefined,
        rutRecordId: undefined,
        assignedDriverId: (() => {
          const raw = item['Conductor Asignado RUT'] || item['Assigned Driver RUT'] || item['ConductorAsignadoRUT'];
          if (!raw) return undefined;
          // Handle both string and array formats
          const rut = (Array.isArray(raw) ? raw[0] : raw)?.toString().trim();
          return rut || undefined;
        })(),
        asiste: undefined,
        percepcion: undefined,
        mail: undefined,
        telefono: undefined,
        telefonoEmergencia: undefined,
        antecedentesSalud: undefined,
        tratamientos: undefined,
      };
    });
  };

  useEffect(() => {
    // Fetch coordinación data via edge function
    const fetchCoordinacionData = async () => {
      setIsLoading(true);
      try {
        const { data: result, error } = await supabase.functions.invoke('webhook-proxy', {
          body: { action: 'coordinacion-cargar', data: { action: 'load' } }
        });

        if (!error && result) {
          // Handle the response structure: either [{ data: [...] }] or { data: [...] }
          const coordinacionData = Array.isArray(result) && result[0]?.data 
            ? result[0].data 
            : result.data || [];
          
          // Transform and set the registrations
          const transformedData = transformWebhookData(coordinacionData);
          
          // Resolve assignedDriverId (RUT) to internal ID
          const resolvedData = transformedData.map(reg => {
            if (!reg.assignedDriverId) return reg;
            
            // assignedDriverId currently contains a RUT like "15992645-1"
            const driverRut = reg.assignedDriverId;
            
            // Find the driver registration with matching RUT, same date, and can provide car
            const driver = transformedData.find(
              r => r.rut === driverRut && 
                   r.puedeAportarAuto === 'si' && 
                   r.fechaSalida === reg.fechaSalida
            );
            
            return {
              ...reg,
              assignedDriverId: driver?.id || undefined
            };
          });
          
          setRegistrations(resolvedData);
          
          toast({
            title: "Datos cargados",
            description: `${resolvedData.length} registros cargados exitosamente`,
          });
        } else {
          toast({
            title: "Error",
            description: "No se pudo cargar los datos de coordinación",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error de conexión",
          description: "No se pudo conectar con el servidor",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoordinacionData();
  }, [toast]);

  // Fetch coordinator data from fecha-salidas webhook
  useEffect(() => {
    const fetchCoordinatorData = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('fetch-airtable-rut', {
          body: { baseId: 'appZJZUZA2xSwD4RR', tableName: 'Master' }
        });
        
        if (error) {
          console.error('Coordinator fetch error:', error);
          return;
        }
        
        // fechaSalidaValues contains coordinator data from the webhook
        if (data?.fechaSalidaValues) {
          const coordMap: CoordinatorData = {};
          
          data.fechaSalidaValues.forEach((item: any) => {
            const fecha = (item.fecha || '').trim();
            const lugar = (item.lugar || '').trim();
            const key = `${fecha}-${lugar}`;
            
            if (fecha && lugar) {
              coordMap[key] = {
                coordinador1: (item.coordinador1 || '').trim(),
                coordinador2: (item.coordinador2 || '').trim()
              };
            }
          });
          
          setCoordinators(coordMap);
          console.log('Coordinators loaded:', Object.keys(coordMap).length, 'entries');
          console.log('Coordinator keys:', Object.keys(coordMap));
        }
      } catch (error) {
        console.error('Failed to fetch coordinator data:', error);
      }
    };
    
    fetchCoordinatorData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="py-8">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando datos de coordinación...</p>
            </div>
          </div>
        ) : (
          <RegistrationTable 
            registrations={registrations} 
            onUpdateRegistrations={setRegistrations}
            initialSelectedDate={dateParam || undefined}
            coordinators={coordinators}
          />
        )}
      </main>
    </div>
  );
};

export default TableView;
