import React from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import type { Cotizacion } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';

interface CotizacionViewProps {
  cotizacion: Cotizacion;
  onBack: () => void;
  onDownloadPDF: () => void;
}

const CotizacionView: React.FC<CotizacionViewProps> = ({
  cotizacion,
  onBack,
  onDownloadPDF
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>
        <button
          onClick={onDownloadPDF}
          className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-all shadow-sm hover:shadow-md"
        >
          <Download className="w-5 h-5" />
          <span>Descargar PDF</span>
        </button>
      </div>

      {/* Cotización Preview */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 md:p-12">
        {/* Header de la cotización */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-200">
          {/* Emisor */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 mb-3">Enviada por:</h4>
            <h3 className="text-lg font-bold text-primary-600 mb-2">
              {cotizacion.emisor_nombre}
            </h3>
            <div className="text-sm text-slate-700 space-y-1">
              <p>{cotizacion.emisor_nit}</p>
              <p>{cotizacion.emisor_direccion}</p>
              <p className="text-primary-600">{cotizacion.emisor_web}</p>
              <p>{cotizacion.emisor_contacto}</p>
              <p>{cotizacion.emisor_email}</p>
              <p>{cotizacion.emisor_telefono}</p>
            </div>
          </div>

          {/* Cliente */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 mb-3">Solicitada por:</h4>
            <h3 className="text-lg font-bold text-primary-600 mb-2">
              {cotizacion.cliente_nombre}
            </h3>
            <div className="text-sm text-slate-700 space-y-1">
              <p>{cotizacion.cliente_nit}</p>
              <p>{cotizacion.cliente_direccion}</p>
              {cotizacion.cliente_web && (
                <p className="text-primary-600">{cotizacion.cliente_web}</p>
              )}
              <p>{cotizacion.cliente_contacto}</p>
              <p>{cotizacion.cliente_email}</p>
              <p>{cotizacion.cliente_telefono}</p>
            </div>
          </div>
        </div>

        {/* Datos de la cotización */}
        <div className="mb-8 pb-8 border-b border-slate-200">
          <h4 className="text-sm font-bold text-slate-700 mb-4">Datos cotización</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Nº cotización:</span>
              <span className="ml-2 font-semibold text-slate-900">
                {cotizacion.numero_cotizacion}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Divisa:</span>
              <span className="ml-2 font-semibold text-slate-900">
                {cotizacion.divisa}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Fecha:</span>
              <span className="ml-2 font-semibold text-slate-900">
                {formatDate(cotizacion.fecha)}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Validez oferta:</span>
              <span className="ml-2 font-semibold text-slate-900">
                {cotizacion.validez_oferta} días
              </span>
            </div>
            <div className="md:col-span-2">
              <span className="text-slate-500">Forma de pago:</span>
              <span className="ml-2 font-semibold text-slate-900">
                {cotizacion.forma_pago}
              </span>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="bg-primary-600 text-white">
                <th className="px-4 py-3 text-left text-sm font-semibold">Items</th>
                <th className="px-4 py-3 text-center text-sm font-semibold w-20">Cant.</th>
                <th className="px-4 py-3 text-right text-sm font-semibold w-28">Precio u</th>
                <th className="px-4 py-3 text-center text-sm font-semibold w-20">Desc.</th>
                <th className="px-4 py-3 text-right text-sm font-semibold w-28">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {cotizacion.items.map((item, index) => (
                <tr key={item.id || index} className={index % 2 === 0 ? 'bg-slate-50' : ''}>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {item.descripcion}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-slate-700">
                    {item.cantidad}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-700">
                    {formatCurrency(item.precio_unitario)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-slate-700">
                    {item.descuento_porcentaje}%
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-slate-900">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="flex justify-end mb-8">
          <div className="w-full md:w-96 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(cotizacion.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">
                Impuesto {cotizacion.impuesto_porcentaje}%
              </span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(cotizacion.impuesto_valor)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2">
              <span className="text-slate-900">Total</span>
              <span className="text-primary-600">
                {formatCurrency(cotizacion.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Notas */}
        {cotizacion.notas && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-slate-700 mb-3">Notas</h4>
            <div className="text-sm text-slate-600 whitespace-pre-line bg-slate-50 p-4 rounded-lg">
              {cotizacion.notas}
            </div>
          </div>
        )}

        {/* Condiciones */}
        {cotizacion.condiciones && (
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-3">Condiciones</h4>
            <div className="text-sm text-slate-600 whitespace-pre-line bg-slate-50 p-4 rounded-lg">
              {cotizacion.condiciones}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CotizacionView;