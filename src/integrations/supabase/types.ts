export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: '13.0.5' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "13.0.5"
    }
    public: {
        Tables: {
            gastosdetalle_2025_01: {
                Row: {
                    abono: number | null
                    boletaterceros: string | null
                    cargo: number | null
                    cartolahija: string | null
                    cartolamadre: string | null
                    categoria: string | null
                    compras: string | null
                    cuenta_corriente_id: number | null
                    descripcion: string | null
                    dtes: string | null
                    fecha: number | null
                    gastos: string | null
                    honorarios: string | null
                    id: number | null
                    impuestos: string | null
                    n8n_id: number
                    ots: string | null
                    previreds: string | null
                    remuneracions: string | null
                    saldos: string | null
                    tipo_cartola_id: number | null
                    validacionsaldos: string | null
                }
                Insert: {
                    abono?: number | null
                    boletaterceros?: string | null
                    cargo?: number | null
                    cartolahija?: string | null
                    cartolamadre?: string | null
                    categoria?: string | null
                    compras?: string | null
                    cuenta_corriente_id?: number | null
                    descripcion?: string | null
                    dtes?: string | null
                    fecha?: number | null
                    gastos?: string | null
                    honorarios?: string | null
                    id?: number | null
                    impuestos?: string | null
                    n8n_id: number
                    ots?: string | null
                    previreds?: string | null
                    remuneracions?: string | null
                    saldos?: string | null
                    tipo_cartola_id?: number | null
                    validacionsaldos?: string | null
                }
                Update: {
                    abono?: number | null
                    boletaterceros?: string | null
                    cargo?: number | null
                    cartolahija?: string | null
                    cartolamadre?: string | null
                    categoria?: string | null
                    compras?: string | null
                    cuenta_corriente_id?: number | null
                    descripcion?: string | null
                    dtes?: string | null
                    fecha?: number | null
                    gastos?: string | null
                    honorarios?: string | null
                    id?: number | null
                    impuestos?: string | null
                    n8n_id?: number
                    ots?: string | null
                    previreds?: string | null
                    remuneracions?: string | null
                    saldos?: string | null
                    tipo_cartola_id?: number | null
                    validacionsaldos?: string | null
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    created_at: string
                    first_name: string | null
                    id: string
                    last_name: string | null
                    updated_at: string
                }
                Insert: {
                    avatar_url?: string | null
                    created_at?: string
                    first_name?: string | null
                    id: string
                    last_name?: string | null
                    updated_at?: string
                }
                Update: {
                    avatar_url?: string | null
                    created_at?: string
                    first_name?: string | null
                    id?: string
                    last_name?: string | null
                    updated_at?: string
                }
                Relationships: []
            }
            transport_coordinators: {
                Row: {
                    capacity: number
                    companions: number | null
                    created_at: string
                    email: string
                    first_name: string
                    id: string
                    is_active: boolean | null
                    last_name: string | null
                    phone: string
                    updated_at: string
                    vehicle_type: Database["public"]["Enums"]["vehicle_type"]
                    whatsapp_group_link: string | null
                }
                Insert: {
                    capacity: number
                    companions?: number | null
                    created_at?: string
                    email: string
                    first_name: string
                    id?: string
                    is_active?: boolean | null
                    last_name?: string | null
                    phone: string
                    updated_at?: string
                    vehicle_type?: Database["public"]["Enums"]["vehicle_type"]
                    whatsapp_group_link?: string | null
                }
                Update: {
                    capacity?: number
                    companions?: number | null
                    created_at?: string
                    email?: string
                    first_name?: string
                    id?: string
                    is_active?: boolean | null
                    last_name?: string | null
                    phone?: string
                    updated_at?: string
                    vehicle_type?: Database["public"]["Enums"]["vehicle_type"]
                    whatsapp_group_link?: string | null
                }
                Relationships: []
            }
            transport_registrations: {
                Row: {
                    companions_count: number | null
                    created_at: string
                    email: string
                    first_name: string
                    id: string
                    is_driver: boolean | null
                    last_name: string | null
                    phone: string
                    status: Database["public"]["Enums"]["registration_status"] | null
                    updated_at: string
                    waiver_accepted: boolean | null
                }
                Insert: {
                    companions_count?: number | null
                    created_at?: string
                    email: string
                    first_name: string
                    id?: string
                    is_driver?: boolean | null
                    last_name?: string | null
                    phone: string
                    status?: Database["public"]["Enums"]["registration_status"] | null
                    updated_at?: string
                    waiver_accepted?: boolean | null
                }
                Update: {
                    companions_count?: number | null
                    created_at?: string
                    email?: string
                    first_name?: string
                    id?: string
                    is_driver?: boolean | null
                    last_name?: string | null
                    phone?: string
                    status?: Database["public"]["Enums"]["registration_status"] | null
                    updated_at?: string
                    waiver_accepted?: boolean | null
                }
                Relationships: []
            }
            users: {
                Row: {
                    created_at: string
                    email: string
                    id: string
                    role: Database["public"]["Enums"]["app_role"]
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    email: string
                    id?: string
                    role?: Database["public"]["Enums"]["app_role"]
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    email?: string
                    id?: string
                    role?: Database["public"]["Enums"]["app_role"]
                    updated_at?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            app_role: "admin" | "coordinator" | "user"
            registration_status: "pending" | "confirmed" | "cancelled"
            vehicle_type: "car" | "van" | "minibus" | "bus"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
    public: {
        Enums: {
            app_role: ["admin", "coordinator", "user"],
        },
    },
} as const
