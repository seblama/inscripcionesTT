import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido"),
  rut: z.string().min(8, "El RUT es requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(8, "Teléfono inválido"),
  lugar: z.string().min(1, "Debes seleccionar un lugar"),
  fechaSalida: z.string().min(1, "La fecha de salida es requerida"),
  tipoTransporte: z.enum(["auto", "pasajero"]),
  cuposDisponibles: z.string().optional(),
  aceptaCompartir: z.boolean().default(false),
});

const RegistrationForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);
  const [dates, setDates] = useState<string[]>([]); // New state for dates

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      rut: "",
      email: "",
      telefono: "",
      lugar: "",
      fechaSalida: "", // Initialize empty
      tipoTransporte: "pasajero",
      cuposDisponibles: "0",
      aceptaCompartir: false,
    },
  });

  const tipoTransporte = form.watch("tipoTransporte");

  useEffect(() => {
    fetchLocationsAndDates();
  }, []);

  const fetchLocationsAndDates = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("get-locations");

      if (error) throw error;

      if (data) {
        // Extract unique locations
        const uniqueLocations = Array.from(new Set(data.map((item: any) => item.Lugar))) as string[];
        setLocations(uniqueLocations);

        // Extract unique dates
        const uniqueDates = Array.from(new Set(data.map((item: any) => item.FechaSalida))) as string[];
        setDates(uniqueDates);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos de salidas",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("register-passenger", {
        body: values,
      });

      if (error) throw error;

      toast({
        title: "¡Registro exitoso!",
        description: "Te has inscrito correctamente a la salida.",
      });

      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un problema al procesar tu inscripción",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in backdrop-blur-sm bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="text-2xl text-center text-slate-800 dark:text-slate-100">
          Formulario de Inscripción
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RUT</FormLabel>
                    <FormControl>
                      <Input placeholder="12.345.678-9" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="juan@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="+56 9 1234 5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lugar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lugar de Salida</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un lugar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

               <FormField
                control={form.control}
                name="fechaSalida"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Salida</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una fecha" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dates.map((date) => (
                          <SelectItem key={date} value={date}>
                            {date}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name="tipoTransporte"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Transporte</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pasajero">Busco transporte</SelectItem>
                        <SelectItem value="auto">Tengo auto</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {tipoTransporte === "auto" && (
                <FormField
                  control={form.control}
                  name="cuposDisponibles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cupos Disponibles</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="6" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="aceptaCompartir"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Acepto compartir mis datos de contacto con el grupo de salida
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Inscribiendo..." : "Inscribirse"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default RegistrationForm;
