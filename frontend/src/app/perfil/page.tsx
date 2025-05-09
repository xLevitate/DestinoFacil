'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../components/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useDestinos } from '../context/DestinationContext';
import Link from 'next/link';
import Image from 'next/image';
import { FiUser, FiMail, FiCalendar, FiHeart, FiLogOut, FiEdit, FiTrash2, FiStar } from 'react-icons/fi';
import { Destino } from '../../types';

export default function ProfilePage() {
  const { usuario, estaAutenticado, sair } = useAuth();
  const { destinos, buscarDestinos } = useDestinos();
  const [destinosFavoritos, setDestinosFavoritos] = useState<Destino[]>([]);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!estaAutenticado) {
      router.push('/entrar');
      return;
    }

    const carregarFavoritos = async () => {
      try {
        setCarregando(true);
        await buscarDestinos();
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    };

    carregarFavoritos();
  }, [estaAutenticado, router, buscarDestinos]);

  useEffect(() => {
    if (usuario && usuario.favoritos && destinos.length > 0) {
      const favoritos = destinos.filter(dest => 
        usuario.favoritos!.includes(dest._id)
      );
      setDestinosFavoritos(favoritos);
    }
  }, [usuario, destinos]);

  const fazerLogout = () => {
    sair();
    router.push('/');
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (carregando) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (!usuario) {
    return (
      <MainLayout>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="text-red-600 dark:text-red-400 text-2xl mb-4">
            Você precisa estar logado para acessar esta página
          </div>
          <Link 
            href="/entrar"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Entrar
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* barra lateral do perfil */}
            <div className="w-full lg:w-1/4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <div className="text-center mb-6">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 text-2xl font-bold">
                      {usuario.nome?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {usuario.nome}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Usuário desde {formatDate(usuario.criado_em)}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                    <FiUser className="text-gray-500" />
                    <span>{usuario.nome}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                    <FiMail className="text-gray-500" />
                    <span>{usuario.email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                    <FiCalendar className="text-gray-500" />
                    <span>Membro desde {formatDate(usuario.criado_em)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                    <FiHeart className="text-gray-500" />
                    <span>{destinosFavoritos.length} destinos favoritos</span>
                  </div>
                </div>
                
                <div className="mt-8 space-y-3">
                  <Link
                    href="/perfil/editar"
                    className="flex items-center justify-center space-x-2 w-full py-2 px-4 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
                  >
                    <FiEdit size={18} />
                    <span>Editar perfil</span>
                  </Link>
                  
                  <button
                    onClick={fazerLogout}
                    className="flex items-center justify-center space-x-2 w-full py-2 px-4 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800"
                  >
                    <FiLogOut size={18} />
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* conteúdo principal */}
            <div className="w-full lg:w-3/4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Meus Destinos Favoritos
                </h2>
                
                {destinosFavoritos.length === 0 ? (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
                    <FiHeart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Você ainda não tem destinos favoritos
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Explore destinos e adicione-os aos favoritos para encontrá-los facilmente aqui.
                    </p>
                    <Link
                      href="/busca"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                    >
                      Explorar destinos
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {destinosFavoritos.map(destino => (
                      <div key={destino._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="relative h-48">
                          <Image
                            src={destino.imagens[0] || '/images/placeholder.jpg'}
                            alt={destino.nome}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                          <button
                            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/80 dark:bg-black/50 rounded-full text-red-500 hover:bg-white dark:hover:bg-black"
                            title="Remover dos favoritos"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                            {destino.nome}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                            {destino.localizacao}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {destino.categorias?.slice(0, 2).map((categoria: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full"
                              >
                                {categoria}
                              </span>
                            ))}
                            {destino.categorias?.length > 2 && (
                              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-full">
                                +{destino.categorias.length - 2}
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            {destino.precoEstimado ? (
                              <span className="text-gray-900 dark:text-gray-100 font-medium">
                                R$ {destino.precoEstimado.toLocaleString('pt-BR')}
                              </span>
                            ) : (
                              <span className="text-gray-500">Preço sob consulta</span>
                            )}
                            <Link
                              href={`/destinos/${destino._id}`}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                            >
                              Ver mais
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Histórico de Atividades
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex-shrink-0 mr-4">
                      <FiHeart className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">
                        Você adicionou Rio de Janeiro aos favoritos
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Há 3 dias
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex-shrink-0 mr-4">
                      <FiStar className="text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">
                        Você avaliou o destino Fernando de Noronha
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Há 1 semana
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex-shrink-0 mr-4">
                      <FiUser className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Conta criada
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(usuario.criado_em)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 