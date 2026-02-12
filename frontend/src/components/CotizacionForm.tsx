import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import type { Cotizacion, Item, CotizacionFormData, Cliente } from '../types';
import { calcularTotalItem, calcularTotalesCotizacion } from '../utils/helpers';
import ClienteSearch from './ClienteSearch';

interface CotizacionFormProps {
  cotizacion?: Cotizacion;
  onSubmit: (data: CotizacionFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  onNavigateToClientes?: () => void;
}

const CotizacionForm: React.FC<CotizacionFormProps> = ({
  cotizacion,
  onSubmit,
  onCancel,
  isLoading = false,
  onNavigateToClientes
}) => {
  const [formData, setFormData] = useState<CotizacionFormData>({
    emisor_nombre: 'JGS SOLUCIONES TECNOLOGICAS',
    emisor_nit: '1.143.351.428',
    emisor_direccion: 'terrazas de granada mz a lt 6 piso 2',
    emisor_web: 'www.jgstecnologias.com.co',
    emisor_contacto: 'JHON JAIRO GAMBIN SALAS',
    emisor_email: 'jgs.tecnologias@gmail.com',
    emisor_telefono: '3003990501',
    cliente_id: undefined,
    cliente_nombre: '',
    cliente_nit: '',
    cliente_direccion: '',
    cliente_web: '',
    cliente_contacto: '',
    cliente_email: '',
    cliente_telefono: '',
    fecha: new Date().toISOString().split('T')[0],
    validez_oferta: 5,
    divisa: 'COP',
    forma_pago: 'Transferencia',
    subtotal: 0,
    impuesto_porcentaje: 0,
    impuesto_valor: 0,
    total: 0,
    notas: ` `,
    condiciones: ` `,
    estado: 'borrador',
    items: []
  });

  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  const [items, setItems] = useState<Item[]>([
    {
      descripcion: '',
      cantidad: 1,
      precio_unitario: 0,
      descuento_porcentaje: 0,
      total: 0
    }
  ]);

  useEffect(() => {
    if (cotizacion) {
      setFormData({
        emisor_nombre: cotizacion.emisor_nombre,
        emisor_nit: cotizacion.emisor_nit,
        emisor_direccion: cotizacion.emisor_direccion,
        emisor_web: cotizacion.emisor_web,
        emisor_contacto: cotizacion.emisor_contacto,
        emisor_email: cotizacion.emisor_email,
        emisor_telefono: cotizacion.emisor_telefono,
        cliente_id: cotizacion.cliente_id,
        cliente_nombre: cotizacion.cliente_nombre,
        cliente_nit: cotizacion.cliente_nit,
        cliente_direccion: cotizacion.cliente_direccion,
        cliente_web: cotizacion.cliente_web || '',
        cliente_contacto: cotizacion.cliente_contacto,
        cliente_email: cotizacion.cliente_email,
        cliente_telefono: cotizacion.cliente_telefono,
        fecha: cotizacion.fecha,
        validez_oferta: cotizacion.validez_oferta,
        divisa: cotizacion.divisa,
        forma_pago: cotizacion.forma_pago,
        subtotal: cotizacion.subtotal,
        impuesto_porcentaje: cotizacion.impuesto_porcentaje,
        impuesto_valor: cotizacion.impuesto_valor,
        total: cotizacion.total,
        notas: cotizacion.notas,
        condiciones: cotizacion.condiciones,
        estado: cotizacion.estado,
        items: cotizacion.items
      });
      setItems(cotizacion.items);
    }
  }, [cotizacion]);

  useEffect(() => {
    const totales = calcularTotalesCotizacion(items);
    setFormData(prev => ({ ...prev, ...totales }));
  }, [items]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: keyof Item, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'cantidad' || field === 'precio_unitario' || field === 'descuento_porcentaje') {
      newItems[index].total = calcularTotalItem(
        newItems[index].cantidad,
        newItems[index].precio_unitario,
        newItems[index].descuento_porcentaje
      );
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        descripcion: '',
        cantidad: 1,
        precio_unitario: 0,
        descuento_porcentaje: 0,
        total: 0
      }
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSelectCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setFormData(prev => ({
      ...prev,
      cliente_id: cliente.id,
      cliente_nombre: cliente.nombre,
      cliente_nit: cliente.nit,
      cliente_direccion: cliente.direccion,
      cliente_web: cliente.pagina_web || '',
      cliente_contacto: cliente.contactos?.[0]?.nombre || cliente.nombre,
      cliente_email: cliente.email,
      cliente_telefono: cliente.telefono
    }));
  };

  const handleClearCliente = () => {
    setSelectedCliente(null);
    setFormData(prev => ({
      ...prev,
      cliente_id: undefined,
      cliente_nombre: '',
      cliente_nit: '',
      cliente_direccion: '',
      cliente_web: '',
      cliente_contacto: '',
      cliente_email: '',
      cliente_telefono: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...formData, items });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>
        <h2 className="text-2xl font-display font-bold text-slate-900">
          {cotizacion ? 'Editar Cotización' : 'Nueva Cotización'}
        </h2>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          <Save className="w-5 h-5" />
          <span>{isLoading ? 'Guardando...' : 'Guardar'}</span>
        </button>
      </div>

      {/* Datos del Cliente */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
          Datos del Cliente
        </h3>
        
        {/* Buscador de clientes (solo en nueva cotización) */}
        {!cotizacion && (
          <div className="mb-6">
            <ClienteSearch
              onSelect={handleSelectCliente}
              selectedCliente={selectedCliente}
              onClear={handleClearCliente}
              onCreateNew={onNavigateToClientes}
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre / Razón Social *
            </label>
            <input
              type="text"
              name="cliente_nombre"
              value={formData.cliente_nombre}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder=""
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              NIT *
            </label>
            <input
              type="text"
              name="cliente_nit"
              value={formData.cliente_nit}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder=""
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Dirección *
            </label>
            <input
              type="text"
              name="cliente_direccion"
              value={formData.cliente_direccion}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder=""
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Sitio Web
            </label>
            <input
              type="text"
              name="cliente_web"
              value={formData.cliente_web}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="www.ejemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contacto *
            </label>
            <input
              type="text"
              name="cliente_contacto"
              value={formData.cliente_contacto}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder=""
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="cliente_email"
              value={formData.cliente_email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="contacto@ejemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Teléfono *
            </label>
            <input
              type="tel"
              name="cliente_telefono"
              value={formData.cliente_telefono}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="3147088615"
            />
          </div>
        </div>
      </div>

      {/* Datos de la Cotización */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
          Información de la Cotización
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Fecha *
            </label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Validez (días) *
            </label>
            <input
              type="number"
              name="validez_oferta"
              value={formData.validez_oferta}
              onChange={handleInputChange}
              required
              min="1"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Forma de Pago *
            </label>
            <select
              name="forma_pago"
              value={formData.forma_pago}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value="Transferencia">Transferencia</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Cheque">Cheque</option>
              <option value="Crédito 30 días">Crédito 30 días</option>
              <option value="Crédito 60 días">Crédito 60 días</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
            Items de la Cotización
          </h3>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Agregar Item
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm font-semibold text-slate-700">
                  Item #{index + 1}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-12">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Descripción *
                  </label>
                  <textarea
                    value={item.descripcion}
                    onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                    required
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                    placeholder="Descripción del producto o servicio"
                  />
                </div>
                
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    value={item.cantidad}
                    onChange={(e) => handleItemChange(index, 'cantidad', parseFloat(e.target.value))}
                    required
                    min="0.01"
                    step="0.01"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
                
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Precio Unitario *
                  </label>
                  <input
                    type="number"
                    value={item.precio_unitario}
                    onChange={(e) => handleItemChange(index, 'precio_unitario', parseFloat(e.target.value))}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                    placeholder="0.00"
                  />
                </div>
                
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Descuento (%)
                  </label>
                  <input
                    type="number"
                    value={item.descuento_porcentaje}
                    onChange={(e) => handleItemChange(index, 'descuento_porcentaje', parseFloat(e.target.value))}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                    placeholder="0"
                  />
                </div>
                
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Total
                  </label>
                  <input
                    type="text"
                    value={`$${item.total.toLocaleString('es-CO')}`}
                    disabled
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-700 font-semibold text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Totales */}
        <div className="mt-6 border-t border-slate-200 pt-4">
          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center justify-between w-full md:w-80 text-sm">
              <span className="text-slate-600">Subtotal:</span>
              <span className="font-semibold text-slate-900">
                ${formData.subtotal.toLocaleString('es-CO')}
              </span>
            </div>
            <div className="flex items-center justify-between w-full md:w-80 text-sm">
              <span className="text-slate-600">Impuesto (0%):</span>
              <span className="font-semibold text-slate-900">
                ${formData.impuesto_valor.toLocaleString('es-CO')}
              </span>
            </div>
            <div className="flex items-center justify-between w-full md:w-80 text-lg border-t border-slate-200 pt-2">
              <span className="font-bold text-slate-900">Total:</span>
              <span className="font-bold text-primary-600">
                ${formData.total.toLocaleString('es-CO')} {formData.divisa}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notas y Condiciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
            Notas
          </h3>
          <textarea
            name="notas"
            value={formData.notas}
            onChange={handleInputChange}
            rows={8}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
            placeholder="Notas adicionales..."
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
            Condiciones
          </h3>
          <textarea
            name="condiciones"
            value={formData.condiciones}
            onChange={handleInputChange}
            rows={8}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
            placeholder="Términos y condiciones..."
          />
        </div>
      </div>
    </form>
  );
};

export default CotizacionForm;