'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '../../components/MainLayout';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiAlertCircle, FiCheck, FiCheckCircle } from 'react-icons/fi';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { registrar: register, estaAutenticado: isAuthenticated, erro: authError } = useAuth();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

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

  const validateForm = () => {
    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não conferem.');
      return false;
    }
    
    if (formData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return false;
    }

    if (!termsAccepted) {
      setError('Você precisa aceitar os termos de uso.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const result = await register(formData.nome, formData.email, formData.senha);
      
      if (result) {
        setSuccess(true);
      } else {
        setError('Falha ao criar conta. O e-mail pode já estar em uso.');
      }
    } catch (err) {
      setError('Ocorreu um erro durante o cadastro. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 10) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.senha);
  const passwordColor = [
    'bg-red-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-green-500'
  ][passwordStrength];

  return (
    <MainLayout>
      <div className="min-h-screen pt-24 flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
              Crie sua conta
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Ou{' '}
              <Link
                href="/entrar"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                entre com uma conta existente
              </Link>
            </p>
          </div>
          
          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded relative">
              <div className="flex items-center">
                <FiAlertCircle className="mr-2" />
                <span>{error}</span>
              </div>
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-200 px-4 py-3 rounded relative">
              <div className="flex items-center">
                <FiCheckCircle className="mr-2" />
                <span>Cadastro realizado com sucesso! Redirecionando...</span>
              </div>
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.nome}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nome completo"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="E-mail"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="senha" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    id="senha"
                    name="senha"
                    type="password"
                    required
                    value={formData.senha}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Senha"
                  />
                </div>
                
                {formData.senha && (
                  <div className="mt-2">
                    <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div
                        className={`h-full ${passwordColor} rounded-full transition-all duration-300`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                      <span>Fraca</span>
                      <span>Média</span>
                      <span>Forte</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirmar senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    id="confirmarSenha"
                    name="confirmarSenha"
                    type="password"
                    required
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirmar senha"
                  />
                  {formData.senha && formData.confirmarSenha && formData.senha === formData.confirmarSenha && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FiCheck className="text-green-500" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="custom-checkbox mt-4">
              <input
                id="terms-accept"
                name="terms-accept"
                type="checkbox"
                className="hidden"
                checked={termsAccepted}
                onChange={() => setTermsAccepted(!termsAccepted)}
              />
              <label 
                htmlFor="terms-accept" 
                className="relative flex items-center cursor-pointer"
              >
                <div className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 mr-2 flex items-center justify-center transition-colors">
                  <svg className={`w-3 h-3 text-white ${termsAccepted ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Eu aceito os {' '}
                  <Link href="/termos" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                    termos de uso
                  </Link>{' '}
                  e{' '}
                  <Link href="/privacidade" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                    política de privacidade
                  </Link>
                </span>
              </label>
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
                    Criando conta...
                  </span>
                ) : (
                  'Criar conta'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
} 