'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/componentes/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/componentes/ui/card';
import { ToggleTema } from '@/componentes/ToggleTema';
import { servicoDestinos } from '@/servicos/apiDestinos';
import { 
  MapPin, 
  Plane, 
  Camera, 
  Users, 
  Star, 
  ArrowRight,
  Search,
  Globe,
  Heart
} from 'lucide-react';

interface DestinoPopular {
  nome: string;
  imagem: string;
  descricao: string;
}

export default function LandingPage() {
  const [destinosPopulares, setDestinosPopulares] = useState<DestinoPopular[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarDestinos = async () => {
      try {
        const nomes = await servicoDestinos.obterDestinosPopulares();
        const destinos = nomes.slice(0, 4).map(nome => ({
          nome,
          imagem: `/images/${nome.toLowerCase().replace(/\s+/g, '-')}.jpg`,
          descricao: `Descubra as maravilhas de ${nome} e planeje sua viagem dos sonhos.`
        }));
        setDestinosPopulares(destinos);
      } catch (error) {
        console.error('Erro ao carregar destinos:', error);
      } finally {
        setCarregando(false);
      }
    };

    carregarDestinos();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Globe className="h-6 w-6" />
              <span className="font-bold">DestinoFácil</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/destinos" className="transition-colors hover:text-foreground/80">
                Destinos
              </Link>
              <Link href="/auth" className="transition-colors hover:text-foreground/80">
                Entrar
              </Link>
            </nav>
            <ToggleTema />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <div className="flex max-w-[980px] flex-col items-start gap-2">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            Descubra seu próximo{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              destino dos sonhos
            </span>
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground">
            Explore destinos incríveis ao redor do mundo, veja informações detalhadas sobre clima, 
            população e pontos turísticos, e encontre voos com facilidade.
          </p>
        </div>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/destinos">
              <Search className="mr-2 h-4 w-4" />
              Explorar Destinos
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/auth">
              Começar Agora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container space-y-6 py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Por que escolher o DestinoFácil?
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Tudo que você precisa para planejar sua viagem perfeita em uma só plataforma.
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Destinos Únicos</CardTitle>
              <CardDescription>
                Descubra cidades e destinos incríveis com informações detalhadas e atualizadas.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Fotos Profissionais</CardTitle>
              <CardDescription>
                Veja imagens de alta qualidade de cada destino para inspirar sua próxima viagem.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Plane className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Busca de Voos</CardTitle>
              <CardDescription>
                Encontre e compare voos diretamente integrado ao Google Flights.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How it Works */}
      <section className="container space-y-6 py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Como funciona
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Em apenas 3 passos simples, encontre e planeje sua viagem perfeita.
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">1. Busque</h3>
            <p className="text-muted-foreground">
              Digite o nome de uma cidade ou destino que você gostaria de visitar.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <MapPin className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">2. Explore</h3>
            <p className="text-muted-foreground">
              Veja informações detalhadas, fotos, clima e dados interessantes sobre o local.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Plane className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">3. Viaje</h3>
            <p className="text-muted-foreground">
              Encontre voos diretamente no Google Flights e comece a planejar sua viagem.
            </p>
          </div>
        </div>
      </section>

      {/* Popular Destinations Preview */}
      <section className="container space-y-6 py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Destinos Populares
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Conheça alguns dos destinos mais procurados pelos viajantes.
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-4">
          {carregando ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg" />
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                </CardHeader>
              </Card>
            ))
          ) : (
            destinosPopulares.map((destino) => (
              <Card key={destino.nome} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-b from-primary/20 to-primary/5 flex items-center justify-center">
                  <MapPin className="h-12 w-12 text-primary/60" />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{destino.nome}</CardTitle>
                  <CardDescription>{destino.descricao}</CardDescription>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
        <div className="flex justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/destinos">
              Ver Todos os Destinos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/40">
        <div className="container flex flex-col items-center justify-center gap-4 py-8 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-2 md:flex-row">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Pronto para descobrir seu próximo destino?
            </p>
          </div>
          <Button asChild>
            <Link href="/destinos">
              Começar Agora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Globe className="h-6 w-6" />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              © 2024 DestinoFácil. Projeto Acadêmico.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
