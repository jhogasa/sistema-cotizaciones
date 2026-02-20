export interface Item {
  id?: number;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  descuento_porcentaje: number;
  total: number;
  orden?: number;
}

export interface Cotizacion {
  id?: number;
  numero_cotizacion: string;
  
  // Datos del emisor
  emisor_nombre: string;
  emisor_nit: string;
  emisor_direccion: string;
  emisor_web: string;
  emisor_contacto: string;
  emisor_email: string;
  emisor_telefono: string;
  
  // Datos del cliente (desde CRM)
  cliente_id?: number;
  cliente_nombre: string;
  cliente_nit: string;
  cliente_direccion: string;
  cliente_web?: string;
  cliente_contacto: string;
  cliente_email: string;
  cliente_telefono: string;
  
  // Datos de la cotización
  fecha: string;
  validez_oferta: number;
  divisa: string;
  forma_pago: string;
  
  // Totales
  subtotal: number;
  impuesto_porcentaje: number;
  impuesto_valor: number;
  total: number;
  
  // Notas y condiciones
  notas?: string;
  condiciones?: string;
  
  // Estado
  estado: 'borrador' | 'enviada' | 'aceptada' | 'rechazada' | 'anulada';
  
  // Items
  items: Item[];
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export interface CotizacionFormData extends Omit<Cotizacion, 'id' | 'numero_cotizacion' | 'created_at' | 'updated_at'> {}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  details?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Auth types
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'usuario';
  activo: boolean;
  ultimo_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  data: {
    token: string;
    usuario: Usuario;
  };
}

export interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ============ CRM: CLIENTES ============

export interface ContactoFormData {
  id?: number;
  cliente_id?: number;
  nombre?: string;
  cargo?: string;
  telefono?: string;
  email?: string;
  es_principal?: boolean;
  activo?: boolean;
}

export interface Cliente {
  id?: number;
  tipo: 'persona' | 'empresa';
  nombre: string;
  nit: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  departamento?: string;
  pagina_web?: string;
  estado: 'prospecto' | 'activo' | 'inactivo' | 'moroso';
  sector?: string;
  prioridad: 'alta' | 'media' | 'baja';
  tamano: 'pequeno' | 'mediano' | 'grande';
  sincronizado?: boolean;
  ultimo_contacto?: string;
  notas_internas?: string;
  contactos?: Contacto[];
  interacciones?: Interaccion[];
  created_at?: string;
  updated_at?: string;
}

export interface ClienteFormData {
  id?: number;
  tipo?: 'persona' | 'empresa';
  nombre?: string;
  nit?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  pagina_web?: string;
  estado?: 'prospecto' | 'activo' | 'inactivo' | 'moroso';
  sector?: string;
  prioridad?: 'alta' | 'media' | 'baja';
  tamano?: 'pequeno' | 'mediano' | 'grande';
  sincronizado?: boolean;
  ultimo_contacto?: string;
  notas_internas?: string;
  contactos?: ContactoFormData[];
  interacciones?: Interaccion[];
  created_at?: string;
  updated_at?: string;
}

export interface Contacto {
  id?: number;
  cliente_id?: number;
  nombre: string;
  cargo?: string;
  telefono?: string;
  email?: string;
  es_principal?: boolean;
  activo?: boolean;
}

export interface Interaccion {
  id?: number;
  cliente_id?: number;
  tipo: 'llamada' | 'whatsapp' | 'email' | 'visita' | 'reunion' | 'nota';
  descripcion: string;
  fecha: string;
  usuario_id?: number;
  usuario?: Pick<Usuario, 'id' | 'nombre' | 'email'>;
  cotizacion_id?: number;
  duracion_minutos?: number;
  resultado?: string;
}

export interface Documento {
  id?: number;
  cliente_id?: number;
  tipo: 'rut' | 'camara_comercio' | 'contrato' | 'cedula' | 'certificado' | 'otro';
  nombre: string;
  nombre_archivo?: string;
  ruta_archivo?: string;
  tamano?: number;
  mime_type?: string;
  usuario_id?: number;
}

// ============ MÓDULO FINANCIERO ============

export interface Proveedor {
  id?: number;
  tipo: 'empresa' | 'persona' | 'tecnico_externo' | 'freelancer';
  nombre: string;
  nit_cedula: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  banco?: string;
  tipo_cuenta?: 'ahorros' | 'corriente';
  numero_cuenta?: string;
  categoria?: string;
  estado: 'activo' | 'inactivo';
  notas?: string;
  usuario_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Movimiento {
  id?: number;
  tipo: 'ingreso' | 'egreso';
  categoria: string;
  subcategoria?: string;
  monto: number;
  fecha: string;
  descripcion: string;
  cliente_id?: number;
  cliente?: Pick<Cliente, 'nombre'>;
  cotizacion_id?: number;
  proveedor_id?: number;
  proveedor?: Pick<Proveedor, 'nombre'>;
  proveedor_nombre?: string;
  metodo_pago: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta' | 'otro';
  numero_referencia?: string;
  comprobante_url?: string;
  usuario_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardFinanciero {
  resumen: {
    ingresos: string;
    egresos: string;
    balance: string;
    margen: number;
  };
  cuentas_por_cobrar: {
    total: string;
    cantidad: number;
    lista: any[];
  };
  cuentas_por_pagar: {
    total: string;
    cantidad: number;
    vencidas: {
      cantidad: number;
      total: string;
    };
    lista: any[];
  };
  ultimos_movimientos: Movimiento[];
}