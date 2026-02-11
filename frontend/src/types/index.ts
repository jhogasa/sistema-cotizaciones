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
  
  // Datos del cliente
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