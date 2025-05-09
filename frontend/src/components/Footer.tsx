'use client';

import Link from 'next/link';
import { FiGithub, FiMail, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 w-full">
      <div className="max-w-[85rem] py-10 px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">DestinoFacil</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Encontre seu próximo destino de viagem de maneira simples e fácil.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                <FiGithub size={20} />
              </a>
              <a href="mailto:contato@destinofacil.com" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                <FiMail size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                <FiMapPin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Links Rápidos</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/busca" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                  Buscar Destinos
                </Link>
              </li>
              <li>
                <Link href="/favoritos" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                  Favoritos
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/termos" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} DestinoFacil. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
} 