import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, LogOut, Users, Shield, Key, Building, FileText, ArrowLeft } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import CotizacionForm from './components/CotizacionForm';
import CotizacionList from './components/CotizacionList';
import CotizacionView from './components/CotizacionView';
import LoginForm from './components/LoginForm';
import UserManagement from './components/UserManagement';
import ClienteList from './components/ClienteList';
import ClienteForm from './components/ClienteForm';
import { cotizacionesApi, authApi } from './services/api';
import type { Cotizacion, CotizacionFormData, Usuario, ClienteFormData } from './types';
import { downloadBlob } from './utils/helpers';

type View = 'list' | 'create' | 'edit' | 'view' | 'users' | 'change-password' | 'clientes-list' | 'clientes-create' | 'clientes-edit';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [view, setView] = useState<View>('list');
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [cotizacionActual, setCotizacionActual] = useState<Cotizacion | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // CRM State
  const [clienteActual, setClienteActual] = useState<ClienteFormData | undefined>();
  const [currentSection, setCurrentSection] = useState<'cotizaciones' | 'clientes'>('cotizaciones');

  // Change password state
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNuevo, setPasswordNuevo] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setIsAuthenticated(false);
    setUsuario(null);
    setView('list');
    setCotizaciones([]);
  }, []);

  // Limpiar localStorage al cargar la app para forzar login
  useEffect(() => {
    // Forzar logout al cargar para siempre mostrar login
    handleLogout();
  }, [handleLogout]);

  // Listen for auth-logout events (from API interceptor)
  useEffect(() => {
    const handleAuthLogout = () => {
      handleLogout();
      toast.error('Su sesión ha expirado, por favor inicie sesión nuevamente');
    };

    window.addEventListener('auth-logout', handleAuthLogout);
    return () => window.removeEventListener('auth-logout', handleAuthLogout);
  }, [handleLogout]);

  // Load cotizaciones when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      cargarCotizaciones();
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = (user: Usuario, _token: string) => {
    setUsuario(user);
    setIsAuthenticated(true);
  };

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordNuevo !== passwordConfirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordNuevo.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setIsLoading(true);
      await authApi.cambiarPassword(passwordActual, passwordNuevo);
      toast.success('Contraseña actualizada exitosamente');
      setPasswordActual('');
      setPasswordNuevo('');
      setPasswordConfirm('');
      setView('list');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al cambiar contraseña';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ============ CRM ============

  const handleSelectCliente = (cliente: ClienteFormData) => {
    setClienteActual(cliente);
    setView('clientes-edit');
  };

  const handleClienteSaved = () => {
    setClienteActual(undefined);
    setView('clientes-list');
  };

  const handleNavigateToClientes = () => {
    setCurrentSection('clientes');
    setView('clientes-list');
  };

  const handleNavigateToCotizaciones = () => {
    setCurrentSection('cotizaciones');
    setView('list');
  };

  const cotizacionesFiltradas = cotizaciones.filter(c =>
    c.numero_cotizacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cliente_nit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <>
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
          }}
        />
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

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
            <div className="flex items-center gap-3 cursor-pointer" onClick={handleNavigateToCotizaciones}>
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

            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              <button
                onClick={handleNavigateToCotizaciones}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  currentSection === 'cotizaciones' 
                    ? 'bg-white text-primary-800 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="font-medium">Cotizaciones</span>
              </button>
              <button
                onClick={handleNavigateToClientes}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  currentSection === 'clientes' 
                    ? 'bg-white text-primary-800 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building className="w-4 h-4" />
                <span className="font-medium">Clientes</span>
              </button>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  usuario?.rol === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {usuario?.rol === 'admin' ? <Shield className="w-4 h-4" /> : <span className="font-medium">{usuario?.nombre?.charAt(0)}</span>}
                </div>
                <span className="font-medium">{usuario?.nombre}</span>
              </div>

              {/* Change Password */}
              <button
                onClick={() => setView('change-password')}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Cambiar contraseña"
              >
                <Key className="w-5 h-5" />
              </button>

              {/* Admin: User Management */}
              {usuario?.rol === 'admin' && (
                <button
                  onClick={() => setView('users')}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Gestión de usuarios"
                >
                  <Users className="w-5 h-5" />
                </button>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
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
            onNavigateToClientes={() => setView('clientes-create')}
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

        {view === 'users' && usuario && (
          <UserManagement
            currentUser={usuario}
            onBack={() => setView('list')}
          />
        )}

        {view === 'change-password' && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <Key className="w-5 h-5 text-primary-800" />
                <h2 className="text-xl font-semibold text-slate-900">Cambiar Contraseña</h2>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña actual</label>
                  <input
                    type="password"
                    value={passwordActual}
                    onChange={(e) => setPasswordActual(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nueva contraseña</label>
                  <input
                    type="password"
                    value={passwordNuevo}
                    onChange={(e) => setPasswordNuevo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800 focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar nueva contraseña</label>
                  <input
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800 focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordActual('');
                      setPasswordNuevo('');
                      setPasswordConfirm('');
                      setView('list');
                    }}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50"
                  >
                    Actualizar Contraseña
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============ VISTAS CRM ============ */}

        {view === 'clientes-list' && (
          <ClienteList
            onBack={handleNavigateToCotizaciones}
            onSelectCliente={handleSelectCliente}
            onCreate={() => setView('clientes-create')}
          />
        )}

        {view === 'clientes-edit' && clienteActual && (
          <ClienteForm
            cliente={clienteActual}
            onBack={() => setView('clientes-list')}
            onSaved={handleClienteSaved}
          />
        )}

        {view === 'clientes-create' && (
          <ClienteForm
            onBack={() => setView('clientes-list')}
            onSaved={handleClienteSaved}
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
