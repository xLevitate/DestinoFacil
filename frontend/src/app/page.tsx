'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../components/MainLayout';
import Link from 'next/link';
import Image from 'next/image';
import { FiSearch, FiMapPin, FiSun, FiDollarSign, FiHeart, FiArrowRight, FiStar } from 'react-icons/fi';
import { useDestinos } from './context/DestinationContext';
import DestinationCard from '../components/DestinationCard';
import { Destino } from '../types';

export default function Home() {
  const router = useRouter();
  const { destinos, carregando } = useDestinos();
  const [destaques, setDestaques] = useState<Destino[]>([]);

  useEffect(() => {
    // seleciona destinos para mostrar na página inicial
    if (destinos && destinos.length > 0) {
      setDestaques(destinos.slice(0, 6));
    }
  }, [destinos]);

  return (
    <MainLayout>
      {/* Hero section */}
      <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-900 py-16 md:py-24">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <a className="inline-flex items-center gap-x-2 bg-white border border-gray-200 text-sm text-gray-800 p-1 ps-3 rounded-full transition hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600 dark:text-gray-200" href="/busca">
              Explorar agora
              <span className="py-1.5 px-2.5 inline-flex justify-center items-center gap-x-2 rounded-full bg-gray-200 font-semibold text-sm text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                <svg className="flex-shrink-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </span>
            </a>
          </div>

          <div className="mt-5 max-w-2xl text-center mx-auto">
            <h1 className="block font-bold text-4xl md:text-5xl lg:text-6xl text-gray-800 dark:text-gray-200">
              Encontre seu próximo <span className="text-blue-600">destino</span>
            </h1>
          </div>

          <div className="mt-5 max-w-3xl text-center mx-auto">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Descubra os melhores lugares para viajar, com recomendações personalizadas e informações detalhadas sobre cada destino.
            </p>
          </div>

          <div className="mt-8 grid gap-3 w-full sm:inline-flex sm:justify-center">
            <a className="inline-flex justify-center items-center gap-x-2 text-center bg-blue-600 hover:bg-blue-700 border border-transparent text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white transition py-3 px-4 dark:focus:ring-offset-gray-800" href="/busca">
              Explorar destinos
              <svg className="flex-shrink-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </a>
            <a className="inline-flex justify-center items-center gap-x-2 text-center bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition py-3 px-4 dark:bg-blue-900/[.1] dark:border-blue-900 dark:text-white dark:hover:text-white dark:hover:border-blue-800 dark:focus:ring-offset-gray-800" href="/cadastro">
              Criar conta gratuita
            </a>
          </div>
        </div>
      </div>
      {/* End Hero */}

      {/* Cards */}
      <div className="max-w-[85rem] px-4 py-12 sm:px-6 lg:px-8 lg:py-16 mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 text-center mb-8">Por que escolher o DestinoFacil?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card */}
          <div className="group flex flex-col h-full bg-white border border-gray-200 shadow-sm rounded-xl dark:bg-slate-900 dark:border-gray-700 dark:shadow-slate-700/[.7]">
            <div className="h-52 flex flex-col justify-center items-center bg-blue-600 rounded-t-xl">
              <svg className="flex-shrink-0 w-20 h-20 text-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 16.326A3.5 3.5 0 1 1 12 14V2.5"></path>
                <path d="M15.5 13a3.5 3.5 0 0 0 0 7h3a3.5 3.5 0 0 0 0-7h-3Z"></path>
              </svg>
            </div>
            <div className="p-4 md:p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-300">
                Destinos incríveis
              </h3>
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                Conheça os lugares mais impressionantes para visitar, com informações detalhadas sobre o que fazer, quando ir e quanto gastar.
              </p>
            </div>
            <div className="mt-auto flex border-t border-gray-200 divide-x divide-gray-200 dark:border-gray-700 dark:divide-gray-700">
              <a className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-bl-xl bg-white text-gray-800 shadow-sm hover:bg-gray-50 transition dark:bg-slate-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800" href="/busca">
                Explorar
              </a>
            </div>
          </div>
          {/* End Card */}

          {/* Card */}
          <div className="group flex flex-col h-full bg-white border border-gray-200 shadow-sm rounded-xl dark:bg-slate-900 dark:border-gray-700 dark:shadow-slate-700/[.7]">
            <div className="h-52 flex flex-col justify-center items-center bg-rose-500 rounded-t-xl">
              <svg className="flex-shrink-0 w-20 h-20 text-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 22h14"></path>
                <path d="M5 2h14"></path>
                <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path>
                <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path>
              </svg>
            </div>
            <div className="p-4 md:p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-300">
                Planejamento simplificado
              </h3>
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                Organize sua viagem com facilidade, economizando tempo e dinheiro com nossas dicas e recomendações para cada destino.
              </p>
            </div>
            <div className="mt-auto flex border-t border-gray-200 divide-x divide-gray-200 dark:border-gray-700 dark:divide-gray-700">
              <a className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-bl-xl bg-white text-gray-800 shadow-sm hover:bg-gray-50 transition dark:bg-slate-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800" href="/cadastro">
                Comece agora
              </a>
            </div>
          </div>
          {/* End Card */}

          {/* Card */}
          <div className="group flex flex-col h-full bg-white border border-gray-200 shadow-sm rounded-xl dark:bg-slate-900 dark:border-gray-700 dark:shadow-slate-700/[.7]">
            <div className="h-52 flex flex-col justify-center items-center bg-amber-500 rounded-t-xl">
              <svg className="flex-shrink-0 w-20 h-20 text-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h20"></path>
                <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"></path>
                <path d="m7 21 5-5 5 5"></path>
              </svg>
            </div>
            <div className="p-4 md:p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-300">
                Experiências autênticas
              </h3>
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                Descubra experiências locais autênticas, com recomendações de lugares que vão além dos pontos turísticos tradicionais.
              </p>
            </div>
            <div className="mt-auto flex border-t border-gray-200 divide-x divide-gray-200 dark:border-gray-700 dark:divide-gray-700">
              <a className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-bl-xl bg-white text-gray-800 shadow-sm hover:bg-gray-50 transition dark:bg-slate-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800" href="/busca">
                Descubra
              </a>
            </div>
          </div>
          {/* End Card */}
        </div>
      </div>
      {/* End Cards */}
      
      {/* Destinos em destaque */}
      <div className="max-w-[85rem] px-4 py-8 sm:px-6 lg:px-8 mx-auto">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Destinos em destaque</h2>
          <Link 
            href="/busca" 
            className="mt-4 sm:mt-0 inline-flex items-center gap-x-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Ver todos os destinos
            <svg className="flex-shrink-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {carregando ? (
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-64"></div>
            ))
          ) : destaques.length > 0 ? (
            destaques.map((destino) => (
              <DestinationCard key={destino._id} destino={destino} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Nenhum destino encontrado.</p>
            </div>
          )}
        </div>
      </div>
      {/* End Destinos em destaque */}

      {/* Testimonials */}
      <div className="max-w-[85rem] px-4 py-12 sm:px-6 lg:px-8 lg:py-16 mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 text-center mb-8">O que nossos usuários dizem</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Testimonial */}
          <div className="flex flex-col bg-white border border-gray-200 shadow-sm rounded-xl p-4 md:p-6 dark:bg-slate-900 dark:border-gray-700 dark:shadow-slate-700/[.7]">
            <div className="flex items-center gap-x-4">
              <img className="rounded-full w-12 h-12" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=900&h=900&q=80" alt="Foto de perfil" />
              <div className="grow">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">
                  Ana Silva
                </h3>
                <p className="text-xs uppercase text-gray-500">
                  Rio de Janeiro
                </p>
              </div>
            </div>

            <p className="mt-3 text-gray-600 dark:text-gray-400">
              &quot;O DestinoFacil me ajudou a encontrar o destino perfeito para minhas férias. As recomendações foram precisas e o processo de busca foi super simples. Recomendo a todos!&quot;
            </p>
          </div>
          {/* End Testimonial */}

          {/* Testimonial */}
          <div className="flex flex-col bg-white border border-gray-200 shadow-sm rounded-xl p-4 md:p-6 dark:bg-slate-900 dark:border-gray-700 dark:shadow-slate-700/[.7]">
            <div className="flex items-center gap-x-4">
              <img className="rounded-full w-12 h-12" src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=900&h=900&q=80" alt="Foto de perfil" />
              <div className="grow">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">
                  Enzo Gabriel
                </h3>
                <p className="text-xs uppercase text-gray-500">
                  São Paulo
                </p>
              </div>
            </div>

            <p className="mt-3 text-gray-600 dark:text-gray-400">
              &quot;Viajei para Gramado usando as recomendações do site e foi uma experiência incrível! As informações detalhadas sobre cada lugar me ajudaram a planejar o roteiro perfeito.&quot;
            </p>
          </div>
          {/* End Testimonial */}

          {/* Testimonial */}
          <div className="flex flex-col bg-white border border-gray-200 shadow-sm rounded-xl p-4 md:p-6 dark:bg-slate-900 dark:border-gray-700 dark:shadow-slate-700/[.7]">
            <div className="flex items-center gap-x-4">
              <img className="rounded-full w-12 h-12" src="https://images.unsplash.com/photo-1557862921-37829c790f19?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=900&h=900&q=80" alt="Foto de perfil" />
              <div className="grow">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">
                  Pedro Cesar
                </h3>
                <p className="text-xs uppercase text-gray-500">
                  Belo Horizonte
                </p>
              </div>
            </div>

            <p className="mt-3 text-gray-600 dark:text-gray-400">
              &quot;Descobri destinos incríveis que eu nunca havia considerado antes. Os recursos de filtragem por interesse são ótimos e me ajudaram a encontrar exatamente o que eu estava procurando.&quot;
            </p>
          </div>
          {/* End Testimonial */}
        </div>
      </div>
      {/* End Testimonials */}
    </MainLayout>
  );
}
