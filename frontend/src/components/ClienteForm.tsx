import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, User, Building, Save } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { clientesApi } from '../services/clientesApi';
import type { ClienteFormData, ContactoFormData } from '../types';

interface ClienteFormProps {
  cliente?: ClienteFormData;
  onBack: () => void;
  onSaved: () => void;
}

export default function ClienteForm({ cliente, onBack, onSaved }: ClienteFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ClienteFormData>({
    tipo: 'empresa',
    nombre: '',
    nit: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    pagina_web: '',
    estado: 'prospecto',
    sector: '',
    prioridad: 'media',
    tamano: 'mediano',
    notas_internas: '',
  });
  const [contactos, setContactos] = useState<ContactoFormData[]>([]);
  const [nuevoContacto, setNuevoContacto] = useState<ContactoFormData>({
    nombre: '',
    cargo: '',
    telefono: '',
    email: '',
    es_principal: false,
  });

  useEffect(() => {
    if (cliente) {
      setFormData(cliente);
      setContactos(cliente.contactos || []);
    }
  }, [cliente]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddContacto = () => {
    if (!nuevoContacto.nombre) {
      toast.error('El nombre del contacto es obligatorio');
      return;
    }
    setContactos(prev => [...prev, { ...nuevoContacto, es_principal: contactos.length === 0 }]);
    setNuevoContacto({ nombre: '', cargo: '', telefono: '', email: '', es_principal: false });
  };

  const handleRemoveContacto = (index: number) => {
    setContactos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre || !formData.nit || !formData.telefono || !formData.email || !formData.direccion || !formData.ciudad) {
      toast.error('Todos los campos marcados con * son obligatorios');
      return;
    }

    try {
      setIsLoading(true);
      
      const data = {
        ...formData,
        contactos: contactos.map((c, i) => ({ 
          ...c, 
          es_principal: i === 0,
          nombre: c.nombre || '',
          cargo: c.cargo || '',
          telefono: c.telefono || '',
          email: c.email || ''
        })),
      };

      if (cliente?.id) {
        await clientesApi.update(cliente.id, data as any);
        toast.success('Cliente actualizado correctamente');
      } else {
        await clientesApi.create(data as any);
        toast.success('Cliente creado correctamente');
      }
      
      onSaved();
    } catch (error: any) {
      console.error('Error al guardar cliente:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Error al guardar el cliente';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {cliente?.id ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h2>
          <p className="text-slate-600">Complete los datos del cliente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de cliente */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Tipo de Cliente</h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tipo"
                value="empresa"
                checked={formData.tipo === 'empresa'}
                onChange={() => setFormData(prev => ({ ...prev, tipo: 'empresa' }))}
                className="w-4 h-4 text-primary-800"
              />
              <Building className="w-4 h-4" />
              <span>Empresa</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tipo"
                value="persona"
                checked={formData.tipo === 'persona'}
                onChange={() => setFormData(prev => ({ ...prev, tipo: 'persona' }))}
                className="w-4 h-4 text-primary-800"
              />
              <User className="w-4 h-4" />
              <span>Persona</span>
            </label>
          </div>
        </div>

        {/* Datos principales */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Datos Principales *</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {formData.tipo === 'empresa' ? 'Razón Social *' : 'Nombre Completo *'}
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">NIT / CC *</label>
              <input
                type="text"
                name="nit"
                value={formData.nit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono *</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Dirección *</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad *</label>
              <input
                type="text"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Departamento</label>
              <input
                type="text"
                name="departamento"
                value={formData.departamento}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Página Web</label>
              <input
                type="text"
                name="pagina_web"
                value={formData.pagina_web}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
              />
            </div>
          </div>
        </div>

        {/* Clasificación */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Clasificación</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
              >
                <option value="prospecto">Prospecto</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="moroso">Moroso</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sector</label>
              <input
                type="text"
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                placeholder="Comercio, Hotel, etc."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prioridad</label>
              <select
                name="prioridad"
                value={formData.prioridad}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
              >
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tamaño</label>
              <select
                name="tamano"
                value={formData.tamano}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
              >
                <option value="pequeno">Pequeño</option>
                <option value="mediano">Mediano</option>
                <option value="grande">Grande</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contactos (solo para empresas) */}
        {formData.tipo === 'empresa' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Contactos de la Empresa</h3>
            
            {/* Lista de contactos */}
            {contactos.length > 0 && (
              <div className="space-y-2 mb-4">
                {contactos.map((contacto, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{contacto.nombre}</span>
                      {contacto.es_principal && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Principal</span>
                      )}
                      {contacto.cargo && <span className="text-sm text-slate-500">({contacto.cargo})</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveContacto(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Agregar contacto */}
            <div className="grid gap-3 md:grid-cols-4">
              <input
                type="text"
                placeholder="Nombre *"
                value={nuevoContacto.nombre}
                onChange={(e) => setNuevoContacto(prev => ({ ...prev, nombre: e.target.value }))}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
              />
              <input
                type="text"
                placeholder="Cargo"
                value={nuevoContacto.cargo}
                onChange={(e) => setNuevoContacto(prev => ({ ...prev, cargo: e.target.value }))}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
              />
              <input
                type="text"
                placeholder="Teléfono"
                value={nuevoContacto.telefono}
                onChange={(e) => setNuevoContacto(prev => ({ ...prev, telefono: e.target.value }))}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
              />
              <button
                type="button"
                onClick={handleAddContacto}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </div>
          </div>
        )}

        {/* Notas internas */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Notas Internas</h3>
          <textarea
            name="notas_internas"
            value={formData.notas_internas}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
            placeholder="Notas privadas sobre el cliente..."
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Guardando...' : 'Guardar Cliente'}
          </button>
        </div>
      </form>

      <Toaster />
    </div>
  );
}
