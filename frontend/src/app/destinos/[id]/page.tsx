'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import MainLayout from '../../../components/MainLayout';
import { useDestinos } from '../../context/DestinationContext';
import { useAuth } from '../../context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { FiMapPin, FiTag, FiDollarSign, FiStar, FiHeart, FiShare2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Destino, Avaliacao } from '../../../types';
import FlightSearchWidget from '../../../components/FlightSearchWidget';

export default function DestinationDetail() {
  const { id } = useParams<{ id: string }>();
  const { obterDestinoPorId, adicionarFavorito, removerFavorito, eFavorito } = useDestinos();
  const { estaAutenticado } = useAuth();
  const [destino, setDestino] = useState<Destino | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [indiceImagemAtual, setIndiceImagemAtual] = useState(0);
  const [ehFavorito, setEhFavorito] = useState(false);

  useEffect(() => {
    const buscarDestino = async () => {
      try {
        setCarregando(true);
        setErro(null);
        
        if (typeof id !== 'string') {
          throw new Error('ID inválido');
        }
        
        const dados = await obterDestinoPorId(id);
        
        if (!dados) {
          throw new Error('Destino não encontrado');
        }
        
        setDestino(dados);
        setEhFavorito(eFavorito(id));
      } catch (err) {
        console.error(err);
        setErro('Falha ao carregar o destino. Por favor, tente novamente.');
      } finally {
        setCarregando(false);
      }
    };

    buscarDestino();
  }, [id, obterDestinoPorId, eFavorito]);

  const handleNextImage = () => {
    if (destino && destino.imagens.length > 0) {
      setIndiceImagemAtual((prevIndex: number) => 
        prevIndex === destino.imagens.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const handlePrevImage = () => {
    if (destino && destino.imagens.length > 0) {
      setIndiceImagemAtual((prevIndex: number) => 
        prevIndex === 0 ? destino.imagens.length - 1 : prevIndex - 1
      );
    }
  };

  const handleFavoriteToggle = async () => {
    if (!estaAutenticado) {
      window.location.href = '/entrar?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    try {
      if (ehFavorito) {
        await removerFavorito(id as string);
      } else {
        await adicionarFavorito(id as string);
      }
      setEhFavorito(!ehFavorito);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: destino?.nome || 'Destino',
        text: `Confira este destino incrível: ${destino?.nome}`,
        url: window.location.href,
      }).catch((error) => console.log('Erro ao compartilhar:', error));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copiado para a área de transferência!'))
        .catch((err) => console.error('Falha ao copiar link:', err));
    }
  };

  const calculateAverageRating = () => {
    if (!destino || !destino.avaliacoes || destino.avaliacoes.length === 0) {
      return 0;
    }
    
    const sum = destino.avaliacoes.reduce((total: number, avaliacao: Avaliacao) => total + avaliacao.nota, 0);
    return (sum / destino.avaliacoes.length).toFixed(1);
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

  if (erro || !destino) {
    return (
      <MainLayout>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="text-red-600 dark:text-red-400 text-2xl mb-4">
            {erro || 'Destino não encontrado'}
          </div>
          <Link 
            href="/busca"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar para busca
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="pt-8 pb-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <Link 
                    href="/" 
                    className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
                  >
                    Início
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="mx-2 text-gray-400">/</span>
                    <Link 
                      href="/busca" 
                      className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
                    >
                      Destinos
                    </Link>
                  </div>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                      {destino.nome}
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
          
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {destino.nome}
                </h1>
                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                  <FiMapPin className="mr-2" />
                  <span>{destino.localizacao}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <FiStar className="text-yellow-500 mr-1" />
                    <span className="text-gray-900 dark:text-white font-medium">
                      {calculateAverageRating()}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 ml-1">
                      ({destino.avaliacoes?.length || 0} avaliações)
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center mt-4 lg:mt-0 space-x-4">
                <button
                  onClick={handleFavoriteToggle}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    ehFavorito
                      ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <FiHeart className={ehFavorito ? 'fill-current' : ''} />
                  <span>{ehFavorito ? 'Favoritado' : 'Favoritar'}</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg"
                >
                  <FiShare2 />
                  <span>Compartilhar</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="mb-10">
            {destino.imagens && destino.imagens.length > 0 ? (
              <div className="relative h-60 sm:h-80 md:h-96 lg:h-[500px] rounded-xl overflow-hidden">
                <Image
                  src={destino.imagens[indiceImagemAtual] || '/images/placeholder.jpg'}
                  alt={`${destino.nome} - Imagem ${indiceImagemAtual + 1}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-opacity duration-500"
                />
                
                {destino.imagens.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
                    >
                      <FiChevronLeft size={24} />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
                    >
                      <FiChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="h-60 sm:h-80 md:h-96 lg:h-[500px] bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400 text-xl">Sem imagens disponíveis</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sobre o destino</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  {destino.descricao}
                </p>
                
                {destino.categorias && destino.categorias.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Categorias</h3>
                    <div className="flex flex-wrap gap-2">
                      {destino.categorias.map((categoria, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm"
                        >
                          <FiTag className="mr-1" />
                          {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {destino.pontos_de_interesse && destino.pontos_de_interesse.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Pontos de interesse</h3>
                    <ul className="space-y-3">
                      {destino.pontos_de_interesse.map((ponto, index) => (
                        <li key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 dark:text-white">{ponto.nome}</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">{ponto.descricao}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Avaliações</h2>
                {destino.avaliacoes && destino.avaliacoes.length > 0 ? (
                  <div className="space-y-6">
                    {destino.avaliacoes.map((avaliacao, index) => (
                      <div key={index} className="border-b dark:border-gray-700 pb-6 last:border-b-0 last:pb-0">
                        <div className="flex items-start mb-2">
                          <div className="mr-4">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-300 font-semibold">
                                {avaliacao.usuario.nome.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-white mr-2">{avaliacao.usuario.nome}</h4>
                              <div className="flex items-center">
                                <FiStar className="text-yellow-500" />
                                <span className="text-gray-900 dark:text-white font-medium ml-1">{avaliacao.nota}</span>
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              {avaliacao.comentario}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">Nenhuma avaliação disponível ainda.</p>
                )}
              </div>
            </div>
            
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Informações</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Preço estimado</h3>
                    <div className="flex items-center mt-1">
                      <FiDollarSign className="text-green-600 dark:text-green-400" />
                      <span className="text-gray-900 dark:text-white font-medium ml-1">
                        R$ {destino.precoEstimado.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  {destino.melhor_epoca && (
                    <div>
                      <h3 className="font-semibold text-gray-700 dark:text-gray-300">Melhor época para visitar</h3>
                      <p className="text-gray-900 dark:text-white mt-1">{destino.melhor_epoca}</p>
                    </div>
                  )}
                  {destino.clima && (
                    <div>
                      <h3 className="font-semibold text-gray-700 dark:text-gray-300">Clima</h3>
                      <p className="text-gray-900 dark:text-white mt-1">
                        Temperatura média: {destino.clima.temperatura_media}°C
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        Temporada atual: {destino.clima.temporada_atual}
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      href={`https://www.google.com/maps/search/?api=1&query=${destino.nome},${destino.localizacao}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 px-4 text-center text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      Ver no Google Maps
                    </Link>
                  </div>
                </div>
              </div>

              <FlightSearchWidget destinationName={destino.nome} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 