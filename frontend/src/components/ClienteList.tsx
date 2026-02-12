import { useState, useEffect } from 'react';
import { Plus, Search, ArrowLeft, Edit, Trash2, Phone, Mail, MapPin, User, Building, Tag } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { clientesApi } from '../services/clientesApi';
import type { ClienteFormData } from '../types';

interface ClienteListProps {
  onBack: () => void;
  onSelectCliente?: (cliente: ClienteFormData) => void;
  onCreate?: () => void;
}

export default function ClienteList({ onBack, onSelectCliente, onCreate }: ClienteListProps) {
  const [clientes, setClientes] = useState<ClienteFormData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');

  const cargarClientes = async () => {
    try {
      setIsLoading(true);
      const response = await clientesApi.getAll({ limit: 100 });
      setClientes(response.data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      toast.error('Error al cargar los clientes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const clientesFiltrados = clientes.filter(c => {
    const matchesSearch = 
      (c.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (c.nit?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (c.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesEstado = !filtroEstado || c.estado === filtroEstado;
    const matchesPrioridad = !filtroPrioridad || c.prioridad === filtroPrioridad;
    return matchesSearch && matchesEstado && matchesPrioridad;
  });

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;
    
    try {
      await clientesApi.delete(id);
      await cargarClientes();
      toast.success('Cliente eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      toast.error('Error al eliminar el cliente');
    }
  };

  const getPrioridadColor = (prioridad?: string) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-100 text-red-700';
      case 'media': return 'bg-yellow-100 text-yellow-700';
      case 'baja': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEstadoColor = (estado?: string) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-700';
      case 'prospecto': return 'bg-blue-100 text-blue-700';
      case 'inactivo': return 'bg-gray-100 text-gray-700';
      case 'moroso': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Gestión de Clientes</h2>
            <p className="text-slate-600">Administra tu base de clientes</p>
          </div>
        </div>
        <button
          onClick={() => onCreate?.()}
          className="flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, NIT o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800 focus:border-transparent"
          />
        </div>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
        >
          <option value="">Todos los estados</option>
          <option value="prospecto">Prospecto</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="moroso">Moroso</option>
        </select>
        <select
          value={filtroPrioridad}
          onChange={(e) => setFiltroPrioridad(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
        >
          <option value="">Todas las prioridades</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
      </div>

      {/* Lista de clientes */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-800 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-slate-600 mt-4">Cargando clientes...</p>
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <Building className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No hay clientes registrados</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clientesFiltrados.map((cliente) => (
            <div key={cliente.id} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {cliente.tipo === 'empresa' ? (
                    <Building className="w-5 h-5 text-slate-500" />
                  ) : (
                    <User className="w-5 h-5 text-slate-500" />
                  )}
                  <div>
                    <h3 className="font-semibold text-slate-900">{cliente.nombre}</h3>
                    <p className="text-sm text-slate-500">NIT: {cliente.nit}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <span className={`px-2 py-1 rounded-full text-xs ${getPrioridadColor(cliente.prioridad)}`}>
                    {cliente.prioridad}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getEstadoColor(cliente.estado)}`}>
                    {cliente.estado}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4" />
                  <span>{cliente.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4" />
                  <span>{cliente.telefono}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4" />
                  <span>{cliente.ciudad}</span>
                </div>
                {cliente.sector && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Tag className="w-4 h-4" />
                    <span>{cliente.sector}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onSelectCliente?.(cliente)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-primary-700 hover:bg-primary-50 rounded transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(cliente.id!)}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Toaster />
    </div>
  );
}
