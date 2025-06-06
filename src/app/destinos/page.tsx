'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/componentes/ui/button';
import { Input } from '@/componentes/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/componentes/ui/card';
import { ToggleTema } from '@/componentes/ToggleTema';
import FiltrosDestinos from '@/componentes/FiltrosDestinos';
import NotificacaoAuth from '@/componentes/NotificacaoAuth';
import { servicoDestinos, obterUrlGoogleFlights } from '@/servicos/apiDestinos';
import { authService } from '@/lib/supabase';
import { useFavoritos } from '@/hooks/useFavoritos';
import { formatarPopulacao } from '@/lib/utils';
import { InfoDestino, FiltrosDestino, ParametrosPaginacao } from '@/tipos';
import { 
  Globe, 
  Search, 
  MapPin, 
  Users, 
  Plane,
  ExternalLink,
  Loader2,
  ArrowLeft,
  User,
  LogOut,
  Heart,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Thermometer,
  Filter
} from 'lucide-react';

export default function PaginaDestinos() {
  const [destinos, setDestinos] = useState<InfoDestino[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [usuario, setUsuario] = useState<any>(null);
  const [mostrarNotificacaoAuth, setMostrarNotificacaoAuth] = useState(false);
  
  // Estados de paginação e filtros
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalItens, setTotalItens] = useState(0);
  const [filtros, setFiltros] = useState<FiltrosDestino>({ ordenarPor: 'popularidade' });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
  const itensPorPagina = 12;
  const router = useRouter();

  // Hook de favoritos
  const { 
    isFavoritado, 
    alternarFavorito, 
    carregando: carregandoFavoritos 
  } = useFavoritos(usuario?.id);

  // Carregar usuário autenticado
  useEffect(() => {
    const verificarUsuario = async () => {
      try {
        const user = await authService.obterUsuario();
        setUsuario(user);
      } catch (error) {
        console.log('Usuário não autenticado');
      }
    };

    verificarUsuario();
  }, []);

  // Carregar destinos
  const carregarDestinos = async (parametros?: Partial<ParametrosPaginacao>) => {
    setCarregando(true);
    setErro(null);

    try {
      const params: ParametrosPaginacao = {
        pagina: parametros?.pagina || paginaAtual,
        limite: itensPorPagina,
        filtros: parametros?.filtros || filtros,
        termoBusca: parametros?.termoBusca || termoBusca
      };

      const resultado = await servicoDestinos.obterDestinosPaginados(params);
      
      // Marcar favoritos
      const destinosComFavoritos = resultado.dados.map(destino => ({
        ...destino,
        isFavorito: usuario ? isFavoritado(destino.id) : false
      }));

      setDestinos(destinosComFavoritos);
      setTotalPaginas(resultado.totalPaginas);
      setTotalItens(resultado.totalItens);
      setPaginaAtual(resultado.paginaAtual);
    } catch (error) {
      setErro('Erro ao carregar destinos. Tente novamente.');
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  // Carregar destinos na inicialização
  useEffect(() => {
    carregarDestinos();
  }, [usuario]); // Recarregar quando usuário mudar

  const buscarDestinos = () => {
    setPaginaAtual(1);
    carregarDestinos({ pagina: 1, termoBusca });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      buscarDestinos();
    }
  };

  const aplicarFiltros = (novosFiltros: FiltrosDestino) => {
    setFiltros(novosFiltros);
    setPaginaAtual(1);
    carregarDestinos({ pagina: 1, filtros: novosFiltros });
  };

  const limparFiltros = () => {
    const filtrosLimpos: FiltrosDestino = { ordenarPor: 'popularidade' };
    setFiltros(filtrosLimpos);
    setPaginaAtual(1);
    carregarDestinos({ pagina: 1, filtros: filtrosLimpos });
  };

  const irParaPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      carregarDestinos({ pagina });
    }
  };

  const handleFavorito = async (destino: InfoDestino) => {
    if (!usuario) {
      setMostrarNotificacaoAuth(true);
      return;
    }

    const sucesso = await alternarFavorito(destino);
    if (sucesso) {
      // Atualizar estado local
      setDestinos(prev => 
        prev.map(d => 
          d.id === destino.id 
            ? { ...d, isFavorito: !d.isFavorito }
            : d
        )
      );
    }
  };

  const abrirGoogleFlights = (nomeDestino: string) => {
    const url = obterUrlGoogleFlights('São Paulo', nomeDestino);
    window.open(url, '_blank');
  };

  const handleLogout = async () => {
    try {
      await authService.sair();
      setUsuario(null);
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const obterIconePreco = (preco?: 'baixo' | 'medio' | 'alto') => {
    switch (preco) {
      case 'baixo': return '💰';
      case 'medio': return '💰💰';
      case 'alto': return '💰💰💰';
      default: return '';
    }
  };

  const obterIconeClima = (clima?: 'frio' | 'temperado' | 'quente') => {
    switch (clima) {
      case 'frio': return '🌨️';
      case 'temperado': return '🌤️';
      case 'quente': return '☀️';
      default: return '';
    }
  };

  const CartaoDestino = ({ destino }: { destino: InfoDestino }) => (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Imagem de Header */}
      <div className="h-48 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 relative overflow-hidden">
        {destino.imagens && destino.imagens.length > 0 ? (
          <img 
            src={destino.imagens[0].miniatura} 
            alt={destino.imagens[0].alt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <MapPin className="h-16 w-16 text-primary/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Tags de preço e clima */}
        <div className="absolute top-2 left-2 flex gap-1">
          {destino.preco && (
            <span className="bg-black/60 text-white text-xs px-2 py-1 rounded">
              {obterIconePreco(destino.preco)}
            </span>
          )}
          {destino.clima && (
            <span className="bg-black/60 text-white text-xs px-2 py-1 rounded">
              {obterIconeClima(destino.clima)}
            </span>
          )}
        </div>
      </div>

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl group-hover:text-primary transition-colors">
              {destino.nome}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <MapPin className="h-4 w-4" />
              {destino.regiao}, {destino.pais}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={`transition-colors ${
              destino.isFavorito 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-muted-foreground hover:text-red-500'
            }`}
            onClick={() => handleFavorito(destino)}
            disabled={carregandoFavoritos}
          >
            <Heart className={`h-4 w-4 ${destino.isFavorito ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informações básicas */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{formatarPopulacao(destino.populacao)}</span>
          </div>
        </div>

        {/* Informações do país */}
        {destino.infoPais && (
          <div className="text-sm text-muted-foreground">
            <p><strong>Capital:</strong> {destino.infoPais.capital}</p>
            <p><strong>Região:</strong> {destino.infoPais.regiao}</p>
          </div>
        )}

        {/* Botão de voos */}
        <Button 
          onClick={() => abrirGoogleFlights(destino.nome)}
          className="w-full"
          variant="outline"
        >
          <Plane className="mr-2 h-4 w-4" />
          Encontrar Voos
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Notificação de Autenticação */}
      <NotificacaoAuth
        visivel={mostrarNotificacaoAuth}
        onFechar={() => setMostrarNotificacaoAuth(false)}
      />

      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-14 items-center">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Link>
            </Button>
            <Link href="/" className="flex items-center space-x-2">
              <Globe className="h-6 w-6" />
              <span className="font-bold">DestinoFácil</span>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-end space-x-4">
            {usuario ? (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" asChild>
                  <Link href="/perfil">
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Sair</span>
                </Button>
              </div>
            ) : (
              <Button variant="ghost" asChild>
                <Link href="/auth">
                  <User className="mr-2 h-4 w-4" />
                  Entrar
                </Link>
              </Button>
            )}
            <ToggleTema />
          </div>
        </div>
      </header>

      <div className="container py-6">
        {/* Seção de Busca e Filtros */}
        <div className="max-w-4xl mx-auto mb-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Explore Destinos Incríveis
            </h1>
            <p className="text-muted-foreground">
              Descubra informações detalhadas sobre cidades ao redor do mundo
            </p>
          </div>

          {/* Busca */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Digite o nome de uma cidade..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-9"
              />
            </div>
            <Button 
              onClick={buscarDestinos}
              disabled={carregando}
            >
              {carregando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
            <FiltrosDestinos
              filtros={filtros}
              onFiltrosChange={aplicarFiltros}
              onLimpar={limparFiltros}
              aberto={mostrarFiltros}
              onToggle={() => setMostrarFiltros(!mostrarFiltros)}
            />
          </div>

          {/* Filtros Expandidos */}
          {mostrarFiltros && (
            <FiltrosDestinos
              filtros={filtros}
              onFiltrosChange={aplicarFiltros}
              onLimpar={limparFiltros}
              aberto={true}
              onToggle={() => setMostrarFiltros(false)}
            />
          )}

          {erro && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {erro}
            </div>
          )}
        </div>

        {/* Informações de Resultados */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Destinos</h2>
            <p className="text-muted-foreground">
              {totalItens > 0 ? (
                <>Mostrando {destinos.length} de {totalItens} destinos</>
              ) : (
                'Nenhum destino encontrado'
              )}
            </p>
          </div>
          
          {/* Paginação Superior */}
          {totalPaginas > 1 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => irParaPagina(paginaAtual - 1)}
                disabled={paginaAtual <= 1 || carregando}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {paginaAtual} de {totalPaginas}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => irParaPagina(paginaAtual + 1)}
                disabled={paginaAtual >= totalPaginas || carregando}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Grid de destinos */}
        {carregando ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: itensPorPagina }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted" />
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                    <div className="h-8 bg-muted rounded w-full mt-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : destinos.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {destinos.map((destino) => (
              <CartaoDestino key={destino.id} destino={destino} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum destino encontrado. Tente ajustar os filtros ou o termo de busca.
            </p>
          </div>
        )}

        {/* Paginação Inferior */}
        {totalPaginas > 1 && !carregando && (
          <div className="flex items-center justify-center mt-8 space-x-2">
            <Button
              variant="outline"
              onClick={() => irParaPagina(paginaAtual - 1)}
              disabled={paginaAtual <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            
            {/* Números das páginas */}
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                let pageNum;
                if (totalPaginas <= 5) {
                  pageNum = i + 1;
                } else if (paginaAtual <= 3) {
                  pageNum = i + 1;
                } else if (paginaAtual >= totalPaginas - 2) {
                  pageNum = totalPaginas - 4 + i;
                } else {
                  pageNum = paginaAtual - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === paginaAtual ? "default" : "outline"}
                    size="sm"
                    onClick={() => irParaPagina(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => irParaPagina(paginaAtual + 1)}
              disabled={paginaAtual >= totalPaginas}
            >
              Próximo
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 