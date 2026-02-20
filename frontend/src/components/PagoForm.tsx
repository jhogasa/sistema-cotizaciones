import { useState } from 'react';
import { X, DollarSign, CheckCircle } from 'lucide-react';
import { financieroApi } from '../services/financieroApi';
import { toast } from 'react-hot-toast';

interface Props {
  cotizacionId: number;
  cotizacionNumero: string;
  clienteNombre: string;
  totalCotizacion: number;
  totalPagado: number;
  onClose: () => void;
  onSaved: () => void;
}

export default function PagoForm({ 
  cotizacionId, 
  cotizacionNumero, 
  clienteNombre, 
  totalCotizacion,
  totalPagado,
  onClose, 
  onSaved 
}: Props) {
  const [tipoPago, setTipoPago] = useState<'anticipo' | 'pago_parcial' | 'pago_total'>('anticipo');
  const [monto, setMonto] = useState('');
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0]);
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'transferencia' | 'cheque' | 'tarjeta' | 'otro'>('transferencia');
  const [numeroReferencia, setNumeroReferencia] = useState('');
  const [banco, setBanco] = useState('');
  const [notas, setNotas] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const saldoPendiente = totalCotizacion - totalPagado;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!monto || parseFloat(monto) <= 0) {
      toast.error('Por favor ingresa un monto válido');
      return;
    }

    const montoNum = parseFloat(monto);
    if (montoNum > saldoPendiente) {
      toast.error(`El monto no puede exceder el saldo pendiente ($${saldoPendiente.toLocaleString()})`);
      return;
    }

    try {
      setIsLoading(true);
      
      await financieroApi.registrarPago({
        cotizacion_id: cotizacionId,
        tipo_pago: tipoPago,
        monto: montoNum,
        fecha_pago: fechaPago,
        metodo_pago: metodoPago,
        numero_referencia: numeroReferencia,
        banco: banco,
        notas: notas
      });

      toast.success('Pago registrado exitosamente');
      onSaved();
      onClose();
    } catch (error: any) {
      console.error('Error al registrar pago:', error);
      toast.error(error.response?.data?.error || 'Error al registrar el pago');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePagoCompleto = () => {
    setMonto(saldoPendiente.toString());
    setTipoPago('pago_total');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-slate-900">Registrar Pago</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen de la cotización */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Cotización:</span>
              <p className="font-medium text-slate-900">#{cotizacionNumero}</p>
            </div>
            <div>
              <span className="text-slate-500">Cliente:</span>
              <p className="font-medium text-slate-900">{clienteNombre}</p>
            </div>
            <div>
              <span className="text-slate-500">Total:</span>
              <p className="font-medium text-slate-900">${totalCotizacion.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-slate-500">Pagado:</span>
              <p className="font-medium text-green-600">${totalPagado.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Saldo Pendiente:</span>
              <span className="text-lg font-bold text-red-600">${saldoPendiente.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tipo de Pago */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Pago *</label>
            <select
              value={tipoPago}
              onChange={(e) => setTipoPago(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="anticipo">Anticipo</option>
              <option value="pago_parcial">Pago Parcial</option>
              <option value="pago_total">Pago Total</option>
            </select>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Monto *</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  min="0"
                  step="0.01"
                  max={saldoPendiente}
                />
              </div>
              <button
                type="button"
                onClick={handlePagoCompleto}
                className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1 text-sm font-medium"
                title="Pagar el saldo completo"
              >
                <CheckCircle className="w-4 h-4" />
                Completo
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Saldo pendiente: ${saldoPendiente.toLocaleString()}
            </p>
          </div>

          {/* Fecha de Pago */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Fecha de Pago *</label>
            <input
              type="date"
              value={fechaPago}
              onChange={(e) => setFechaPago(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Método de Pago *</label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="transferencia">Transferencia</option>
              <option value="efectivo">Efectivo</option>
              <option value="cheque">Cheque</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          {/* Número de Referencia */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Número de Referencia</label>
            <input
              type="text"
              value={numeroReferencia}
              onChange={(e) => setNumeroReferencia(e.target.value)}
              placeholder="Número de transacción, cheque, etc."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Banco */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Banco</label>
            <input
              type="text"
              value={banco}
              onChange={(e) => setBanco(e.target.value)}
              placeholder="Nombre del banco"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Notas</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Observaciones adicionales..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : 'Registrar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
