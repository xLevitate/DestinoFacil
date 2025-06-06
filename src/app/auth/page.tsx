'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/componentes/ui/button';
import { Input } from '@/componentes/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/componentes/ui/card';
import { ToggleTema } from '@/componentes/ToggleTema';
import { authService } from '@/lib/supabase';
import { Globe, Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';

type ModoAuth = 'login' | 'registro';

export default function PaginaAuth() {
  const [modo, setModo] = useState<ModoAuth>('login');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setErro(null);
  };

  const validarFormulario = () => {
    if (!formData.email || !formData.senha) {
      setErro('Email e senha são obrigatórios');
      return false;
    }

    if (modo === 'registro') {
      if (!formData.nome) {
        setErro('Nome é obrigatório');
        return false;
      }
      if (formData.senha.length < 6) {
        setErro('Senha deve ter pelo menos 6 caracteres');
        return false;
      }
      if (formData.senha !== formData.confirmarSenha) {
        setErro('Senhas não coincidem');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    setCarregando(true);
    setErro(null);
    setSucesso(null);

    try {
      if (modo === 'login') {
        await authService.entrar(formData.email, formData.senha);
        setSucesso('Login realizado com sucesso!');
        setTimeout(() => {
          router.push('/destinos');
        }, 1000);
      } else {
        await authService.registrar(formData.email, formData.senha, formData.nome);
        setSucesso('Conta criada com sucesso! Verifique seu email para confirmar.');
        setTimeout(() => {
          setModo('login');
          setSucesso(null);
        }, 2000);
      }
    } catch (error: any) {
      setErro(error.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const resetarFormulario = () => {
    setFormData({
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: ''
    });
    setErro(null);
    setSucesso(null);
  };

  const alternarModo = () => {
    setModo(modo === 'login' ? 'registro' : 'login');
    resetarFormulario();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40">
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
          <div className="ml-auto">
            <ToggleTema />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container flex items-center justify-center min-h-[calc(100vh-3.5rem)] py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {modo === 'login' ? 'Entrar' : 'Criar Conta'}
            </CardTitle>
            <CardDescription className="text-center">
              {modo === 'login' 
                ? 'Entre com suas credenciais para acessar sua conta'
                : 'Crie uma conta para salvar seus destinos favoritos'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {modo === 'registro' && (
                <div className="space-y-2">
                  <label htmlFor="nome" className="text-sm font-medium">
                    Nome completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nome"
                      name="nome"
                      type="text"
                      placeholder="Seu nome completo"
                      value={formData.nome}
                      onChange={handleChange}
                      className="pl-9"
                      disabled={carregando}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-9"
                    disabled={carregando}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="senha" className="text-sm font-medium">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="senha"
                    name="senha"
                    type="password"
                    placeholder="Sua senha"
                    value={formData.senha}
                    onChange={handleChange}
                    className="pl-9"
                    disabled={carregando}
                  />
                </div>
              </div>

              {modo === 'registro' && (
                <div className="space-y-2">
                  <label htmlFor="confirmarSenha" className="text-sm font-medium">
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmarSenha"
                      name="confirmarSenha"
                      type="password"
                      placeholder="Confirme sua senha"
                      value={formData.confirmarSenha}
                      onChange={handleChange}
                      className="pl-9"
                      disabled={carregando}
                    />
                  </div>
                </div>
              )}

              {erro && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {erro}
                </div>
              )}

              {sucesso && (
                <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-md">
                  {sucesso}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={carregando}
              >
                {carregando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {modo === 'login' ? 'Entrando...' : 'Criando conta...'}
                  </>
                ) : (
                  modo === 'login' ? 'Entrar' : 'Criar conta'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                {modo === 'login' ? 'Não tem uma conta? ' : 'Já tem uma conta? '}
              </span>
              <Button 
                variant="link" 
                className="p-0 h-auto"
                onClick={alternarModo}
                disabled={carregando}
              >
                {modo === 'login' ? 'Criar conta' : 'Entrar'}
              </Button>
            </div>

            {modo === 'login' && (
              <div className="mt-4 text-center">
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm text-muted-foreground"
                  disabled={carregando}
                >
                  Esqueceu a senha?
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 