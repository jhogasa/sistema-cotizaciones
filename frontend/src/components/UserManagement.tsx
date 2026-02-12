import { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Shield, User, X, Save, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authApi } from '../services/api';
import type { Usuario } from '../types';

interface UserManagementProps {
  currentUser: Usuario;
  onBack: () => void;
}

function UserManagement({ currentUser, onBack }: UserManagementProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'usuario' as 'admin' | 'usuario',
    activo: true,
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setIsLoading(true);
      const data = await authApi.getUsuarios();
      setUsuarios(data);
    } catch (error) {
      toast.error('Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', email: '', password: '', rol: 'usuario', activo: true });
    setEditingUser(null);
    setShowForm(false);
    setShowPassword(false);
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUser(usuario);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol: usuario.rol,
      activo: usuario.activo,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre || !formData.email) {
      toast.error('Nombre y email son requeridos');
      return;
    }

    try {
      setIsLoading(true);

      if (editingUser) {
        // Update
        const updateData: any = {
          nombre: formData.nombre,
          email: formData.email,
          rol: formData.rol,
          activo: formData.activo,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await authApi.actualizarUsuario(editingUser.id, updateData);
        toast.success('Usuario actualizado exitosamente');
      } else {
        // Create
        if (!formData.password) {
          toast.error('La contraseña es requerida para nuevos usuarios');
          return;
        }
        await authApi.crearUsuario({
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
          rol: formData.rol,
        });
        toast.success('Usuario creado exitosamente');
      }

      resetForm();
      await cargarUsuarios();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al guardar usuario';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (usuario: Usuario) => {
    if (usuario.id === currentUser.id) {
      toast.error('No puede eliminar su propia cuenta');
      return;
    }

    if (!confirm(`¿Está seguro de eliminar al usuario "${usuario.nombre}"?`)) return;

    try {
      setIsLoading(true);
      await authApi.eliminarUsuario(usuario.id);
      toast.success('Usuario eliminado exitosamente');
      await cargarUsuarios();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al eliminar usuario';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (usuario: Usuario) => {
    if (usuario.id === currentUser.id) {
      toast.error('No puede desactivar su propia cuenta');
      return;
    }

    try {
      await authApi.actualizarUsuario(usuario.id, { activo: !usuario.activo });
      toast.success(`Usuario ${!usuario.activo ? 'activado' : 'desactivado'} exitosamente`);
      await cargarUsuarios();
    } catch (error: any) {
      toast.error('Error al cambiar estado del usuario');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-primary-800" />
            <h2 className="text-2xl font-bold text-slate-900">Gestión de Usuarios</h2>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-primary-800 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h3>
            <button onClick={resetForm} className="p-1 hover:bg-slate-100 rounded">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contraseña {editingUser && <span className="text-slate-400">(dejar vacío para no cambiar)</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800 focus:border-transparent"
                  required={!editingUser}
                  minLength={6}
                  placeholder={editingUser ? '••••••••' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
              <select
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value as 'admin' | 'usuario' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800 focus:border-transparent"
              >
                <option value="usuario">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            {editingUser && (
              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4 text-primary-800 rounded focus:ring-primary-800"
                />
                <label htmlFor="activo" className="text-sm text-slate-700">Usuario activo</label>
              </div>
            )}

            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{editingUser ? 'Actualizar' : 'Crear'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Usuario</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Rol</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Último Login</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && usuarios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="w-8 h-8 border-2 border-primary-800 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Cargando usuarios...
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No hay usuarios registrados
                  </td>
                </tr>
              ) : (
                usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                          usuario.rol === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {usuario.rol === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{usuario.nombre}</p>
                          {usuario.id === currentUser.id && (
                            <span className="text-xs text-primary-800 font-medium">(Tú)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{usuario.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        usuario.rol === 'admin'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {usuario.rol === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {usuario.rol === 'admin' ? 'Admin' : 'Usuario'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(usuario)}
                        disabled={usuario.id === currentUser.id}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          usuario.activo
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        } ${usuario.id === currentUser.id ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {usuario.ultimo_login
                        ? new Date(usuario.ultimo_login).toLocaleString('es-CO')
                        : 'Nunca'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(usuario)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {usuario.id !== currentUser.id && (
                          <button
                            onClick={() => handleDelete(usuario)}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
