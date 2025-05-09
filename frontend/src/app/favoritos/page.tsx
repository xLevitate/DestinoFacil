'use client';

import { useState, useEffect } from 'react';
import { useDestinos } from '../context/DestinationContext';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import MainLayout from '../../components/MainLayout';
import { FiHeart, FiAlertTriangle, FiMapPin, FiLoader } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { Destino } from '../../types';

export default function FavoritosPage() {
  // estados
  const [destinosFavoritos, setDestinosFavoritos] = useState<Destino[]>([]);
  const [carregando, setCarregando] = useState(true);
  // contextos
  const { obterDestinosFavoritos, removerFavorito, erro } = useDestinos();
  const { estaAutenticado } = useAuth();
  const router = useRouter();

  // carrega os favoritos
  useEffect(() => {
    if (!estaAutenticado) {
      router.push('/entrar?redirect=favoritos');
      return;
    }

    const carregarFavoritos = async () => {
      setCarregando(true);
      try {
        const favoritos = await obterDestinosFavoritos();
        setDestinosFavoritos(favoritos);
      } catch (err) {
        console.error('Erro ao carregar favoritos:', err);
      } finally {
        setCarregando(false);
      }
    };

    carregarFavoritos();
  }, [estaAutenticado, obterDestinosFavoritos, router]);

  // remove um destino dos favoritos
  const removerDosFavoritos = async (id: string) => {
    const sucesso = await removerFavorito(id);
    if (sucesso) {
      setDestinosFavoritos(prev => prev.filter(dest => dest._id !== id));
    }
  };

  return (
    <MainLayout>
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h1 className="text-2xl font-bold md:text-4xl md:leading-tight dark:text-white">Meus Destinos Favoritos</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Aqui estão os destinos que você marcou como favoritos
          </p>
        </div>

        {carregando ? (
          <div className="flex justify-center items-center h-40">
            <FiLoader className="animate-spin text-blue-600 size-8" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando seus favoritos...</span>
          </div>
        ) : destinosFavoritos.length === 0 ? (
          <div className="max-w-md mx-auto rounded-xl bg-white shadow-lg dark:bg-slate-900 dark:border dark:border-gray-700 p-6 text-center">
            <div className="flex justify-center">
              <div className="size-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex justify-center items-center mb-4">
                <FiAlertTriangle className="size-8 text-blue-600 dark:text-blue-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Nenhum favorito encontrado</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Você ainda não adicionou nenhum destino aos seus favoritos.</p>
            <div className="mt-6">
              <Link 
                href="/"
                className="py-2 px-3 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
              >
                Explorar Destinos
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinosFavoritos.map((destino) => (
              <div 
                key={destino._id} 
                className="group flex flex-col h-full bg-white border border-gray-200 shadow-sm rounded-xl dark:bg-slate-900 dark:border-gray-700 dark:shadow-slate-700/[.7]"
              >
                <div className="relative h-52 flex flex-col overflow-hidden rounded-t-xl">
                  {destino.imagens && destino.imagens.length > 0 ? (
                    <Image
                      src={destino.imagens[0]}
                      alt={destino.nome}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="h-52 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <FiMapPin className="size-10 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                  <button 
                    onClick={() => removerDosFavoritos(destino._id)}
                    className="absolute top-3 right-3 size-8 bg-white bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-70 rounded-full flex items-center justify-center text-red-500 hover:text-red-700 focus:outline-none transition-colors z-10"
                    aria-label="Remover dos favoritos"
                  >
                    <FiHeart className="size-5 fill-current" />
                  </button>
                </div>
                <div className="p-4 md:p-6">
                  <span className="block mb-1 text-xs font-semibold uppercase text-blue-600 dark:text-blue-500">
                    {destino.localizacao}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-300">
                    {destino.nome}
                  </h3>
                  <p className="mt-3 text-gray-600 dark:text-gray-400 line-clamp-3">
                    {destino.descricao}
                  </p>
                </div>
                <div className="mt-auto flex border-t border-gray-200 dark:border-gray-700 divide-x divide-gray-200 dark:divide-gray-700">
                  <Link
                    href={`/destinos/${destino._id}`}
                    className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-es-xl bg-white text-gray-800 shadow-sm hover:bg-gray-50 dark:bg-slate-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Ver Detalhes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
} 