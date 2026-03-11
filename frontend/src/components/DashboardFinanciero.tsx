import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Wallet, AlertCircle, ArrowLeft, Plus, Filter, RefreshCw, Eye, X } from 'lucide-react';
import { financieroApi } from '../services/financieroApi';
import MovimientoForm from './MovimientoForm';
import type { DashboardFinanciero as DashboardData, Movimiento } from '../types';
import { toast } from 'react-hot-toast';

interface Props {
  onBack: () => void;
}

export default function DashboardFinanciero({ onBack }: Props) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMovimientoForm, setShowMovimientoForm] = useState(false);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<Movimiento | null>(null);
  
  // Filtros
  const [periodo, setPeriodo] = useState('todos');
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [busquedaCliente, setBusquedaCliente] = useState('');

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  useEffect(() => {
    cargarDashboard();
    cargarMovimientos();
  }, [periodo, mes, anio]);

  const cargarDashboard = async () => {
    try {
      setIsLoading(true);
      const params: any = { periodo };
      if (periodo === 'mes') {
        params.mes = mes;
        params.anio = anio;
      } else if (periodo === 'año') {
        params.anio = anio;
      }
      const data = await financieroApi.getDashboard(params);
      setDashboard(data);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      toast.error('Error al cargar el dashboard financiero');
    } finally {
      setIsLoading(false);
    }
  };

  const cargarMovimientos = async () => {
    try {
      const params: any = { limit: 100 };
      if (filtroTipo) params.tipo = filtroTipo;
      if (filtroCategoria) params.categoria = filtroCategoria;
      if (busquedaCliente) params.search = busquedaCliente;
      
      const response = await financieroApi.getMovimientos(params);
      setMovimientos(response.data);
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
    }
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(num);
  };

  const getPeriodoLabel = () => {
    switch (periodo) {
      case 'todos': return 'Todos los tiempos';
      case 'mes': return `${meses[mes - 1]} ${anio}`;
      case 'año': return `Año ${anio}`;
      case 'dia': return 'Hoy';
      default: return '';
    }
  };

  if (isLoading && !dashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestión Financiera</h1>
            <p className="text-sm text-slate-600">{getPeriodoLabel()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Selector de Período */}
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
          >
            <option value="todos">Todos</option>
            <option value="mes">Este Mes</option>
            <option value="año">Este Año</option>
            <option value="dia">Hoy</option>
          </select>

          {periodo === 'mes' && (
            <>
              <select
                value={mes}
                onChange={(e) => setMes(parseInt(e.target.value))}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
              >
                {meses.map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
              <select
                value={anio}
                onChange={(e) => setAnio(parseInt(e.target.value))}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800"
              >
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </>
          )}

          <button
            onClick={() => {
              cargarDashboard();
              cargarMovimientos();
            }}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Actualizar"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowMovimientoForm(true)}
            className="flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Registrar</span>
          </button>
        </div>
      </div>

      {/* Modal de Movimiento */}
      {showMovimientoForm && (
        <MovimientoForm
          onClose={() => setShowMovimientoForm(false)}
          onSaved={() => {
            setShowMovimientoForm(false);
            cargarDashboard();
            cargarMovimientos();
          }}
        />
      )}

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Ingresos</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(dashboard?.resumen?.ingresos || 0)}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Egresos</span>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(dashboard?.resumen?.egresos || 0)}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Balance</span>
            <Wallet className="w-5 h-5 text-blue-600" />
          </div>
          <p className={`text-2xl font-bold ${parseFloat(String(dashboard?.resumen?.balance || '0')) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(dashboard?.resumen?.balance || 0)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Margen</span>
            <DollarSign className="w-5 h-5 text-primary-800" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{dashboard?.resumen?.margen?.toFixed(1) || 0}%</p>
        </div>
      </div>

      {/* Filtros de Movimientos */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Filtros:</span>
          </div>
          
          <select
            value={filtroTipo}
            onChange={(e) => {
              setFiltroTipo(e.target.value);
              cargarMovimientos();
            }}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
          >
            <option value="">Todos los tipos</option>
            <option value="ingreso">Ingresos</option>
            <option value="egreso">Egresos</option>
          </select>

          <select
            value={filtroCategoria}
            onChange={(e) => {
              setFiltroCategoria(e.target.value);
              cargarMovimientos();
            }}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
          >
            <option value="">Todas las categorías</option>
            <option value="venta_directa">Venta Directa</option>
            <option value="servicio">Servicio</option>
            <option value="consultoria">Consultoría</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="materiales">Materiales</option>
            <option value="insumos">Insumos</option>
            <option value="repuestos">Repuestos</option>
            <option value="hardware">Hardware</option>
            <option value="software">Software</option>
            <option value="servicio_tecnico">Servicio Técnico</option>
          </select>

          {/* Filtro por cliente/empresa */}
          <input
            type="text"
            value={busquedaCliente}
            onChange={(e) => {
              setBusquedaCliente(e.target.value);
              cargarMovimientos();
            }}
            placeholder="Buscar cliente o empresa..."
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm w-48"
          />

          <span className="text-sm text-slate-500">
            {movimientos.length} movimientos
          </span>
        </div>
      </div>

      {/* Lista de Movimientos */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Movimientos</h2>
        </div>
        
        {movimientos.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No hay movimientos registrados</p>
            <button
              onClick={() => setShowMovimientoForm(true)}
              className="mt-4 text-primary-800 hover:underline"
            >
              Registrar el primer movimiento
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cliente/Proveedor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Método</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Monto</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {movimientos.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(mov.fecha).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        mov.tipo === 'ingreso' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {mov.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {mov.categoria}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 max-w-xs truncate" title={mov.descripcion}>
                      {mov.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {mov.cliente?.nombre || mov.proveedor?.nombre || mov.proveedor_nombre || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {mov.metodo_pago}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                      mov.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {mov.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(mov.monto)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setMovimientoSeleccionado(mov)}
                        className="text-primary-800 hover:text-primary-600 p-1 rounded hover:bg-primary-50"
                        title="Ver detalles"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para ver detalles del movimiento */}
      {movimientoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Detalles del Movimiento</h3>
              <button
                onClick={() => setMovimientoSeleccionado(null)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Tipo:</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  movimientoSeleccionado.tipo === 'ingreso' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {movimientoSeleccionado.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Fecha:</span>
                <span className="text-slate-900 font-medium">
                  {new Date(movimientoSeleccionado.fecha).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">Monto:</span>
                <span className={`text-xl font-bold ${
                  movimientoSeleccionado.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {movimientoSeleccionado.tipo === 'ingreso' ? '+' : '-'}
                  {formatCurrency(movimientoSeleccionado.monto)}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <span className="text-slate-600 text-sm">Descripción:</span>
                <p className="text-slate-900 mt-1">{movimientoSeleccionado.descripcion}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-600 text-sm">Categoría:</span>
                  <p className="text-slate-900 font-medium">{movimientoSeleccionado.categoria}</p>
                </div>
                <div>
                  <span className="text-slate-600 text-sm">Método de Pago:</span>
                  <p className="text-slate-900 font-medium capitalize">{movimientoSeleccionado.metodo_pago}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-600 text-sm">
                    {movimientoSeleccionado.tipo === 'ingreso' ? 'Cliente:' : 'Proveedor:'}
                  </span>
                  <p className="text-slate-900 font-medium">
                    {movimientoSeleccionado.cliente?.nombre || 
                     movimientoSeleccionado.proveedor?.nombre || 
                     movimientoSeleccionado.proveedor_nombre || 
                     '-'}
                  </p>
                </div>
                {movimientoSeleccionado.numero_referencia && (
                  <div>
                    <span className="text-slate-600 text-sm">Referencia:</span>
                    <p className="text-slate-900 font-medium">{movimientoSeleccionado.numero_referencia}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
