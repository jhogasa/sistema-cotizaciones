import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Building2, Phone, Mail } from 'lucide-react';
import { proveedoresApi } from '../services/financieroApi';
import type { Proveedor } from '../types';
import { toast } from 'react-hot-toast';

interface Props {
  onClose: () => void;
}

export default function ProveedorList({ onClose }: Props) {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    try {
      setLoading(true);
      const response = await proveedoresApi.getAll({ search, limit: 100 });
      setProveedores(response.data || []);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      toast.error('Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarProveedores();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editando) {
        await proveedoresApi.update(editando.id!, formData);
        toast.success('Proveedor actualizado');
      } else {
        await proveedoresApi.create(formData);
        toast.success('Proveedor creado');
      }
      setShowForm(false);
      setEditando(null);
      resetForm();
      cargarProveedores();
    } catch (error: any) {
      console.error('Error al guardar proveedor:', error);
      toast.error(error.response?.data?.message || 'Error al guardar proveedor');
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

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;
    try {
      await proveedoresApi.delete(id);
      toast.success('Proveedor eliminado');
      cargarProveedores();
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
      toast.error('Error al eliminar proveedor');
    }
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

  const tiposLabel: Record<string, string> = {
    empresa: 'Empresa',
    persona: 'Persona',
    tecnico_externo: 'Técnico Externo',
    freelancer: 'Freelancer'
  };

  const getTipoLabel = (tipo: string) => tiposLabel[tipo] || tipo;

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
              <X className="w-5 h-5" />
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-primary-800" />
            <h2 className="text-xl font-semibold text-slate-900">Proveedores</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Add */}
        <div className="p-4 border-b border-slate-200 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, NIT o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
            />
          </div>
          <button
            onClick={() => { setShowForm(true); setEditando(null); resetForm(); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" />
            Nuevo Proveedor
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-slate-500">Cargando...</div>
          ) : proveedores.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No hay proveedores{search ? ' que coincidan con la búsqueda' : ''}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Tipo</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Nombre</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">NIT/Cédula</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Contacto</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Estado</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {proveedores.map((proveedor) => (
                  <tr key={proveedor.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {getTipoLabel(proveedor.tipo)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{proveedor.nombre}</td>
                    <td className="px-4 py-3 text-slate-600">{proveedor.nit_cedula}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 text-sm text-slate-600">
                        {proveedor.telefono && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {proveedor.telefono}
                          </span>
                        )}
                        {proveedor.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {proveedor.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        proveedor.estado === 'activo' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {proveedor.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(proveedor)}
                          className="p-2 text-slate-600 hover:text-primary-800 hover:bg-slate-100 rounded-lg"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(proveedor.id!)}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-lg"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
