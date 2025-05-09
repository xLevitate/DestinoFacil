'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '../../components/MainLayout';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiAlertCircle, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { login, estaAutenticado: isAuthenticated, erro: authError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (redirect) {
        router.push(`/${redirect}`);
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, router, redirect]);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.senha);
      
      if (result) {
        setSuccess(true);
      } else {
        setError('Falha ao fazer login. Verifique suas credenciais.');
      }
    } catch (err) {
      setError('Ocorreu um erro durante o login. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen pt-24 flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 shadow-lg rounded-2xl p-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Entre na sua conta
              </h2>
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                Ou{' '}
                <Link 
                  href="/cadastro" 
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  cadastre-se gratuitamente
                </Link>
              </p>
            </div>
            
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                <div className="flex items-center text-red-600 dark:text-red-400">
                  <FiAlertCircle className="flex-shrink-0 mr-2" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}
            
            {success && (
              <div className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3">
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <FiCheckCircle className="flex-shrink-0 mr-2" />
                  <span className="text-sm font-medium">Login realizado com sucesso! Redirecionando...</span>
                </div>
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    E-mail
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FiMail className="size-5" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 dark:bg-slate-700/50 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="seuemail@exemplo.com"
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="senha" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Senha
                    </label>
                    <Link 
                      href="/recuperar-senha" 
                      className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Esqueceu sua senha?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FiLock className="size-5" />
                    </div>
                    <input
                      id="senha"
                      name="senha"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={formData.senha}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 dark:bg-slate-700/50 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Sua senha"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="custom-checkbox">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="hidden"
                  />
                  <label 
                    htmlFor="remember-me" 
                    className="relative flex items-center cursor-pointer"
                  >
                    <div className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 mr-2 flex items-center justify-center transition-colors">
                      <svg className="w-3 h-3 text-white opacity-0 checkbox-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Lembrar de mim</span>
                  </label>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white font-medium ${
                    loading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Entrando...
                    </span>
                  ) : (
                    'Entrar'
                  )}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Não tem uma conta?{' '}
                <Link
                  href="/cadastro"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center"
                >
                  Cadastre-se <FiArrowRight className="ml-1 size-4" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 