'use client';
import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';

interface CampoBuscaProps {
  aoBuscar: (cidade: string) => void;
  carregando?: boolean;
}

export default function CampoBusca({ aoBuscar, carregando = false }: CampoBuscaProps) {
  const [cidade, setCidade] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cidade.trim()) {
      aoBuscar(cidade.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            placeholder="Digite o nome de uma cidade..."
            className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 pl-14"
            disabled={carregando}
          />
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
        </div>
        
        <button
          type="submit"
          disabled={carregando || !cidade.trim()}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {carregando ? 'Buscando...' : 'Buscar'}
        </button>
      </form>
    </div>
  );
} 