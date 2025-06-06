'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/componentes/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/componentes/ui/card';
import { Badge } from '@/componentes/ui/badge';
import { ToggleTema } from '@/componentes/ToggleTema';
import { servicoDestinos } from '../servicos/apiDestinos';
import { InfoDestino } from '@/tipos';
import { 
  MapPin, 
  Plane, 
  Camera, 
  Users, 
  Star, 
  ArrowRight,
  Search,
  Globe,
  Heart,
  Shield,
  Zap,
  Navigation,
  Filter,
  Smartphone,
  Award,
  TrendingUp
} from 'lucide-react';

export default function LandingPage() {
  const [destinosPopulares, setDestinosPopulares] = useState<InfoDestino[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarDestinos = async () => {
      try {
        const resultado = await servicoDestinos.obterDestinosPaginados({
          pagina: 1,
          limite: 6,
          filtros: { ordenarPor: 'popularidade' }
        });
        setDestinosPopulares(resultado.dados);
      } catch (error) {
        console.error('Erro ao carregar destinos populares:', error);
      } finally {
        setCarregando(false);
      }
    };

    carregarDestinos();
  }, []);

  const obterEmojiPreco = (preco: 'baixo' | 'medio' | 'alto'): string => {
    switch (preco) {
      case 'baixo': return '💰';
      case 'medio': return '💰💰';
      case 'alto': return '💰💰💰';
      default: return '💰';
    }
  };

  const calcularEstrelas = (destino: InfoDestino): number => {
    // Sistema simples de popularidade baseado na população e região
    let score = 0;
    if (destino.populacao > 10000000) score = 5;
    else if (destino.populacao > 5000000) score = 4;
    else if (destino.populacao > 2000000) score = 3;
    else if (destino.populacao > 1000000) score = 2;
    else score = 1;
    
    return Math.min(5, score);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header Moderno */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 transition-opacity hover:opacity-80">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                <Globe className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                DestinoFácil
              </span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/destinos" 
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Explorar Destinos
            </Link>
            <Link 
              href="#features" 
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Funcionalidades
            </Link>
            <Link 
              href="#como-funciona" 
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Como Funciona
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/auth">Entrar</Link>
            </Button>
            <Button size="sm" asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Link href="/destinos">
                <Search className="mr-2 h-4 w-4" />
                Começar Agora
              </Link>
            </Button>
            <ToggleTema />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-indigo-600/5 to-purple-600/5" />
        <div className="container mx-auto px-4 relative">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-8 px-4 py-2 text-sm">
              <TrendingUp className="mr-2 h-4 w-4" />
              Plataforma de Viagens
            </Badge>
            
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Descubra seu{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                próximo destino
              </span>{' '}
              dos sonhos
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Explore destinos incríveis ao redor do mundo com informações detalhadas sobre clima, 
              população e pontos turísticos. Encontre voos e planeje sua viagem perfeita.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-12 px-8">
                <Link href="/destinos">
                  <Search className="mr-2 h-5 w-5" />
                  Explorar Destinos
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="w-full sm:w-auto h-12 px-8">
                <Link href="/auth">
                  Criar Conta Gratuita
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">1000+</div>
                <div className="text-sm text-muted-foreground">Destinos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">195</div>
                <div className="text-sm text-muted-foreground">Países</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">100%</div>
                <div className="text-sm text-muted-foreground">Gratuito</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">24/7</div>
                <div className="text-sm text-muted-foreground">Disponível</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="features" className="py-20 sm:py-32 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Tudo que você precisa para{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                planejar sua viagem
              </span>
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Uma plataforma completa com todas as ferramentas necessárias para descobrir e planejar seu próximo destino.
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                  <Search className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Busca Inteligente</CardTitle>
                <CardDescription>
                  Encontre destinos por nome, região ou características específicas com nossa busca avançada.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 text-white">
                  <Filter className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Filtros Avançados</CardTitle>
                <CardDescription>
                  Refine sua busca por preço, clima, população e região para encontrar o destino perfeito.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-violet-600 text-white">
                  <Heart className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Favoritos</CardTitle>
                <CardDescription>
                  Salve seus destinos preferidos e acesse-os facilmente em qualquer dispositivo.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-600 to-red-600 text-white">
                  <Plane className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Busca de Voos</CardTitle>
                <CardDescription>
                  Integração direta com Skyscanner para encontrar as melhores ofertas de passagens.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/10">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-cyan-600 text-white">
                  <Smartphone className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Responsivo</CardTitle>
                <CardDescription>
                  Interface otimizada para desktop, tablet e celular. Acesse de qualquer lugar.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-pink-600 to-rose-600 text-white">
                  <Award className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Gratuito</CardTitle>
                <CardDescription>
                  Acesso completo a todas as funcionalidades sem custo. Projeto acadêmico sem fins lucrativos.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Como funciona
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Em apenas 3 passos simples, encontre e planeje sua viagem dos sonhos.
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-5xl gap-12 lg:grid-cols-3">
            <div className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xl font-bold">
                1
              </div>
              <h3 className="mt-6 text-xl font-semibold">Busque seu Destino</h3>
              <p className="mt-4 text-muted-foreground">
                Digite o nome de uma cidade, país ou região que você gostaria de visitar. Use nossos filtros para refinar sua busca.
              </p>
            </div>
            
            <div className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-emerald-600 text-white text-xl font-bold">
                2
              </div>
              <h3 className="mt-6 text-xl font-semibold">Explore Informações</h3>
              <p className="mt-4 text-muted-foreground">
                Descubra informações detalhadas sobre clima, população, preços e características únicas de cada destino.
              </p>
            </div>
            
            <div className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-violet-600 text-white text-xl font-bold">
                3
              </div>
              <h3 className="mt-6 text-xl font-semibold">Planeje sua Viagem</h3>
              <p className="mt-4 text-muted-foreground">
                Encontre voos com nossa integração ao Skyscanner e comece a planejar sua aventura perfeita.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Destinos Populares */}
      <section className="py-20 sm:py-32 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Destinos em{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Alta
              </span>
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Conheça alguns dos destinos mais procurados e bem avaliados pelos viajantes.
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {carregando ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse overflow-hidden">
                  <div className="h-48 bg-muted" />
                  <CardHeader>
                    <div className="h-6 w-3/4 bg-muted rounded" />
                    <div className="h-4 w-full bg-muted rounded" />
                  </CardHeader>
                </Card>
              ))
            ) : (
              destinosPopulares.map((destino) => {
                const estrelas = calcularEstrelas(destino);
                return (
                  <Card key={destino.id} className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                    <Link href="/destinos">
                      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <MapPin className="h-16 w-16 text-white/80" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        
                        {/* Badges de Preço e Popularidade */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          <Badge className="bg-white/20 text-white border-white/30 text-xs">
                            {obterEmojiPreco(destino.preco)} {destino.preco}
                          </Badge>
                          <Badge className="bg-yellow-500/20 text-yellow-200 border-yellow-500/30 text-xs">
                            <Star className="mr-1 h-3 w-3 fill-current" />
                            {estrelas}
                          </Badge>
                        </div>

                        <div className="absolute top-3 right-3">
                          <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/20 text-white hover:bg-white/30">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <CardHeader className="space-y-2">
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {destino.nome}
                        </CardTitle>
                        <CardDescription className="flex items-center justify-between">
                          <span>{destino.regiao}</span>
                          <span className="text-xs text-muted-foreground">
                            {(destino.populacao / 1000000).toFixed(1)}M hab
                          </span>
                        </CardDescription>
                      </CardHeader>
                    </Link>
                  </Card>
                );
              })
            )}
          </div>
          
          <div className="mt-12 text-center">
            <Button asChild size="lg" variant="outline" className="h-12 px-8">
              <Link href="/destinos">
                Ver Todos os Destinos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 sm:py-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Pronto para descobrir o mundo?
            </h2>
            <p className="mt-6 text-lg leading-8 text-blue-100">
              Junte-se a milhares de viajantes que descobriram seus destinos dos sonhos conosco.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="secondary" asChild className="w-full sm:w-auto h-12 px-8">
                <Link href="/destinos">
                  <Search className="mr-2 h-5 w-5" />
                  Começar Exploração
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/80">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                  <Globe className="h-4 w-4" />
                </div>
                <span className="font-bold">DestinoFácil</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Plataforma para descoberta de destinos de viagem.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">Plataforma</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/destinos" className="hover:text-foreground transition-colors">Explorar Destinos</Link></li>
                <li><Link href="/auth" className="hover:text-foreground transition-colors">Criar Conta</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium">Recursos</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition-colors">Funcionalidades</Link></li>
                <li><Link href="#como-funciona" className="hover:text-foreground transition-colors">Como Funciona</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium">Equipe</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Aluisio Paredes</li>
                <li>Enzo Gabriel</li>
                <li>Guilherme Almeida</li>
                <li>Pedro Cesar</li>
                <li>Victor Santana</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
            © 2024 DestinoFácil. Projeto Acadêmico - Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
