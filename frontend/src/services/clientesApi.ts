import axios from 'axios';
import type { Cliente, Contacto, Interaccion } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============ CLIENTES ============

export const clientesApi = {
  // Listar clientes
  getAll: async (params?: { 
    page?: number; 
    limit?: number; 
    search?: string;
    estado?: string;
    sector?: string;
    prioridad?: string;
  }) => {
    const response = await api.get('/clientes', { params });
    return response.data;
  },

  // Obtener cliente por ID
  getById: async (id: number) => {
    const response = await api.get(`/clientes/${id}`);
    return response.data.data;
  },

  // Crear cliente
  create: async (data: Partial<Cliente> & { contactos?: Partial<Contacto>[] }) => {
    const response = await api.post('/clientes', data);
    return response.data;
  },

  // Actualizar cliente
  update: async (id: number, data: Partial<Cliente> & { contactos?: Partial<Contacto>[] }) => {
    const response = await api.put(`/clientes/${id}`, data);
    return response.data;
  },

  // Eliminar cliente
  delete: async (id: number) => {
    const response = await api.delete(`/clientes/${id}`);
    return response.data;
  },

  // ============ CONTACTOS ============

  addContacto: async (clienteId: number, contacto: Partial<Contacto>) => {
    const response = await api.post(`/clientes/${clienteId}/contactos`, contacto);
    return response.data;
  },

  deleteContacto: async (clienteId: number, contactoId: number) => {
    const response = await api.delete(`/clientes/${clienteId}/contactos/${contactoId}`);
    return response.data;
  },

  // ============ INTERACCIONES ============

  getInteracciones: async (clienteId: number, params?: { page?: number; limit?: number; tipo?: string }) => {
    const response = await api.get(`/clientes/${clienteId}/interacciones`, { params });
    return response.data;
  },

  addInteraccion: async (clienteId: number, interaccion: Partial<Interaccion>) => {
    const response = await api.post(`/clientes/${clienteId}/interacciones`, interaccion);
    return response.data;
  },

  deleteInteraccion: async (clienteId: number, interaccionId: number) => {
    const response = await api.delete(`/clientes/${clienteId}/interacciones/${interaccionId}`);
    return response.data;
  },

  // Exportar clientes
  export: async () => {
    const response = await api.get('/clientes/exportar');
    return response.data;
  },
};

export default clientesApi;
