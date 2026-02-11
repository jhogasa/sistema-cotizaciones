import axios from 'axios';
import type { Cotizacion, CotizacionFormData, ApiResponse, PaginatedResponse } from '../types';

// Forma correcta de acceder a variables de entorno en Vite
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const cotizacionesApi = {
  // Obtener todas las cotizaciones
  getAll: async (params?: {
    page?: number;
    limit?: number;
    estado?: string;
    search?: string;
  }): Promise<PaginatedResponse<Cotizacion>> => {
    const response = await api.get('/cotizaciones', { params });
    return response.data;
  },

  // Obtener una cotización por ID
  getById: async (id: number): Promise<Cotizacion> => {
    const response = await api.get<ApiResponse<Cotizacion>>(`/cotizaciones/${id}`);
    return response.data.data!;
  },

  // Crear nueva cotización
  create: async (data: CotizacionFormData): Promise<Cotizacion> => {
    const response = await api.post<ApiResponse<Cotizacion>>('/cotizaciones', data);
    return response.data.data!;
  },

  // Actualizar cotización
  update: async (id: number, data: Partial<CotizacionFormData>): Promise<Cotizacion> => {
    const response = await api.put<ApiResponse<Cotizacion>>(`/cotizaciones/${id}`, data);
    return response.data.data!;
  },

  // Eliminar cotización
  delete: async (id: number): Promise<void> => {
    await api.delete(`/cotizaciones/${id}`);
  },

  // Obtener siguiente número de cotización
  getSiguienteNumero: async (): Promise<string> => {
    const response = await api.get<{ numero: string }>('/cotizaciones/siguiente-numero');
    return response.data.numero;
  },

  // Descargar PDF
  downloadPDF: async (id: number): Promise<Blob> => {
    const response = await api.get(`/cotizaciones/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Enviar cotización por email
  sendEmail: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.post<ApiResponse<any>>(`/cotizaciones/${id}/enviar`);
    return response.data;
  },
};

export default api;