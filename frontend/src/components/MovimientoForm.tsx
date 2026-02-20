import { useState, useEffect } from 'react';
import { X, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { financieroApi } from '../services/financieroApi';
import { clientesApi } from '../services/clientesApi';
import { proveedoresApi } from '../services/financieroApi';
import type { Cliente, Proveedor } from '../types';
import { toast } from 'react-hot-toast';

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export default function MovimientoForm({ onClose, onSaved }: Props) {
  const [tipo, setTipo] = useState<'ingreso' | 'egreso'>('ingreso');
  const [categoria, setCategoria] = useState('');
  const [categoriaPersonalizada, setCategoriaPersonalizada] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [descripcion, setDescripcion] = useState('');
  const [metodoPago, setMetodoPago] = useState('transferencia');
  const [numeroReferencia, setNumeroReferencia] = useState('');
  
  // Para ingresos
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  
  // Para egresos
  const [proveedorId, setProveedorId] = useState<number | null>(null);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [busquedaProveedor, setBusquedaProveedor] = useState('');
  const [proveedorNombre, setProveedorNombre] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  // Cargar clientes
  useEffect(() => {
    if (tipo === 'ingreso' && busquedaCliente.length >= 2) {
      cargarClientes();
    }
  }, [busquedaCliente, tipo]);

  // Cargar proveedores
  useEffect(() => {
    if (tipo === 'egreso' && busquedaProveedor.length >= 2) {
      cargarProveedores();
    }
  }, [busquedaProveedor, tipo]);

  const cargarClientes = async () => {
    try {
      const response = await clientesApi.getAll({ search: busquedaCliente, limit: 10 });
      setClientes(response.data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const cargarProveedores = async () => {
    try {
      const response = await proveedoresApi.getAll({ search: busquedaProveedor, limit: 10 });
      setProveedores(response.data);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    }
  };

  const categoriasIngreso = [
    { value: 'venta_directa', label: 'Venta Directa' },
    { value: 'servicio', label: 'Servicio' },
    { value: 'consultoria', label: 'Consultoría' },
    { value: 'soporte', label: 'Soporte Técnico' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'inversion', label: 'Inversión' },
    { value: 'prestamo', label: 'Préstamo' },
    { value: 'otros', label: 'Otros' }
  ];

  const categoriasEgreso = [
    { value: 'servicio_tecnico', label: 'Servicio Técnico' },
    { value: 'consultoria', label: 'Consultoría' },
    { value: 'software', label: 'Software' },
    { value: 'hardware', label: 'Hardware' },
    { value: 'materiales', label: 'Materiales' },
    { value: 'insumos', label: 'Insumos' },
    { value: 'repuestos', label: 'Repuestos' },
    { value: 'arriendo', label: 'Arriendo' },
    { value: 'servicios_publicos', label: 'Servicios Públicos' },
    { value: 'nomina', label: 'Nómina' },
    { value: 'transporte', label: 'Transporte' },
    { value: 'otros', label: 'Otros' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!monto || !descripcion) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    // Validar categoría
    const categoriaFinal = categoria === 'otros' ? categoriaPersonalizada : categoria;
    if (!categoriaFinal) {
      toast.error('Por favor selecciona o escribe una categoría');
      return;
    }

    try {
      setIsLoading(true);
      
      await financieroApi.crearMovimiento({
        tipo,
        categoria: categoriaFinal,
        monto: parseFloat(monto),
        fecha,
        descripcion,
        cliente_id: tipo === 'ingreso' && clienteId ? clienteId : undefined,
        proveedor_id: tipo === 'egreso' && proveedorId ? proveedorId : undefined,
        proveedor_nombre: tipo === 'egreso' && !proveedorId ? proveedorNombre : undefined,
        metodo_pago: metodoPago as 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta' | 'otro',
        numero_referencia: numeroReferencia
      });

      toast.success('Movimiento registrado exitosamente');
      onSaved();
      onClose();
    } catch (error: any) {
      console.error('Error al registrar movimiento:', error);
      toast.error(error.response?.data?.message || 'Error al registrar movimiento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-primary-800" />
            <h2 className="text-xl font-semibold text-slate-900">Registrar Movimiento</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tipo de Movimiento */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Movimiento *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipo('ingreso')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  tipo === 'ingreso'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Ingreso</span>
              </button>
              <button
                type="button"
                onClick={() => setTipo('egreso')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  tipo === 'egreso'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <TrendingDown className="w-5 h-5" />
                <span className="font-medium">Egreso</span>
              </button>
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Categoría *</label>
            <select
              value={categoria}
              onChange={(e) => {
                setCategoria(e.target.value);
                if (e.target.value !== 'otros') {
                  setCategoriaPersonalizada('');
                }
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800 focus:border-transparent"
              required
            >
              <option value="">Seleccionar categoría...</option>
              {(tipo === 'ingreso' ? categoriasIngreso : categoriasEgreso).map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            
            {/* Campo para categoría personalizada cuando selecciona "otros" */}
            {categoria === 'otros' && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Especificar categoría *
                </label>
                <input
                  type="text"
                  value={categoriaPersonalizada}
                  onChange={(e) => setCategoriaPersonalizada(e.target.value)}
                  placeholder="Ej: Arrendamiento, Dividendos, etc."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800 focus:border-transparent"
                  required
                />
              </div>
            )}
          </div>

          {/* Cliente (solo para ingresos) */}
          {tipo === 'ingreso' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Cliente (Opcional)</label>
              <input
                type="text"
                value={busquedaCliente}
                onChange={(e) => setBusquedaCliente(e.target.value)}
                placeholder="Buscar cliente por nombre o NIT..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800 focus:border-transparent"
              />
              {clientes.length > 0 && busquedaCliente && (
                <div className="mt-2 border border-slate-200 rounded-lg max-h-40 overflow-y-auto">
                  {clientes.map(cliente => (
                    <button
                      key={cliente.id}
                      type="button"
                      onClick={() => {
                        setClienteId(cliente.id!);
                        setBusquedaCliente(cliente.nombre);
                        setClientes([]);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors"
                    >
                      <p className="font-medium text-slate-900">{cliente.nombre}</p>
                      <p className="text-xs text-slate-500">NIT: {cliente.nit}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Proveedor (solo para egresos) */}
          {tipo === 'egreso' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Proveedor</label>
              <input
                type="text"
                value={busquedaProveedor || proveedorNombre}
                onChange={(e) => {
                  setBusquedaProveedor(e.target.value);
                  setProveedorNombre(e.target.value);
                  setProveedorId(null);
                }}
                placeholder="Buscar proveedor o escribir nombre..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800 focus:border-transparent"
              />
              {proveedores.length > 0 && busquedaProveedor && (
                <div className="mt-2 border border-slate-200 rounded-lg max-h-40 overflow-y-auto">
                  {proveedores.map(proveedor => (
                    <button
                      key={proveedor.id}
                      type="button"
                      onClick={() => {
                        setProveedorId(proveedor.id!);
                        setBusquedaProveedor(proveedor.nombre);
                        setProveedorNombre('');
                        setProveedores([]);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors"
                    >
                      <p className="font-medium text-slate-900">{proveedor.nombre}</p>
                      <p className="text-xs text-slate-500">{proveedor.nit_cedula}</p>
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Puedes buscar un proveedor existente o escribir un nombre nuevo
              </p>
            </div>
          )}

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Monto *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800 focus:border-transparent"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Fecha *</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800 focus:border-transparent"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Descripción *</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder={tipo === 'ingreso' 
                ? 'Ej: Venta de servicio de instalación de red WiFi'
                : 'Ej: Compra de materiales para proyecto X'
              }
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Método de Pago *</label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800 focus:border-transparent"
              required
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="cheque">Cheque</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          {/* Número de Referencia */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Número de Referencia (Opcional)</label>
            <input
              type="text"
              value={numeroReferencia}
              onChange={(e) => setNumeroReferencia(e.target.value)}
              placeholder="Ej: TRX-123456, CHQ-789"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800 focus:border-transparent"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                tipo === 'ingreso'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Registrando...' : `Registrar ${tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}`}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
