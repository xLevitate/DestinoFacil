'use client';

import { Destino } from '../types';
import Link from 'next/link';
import Image from 'next/image';
import { FiMapPin, FiStar, FiHeart } from 'react-icons/fi';
import { useAuth } from '../app/context/AuthContext';
import { useDestinos } from '../app/context/DestinationContext';
import { useState } from 'react';

interface DestinationCardProps {
  destino: Destino;
}

export default function DestinationCard({ destino }: DestinationCardProps) {
  const { estaAutenticado } = useAuth();
  const { adicionarFavorito, removerFavorito, eFavorito } = useDestinos();
  const [favorito, setFavorito] = useState(eFavorito(destino._id));

  const calcularMediaAvaliacao = () => {
    if (!destino.avaliacoes || destino.avaliacoes.length === 0) {
      return 0;
    }
    const soma = destino.avaliacoes.reduce((total, avaliacao) => total + avaliacao.nota, 0);
    return (soma / destino.avaliacoes.length).toFixed(1);
  };

  const handleToggleFavorito = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!estaAutenticado) {
      window.location.href = '/entrar?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    try {
      if (favorito) {
        await removerFavorito(destino._id);
      } else {
        await adicionarFavorito(destino._id);
      }
      setFavorito(!favorito);
    } catch (err) {
      console.error('Erro ao gerenciar favorito:', err);
    }
  };

  return (
    <Link 
      href={`/destinos/${destino._id}`}
      className="group flex flex-col h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md rounded-xl overflow-hidden transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        {destino.imagens && destino.imagens.length > 0 ? (
          <Image
            src={destino.imagens[0]}
            alt={destino.nome}
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
            <FiMapPin className="text-4xl text-gray-400 dark:text-gray-500" />
          </div>
        )}
        
        <button 
          onClick={handleToggleFavorito}
          className={`absolute top-3 right-3 p-2 rounded-full ${
            favorito 
              ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' 
              : 'bg-gray-100/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300'
          }`}
        >
          <FiHeart className={favorito ? 'fill-current' : ''} size={18} />
        </button>
        
        {destino.categorias && destino.categorias.length > 0 && (
          <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
            {destino.categorias[0].charAt(0).toUpperCase() + destino.categorias[0].slice(1)}
          </span>
        )}
      </div>
      
      <div className="p-4 flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-1">
          {destino.nome}
        </h3>
        
        <div className="flex items-center gap-2 mb-2">
          <FiMapPin className="text-blue-600 dark:text-blue-400" size={16} />
          <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{destino.localizacao}</span>
        </div>
        
        {destino.avaliacoes && destino.avaliacoes.length > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <FiStar className="text-yellow-500" size={16} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {calcularMediaAvaliacao()} ({destino.avaliacoes.length})
            </span>
          </div>
        )}
        
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {destino.descricao}
        </p>
      </div>
      
      <div className="px-4 pb-4 mt-auto">
        <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-blue-600 dark:text-blue-400 font-medium">
            R$ {destino.precoEstimado.toLocaleString('pt-BR')}
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
            Ver detalhes
          </span>
        </div>
      </div>
    </Link>
  );
} 