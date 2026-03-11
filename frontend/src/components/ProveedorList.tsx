import { useState, useEffect } from 'react';
import { Plus, Search, ArrowLeft, Edit, Trash2, Phone, Mail, MapPin, User, Building, Tag, Building2 } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { proveedoresApi } from '../services/financieroApi';
import type { Proveedor } from '../types';

interface Props {
  onClose: () => void;
}

export default function ProveedorList({ onClose }: Props) {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Proveedor | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    tipo: 'empresa' as 'empresa' | 'persona' | 'tecnico_externo' | 'freelancer',
    nombre: '',
    nit_cedula: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    banco: '',
    tipo_cuenta: 'ahorros' as 'ahorros' | 'corriente',
    numero_cuenta: '',
    categoria: '',
    estado: 'activo' as 'activo' | 'inactivo',
    notas: ''
  });

  const cargarProveedores = async () => {
    try {
      setIsLoading(true);
      const response = await proveedoresApi.getAll({ search: searchTerm, limit: 100 });
      setProveedores(response.data || []);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      toast.error('Error al cargar los proveedores');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarProveedores();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const proveedoresFiltrados = proveedores.filter(p => {
    const matchesSearch = 
      (p.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (p.nit_cedula?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (p.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesEstado = !filtroEstado || p.estado === filtroEstado;
    const matchesTipo = !filtroTipo || p.tipo === filtroTipo;
    return matchesSearch && matchesEstado && matchesTipo;
  });

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;
    
    try {
      await proveedoresApi.delete(id);
      await cargarProveedores();
      toast.success('Proveedor eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
      toast.error('Error al eliminar el proveedor');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editando) {
        await proveedoresApi.update(editando.id!, formData);
        toast.success('Proveedor actualizado correctamente');
      } else {
        await proveedoresApi.create(formData);
        toast.success('Proveedor creado correctamente');
      }
      setShowForm(false);
      setEditando(null);
      resetForm();
      cargarProveedores();
    } catch (error: any) {
      console.error('Error al guardar proveedor:', error);
      toast.error(error.response?.data?.message || 'Error al guardar el proveedor');
    }
  };

  const handleEdit = (proveedor: Proveedor) => {
    setEditando(proveedor);
    setFormData({
      tipo: proveedor.tipo,
      nombre: proveedor.nombre,
      nit_cedula: proveedor.nit_cedula,
      telefono: proveedor.telefono || '',
      email: proveedor.email || '',
      direccion: proveedor.direccion || '',
      ciudad: proveedor.ciudad || '',
      departamento: proveedor.departamento || '',
      banco: proveedor.banco || '',
      tipo_cuenta: proveedor.tipo_cuenta || 'ahorros',
      numero_cuenta: proveedor.numero_cuenta || '',
      categoria: proveedor.categoria || '',
      estado: proveedor.estado,
      notas: proveedor.notas || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      tipo: 'empresa',
      nombre: '',
      nit_cedula: '',
      telefono: '',
      email: '',
      direccion: '',
      ciudad: '',
      departamento: '',
      banco: '',
      tipo_cuenta: 'ahorros',
      numero_cuenta: '',
      categoria: '',
      estado: 'activo',
      notas: ''
    });
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'empresa':
        return <Building className="w-5 h-5 text-slate-500" />;
      case 'persona':
        return <User className="w-5 h-5 text-slate-500" />;
      default:
        return <User className="w-5 h-5 text-slate-500" />;
    }
  };

  const getEstadoColor = (estado?: string) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-700';
      case 'inactivo': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Modal Form
  if (showForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              {editando ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h2>
            <button
              onClick={() => { setShowForm(false); setEditando(null); resetForm(); }}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
                required
              >
                <option value="empresa">Empresa</option>
                <option value="persona">Persona</option>
                <option value="tecnico_externo">Técnico Externo</option>
                <option value="freelancer">Freelancer</option>
              </select>
            </div>

            {/* Nombre y NIT */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">NIT/Cédula *</label>
                <input
                  type="text"
                  value={formData.nit_cedula}
                  onChange={(e) => setFormData({ ...formData, nit_cedula: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
                  required
                />
              </div>
            </div>

            {/* Teléfono y Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
                />
              </div>
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
              />
            </div>

            {/* Ciudad y Departamento */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad</label>
                <input
                  type="text"
                  value={formData.ciudad}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Departamento</label>
                <input
                  type="text"
                  value={formData.departamento}
                  onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
                />
              </div>
            </div>

            {/* Banco y Cuenta */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Banco</label>
                <input
                  type="text"
                  value={formData.banco}
                  onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo Cuenta</label>
                <select
                  value={formData.tipo_cuenta}
                  onChange={(e) => setFormData({ ...formData, tipo_cuenta: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
                >
                  <option value="ahorros">Ahorros</option>
                  <option value="corriente">Corriente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Número Cuenta</label>
                <input
                  type="text"
                  value={formData.numero_cuenta}
                  onChange={(e) => setFormData({ ...formData, numero_cuenta: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
                />
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
              <input
                type="text"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                placeholder="Ej: servicios_tecnicos, software, hardware, consultoria"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
              <textarea
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditando(null); resetForm(); }}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700"
              >
                {editando ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Main List View - Matching ClienteList design
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Gestión de Proveedores</h2>
            <p className="text-slate-600">Administra tu base de proveedores</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditando(null); resetForm(); }}
          className="flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Proveedor
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
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
        >
          <option value="">Todos los tipos</option>
          <option value="empresa">Empresa</option>
          <option value="persona">Persona</option>
          <option value="tecnico_externo">Técnico Externo</option>
          <option value="freelancer">Freelancer</option>
        </select>
      </div>

      {/* Lista de proveedores - Grid layout like ClienteList */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-800 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-slate-600 mt-4">Cargando proveedores...</p>
        </div>
      ) : proveedoresFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No hay proveedores registrados</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {proveedoresFiltrados.map((proveedor) => (
            <div key={proveedor.id} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getTipoIcon(proveedor.tipo)}
                  <div>
                    <h3 className="font-semibold text-slate-900">{proveedor.nombre}</h3>
                    <p className="text-sm text-slate-500">NIT: {proveedor.nit_cedula}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <span className={`px-2 py-1 rounded-full text-xs ${getEstadoColor(proveedor.estado)}`}>
                    {proveedor.estado}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {proveedor.email && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-4 h-4" />
                    <span>{proveedor.email}</span>
                  </div>
                )}
                {proveedor.telefono && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4" />
                    <span>{proveedor.telefono}</span>
                  </div>
                )}
                {proveedor.ciudad && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span>{proveedor.ciudad}{proveedor.departamento ? `, ${proveedor.departamento}` : ''}</span>
                  </div>
                )}
                {proveedor.categoria && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Tag className="w-4 h-4" />
                    <span>{proveedor.categoria}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleEdit(proveedor)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-primary-700 hover:bg-primary-50 rounded transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(proveedor.id!)}
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
