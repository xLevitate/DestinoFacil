'use client';

import { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Destino, ParametrosBusca } from '../../types';
import { destinationServices, CityImage, imageUtils } from '../../services/apiServices';
import { useAuth } from './AuthContext';
import flightsService from '../../services/flightsService';

// tipo do contexto de destinos
type TipoContextoDestino = {
  destinos: Destino[];
  carregando: boolean;
  erro: string | null;
  buscarDestinos: () => Promise<void>;
  pesquisarDestinos: (parametrosBusca: ParametrosBusca) => Promise<void>;
  obterDestinoPorId: (id: string) => Promise<Destino | null>;
  adicionarFavorito: (id: string) => Promise<boolean>;
  removerFavorito: (id: string) => Promise<boolean>;
  eFavorito: (id: string) => boolean;
  obterDestinosFavoritos: () => Promise<Destino[]>;
};

const ContextoDestino = createContext<TipoContextoDestino | undefined>(undefined);

export function ProvedorDestino({ children }: { children: ReactNode }) {
  // estados para gerenciar os destinos
  const [destinos, setDestinos] = useState<Destino[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const { estaAutenticado, usuario, adicionarAosFavoritos, removerDosFavoritos, eFavorito, obterFavoritos } = useAuth();
  const [cacheDestinos, setCacheDestinos] = useState<Record<string, Destino>>({});

  // busca todos os destinos
  const buscarDestinos = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      
      // pega as cidades populares
      const cidades = await destinationServices.getPopularCities();
      if (!cidades || cidades.length === 0) {
        throw new Error('Não foi possível carregar os destinos populares');
      }

      // processa cada cidade
      const promessasDestinos = cidades.map(async (cidade: string) => {
        try {
          const infoDestino = await destinationServices.getDestinationInfo(cidade);
          if (!infoDestino) return null;

          // calcula o preco estimado
          const precoEstimado = await calcularPrecoDestino(infoDestino);

          return {
            _id: infoDestino.id.toString(),
            nome: infoDestino.name,
            descricao: `${infoDestino.name} é uma cidade em ${infoDestino.region}, ${infoDestino.country} com uma população de ${infoDestino.population.toLocaleString('pt-BR')}.`,
            localizacao: `${infoDestino.region}, ${infoDestino.country}`,
            imagens: infoDestino.images.map((img: CityImage) => img.url),
            categorias: ['cidade'],
            precoEstimado: precoEstimado,
            avaliacoes: []
          } as Destino;
        } catch (erro) {
          console.error(`Erro ao carregar informações para ${cidade}:`, erro);
          return null;
        }
      });
      
      // espera todas as promessas terminarem
      const dadosDestinos = await Promise.all(promessasDestinos);
      const destinosFiltrados = dadosDestinos.filter(Boolean) as Destino[];

      // pré-carrega as imagens e atualiza o cache
      destinosFiltrados.forEach(destino => {
        if (destino.imagens && destino.imagens.length > 0) {
          const imagensCidade = destino.imagens.map((url, index) => ({
            id: `${destino._id}_${index}`,
            url: url,
            thumb: url,
            alt: `Foto de ${destino.nome}`,
            photographer: { name: '', profile: '' }
          }));
          imageUtils.preloadImages(imagensCidade);
        }
        
        setCacheDestinos(prev => ({
          ...prev,
          [destino._id]: destino
        }));
      });

      setDestinos(destinosFiltrados);
    } catch (err: any) {
      setErro('Falha ao carregar destinos. Por favor, tente novamente.');
      console.error(err);
      setDestinos([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  // pesquisa destinos com filtros
  const pesquisarDestinos = useCallback(async (parametrosBusca: ParametrosBusca) => {
    try {
      setCarregando(true);
      setErro(null);
      
      // busca por localizacao
      if (parametrosBusca.localizacao && parametrosBusca.localizacao.trim() !== '') {
        try {
          const infoDestino = await destinationServices.getDestinationInfo(parametrosBusca.localizacao);
          
          if (infoDestino) {
            const precoEstimado = await calcularPrecoDestino(infoDestino);
            
            const destinoApi: Destino = {
              _id: infoDestino.id.toString(),
              nome: infoDestino.name,
              descricao: `${infoDestino.name} é uma cidade em ${infoDestino.region}, ${infoDestino.country} com uma população de ${infoDestino.population.toLocaleString('pt-BR')}.`,
              localizacao: `${infoDestino.region}, ${infoDestino.country}`,
              imagens: infoDestino.images.map((img: CityImage) => img.url),
              categorias: ['cidade'],
              precoEstimado: precoEstimado,
              avaliacoes: []
            };
            
            // adiciona ao cache
            setCacheDestinos(prev => ({
              ...prev,
              [destinoApi._id]: destinoApi
            }));
            
            // processa cidades proximas
            const promessasProximas = (infoDestino.nearbyCities || []).map(async (cidade) => {
              try {
                const imagens = await destinationServices.getCityImages(cidade.name);
                
                const precoProximo = await calcularPrecoDestinoProximo(infoDestino, cidade);
                
                const destino: Destino = {
                  _id: cidade.id.toString(),
                  nome: cidade.name,
                  descricao: `${cidade.name} é uma cidade próxima a ${infoDestino.name}.`,
                  localizacao: `${cidade.region}, ${cidade.country}`,
                  imagens: imagens.map((img: CityImage) => img.url),
                  categorias: ['cidade'],
                  precoEstimado: precoProximo,
                  avaliacoes: []
                };
                
                // adiciona ao cache
                setCacheDestinos(prev => ({
                  ...prev,
                  [destino._id]: destino
                }));
                
                return destino;
              } catch (erro) {
                console.error(`Erro ao carregar imagens para ${cidade.name}:`, erro);
                
                const precoProximo = await calcularPrecoDestinoProximo(infoDestino, cidade);
                
                const destino: Destino = {
                  _id: cidade.id.toString(),
                  nome: cidade.name,
                  descricao: `${cidade.name} é uma cidade próxima a ${infoDestino.name}.`,
                  localizacao: `${cidade.region}, ${cidade.country}`,
                  imagens: [],
                  categorias: ['cidade'],
                  precoEstimado: precoProximo,
                  avaliacoes: []
                };
                
                // adiciona ao cache
                setCacheDestinos(prev => ({
                  ...prev,
                  [destino._id]: destino
                }));
                
                return destino;
              }
            });
            
            // espera as cidades proximas terminarem
            const destinosProximos = await Promise.all(promessasProximas);
            const resultadosApi = [destinoApi, ...destinosProximos];
            
            // aplica filtros
            let resultadosFiltrados = resultadosApi;
            if (parametrosBusca.categorias && parametrosBusca.categorias.length > 0) {
              resultadosFiltrados = resultadosFiltrados.filter(
                dest => parametrosBusca.categorias!.some(cat => dest.categorias.includes(cat))
              );
            }
            
            if (parametrosBusca.precoMaximo) {
              resultadosFiltrados = resultadosFiltrados.filter(
                dest => dest.precoEstimado <= parametrosBusca.precoMaximo!
              );
            }
            
            // pré-carrega imagens
            resultadosFiltrados.forEach(destino => {
              if (destino.imagens && destino.imagens.length > 0) {
                const imagensCidade = destino.imagens.map((url, index) => ({
                  id: `${destino._id}_${index}`,
                  url: url,
                  thumb: url,
                  alt: `Foto de ${destino.nome}`,
                  photographer: { name: '', profile: '' }
                }));
                imageUtils.preloadImages(imagensCidade);
              }
            });
            
            setDestinos(resultadosFiltrados);
            return;
          }
        } catch (apiError) {
          console.error('Erro na busca por API, tentando outro método:', apiError);
          await buscarDestinos();
        }
      } else {
        await buscarDestinos();
      }
    } catch (err: any) {
      setErro('Falha ao buscar destinos. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }, [buscarDestinos]);

  const obterDestinoPorId = useCallback(async (id: string): Promise<Destino | null> => {
    try {
      setCarregando(true);
      setErro(null);
      
      if (cacheDestinos[id]) {
        console.log(`Using context cache for destination ID ${id}`);
        setCarregando(false);
        return cacheDestinos[id];
      }
      
      const foundDestino = destinos.find(dest => dest._id === id);
      
      if (foundDestino) {
        setCacheDestinos(prev => ({ ...prev, [id]: foundDestino }));
        return foundDestino;
      }
      
      const allCidades = await destinationServices.getPopularCities();
      
      for (const cityName of allCidades) {
        try {
          const info = await destinationServices.getDestinationInfo(cityName);
          
          if (info && info.id.toString() === id) {
            const precoEstimado = await calcularPrecoDestino(info);
            
            const destino: Destino = {
              _id: info.id.toString(),
              nome: info.name,
              descricao: `${info.name} é uma cidade em ${info.region}, ${info.country} com uma população de ${info.population.toLocaleString('pt-BR')}.`,
              localizacao: `${info.region}, ${info.country}`,
              imagens: info.images.map((img: CityImage) => img.url),
              categorias: ['cidade'],
              precoEstimado: precoEstimado,
              avaliacoes: []
            };
            
            if (destino.imagens && destino.imagens.length > 0) {
              const cityImages = destino.imagens.map((url, index) => ({
                id: `${destino._id}_${index}`,
                url: url,
                thumb: url,
                alt: `Foto de ${destino.nome}`,
                photographer: { name: '', profile: '' }
              }));
              imageUtils.preloadImages(cityImages);
            }
            
            setCacheDestinos(prev => ({ ...prev, [id]: destino }));
            return destino;
          }
          
          const nearbyCity = info?.nearbyCities?.find(city => city.id.toString() === id);
          
          if (nearbyCity) {
            const images = await destinationServices.getCityImages(nearbyCity.name);
            
            const precoProximo = await calcularPrecoDestinoProximo(info, nearbyCity);
            
            const destino: Destino = {
              _id: nearbyCity.id.toString(),
              nome: nearbyCity.name,
              descricao: `${nearbyCity.name} é uma cidade em ${nearbyCity.region}, ${nearbyCity.country}.`,
              localizacao: `${nearbyCity.region}, ${nearbyCity.country}`,
              imagens: images.map((img: CityImage) => img.url),
              categorias: ['cidade'],
              precoEstimado: precoProximo,
              avaliacoes: []
            };
            
            if (destino.imagens && destino.imagens.length > 0) {
              const cityImages = destino.imagens.map((url, index) => ({
                id: `${destino._id}_${index}`,
                url: url,
                thumb: url,
                alt: `Foto de ${destino.nome}`,
                photographer: { name: '', profile: '' }
              }));
              imageUtils.preloadImages(cityImages);
            }
            
            setCacheDestinos(prev => ({ ...prev, [id]: destino }));
            return destino;
          }
        } catch (cityError) {
          console.error(`Erro ao buscar informações para ${cityName}:`, cityError);
        }
      }
      
      throw new Error('Destino não encontrado');
    } catch (err: any) {
      setErro('Falha ao carregar destino. Por favor, tente novamente.');
      console.error(err);
      return null;
    } finally {
      setCarregando(false);
    }
  }, [destinos, cacheDestinos]);

  const adicionarFavorito = useCallback(async (id: string): Promise<boolean> => {
    try {
      if (!estaAutenticado) {
        setErro('Você precisa estar logado para adicionar favoritos');
        return false;
      }
      
      const result = await adicionarAosFavoritos(id);
      
      if (result) {
        console.log(`Destino ${id} adicionado aos favoritos`);
      }
      
      return result;
    } catch (err: any) {
      setErro('Falha ao adicionar aos favoritos. Por favor, tente novamente.');
      console.error(err);
      return false;
    }
  }, [estaAutenticado, adicionarAosFavoritos]);

  const removerFavorito = useCallback(async (id: string): Promise<boolean> => {
    try {
      if (!estaAutenticado) {
        setErro('Você precisa estar logado para remover favoritos');
        return false;
      }
      
      const result = await removerDosFavoritos(id);
      
      if (result) {
        console.log(`Destino ${id} removido dos favoritos`);
      }
      
      return result;
    } catch (err: any) {
      setErro('Falha ao remover dos favoritos. Por favor, tente novamente.');
      console.error(err);
      return false;
    }
  }, [estaAutenticado, removerDosFavoritos]);
  
  const checkIsFavorite = useCallback((id: string): boolean => {
    return eFavorito(id);
  }, [eFavorito]);
  
  const obterDestinosFavoritos = useCallback(async (): Promise<Destino[]> => {
    try {
      setCarregando(true);
      setErro(null);
      
      if (!estaAutenticado) {
        setErro('Você precisa estar logado para ver seus favoritos');
        return [];
      }
      
      const favoriteIds = obterFavoritos();
      
      if (!favoriteIds || favoriteIds.length === 0) {
        return [];
      }
      
      const favoriteDestinos: Destino[] = [];
      
      for (const id of favoriteIds) {
        const destino = await obterDestinoPorId(id);
        if (destino) {
          favoriteDestinos.push(destino);
        }
      }
      
      return favoriteDestinos;
    } catch (err: any) {
      setErro('Falha ao carregar favoritos. Por favor, tente novamente.');
      console.error(err);
      return [];
    } finally {
      setCarregando(false);
    }
  }, [estaAutenticado, obterFavoritos, obterDestinoPorId]);

  const calcularPrecoDestino = async (destinationInfo: any): Promise<number> => {
    try {
      const baseCity = 'São Paulo';
      
      const flightPrice = await flightsService.estimateFlightPrice(baseCity, destinationInfo.name);
      
      let accommodationFactor = 1.0;
      
      switch (destinationInfo.country) {
        case 'Switzerland':
        case 'Norway':
        case 'Japan':
        case 'Singapore':
        case 'Iceland':
          accommodationFactor = 2.0;
          break;
          
        case 'United Kingdom':
        case 'France':
        case 'United States':
        case 'Netherlands':
        case 'Australia':
        case 'Canada':
          accommodationFactor = 1.7;
          break;
          
        case 'Germany':
        case 'Italy':
        case 'Spain':
        case 'Portugal':
        case 'South Korea':
          accommodationFactor = 1.5;
          break;
          
        case 'Brazil':
        case 'Argentina':
        case 'Mexico':
        case 'Thailand':
        case 'Turkey':
          accommodationFactor = 1.0;
          break;
          
        case 'Colombia':
        case 'Peru':
        case 'Vietnam':
        case 'Indonesia':
          accommodationFactor = 0.8;
          break;
          
        default:
          if (destinationInfo.country.includes('Europe')) {
            accommodationFactor = 1.5;
          } else if (destinationInfo.country.includes('Asia')) {
            accommodationFactor = 1.2;
          } else if (destinationInfo.country.includes('America')) {
            accommodationFactor = 1.0;
          } else {
            accommodationFactor = 1.2;
          }
      }
      
      const baseDailyRate = 300; 
      const accommodationCost = baseDailyRate * 5 * accommodationFactor;
      
      const expensiveCities = [
        'New York', 'London', 'Paris', 'Tokyo', 'Singapore', 'Hong Kong',
        'Zurich', 'Geneva', 'San Francisco', 'Oslo', 'Sydney', 'Copenhagen'
      ];
      
      const cityPremium = expensiveCities.some(city => 
        destinationInfo.name.includes(city)
      ) ? 1000 : 0;
      
      const populationFactor = destinationInfo.population > 5000000 ? 1.2 : 
                              destinationInfo.population > 1000000 ? 1.1 : 1.0;
      
      const totalPrice = Math.round((flightPrice + accommodationCost + cityPremium) * populationFactor);
      
      const variation = 1 + (Math.random() * 0.1 - 0.05);
      
      return Math.round(totalPrice * variation);
    } catch (error) {
      console.error('Error calculating destination price:', error);
      
      const basePrice = destinationInfo.country === 'Brazil' ? 2500 : 5000;
      return basePrice;
    }
  };
  
  const calcularPrecoDestinoProximo = async (mainDestination: any, nearbyCity: any): Promise<number> => {
    try {
      const mainPrice = await calcularPrecoDestino(mainDestination);
      
      const isSmaller = (nearbyCity.population || 0) < (mainDestination.population || 100000);
      
      const discountFactor = isSmaller ? 0.75 + (Math.random() * 0.15) : 0.9 + (Math.random() * 0.05);
      
      return Math.round(mainPrice * discountFactor);
    } catch (error) {
      console.error('Error calculating nearby destination price:', error);
      
      return Math.round(3000 + (Math.random() * 2000));
    }
  };

  return (
    <ContextoDestino.Provider
      value={{
        destinos,
        carregando,
        erro,
        buscarDestinos,
        pesquisarDestinos,
        obterDestinoPorId,
        adicionarFavorito,
        removerFavorito,
        eFavorito: checkIsFavorite,
        obterDestinosFavoritos
      }}
    >
      {children}
    </ContextoDestino.Provider>
  );
}

export function useDestinos() {
  const context = useContext(ContextoDestino);
  if (context === undefined) {
    throw new Error('useDestinos must be used within a ProvedorDestino');
  }
  return context;
} 