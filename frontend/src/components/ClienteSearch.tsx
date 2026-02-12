import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Building, User, X, Loader2 } from 'lucide-react';
import { clientesApi } from '../services/clientesApi';
import type { Cliente } from '../types';
import { Toaster, toast } from 'react-hot-toast';

interface ClienteSearchProps {
  onSelect: (cliente: Cliente) => void;
  onCreateNew?: () => void;
  selectedCliente?: Cliente | null;
  onClear?: () => void;
}

export default function ClienteSearch({ onSelect, onCreateNew, selectedCliente, onClear }: ClienteSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    setShowResults(true);

    try {
      const response = await clientesApi.getAll({ limit: 10 });
      const searchLower = searchTerm.toLowerCase();
      const filtered = response.data.filter((c: Cliente) =>
        c.nit?.toLowerCase().includes(searchLower) ||
        c.nombre?.toLowerCase().includes(searchLower) ||
        c.email?.toLowerCase().includes(searchLower)
      );
      setResults(filtered);
    } catch (error) {
      console.error('Error buscando clientes:', error);
      toast.error('Error al buscar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSelect = (cliente: Cliente) => {
    onSelect(cliente);
    setSearchTerm(cliente.nombre);
    setShowResults(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    setResults([]);
    setHasSearched(false);
    onClear?.();
  };

  // Mostrar cliente seleccionado
  if (selectedCliente) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedCliente.tipo === 'empresa' ? (
              <Building className="w-8 h-8 text-slate-400" />
            ) : (
              <User className="w-8 h-8 text-slate-400" />
            )}
            <div>
              <p className="font-medium text-slate-900">{selectedCliente.nombre}</p>
              <p className="text-sm text-slate-500">NIT: {selectedCliente.nit}</p>
            </div>
          </div>
          <button
            onClick={handleClear}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-slate-500">Email:</span> {selectedCliente.email}
          </div>
          <div>
            <span className="text-slate-500">Teléfono:</span> {selectedCliente.telefono}
          </div>
          <div className="col-span-2">
            <span className="text-slate-500">Dirección:</span> {selectedCliente.direccion} - {selectedCliente.ciudad}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={searchRef} className="relative">
      <Toaster />
      <label className="block text-sm font-medium text-slate-700 mb-1">
        Buscar Cliente (NIT o Nombre)
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => hasSearched && setShowResults(true)}
            placeholder="Escribe el NIT o nombre del cliente..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-800 focus:border-transparent"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 animate-spin" />
          )}
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
        >
          Buscar
        </button>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo
        </button>
      </div>

      {/* Dropdown de resultados */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {results.map((cliente) => (
            <button
              key={cliente.id}
              onClick={() => handleSelect(cliente)}
              className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors text-left"
            >
              {cliente.tipo === 'empresa' ? (
                <Building className="w-5 h-5 text-slate-400 flex-shrink-0" />
              ) : (
                <User className="w-5 h-5 text-slate-400 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{cliente.nombre}</p>
                <p className="text-sm text-slate-500">
                  {cliente.nit} • {cliente.email}
                </p>
              </div>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                cliente.estado === 'activo' ? 'bg-green-100 text-green-700' :
                cliente.estado === 'prospecto' ? 'bg-blue-100 text-blue-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {cliente.estado}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Sin resultados */}
      {showResults && hasSearched && results.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-4">
          <p className="text-center text-slate-500 mb-3">No se encontraron clientes</p>
          <button
            onClick={() => {
              setShowResults(false);
              onCreateNew?.();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear nuevo cliente
          </button>
        </div>
      )}
    </div>
  );
}
