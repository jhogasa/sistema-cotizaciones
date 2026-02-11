import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import CotizacionForm from './components/CotizacionForm';
import CotizacionList from './components/CotizacionList';
import CotizacionView from './components/CotizacionView';
import { cotizacionesApi } from './services/api';
import type { Cotizacion, CotizacionFormData } from './types';
import { downloadBlob } from './utils/helpers';

type View = 'list' | 'create' | 'edit' | 'view';

function App() {
  const [view, setView] = useState<View>('list');
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [cotizacionActual, setCotizacionActual] = useState<Cotizacion | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    cargarCotizaciones();
  }, []);

  const cargarCotizaciones = async () => {
    try {
      setIsLoading(true);
      const response = await cotizacionesApi.getAll({ limit: 100 });
      setCotizaciones(response.data);
    } catch (error) {
      console.error('Error al cargar cotizaciones:', error);
      toast.error('Error al cargar las cotizaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: CotizacionFormData) => {
    try {
      setIsLoading(true);
      await cotizacionesApi.create(data);
      await cargarCotizaciones();
      setView('list');
      toast.success('Cotización creada exitosamente');
    } catch (error) {
      console.error('Error al crear cotización:', error);
      toast.error('Error al crear la cotización');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (data: CotizacionFormData) => {
    if (!cotizacionActual?.id) return;
    
    try {
      setIsLoading(true);
      await cotizacionesApi.update(cotizacionActual.id, data);
      await cargarCotizaciones();
      setView('list');
      setCotizacionActual(undefined);
      toast.success('Cotización actualizada exitosamente');
    } catch (error) {
      console.error('Error al actualizar cotización:', error);
      toast.error('Error al actualizar la cotización');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setIsLoading(true);
      await cotizacionesApi.delete(id);
      await cargarCotizaciones();
      toast.success('Cotización eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar cotización:', error);
      toast.error('Error al eliminar la cotización');
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = async (id: number) => {
    try {
      const cotizacion = await cotizacionesApi.getById(id);
      setCotizacionActual(cotizacion);
      setView('view');
    } catch (error) {
      console.error('Error al cargar cotización:', error);
      toast.error('Error al cargar la cotización');
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const cotizacion = await cotizacionesApi.getById(id);
      setCotizacionActual(cotizacion);
      setView('edit');
    } catch (error) {
      console.error('Error al cargar cotización:', error);
      toast.error('Error al cargar la cotización');
    }
  };

  const handleDownloadPDF = async (id: number, clienteNombre: string) => {
    try {
      const blob = await cotizacionesApi.downloadPDF(id);
      const cotizacion = cotizaciones.find(c => c.id === id);
      const filename = `cotizacion_${cotizacion?.numero_cotizacion}_${clienteNombre.replace(/\s+/g, '_')}.pdf`;
      downloadBlob(blob, filename);
      toast.success('PDF descargado correctamente');
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      toast.error('Error al descargar el PDF');
    }
  };

  const handleSendEmail = async (id: number) => {
    try {
      setIsLoading(true);
      await cotizacionesApi.sendEmail(id);
      await cargarCotizaciones();
      toast.success('Cotización enviada exitosamente por email');
    } catch (error) {
      console.error('Error al enviar email:', error);
      toast.error('Error al enviar la cotización por email');
    } finally {
      setIsLoading(false);
    }
  };

  const cotizacionesFiltradas = cotizaciones.filter(c =>
    c.numero_cotizacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cliente_nit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100">
      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            borderRadius: '10px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#059669',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo JGS */}
              <img 
                src="/logo-jgs.jpg" 
                alt="JGS Soluciones Tecnológicas" 
                className="h-12 w-auto rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-display font-bold text-slate-900">
                  Sistema de Cotizaciones
                </h1>
                <p className="text-sm text-slate-600">
                  JGS Soluciones Tecnológicas
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'list' && (
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por número, cliente o NIT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800 focus:border-transparent transition-all"
                />
              </div>
              <button
                onClick={() => {
                  setCotizacionActual(undefined);
                  setView('create');
                }}
                className="flex items-center gap-2 bg-primary-800 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-all shadow-sm hover:shadow-md"
              >
                <Plus className="w-5 h-5" />
                <span>Nueva Cotización</span>
              </button>
            </div>

            {/* Lista */}
            <CotizacionList
              cotizaciones={cotizacionesFiltradas}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDownloadPDF={handleDownloadPDF}
              onSendEmail={handleSendEmail}
              isLoading={isLoading}
            />
          </div>
        )}

        {view === 'create' && (
          <CotizacionForm
            onSubmit={handleCreate}
            onCancel={() => setView('list')}
            isLoading={isLoading}
          />
        )}

        {view === 'edit' && cotizacionActual && (
          <CotizacionForm
            cotizacion={cotizacionActual}
            onSubmit={handleUpdate}
            onCancel={() => {
              setView('list');
              setCotizacionActual(undefined);
            }}
            isLoading={isLoading}
          />
        )}

        {view === 'view' && cotizacionActual && (
          <CotizacionView
            cotizacion={cotizacionActual}
            onBack={() => {
              setView('list');
              setCotizacionActual(undefined);
            }}
            onDownloadPDF={() => handleDownloadPDF(cotizacionActual.id!, cotizacionActual.cliente_nombre)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-slate-600">
            © 2026 JGS Soluciones Tecnológicas - Sistema de Cotizaciones v1.0.0
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
