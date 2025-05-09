'use client';

import { useState, useEffect } from 'react';
import MainLayout from '../../components/MainLayout';
import { useDestinos } from '../context/DestinationContext';
import Link from 'next/link';
import Image from 'next/image';
import { FiSearch, FiMapPin, FiHeart, FiFilter, FiX, FiStar } from 'react-icons/fi';
import { ParametrosBusca } from '../../types';
import { useSearchParams } from 'next/navigation';

type FilterState = {
  localizacao: string;
  categorias: string[];
  precoMaximo: number | null;
};

export default function SearchPage() {
  const { destinos, carregando, erro, pesquisarDestinos } = useDestinos();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState<FilterState>({
    localizacao: '',
    categorias: [],
    precoMaximo: null
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categoriaOptions = [
    { id: 'praia', label: 'Praia' },
    { id: 'montanha', label: 'Montanha' },
    { id: 'cidade', label: 'Cidade' },
    { id: 'rural', label: 'Rural' },
    { id: 'historico', label: 'Histórico' },
    { id: 'aventura', label: 'Aventura' }
  ];

  const precoOptions = [
    { value: 1000, label: 'Até R$ 1.000' },
    { value: 2500, label: 'Até R$ 2.500' },
    { value: 5000, label: 'Até R$ 5.000' },
    { value: 10000, label: 'Até R$ 10.000' },
    { value: null, label: 'Sem limite' }
  ];

  useEffect(() => {
    const locationParam = searchParams.get('localizacao');
    const categoriaParam = searchParams.get('categorias');
    const precoParam = searchParams.get('precoMaximo');
    
    const newFilters: FilterState = {
      localizacao: locationParam || '',
      categorias: categoriaParam ? [categoriaParam] : [],
      precoMaximo: precoParam ? parseInt(precoParam) : null
    };
    
    setFilters(newFilters);
    
    const apiParams: ParametrosBusca = {};
    if (newFilters.localizacao) apiParams.localizacao = newFilters.localizacao;
    if (newFilters.categorias.length > 0) apiParams.categorias = newFilters.categorias;
    if (newFilters.precoMaximo) apiParams.precoMaximo = newFilters.precoMaximo;
    
    pesquisarDestinos(apiParams);
  }, [searchParams, pesquisarDestinos]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams: ParametrosBusca = {
      ...filters,
      precoMaximo: filters.precoMaximo === null ? undefined : filters.precoMaximo
    };
    pesquisarDestinos(searchParams);
    setIsFilterOpen(false);
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFilters(prev => {
      if (prev.categorias.includes(categoryId)) {
        return {
          ...prev,
          categorias: prev.categorias.filter(id => id !== categoryId)
        };
      } else {
        return {
          ...prev,
          categorias: [...prev.categorias, categoryId]
        };
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      localizacao: '',
      categorias: [],
      precoMaximo: null
    });
    pesquisarDestinos({});
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 dark:bg-slate-900 min-h-screen pt-20 pb-16">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
          {/* cabeçalho com botão de filtro */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Buscar Destinos
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Encontre o destino perfeito para a sua próxima viagem
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
              >
                <FiFilter className="flex-shrink-0 size-4" />
                Filtros {filters.categorias.length > 0 || filters.localizacao || filters.precoMaximo ? 
                  <span className="inline-flex items-center py-0.5 px-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 ml-2">
                    {filters.categorias.length + (filters.localizacao ? 1 : 0) + (filters.precoMaximo ? 1 : 0)}
                  </span> : ''}
              </button>
            </div>
          </div>
          
          {/* barra de busca */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-10">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-gray-400">
                    <FiMapPin className="size-4" />
                  </div>
                  <input
                    type="text"
                    value={filters.localizacao}
                    onChange={(e) => setFilters({ ...filters, localizacao: e.target.value })}
                    className="py-3 px-4 ps-12 block w-full border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:placeholder-gray-500 dark:focus:ring-gray-600"
                    placeholder="Para onde você quer ir?"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
              >
                <FiSearch className="size-4" /> Buscar
              </button>
            </form>
          </div>

          {/* modal de filtros (mobile) */}
          {isFilterOpen && (
            <div className="fixed inset-0 z-50 flex md:hidden">
              <div
                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={() => setIsFilterOpen(false)}
              ></div>
              <div className="relative w-full max-w-xs bg-white dark:bg-gray-800 h-full overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filtros</h2>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="inline-flex flex-shrink-0 justify-center items-center size-8 rounded-lg text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white text-sm dark:text-gray-500 dark:hover:text-gray-400 dark:focus:ring-gray-700 dark:focus:ring-offset-gray-800"
                  >
                    <FiX size={20} />
                  </button>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm text-gray-600 uppercase font-semibold mb-3 dark:text-gray-400">Localização</h3>
                  <input
                    type="text"
                    value={filters.localizacao}
                    onChange={(e) => setFilters({ ...filters, localizacao: e.target.value })}
                    className="py-3 px-4 ps-3 block w-full border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:placeholder-gray-500 dark:focus:ring-gray-600"
                    placeholder="Cidade, estado ou região"
                  />
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm text-gray-600 uppercase font-semibold mb-3 dark:text-gray-400">Categorias</h3>
                  <div className="space-y-3">
                    {categoriaOptions.map(category => (
                      <div key={category.id} className="custom-checkbox">
                        <input
                          type="checkbox"
                          id={`mobile-${category.id}`}
                          checked={filters.categorias.includes(category.id)}
                          onChange={() => handleCategoryToggle(category.id)}
                          className="hidden"
                        />
                        <label 
                          htmlFor={`mobile-${category.id}`} 
                          className="relative flex items-center cursor-pointer"
                        >
                          <div className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 mr-2 flex items-center justify-center transition-colors">
                            <svg className={`w-3 h-3 text-white ${filters.categorias.includes(category.id) ? 'opacity-100' : 'opacity-0'}`} 
                                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-gray-600 dark:text-gray-400">
                            {category.label}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm text-gray-600 uppercase font-semibold mb-3 dark:text-gray-400">Orçamento</h3>
                  <div className="space-y-3">
                    {precoOptions.map((option, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="radio"
                          id={`mobile-price-${index}`}
                          name="mobile-preco"
                          checked={filters.precoMaximo === option.value}
                          onChange={() => setFilters({ ...filters, precoMaximo: option.value })}
                          className="shrink-0 mt-0.5 border-gray-200 rounded-full text-blue-600 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                        />
                        <label htmlFor={`mobile-price-${index}`} className="ms-3 text-gray-600 dark:text-gray-400">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleSearch}
                    className="py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  >
                    Aplicar Filtros
                  </button>
                  <button
                    onClick={clearFilters}
                    className="py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-10">
            {/* barra lateral de filtros (desktop) */}
            <div className="hidden lg:block w-72 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 self-start sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Filtros</h2>
              
              <div className="mb-8">
                <h3 className="text-sm text-gray-600 uppercase font-semibold mb-4 dark:text-gray-400">Categorias</h3>
                <div className="space-y-3">
                  {categoriaOptions.map(category => (
                    <div key={category.id} className="custom-checkbox">
                      <input
                        type="checkbox"
                        id={`desktop-${category.id}`}
                        checked={filters.categorias.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        className="hidden"
                      />
                      <label 
                        htmlFor={`desktop-${category.id}`} 
                        className="relative flex items-center cursor-pointer"
                      >
                        <div className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 mr-2 flex items-center justify-center transition-colors">
                          <svg className={`w-3 h-3 text-white ${filters.categorias.includes(category.id) ? 'opacity-100' : 'opacity-0'}`} 
                               fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-600 dark:text-gray-400">
                          {category.label}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-sm text-gray-600 uppercase font-semibold mb-4 dark:text-gray-400">Orçamento</h3>
                <div className="space-y-3">
                  {precoOptions.map((option, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="radio"
                        id={`desktop-price-${index}`}
                        name="desktop-preco"
                        checked={filters.precoMaximo === option.value}
                        onChange={() => setFilters({ ...filters, precoMaximo: option.value })}
                        className="shrink-0 mt-0.5 border-gray-200 rounded-full text-blue-600 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                      />
                      <label htmlFor={`desktop-price-${index}`} className="ms-3 text-gray-600 dark:text-gray-400">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSearch}
                  className="py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                >
                  Aplicar Filtros
                </button>
                <button
                  onClick={clearFilters}
                  className="py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>

            {/* seção de resultados */}
            <div className="flex-1">
              {/* filtros aplicados */}
              {(filters.categorias.length > 0 || filters.localizacao || filters.precoMaximo) && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Filtros aplicados:</span>
                    
                    {filters.localizacao && (
                      <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Localização: {filters.localizacao}
                        <button type="button" className="flex-shrink-0 h-4 w-4 inline-flex items-center justify-center rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:bg-blue-200 focus:text-blue-500"
                          onClick={() => setFilters(prev => ({ ...prev, localizacao: '' }))}>
                          <span className="sr-only">Remover filtro</span>
                          <FiX className="size-3" />
                        </button>
                      </span>
                    )}
                    
                    {filters.categorias.map(categoria => {
                      const cat = categoriaOptions.find(c => c.id === categoria);
                      return (
                        <span key={categoria} className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Categoria: {cat?.label}
                          <button type="button" className="flex-shrink-0 h-4 w-4 inline-flex items-center justify-center rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:bg-blue-200 focus:text-blue-500"
                            onClick={() => handleCategoryToggle(categoria)}>
                            <span className="sr-only">Remover filtro</span>
                            <FiX className="size-3" />
                          </button>
                        </span>
                      );
                    })}
                    
                    {filters.precoMaximo && (
                      <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Preço máximo: R$ {filters.precoMaximo.toLocaleString('pt-BR')}
                        <button type="button" className="flex-shrink-0 h-4 w-4 inline-flex items-center justify-center rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:bg-blue-200 focus:text-blue-500"
                          onClick={() => setFilters(prev => ({ ...prev, precoMaximo: null }))}>
                          <span className="sr-only">Remover filtro</span>
                          <FiX className="size-3" />
                        </button>
                      </span>
                    )}
                    
                    <button
                      onClick={clearFilters}
                      className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      Limpar todos
                    </button>
                  </div>
                </div>
              )}
              
              {/* estado de carregando */}
              {carregando && (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin inline-block size-8 border-[3px] border-current border-t-transparent text-blue-600 rounded-full" role="status" aria-label="loading">
                    <span className="sr-only">Carregando...</span>
                  </div>
                </div>
              )}
              
              {/* estado de erro */}
              {!carregando && erro && (
                <div className="bg-red-50 border border-red-200 text-sm text-red-600 rounded-lg p-4 dark:bg-red-800/10 dark:border-red-900 dark:text-red-400" role="alert">
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0">
                      <svg className="h-4 w-4 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" x2="12" y1="8" y2="12" />
                        <line x1="12" x2="12.01" y1="16" y2="16" />
                      </svg>
                    </span>
                    <p>{erro}</p>
                  </div>
                </div>
              )}
              
              {/* estado vazio */}
              {!carregando && !erro && destinos.length === 0 && (
                <div className="text-center py-20">
                  <svg className="w-12 h-12 text-gray-400 mb-4 mx-auto" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9 10h.01" />
                    <path d="M15 10h.01" />
                    <path d="M9.5 15.2a3.5 3.5 0 0 0 5 0" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Nenhum destino encontrado</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Não encontramos destinos que correspondam aos seus filtros.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="py-2 px-4 inline-flex justify-center items-center gap-2 rounded-md bg-blue-100 border border-transparent font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 ring-offset-white focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-blue-400 dark:hover:text-white dark:focus:ring-offset-gray-800"
                  >
                    Limpar filtros e tentar novamente
                  </button>
                </div>
              )}
              
              {/* grade de resultados */}
              {!carregando && !erro && destinos.length > 0 && (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Mostrando {destinos.length} destinos
                  </p>
                  
                  <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {destinos.map(destination => (
                      <div 
                        key={destination._id}
                        className="group flex flex-col h-full bg-white dark:bg-slate-800 border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 dark:shadow-gray-900/30"
                      >
                        <div className="relative h-60 overflow-hidden">
                          {destination.imagens[0] && (
                            <Image
                              src={destination.imagens[0]}
                              alt={destination.nome}
                              fill
                              style={{ objectFit: 'cover' }}
                              className="transition-transform duration-500 ease-in-out group-hover:scale-105"
                            />
                          )}
                          {destination.categorias[0] && (
                            <span className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                              {destination.categorias[0].charAt(0).toUpperCase() + destination.categorias[0].slice(1)}
                            </span>
                          )}
                          <button
                            aria-label="Favoritar"
                            className="absolute top-4 left-4 p-2 rounded-full bg-white/30 backdrop-blur-md text-white hover:bg-white/50 transition-colors"
                          >
                            <FiHeart className="size-5" />
                          </button>
                        </div>
                        
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                            {destination.nome}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                            {destination.descricao}
                          </p>
                          
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-1.5">
                              <FiMapPin className="text-blue-600" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">{destination.localizacao}</span>
                            </div>
                            {destination.avaliacoes && destination.avaliacoes.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                <FiStar className="text-yellow-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {(destination.avaliacoes.reduce((acc, curr) => acc + curr.nota, 0) / destination.avaliacoes.length).toFixed(1)} ({destination.avaliacoes.length})
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-gray-800 dark:text-gray-200 font-medium">A partir de R$ {destination.precoEstimado.toLocaleString('pt-BR')}</span>
                            <Link 
                              href={`/destinos/${destination._id}`}
                              className="py-2 px-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                              Ver detalhes
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 