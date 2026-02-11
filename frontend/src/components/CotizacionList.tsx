import React, { useState } from 'react';
import { Eye, Edit2, Trash2, Download, FileText, Mail, X } from 'lucide-react';
import type { Cotizacion } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';

interface CotizacionListProps {
  cotizaciones: Cotizacion[];
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onDownloadPDF: (id: number, nombre: string) => void;
  onSendEmail: (id: number) => void;
  isLoading?: boolean;
}

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  isDestructive = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </div>
        <div className="px-6 py-4">
          <p className="text-slate-600">{message}</p>
        </div>
        <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isDestructive 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-primary-800 text-white hover:bg-primary-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const estadoColors = {
  borrador: 'bg-slate-100 text-slate-700',
  enviada: 'bg-blue-100 text-blue-700',
  aceptada: 'bg-green-100 text-green-700',
  rechazada: 'bg-red-100 text-red-700',
  anulada: 'bg-gray-100 text-gray-700'
};

const estadoLabels = {
  borrador: 'Borrador',
  enviada: 'Enviada',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  anulada: 'Anulada'
};

const CotizacionList: React.FC<CotizacionListProps> = ({
  cotizaciones,
  onView,
  onEdit,
  onDelete,
  onDownloadPDF,
  onSendEmail,
  isLoading = false
}) => {
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'delete' | 'email' | null;
    id?: number;
    title?: string;
    message?: string;
  }>({ isOpen: false, type: null });

  const handleDeleteClick = (id: number, numero: string) => {
    setModal({
      isOpen: true,
      type: 'delete',
      id,
      title: 'Eliminar Cotización',
      message: `¿Está seguro de eliminar la cotización #${numero}? Esta acción no se puede deshacer.`
    });
  };

  const handleEmailClick = (id: number, estado: string) => {
    const accion = estado === 'borrador' ? 'Enviar' : 'Reenviar';
    setModal({
      isOpen: true,
      type: 'email',
      id,
      title: `${accion} Cotización`,
      message: `¿${accion} cotización por email al cliente?`
    });
  };

  const handleModalConfirm = () => {
    if (modal.type === 'delete' && modal.id) {
      onDelete(modal.id);
    } else if (modal.type === 'email' && modal.id) {
      onSendEmail(modal.id);
    }
    setModal({ isOpen: false, type: null });
  };

  const handleModalCancel = () => {
    setModal({ isOpen: false, type: null });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (cotizaciones.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-2 text-sm font-semibold text-slate-900">
          No hay cotizaciones
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Comienza creando tu primera cotización
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Nº Cotización
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {cotizaciones.map((cotizacion) => (
                <tr key={cotizacion.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-slate-900">
                        #{cotizacion.numero_cotizacion}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900 font-medium">
                      {cotizacion.cliente_nombre}
                    </div>
                    <div className="text-sm text-slate-500">
                      {cotizacion.cliente_nit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {formatDate(cotizacion.fecha)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-slate-900">
                      {formatCurrency(cotizacion.total)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${estadoColors[cotizacion.estado]}`}>
                      {estadoLabels[cotizacion.estado]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onView(cotizacion.id!)}
                        className="text-slate-600 hover:text-primary-600 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDownloadPDF(cotizacion.id!, cotizacion.cliente_nombre)}
                        className="text-slate-600 hover:text-primary-600 transition-colors"
                        title="Descargar PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(cotizacion.id!)}
                        className="text-slate-600 hover:text-primary-600 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {(cotizacion.estado === 'borrador' || cotizacion.estado === 'enviada') && (
                        <button
                          onClick={() => handleEmailClick(cotizacion.id!, cotizacion.estado)}
                          className="text-slate-600 hover:text-blue-600 transition-colors"
                          title={cotizacion.estado === 'borrador' ? 'Enviar por email' : 'Reenviar email'}
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClick(cotizacion.id!, cotizacion.numero_cotizacion)}
                        className="text-slate-600 hover:text-red-600 transition-colors"
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
        </div>
      </div>

      {/* Modal de confirmación */}
      <Modal
        isOpen={modal.isOpen}
        title={modal.title || ''}
        message={modal.message || ''}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
        confirmText={modal.type === 'delete' ? 'Eliminar' : 'Enviar'}
        cancelText="Cancelar"
        isDestructive={modal.type === 'delete'}
      />
    </>
  );
};

export default CotizacionList;
