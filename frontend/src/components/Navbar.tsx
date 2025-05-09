'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../app/context/AuthContext';
import { FiUser, FiLogOut, FiLogIn, FiHome, FiHeart, FiCompass } from 'react-icons/fi';

export default function Navbar() {
  const pathname = usePathname();
  const { estaAutenticado, sair, usuario } = useAuth();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const fazerLogout = async () => {
    await sair();
    setIsUserDropdownOpen(false);
  };

  const navLinks = [
    { href: '/', text: 'Início', icon: <FiHome className="size-4" /> },
    { href: '/busca', text: 'Buscar Destinos', icon: <FiCompass className="size-4" /> }
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('preline/dist/preline.js').then(({ HSStaticMethods }) => {
        HSStaticMethods.autoInit();
      });
    }
  }, []);

  return (
    <header className={`flex flex-wrap lg:justify-start lg:flex-nowrap z-50 w-full py-6 fixed top-0 left-0 right-0 transition-all duration-300 ${
      isScrolled 
        ? 'bg-slate-900/90 backdrop-blur-lg shadow-sm' 
        : 'bg-transparent'
    }`}>
      <nav className="relative max-w-7xl w-full flex flex-wrap lg:grid lg:grid-cols-12 basis-full items-center px-4 md:px-6 lg:px-8 mx-auto">
        <div className="lg:col-span-3 flex items-center">
          {/* nome da marca */}
          <Link href="/" className="flex-none rounded-xl text-xl inline-block font-semibold focus:outline-hidden focus:opacity-80 text-white">
            DestinoFacil
          </Link>
        </div>

        {/* grupo de botões */}
        <div className="flex items-center gap-x-1 lg:gap-x-2 ms-auto py-1 lg:ps-6 lg:order-3 lg:col-span-3">
          {estaAutenticado ? (
            <div className="relative inline-flex">
              <button
                type="button"
                onClick={toggleUserDropdown}
                className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium text-nowrap rounded-xl bg-white/10 border border-gray-700 text-white hover:bg-white/20 focus:outline-hidden focus:bg-white/20 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:hover:bg-white/10 dark:text-white dark:hover:text-white dark:focus:text-white"
              >
                <FiUser className="size-4" />
                <span className="hidden sm:inline-block">
                  {usuario?.nome?.split(' ')[0] || 'Usuário'}
                </span>
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg z-10 top-full">
                  <div className="py-2 px-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {usuario?.nome || 'Usuário'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {usuario?.email}
                    </p>
                  </div>
                  <ul className="py-2">
                    <li>
                      <Link
                        href="/perfil"
                        className="flex items-center gap-x-3.5 py-2 px-3 text-sm text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <FiUser />
                        Meu Perfil
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/favoritos"
                        className="flex items-center gap-x-3.5 py-2 px-3 text-sm text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <FiHeart />
                        Favoritos
                      </Link>
                    </li>
                    <li>
                      <button
                        className="flex w-full items-center gap-x-3.5 py-2 px-3 text-sm text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                        onClick={fazerLogout}
                      >
                        <FiLogOut />
                        Sair
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/entrar" className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium text-nowrap rounded-xl bg-white/10 border border-gray-700 text-white hover:bg-white/20 focus:outline-hidden focus:bg-white/20 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:hover:bg-white/10 dark:text-white dark:hover:text-white dark:focus:text-white">
                Entrar
              </Link>
              <Link href="/cadastro" className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium text-nowrap rounded-xl border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 transition disabled:opacity-50 disabled:pointer-events-none">
                Cadastrar
              </Link>
            </>
          )}

          <div className="lg:hidden">
            <button type="button" className="hs-collapse-toggle size-9.5 flex justify-center items-center text-sm font-semibold rounded-xl border border-gray-700 text-white hover:bg-white/10 focus:outline-hidden focus:bg-white/10 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:border-neutral-700 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700" id="hs-navbar-collapse" data-hs-collapse="#hs-navbar-collapse-menu" aria-controls="hs-navbar-collapse-menu" aria-label="Toggle navigation">
              <svg className="hs-collapse-open:hidden shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
              <svg className="hs-collapse-open:block hidden shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>
        
        {/* menu recolhível */}
        <div id="hs-navbar-collapse-menu" className="hs-collapse hidden overflow-hidden transition-all duration-300 basis-full grow lg:block lg:w-auto lg:basis-auto lg:order-2 lg:col-span-6" aria-labelledby="hs-navbar-collapse">
          <div className="flex flex-col gap-y-4 gap-x-0 mt-5 lg:flex-row lg:justify-center lg:items-center lg:gap-y-0 lg:gap-x-7 lg:mt-0">
            {navLinks.map((link) => (
              <div key={link.href}>
                <Link 
                  href={link.href}
                  className={`${pathname === link.href 
                    ? 'relative inline-block text-white focus:outline-hidden before:absolute before:bottom-0.5 before:start-0 before:-z-1 before:w-full before:h-1 before:bg-blue-600' 
                    : 'inline-block text-white hover:text-gray-300 focus:outline-hidden focus:text-gray-300'}`}
                >
                  {link.text}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
} 