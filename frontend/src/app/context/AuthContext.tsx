'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { Usuario } from '../../types';
import { jwtDecode } from 'jwt-decode';

// tipo do contexto de autenticacao
type TipoContextoAuth = {
  usuario: Usuario | null;
  estaAutenticado: boolean;
  carregando: boolean;
  erro: string | null;
  login: (email: string, senha: string) => Promise<boolean>;
  registrar: (nome: string, email: string, senha: string) => Promise<boolean>;
  sair: () => void;
  obterFavoritos: () => string[];
  adicionarAosFavoritos: (idDestino: string) => Promise<boolean>;
  removerDosFavoritos: (idDestino: string) => Promise<boolean>;
  eFavorito: (idDestino: string) => boolean;
};

const ContextoAuth = createContext<TipoContextoAuth | undefined>(undefined);

// tipo do payload do token jwt
type PayloadToken = {
  id: string;
  nome: string;
  email: string;
  exp: number;
};

export function ProvedorAuth({ children }: { children: ReactNode }) {
  // estados para gerenciar autenticacao
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [estaAutenticado, setEstaAutenticado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // verifica autenticacao ao iniciar
  useEffect(() => {
    const verificarAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setCarregando(false);
          return;
        }

        try {
          // decodifica o token
          const decodificado = jwtDecode<PayloadToken>(token);
          
          // verifica se o token expirou
          if (decodificado.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            setCarregando(false);
            return;
          }
          
          // carrega favoritos do storage
          const favoritosSalvos = localStorage.getItem(`favorites_${decodificado.id}`);
          const favoritos = favoritosSalvos ? JSON.parse(favoritosSalvos) : [];
          
          // configura o usuario
          setUsuario({
            id: decodificado.id,
            nome: decodificado.nome,
            email: decodificado.email,
            criado_em: new Date(),
            favoritos: favoritos,
          });
          
          setEstaAutenticado(true);
        } catch (err) {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Erro auth:', err);
      } finally {
        setCarregando(false);
      }
    };

    verificarAuth();
  }, []);

  // funcao para fazer login
  const login = async (email: string, senha: string): Promise<boolean> => {
    setCarregando(true);
    setErro(null);
    
    try {
      console.log('Tentando fazer login:', { email });
      
      // faz requisicao para api
      const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/login`;
      console.log('URL completa de login:', url);
      
      const resposta = await axios.post(url, {
        email,
        senha,
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const { token } = resposta.data;
      localStorage.setItem('token', token);
      
      // decodifica o token
      const decodificado = jwtDecode<PayloadToken>(token);
      
      // carrega favoritos
      const favoritosSalvos = localStorage.getItem(`favorites_${decodificado.id}`);
      const favoritos = favoritosSalvos ? JSON.parse(favoritosSalvos) : [];
      
      // configura usuario
      setUsuario({
        id: decodificado.id,
        nome: decodificado.nome,
        email: decodificado.email,
        criado_em: new Date(),
        favoritos: favoritos,
      });
      
      setEstaAutenticado(true);
      return true;
    } catch (err: any) {
      console.error('Erro ao fazer login:', err);
      console.error('Detalhes do erro:', err.message, err.code);
      
      if (err.code === 'ERR_NETWORK') {
        setErro('Erro de conexão com o servidor. Verifique se o backend está rodando e acessível.');
      } else if (err.response) {
        // O servidor respondeu com um status de erro
        setErro(err.response.data?.message || `Erro ${err.response.status}: ${err.response.statusText}`);
      } else if (err.request) {
        // A requisição foi feita mas não houve resposta
        setErro('Servidor não respondeu à solicitação. Verifique a conexão e tente novamente.');
      } else {
        // Algo aconteceu na configuração da requisição que disparou um erro
        setErro(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
      }
      
      return false;
    } finally {
      setCarregando(false);
    }
  };

  // funcao para registrar novo usuario
  const registrar = async (nome: string, email: string, senha: string): Promise<boolean> => {
    setCarregando(true);
    setErro(null);
    
    try {
      console.log('Tentando registrar usuário:', { nome, email });
      
      // faz requisicao para api - ajustando URL conforme necessário
      const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/register`;
      console.log('URL completa:', url);
      
      const resposta = await axios.post(url, {
        nome,
        email,
        senha,
      }, {
        // Configurações adicionais para debug e contornar CORS
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Resposta do servidor:', resposta.data);
      
      const { token } = resposta.data;
      localStorage.setItem('token', token);
      
      // decodifica token
      const decodificado = jwtDecode<PayloadToken>(token);
      setUsuario({
        id: decodificado.id,
        nome: decodificado.nome,
        email: decodificado.email,
        criado_em: new Date(),
        favoritos: [],
      });
      
      // salva lista vazia de favoritos
      localStorage.setItem(`favorites_${decodificado.id}`, JSON.stringify([]));
      
      setEstaAutenticado(true);
      return true;
    } catch (err: any) {
      console.error('Erro ao criar conta:', err);
      console.error('Detalhes do erro:', err.message, err.code);
      
      if (err.code === 'ERR_NETWORK') {
        setErro('Erro de conexão com o servidor. Verifique se o backend está rodando e acessível.');
      } else if (err.response) {
        // O servidor respondeu com um status de erro
        setErro(err.response.data?.message || `Erro ${err.response.status}: ${err.response.statusText}`);
      } else if (err.request) {
        // A requisição foi feita mas não houve resposta
        setErro('Servidor não respondeu à solicitação. Verifique a conexão e tente novamente.');
      } else {
        // Algo aconteceu na configuração da requisição que disparou um erro
        setErro(err.message || 'Erro ao criar conta. Tente novamente.');
      }
      
      return false;
    } finally {
      setCarregando(false);
    }
  };

  // funcao para sair
  const sair = () => {
    localStorage.removeItem('token');
    setUsuario(null);
    setEstaAutenticado(false);
  };
  
  // obtem lista de favoritos
  const obterFavoritos = (): string[] => {
    if (!usuario || !usuario.favoritos) return [];
    return usuario.favoritos;
  };
  
  // adiciona um destino aos favoritos
  const adicionarAosFavoritos = async (idDestino: string): Promise<boolean> => {
    if (!estaAutenticado || !usuario) {
      setErro('Você precisa estar logado para adicionar favoritos');
      return false;
    }
    
    try {
      // verifica se ja nao esta nos favoritos
      if (!usuario.favoritos?.includes(idDestino)) {
        const favoritosAtualizados = [...(usuario.favoritos || []), idDestino];
        
        // atualiza o usuario
        setUsuario({
          ...usuario,
          favoritos: favoritosAtualizados
        });
        
        // salva no storage
        localStorage.setItem(`favorites_${usuario.id}`, JSON.stringify(favoritosAtualizados));
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao adicionar aos favoritos:', err);
      return false;
    }
  };
  
  // remove um destino dos favoritos
  const removerDosFavoritos = async (idDestino: string): Promise<boolean> => {
    if (!estaAutenticado || !usuario) {
      setErro('Você precisa estar logado para remover favoritos');
      return false;
    }
    
    try {
      // verifica se esta nos favoritos
      if (usuario.favoritos?.includes(idDestino)) {
        const favoritosAtualizados = usuario.favoritos.filter(id => id !== idDestino);
        
        // atualiza o usuario
        setUsuario({
          ...usuario,
          favoritos: favoritosAtualizados
        });
        
        // salva no storage
        localStorage.setItem(`favorites_${usuario.id}`, JSON.stringify(favoritosAtualizados));
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao remover dos favoritos:', err);
      return false;
    }
  };
  
  // verifica se um destino e favorito
  const eFavorito = (idDestino: string): boolean => {
    if (!usuario || !usuario.favoritos) return false;
    return usuario.favoritos.includes(idDestino);
  };

  return (
    <ContextoAuth.Provider
      value={{
        usuario,
        estaAutenticado,
        carregando,
        erro,
        login,
        registrar,
        sair,
        obterFavoritos,
        adicionarAosFavoritos,
        removerDosFavoritos,
        eFavorito
      }}
    >
      {children}
    </ContextoAuth.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(ContextoAuth);
  if (contexto === undefined) {
    throw new Error('useAuth deve ser usado dentro de um ProvedorAuth');
  }
  return contexto;
} 