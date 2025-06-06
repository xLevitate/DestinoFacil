'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/componentes/ui/button';
import { Input } from '@/componentes/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/componentes/ui/card';
import { Badge } from '@/componentes/ui/badge';
import { ToggleTema } from '@/componentes/ToggleTema';
import FiltrosDestinos from '@/componentes/FiltrosDestinos';
import NotificacaoAuth from '@/componentes/NotificacaoAuth';
import { servicoDestinos } from '../../servicos/apiDestinos';
import { authService } from '@/lib/supabase';
import { useFavoritos } from '@/hooks/useFavoritos';
import { InfoDestino, FiltrosDestino, ParametrosPaginacao } from '@/tipos';
import type { User } from '@supabase/supabase-js';
import {
  Globe,
  Search,
  MapPin,
  Plane,
  Loader2,
  User as UserIcon,
  LogOut,
  Heart,
  ChevronLeft,
  ChevronRight,
  Filter,
  Star,
  TrendingUp,
  ArrowUpDown,
  Grid3X3,
  SlidersHorizontal,
  Users,
  Thermometer,
  DollarSign
} from 'lucide-react';

// Função auxiliar para limpeza de entrada
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>'"&]/g, '').slice(0, 100);
};

// Função para obter emoji de preço
const obterEmojiPreco = (preco: 'baixo' | 'medio' | 'alto'): string => {
  switch (preco) {
    case 'baixo': return '💰';
    case 'medio': return '💰💰';
    case 'alto': return '💰💰💰';
    default: return '💰';
  }
};

// Função para obter emoji de clima
const obterEmojiClima = (clima: 'frio' | 'temperado' | 'quente'): string => {
  switch (clima) {
    case 'frio': return '🌨️';
    case 'temperado': return '🌤️';
    case 'quente': return '☀️';
    default: return '🌤️';
  }
};

// Função para calcular popularidade baseada em vários fatores
const calcularPopularidade = (destino: InfoDestino): number => {
  let score = 0;
  
  // Pontuação baseada na região (destinos mais conhecidos)
  const regiaoScores: { [key: string]: number } = {
    'Europa Ocidental': 100,
    'Europa Meridional': 95,
    'América do Norte': 90,
    'Ásia Oriental': 85,
    'Sudeste Asiático': 80,
    'América Central': 75,
    'América do Sul': 70,
    'África Setentrional': 65,
    'Europa Oriental': 60,
    'África Meridional': 55,
    'Ásia Ocidental': 50,
    'Oceania': 45,
    'Ásia Central': 40,
    'África Oriental': 35,
    'África Ocidental': 30,
  };
  
  score += regiaoScores[destino.regiao] || 25;
  
  // Pontuação baseada no preço (destinos mais caros tendem a ser mais turísticos)
  switch (destino.preco) {
    case 'alto': score += 30; break;
    case 'medio': score += 20; break;
    case 'baixo': score += 10; break;
  }
  
  // Pontuação baseada no clima (temperado e quente são mais populares)
  switch (destino.clima) {
    case 'quente': score += 25; break;
    case 'temperado': score += 20; break;
    case 'frio': score += 10; break;
  }
  
  // Bonificação para capitais e cidades conhecidas
  const cidadesPopulares = [
    'Paris', 'London', 'New York', 'Tokyo', 'Rome', 'Barcelona', 'Amsterdam', 
    'Berlin', 'Prague', 'Vienna', 'Budapest', 'Lisbon', 'Madrid', 'Athens',
    'Istanbul', 'Moscow', 'Beijing', 'Seoul', 'Bangkok', 'Singapore',
    'Dubai', 'Cairo', 'Sydney', 'Melbourne', 'Los Angeles', 'San Francisco',
    'Miami', 'Las Vegas', 'Rio de Janeiro', 'São Paulo', 'Buenos Aires',
    'Lima', 'Santiago', 'Mexico City', 'Havana', 'Cancun', 'Mumbai', 'Delhi'
  ];
  
  if (cidadesPopulares.some(cidade => destino.nome.toLowerCase().includes(cidade.toLowerCase()))) {
    score += 50;
  }
  
  return score;
};

export default function PaginaDestinos() {
  const [destinos, setDestinos] = useState<InfoDestino[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  
  // Estado para o input e para o termo de busca efetivado
  const [termoInput, setTermoInput] = useState('');
  const [termoBusca, setTermoBusca] = useState('');

  const [usuario, setUsuario] = useState<User | null>(null);
  const [mostrarNotificacaoAuth, setMostrarNotificacaoAuth] = useState(false);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalItens, setTotalItens] = useState(0);
  const [filtros, setFiltros] = useState<FiltrosDestino>({ ordenarPor: 'popularidade' });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const itensPorPagina = 12;
  const router = useRouter();
  const { isFavoritado, alternarFavorito, carregando: carregandoFavoritos } = useFavoritos(usuario?.id);

  // Efeito para buscar usuário e observar mudanças
  useEffect(() => {
    let subscription: any = null;

    const setupAuth = async () => {
      try {
        // Define o usuário inicial
        const initialUser = await authService.obterUsuario();
        setUsuario(initialUser);

        // Escuta por mudanças (login, logout)
        subscription = authService.onAuthStateChange(setUsuario);
      } catch (error) {
        console.error('Erro ao configurar autenticação:', error);
        setUsuario(null);
      }
    };

    setupAuth();

    // Limpa a inscrição quando o componente é desmontado
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Efeito centralizado para carregar destinos
  useEffect(() => {
    const carregarDestinos = async () => {
      setCarregando(true);
      setErro(null);

      try {
        const params: ParametrosPaginacao = {
          pagina: paginaAtual,
          limite: itensPorPagina,
          filtros: filtros,
          termoBusca: termoBusca,
        };

        const resultado = await servicoDestinos.obterDestinosPaginados(params);
        
        const destinosComFavoritos = resultado.dados.map((d: InfoDestino) => ({
          ...d,
          isFavorito: usuario ? isFavoritado(d.id) : false,
        }));

        setDestinos(destinosComFavoritos);
        setTotalPaginas(resultado.totalPaginas);
        setTotalItens(resultado.totalItens);
      } catch (error) {
        setErro('Erro ao carregar destinos. Tente novamente mais tarde.');
        console.error('Erro ao carregar destinos:', error);
      } finally {
        setCarregando(false);
      }
    };

    carregarDestinos();
  }, [paginaAtual, filtros, termoBusca, usuario, isFavoritado]); // Dependências que disparam a busca

  // Manipuladores que apenas atualizam o estado - useCallback para performance
  const handleBuscar = useCallback(() => {
    const termoSeguro = sanitizeInput(termoInput);
    setPaginaAtual(1);
    setTermoBusca(termoSeguro);
  }, [termoInput]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBuscar();
    }
  }, [handleBuscar]);

  const aplicarFiltros = useCallback((novosFiltros: FiltrosDestino) => {
    setPaginaAtual(1);
    setFiltros(novosFiltros);
  }, []);

  const limparFiltros = useCallback(() => {
    setPaginaAtual(1);
    setFiltros({ ordenarPor: 'popularidade' });
    setTermoInput('');
    setTermoBusca('');
  }, []);

  const irParaPagina = useCallback((novaPagina: number) => {
    if (novaPagina >= 1 && novaPagina <= totalPaginas && novaPagina !== paginaAtual) {
      setPaginaAtual(novaPagina);
      // Rolar para o topo ao mudar de página
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalPaginas, paginaAtual]);

  const handleFavorito = useCallback(async (destino: InfoDestino) => {
    if (!usuario) {
      setMostrarNotificacaoAuth(true);
      return;
    }
    
    try {
      const sucesso = await alternarFavorito(destino);
      if (sucesso) {
        setDestinos((prev) =>
          prev.map((d) => (d.id === destino.id ? { ...d, isFavorito: !d.isFavorito } : d))
        );
      }
    } catch (error) {
      console.error('Erro ao alternar favorito:', error);
    }
  }, [usuario, alternarFavorito]);

  const abrirSkyscanner = useCallback((nomeDestino: string) => {
    try {
      const url = `https://www.skyscanner.com.br/transporte/voos/sao-paulo/${encodeURIComponent(nomeDestino.toLowerCase().replace(/\s+/g, '-'))}/`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
              console.error('Erro ao abrir Skyscanner:', error);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await authService.sair();
      setUsuario(null);
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }, [router]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = sanitizeInput(e.target.value);
    setTermoInput(valor);
  }, []);

  // Componentes estáveis para evitar re-renderizações desnecessárias
  const Cabecalho = useMemo(() => (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">DestinoFácil</h1>
            <p className="text-xs text-muted-foreground">Explore o mundo</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {usuario ? (
            <>
              <Button variant="ghost" size="icon" onClick={() => router.push('/perfil')} className="h-9 w-9">
                <UserIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="h-9 w-9">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button onClick={() => router.push('/auth')} size="sm">Login</Button>
          )}
          <ToggleTema />
        </div>
      </div>
    </header>
  ), [usuario, router, handleLogout]);

  // Componente de barra de busca estável
  const BarraDeBusca = useMemo(() => (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Para onde você quer ir? Ex: Paris, Europa, Ásia..."
          className="pl-10 h-12 text-base bg-background/50 border-border/50 focus:bg-background"
          value={termoInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          maxLength={100}
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleBuscar} disabled={carregando} size="lg" className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>
        <Button variant="outline" onClick={() => setMostrarFiltros(!mostrarFiltros)} size="lg" className="h-12 px-6">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>
    </div>
  ), [termoInput, handleInputChange, handleKeyPress, handleBuscar, carregando, mostrarFiltros]);
  
  const CartaoDestino = ({ destino }: { destino: InfoDestino }) => {
    const popularidade = calcularPopularidade(destino);
    const estrelas = Math.min(5, Math.floor(popularidade / 20));
    
    return (
      <Card className="group overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col border-0 bg-gradient-to-br from-background to-muted/20">
        <div className="h-56 relative bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
          <MapPin className="h-20 w-20 text-white/60 group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Badges superiores */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {obterEmojiPreco(destino.preco)} {destino.preco}
            </Badge>
            <Badge className="bg-yellow-500/20 text-yellow-200 border-yellow-500/30 backdrop-blur-sm">
              <Star className="mr-1 h-3 w-3 fill-current" />
              {estrelas}
            </Badge>
          </div>

          {/* Botão favorito */}
          <div className="absolute top-3 right-3">
            <Button
              variant="ghost"
              size="icon"
              className={`h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm transition-all duration-200 ${destino.isFavorito ? 'text-red-400 bg-red-500/20' : 'text-white hover:bg-white/30'}`}
              onClick={() => handleFavorito(destino)}
              disabled={carregandoFavoritos}
              aria-label={destino.isFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Heart className={`h-5 w-5 ${destino.isFavorito ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Informações de clima */}
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-black/30 text-white border-white/20 backdrop-blur-sm">
              {obterEmojiClima(destino.clima)} {destino.clima}
            </Badge>
          </div>
        </div>
        
        <CardHeader className="flex-grow pb-3">
          <CardTitle className="text-xl group-hover:text-blue-600 transition-colors duration-200">{destino.nome}</CardTitle>
          <CardDescription className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {destino.regiao}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3 w-3" />
              {(destino.populacao / 1000000).toFixed(1)}M
            </span>
          </CardDescription>
          
          {/* Indicadores adicionais */}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {destino.pais}
            </Badge>
            {popularidade > 80 && (
              <Badge className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                <TrendingUp className="h-3 w-3 mr-1" />
                Popular
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 group-hover:scale-[1.02]" 
            onClick={() => abrirSkyscanner(destino.nome)}
            aria-label={`Ver voos para ${destino.nome}`}
          >
            <Plane className="h-4 w-4 mr-2" />
            Ver Voos
          </Button>
        </CardContent>
      </Card>
    );
  };

  const Paginacao = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12">
      <div className="text-sm text-muted-foreground">
        Mostrando {Math.min((paginaAtual - 1) * itensPorPagina + 1, totalItens)} - {Math.min(paginaAtual * itensPorPagina, totalItens)} de {totalItens} destinos
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => irParaPagina(paginaAtual - 1)}
          disabled={paginaAtual <= 1 || carregando}
          aria-label="Página anterior"
          className="h-9 w-9"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
            const pageNum = i + Math.max(1, paginaAtual - 2);
            if (pageNum > totalPaginas) return null;
            
            return (
              <Button
                key={pageNum}
                variant={pageNum === paginaAtual ? "default" : "outline"}
                size="icon"
                onClick={() => irParaPagina(pageNum)}
                className="h-9 w-9"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => irParaPagina(paginaAtual + 1)}
          disabled={paginaAtual >= totalPaginas || carregando}
          aria-label="Próxima página"
          className="h-9 w-9"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {Cabecalho}
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Explore o{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Mundo
            </span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Encontre o seu próximo destino de aventura. Descubra informações detalhadas, preços e avalie cada local.
          </p>
          {BarraDeBusca}
        </div>

        {/* Filtros */}
        {mostrarFiltros && (
          <div className="mb-8">
            <FiltrosDestinos
              filtros={filtros}
              onFiltrosChange={aplicarFiltros}
              onLimpar={limparFiltros}
            />
          </div>
        )}

        {/* Área de resultados */}
        <div className="space-y-6">
          {/* Header de resultados */}
          {!carregando && destinos.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-background/50 backdrop-blur-sm rounded-lg border border-border/50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{totalItens} destinos encontrados</span>
                </div>
                {termoBusca && (
                  <Badge variant="secondary">
                    Busca: "{termoBusca}"
                  </Badge>
                )}
                {filtros.ordenarPor && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <ArrowUpDown className="h-3 w-3" />
                    {filtros.ordenarPor === 'popularidade' ? 'Mais Popular' : 
                     filtros.ordenarPor === 'nome' ? 'A-Z' : 'População'}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Grid de destinos */}
          {carregando ? (
            <div className="flex justify-center items-center h-64" role="status" aria-label="Carregando destinos">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-muted-foreground">Descobrindo destinos incríveis...</p>
              </div>
            </div>
          ) : erro ? (
            <div className="text-center p-12 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20" role="alert">
              <div className="text-red-600 text-lg font-medium mb-2">{erro}</div>
              <Button onClick={() => window.location.reload()} variant="outline">
                Tentar Novamente
              </Button>
            </div>
          ) : destinos.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {destinos.map(destino => (
                  <CartaoDestino key={destino.id} destino={destino} />
                ))}
              </div>
              {totalPaginas > 1 && <Paginacao />}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <MapPin className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">Nenhum destino encontrado</h3>
                <p className="text-muted-foreground mb-6">
                  Tente usar termos diferentes ou ajustar os filtros para encontrar destinos.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button onClick={limparFiltros} variant="outline">
                    Limpar Filtros
                  </Button>
                  <Button onClick={() => {
                    setTermoInput('');
                    setTermoBusca('');
                    setPaginaAtual(1);
                  }}>
                    Ver Todos os Destinos
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {mostrarNotificacaoAuth && (
        <NotificacaoAuth 
          visivel={mostrarNotificacaoAuth}
          onFechar={() => setMostrarNotificacaoAuth(false)} 
        />
      )}
    </div>
  );
} 