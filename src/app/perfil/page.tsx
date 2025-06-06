'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/componentes/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentes/ui/card';
import { ToggleTema } from '@/componentes/ToggleTema';
import { authService } from '@/lib/supabase';
import { useFavoritos } from '@/hooks/useFavoritos';

import { formatarPopulacao } from '@/lib/utils';
import { 
  Globe, 
  ArrowLeft,
  User,
  LogOut,
  Heart,
  MapPin,
  Users,
  Plane,
  ExternalLink,
  Mail,
  Calendar,
  Loader2
} from 'lucide-react';

export default function PaginaPerfil() {
  const [usuario, setUsuario] = useState<any>(null);
  const [carregandoUsuario, setCarregandoUsuario] = useState(true);
  const router = useRouter();

  // Hook de favoritos  
  const [favoritos, setFavoritos] = useState<any[]>([]);
  const [carregandoFavoritos, setCarregandoFavoritos] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Carregar usuário autenticado
  useEffect(() => {
    const verificarUsuario = async () => {
      try {
        const user = await authService.obterUsuario();
        if (!user) {
          router.push('/auth');
          return;
        }
        setUsuario(user);
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
        router.push('/auth');
      } finally {
        setCarregandoUsuario(false);
      }
    };

    verificarUsuario();
  }, [router]);

  const handleLogout = async () => {
    try {
      await authService.sair();
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const abrirSkyscanner = (nomeDestino: string) => {
    const url = `https://www.skyscanner.com.br/transporte/voos/sao-paulo/${encodeURIComponent(nomeDestino.toLowerCase().replace(/\s+/g, '-'))}/`;
    window.open(url, '_blank');
  };

  if (carregandoUsuario) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return null; // Redirecionando...
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-14 items-center">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/destinos">
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
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sair</span>
            </Button>
            <ToggleTema />
          </div>
        </div>
      </header>

      <div className="container py-6 space-y-8">
        {/* Informações do Usuário */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {usuario.user_metadata?.nome || 'Usuário'}
                  </h1>
                  <p className="text-muted-foreground">Perfil</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{usuario.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Membro desde</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Destinos Favoritos */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Destinos Favoritos</h2>
              <p className="text-muted-foreground">
                {favoritos.length} {favoritos.length === 1 ? 'destino favoritado' : 'destinos favoritados'}
              </p>
            </div>
            <Button variant="outline" disabled={carregandoFavoritos}>
              {carregandoFavoritos ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Atualizar'
              )}
            </Button>
          </div>

          {erro && (
            <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {erro}
            </div>
          )}

          {carregandoFavoritos ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-32 bg-muted" />
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-8 bg-muted rounded w-full mt-4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : favoritos.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {favoritos.map((favorito) => (
                <Card key={favorito.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                  {/* Header do Card */}
                  <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 relative overflow-hidden">
                    <div className="flex items-center justify-center h-full">
                      <MapPin className="h-12 w-12 text-primary/40" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute top-2 right-2">
                      <div className="bg-red-500 rounded-full p-1">
                        <Heart className="h-3 w-3 text-white fill-current" />
                      </div>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {favorito.destino_nome}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {favorito.destino_regiao}, {favorito.destino_pais}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Informações básicas */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{formatarPopulacao(favorito.destino_populacao)}</span>
                      </div>
                    </div>

                    {/* Data de quando foi favoritado */}
                    <div className="text-xs text-muted-foreground">
                      Favoritado em {new Date(favorito.created_at).toLocaleDateString('pt-BR')}
                    </div>

                    {/* Botão de voos */}
                    <Button 
                      onClick={() => abrirSkyscanner(favorito.destino_nome)}
                      className="w-full"
                      variant="outline"
                    >
                      <Plane className="mr-2 h-4 w-4" />
                      Encontrar Voos
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum destino favoritado</h3>
                <p className="text-muted-foreground mb-4">
                  Comece a explorar destinos e adicione seus favoritos aqui!
                </p>
                <Button asChild>
                  <Link href="/destinos">
                    Explorar Destinos
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 