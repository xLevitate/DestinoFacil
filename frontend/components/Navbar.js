import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-xl font-bold">
            DestinoFacil
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link href="/" className="hover:text-blue-200">
              Início
            </Link>
            <Link href="/destinations" className="hover:text-blue-200">
              Destinos
            </Link>
            {isLoggedIn ? (
              <>
                <Link href="/profile" className="hover:text-blue-200">
                  Meu Perfil
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="hover:text-blue-200"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-blue-200">
                  Entrar
                </Link>
                <Link href="/register" className="hover:text-blue-200">
                  Cadastrar
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="focus:outline-none"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                ) : (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link 
              href="/" 
              className="block hover:text-blue-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Início
            </Link>
            <Link 
              href="/destinations" 
              className="block hover:text-blue-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Destinos
            </Link>
            {isLoggedIn ? (
              <>
                <Link 
                  href="/profile" 
                  className="block hover:text-blue-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Meu Perfil
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }} 
                  className="block hover:text-blue-200 w-full text-left"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="block hover:text-blue-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Entrar
                </Link>
                <Link 
                  href="/register" 
                  className="block hover:text-blue-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
