import api from './api';
import type { DashboardFinanciero, Movimiento, Proveedor, ApiResponse, PaginatedResponse } from '../types';

export interface PagoData {
  cotizacion_id: number;
  tipo_pago: 'anticipo' | 'pago_parcial' | 'pago_total';
  monto: number;
  fecha_pago?: string;
  metodo_pago?: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta' | 'otro';
  numero_referencia?: string;
  banco?: string;
  notas?: string;
}

export interface PagoResponse {
  pago: any;
  cotizacion: string;
  cliente: string;
  total_cotizacion: number;
  total_pagado: number;
  saldo_pendiente: number;
}

export interface PagosCotizacionResponse {
  cotizacion: any;
  pagos: any[];
  resumen: {
    total_cotizacion: number;
    total_pagado: number;
    saldo_pendiente: number;
    esta_pagada: boolean;
  };
}

export const financieroApi = {
  // Dashboard
  getDashboard: async (mes?: number, anio?: number): Promise<DashboardFinanciero> => {
    const params = mes && anio ? { mes, anio } : {};
    const response = await api.get<{ data: DashboardFinanciero }>('/financiero/dashboard', { params });
    return response.data.data;
  },

  // Movimientos
  getMovimientos: async (params?: {
    page?: number;
    limit?: number;
    tipo?: string;
    categoria?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    search?: string;
  }): Promise<PaginatedResponse<Movimiento>> => {
    const response = await api.get('/financiero/movimientos', { params });
    return response.data;
  },

  crearMovimiento: async (data: Partial<Movimiento>): Promise<Movimiento> => {
    const response = await api.post<ApiResponse<Movimiento>>('/financiero/movimientos', data);
    return response.data.data!;
  },

  // Pagos de cotizaciones
  registrarPago: async (data: PagoData): Promise<PagoResponse> => {
    const response = await api.post<ApiResponse<PagoResponse>>('/financiero/pagos', data);
    return response.data.data!;
  },

  getPagosPorCotizacion: async (cotizacionId: number): Promise<PagosCotizacionResponse> => {
    const response = await api.get<{ data: PagosCotizacionResponse }>(`/financiero/pagos/${cotizacionId}`);
    return response.data.data;
  },

  // Cambiar estado de cotización
  cambiarEstadoCotizacion: async (id: number, estado: string): Promise<any> => {
    const response = await api.put<ApiResponse<any>>(`/financiero/cotizaciones/${id}/estado`, { estado });
    return response.data.data;
  },

  // Reportes
  getReporteIngresosEgresos: async (anio?: number): Promise<any[]> => {
    const params = anio ? { anio } : {};
    const response = await api.get<{ data: any[] }>('/financiero/reportes/ingresos-egresos', { params });
    return response.data.data;
  },
};

export const proveedoresApi = {
  // CRUD Proveedores
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tipo?: string;
    estado?: string;
    categoria?: string;
  }): Promise<PaginatedResponse<Proveedor>> => {
    const response = await api.get('/proveedores', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Proveedor> => {
    const response = await api.get<{ data: Proveedor }>(`/proveedores/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<Proveedor>): Promise<Proveedor> => {
    const response = await api.post<ApiResponse<Proveedor>>('/proveedores', data);
    return response.data.data!;
  },

  update: async (id: number, data: Partial<Proveedor>): Promise<Proveedor> => {
    const response = await api.put<ApiResponse<Proveedor>>(`/proveedores/${id}`, data);
    return response.data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/proveedores/${id}`);
  },
};
