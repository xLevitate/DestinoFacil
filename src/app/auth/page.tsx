'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/componentes/ui/button';
import { Input } from '@/componentes/ui/input';
import { Label } from '@/componentes/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/componentes/ui/card';
import { Badge } from '@/componentes/ui/badge';
import { Alert, AlertDescription } from '@/componentes/ui/alert';
import { ToggleTema } from '@/componentes/ToggleTema';
import { authService } from '@/lib/supabase';
import { 
  Eye, 
  EyeOff, 
  Globe, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Shield, 
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

export default function AuthPage() {
  const [modo, setModo] = useState<'entrar' | 'registrar'>('entrar');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  
  const router = useRouter();

  // Validação em tempo real
  const [validacao, setValidacao] = useState({
    email: { valido: false, mensagem: '' },
    senha: { valido: false, mensagem: '' },
    nome: { valido: false, mensagem: '' }
  });

  useEffect(() => {
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailValido = emailRegex.test(email);
    setValidacao(prev => ({
      ...prev,
      email: {
        valido: emailValido,
        mensagem: email && !emailValido ? 'Por favor, insira um e-mail válido' : ''
      }
    }));
  }, [email]);

  useEffect(() => {
    // Validar senha
    const senhaValida = senha.length >= 8;
    setValidacao(prev => ({
      ...prev,
      senha: {
        valido: senhaValida,
        mensagem: senha && !senhaValida ? 'A senha deve ter pelo menos 8 caracteres' : ''
      }
    }));
  }, [senha]);

  useEffect(() => {
    // Validar nome (apenas para registro)
    const nomeValido = nome.length >= 2;
    setValidacao(prev => ({
      ...prev,
      nome: {
        valido: nomeValido,
        mensagem: nome && !nomeValido ? 'O nome deve ter pelo menos 2 caracteres' : ''
      }
    }));
  }, [nome]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setCarregando(true);

    try {
      if (modo === 'entrar') {
        await authService.entrar(email, senha);
        router.push('/destinos');
      } else {
        await authService.registrar(email, senha, nome);
        setSucesso('Conta criada com sucesso! Verifique seu e-mail para confirmar.');
        // Aguardar 2 segundos antes de redirecionar
        setTimeout(() => {
          setModo('entrar');
          setSucesso('');
        }, 2000);
      }
    } catch (error: any) {
      setErro(error.message || 'Erro inesperado. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const alternarModo = () => {
    setModo(modo === 'entrar' ? 'registrar' : 'entrar');
    setErro('');
    setSucesso('');
    setEmail('');
    setSenha('');
    setNome('');
  };

  const formValido = modo === 'entrar' 
    ? validacao.email.valido && validacao.senha.valido
    : validacao.email.valido && validacao.senha.valido && validacao.nome.valido;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(148_163_184_/_0.15)_1px,transparent_0)] [background-size:24px_24px]" />
      
      {/* Header absoluto */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-3 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
            <Globe className="h-4 w-4" />
          </div>
          <span className="font-bold text-foreground">DestinoFácil</span>
        </Link>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <ToggleTema />
        </div>
      </div>

      {/* Container Principal */}
      <div className="w-full max-w-md relative">
        <Card className="backdrop-blur-sm bg-background/80 border border-border/50 shadow-2xl shadow-blue-500/10">
          <CardHeader className="space-y-1 text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                <Shield className="h-6 w-6" />
              </div>
            </div>
            
            <CardTitle className="text-2xl font-bold tracking-tight">
              {modo === 'entrar' ? 'Bem-vindo de volta' : 'Criar sua conta'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {modo === 'entrar' 
                ? 'Entre em sua conta para continuar explorando' 
                : 'Junte-se a milhares de viajantes'
              }
            </CardDescription>
            
            {/* Indicador de confiança */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge variant="secondary" className="text-xs">
                <Shield className="mr-1 h-3 w-3" />
                100% Seguro
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="mr-1 h-3 w-3" />
                Gratuito
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Alertas de Erro/Sucesso */}
            {erro && (
              <Alert variant="destructive" className="animate-in slide-in-from-top-1 duration-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{erro}</AlertDescription>
              </Alert>
            )}
            
            {sucesso && (
              <Alert className="border-green-500/50 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-50 animate-in slide-in-from-top-1 duration-300">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{sucesso}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Campo Nome (apenas registro) */}
              {modo === 'registrar' && (
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-sm font-medium">
                    Nome completo
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nome"
                      placeholder="Seu nome completo"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className={`pl-10 h-11 transition-all duration-200 ${
                        nome && !validacao.nome.valido 
                          ? 'border-red-500 focus:ring-red-500' 
                          : nome && validacao.nome.valido 
                          ? 'border-green-500 focus:ring-green-500' 
                          : ''
                      }`}
                      required
                    />
                    {nome && validacao.nome.valido && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                  </div>
                  {validacao.nome.mensagem && (
                    <p className="text-xs text-red-500 animate-in slide-in-from-top-1 duration-200">
                      {validacao.nome.mensagem}
                    </p>
                  )}
                </div>
              )}

              {/* Campo E-mail */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 h-11 transition-all duration-200 ${
                      email && !validacao.email.valido 
                        ? 'border-red-500 focus:ring-red-500' 
                        : email && validacao.email.valido 
                        ? 'border-green-500 focus:ring-green-500' 
                        : ''
                    }`}
                    required
                  />
                  {email && validacao.email.valido && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {validacao.email.mensagem && (
                  <p className="text-xs text-red-500 animate-in slide-in-from-top-1 duration-200">
                    {validacao.email.mensagem}
                  </p>
                )}
              </div>

              {/* Campo Senha */}
              <div className="space-y-2">
                <Label htmlFor="senha" className="text-sm font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="senha"
                    type={mostrarSenha ? 'text' : 'password'}
                    placeholder={modo === 'entrar' ? 'Sua senha' : 'Mínimo 8 caracteres'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className={`pl-10 pr-10 h-11 transition-all duration-200 ${
                      senha && !validacao.senha.valido 
                        ? 'border-red-500 focus:ring-red-500' 
                        : senha && validacao.senha.valido 
                        ? 'border-green-500 focus:ring-green-500' 
                        : ''
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {validacao.senha.mensagem && (
                  <p className="text-xs text-red-500 animate-in slide-in-from-top-1 duration-200">
                    {validacao.senha.mensagem}
                  </p>
                )}
                
                {/* Indicador de força da senha */}
                {modo === 'registrar' && senha && (
                  <div className="space-y-1">
                    <div className="flex space-x-1">
                      <div className={`h-1 w-1/4 rounded ${senha.length >= 8 ? 'bg-green-500' : 'bg-gray-200'} transition-colors`} />
                      <div className={`h-1 w-1/4 rounded ${senha.length >= 10 ? 'bg-green-500' : 'bg-gray-200'} transition-colors`} />
                      <div className={`h-1 w-1/4 rounded ${/[A-Z]/.test(senha) ? 'bg-green-500' : 'bg-gray-200'} transition-colors`} />
                      <div className={`h-1 w-1/4 rounded ${/[0-9]/.test(senha) ? 'bg-green-500' : 'bg-gray-200'} transition-colors`} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Força da senha: {senha.length >= 10 && /[A-Z]/.test(senha) && /[0-9]/.test(senha) ? 'Forte' : senha.length >= 8 ? 'Média' : 'Fraca'}
                    </p>
                  </div>
                )}
              </div>

              {/* Botão Submit */}
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02]"
                disabled={carregando || !formValido}
              >
                {carregando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {modo === 'entrar' ? 'Entrando...' : 'Criando conta...'}
                  </>
                ) : (
                  <>
                    {modo === 'entrar' ? 'Entrar' : 'Criar conta'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {modo === 'entrar' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
              </p>
              <button
                type="button"
                onClick={alternarModo}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors hover:underline"
                disabled={carregando}
              >
                {modo === 'entrar' ? 'Criar conta gratuita' : 'Fazer login'}
              </button>
            </div>

            {/* Links adicionais */}
            {modo === 'entrar' && (
              <div className="text-center">
                <Link 
                  href="/auth/esqueci-senha" 
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
            )}

            {/* Termos e condições */}
            {modo === 'registrar' && (
              <p className="text-xs text-center text-muted-foreground">
                Ao criar uma conta, você concorda que este é um{' '}
                <span className="font-medium text-foreground">projeto acadêmico</span>{' '}
                e seus dados são usados apenas para fins educacionais.
              </p>
            )}
          </CardFooter>
        </Card>

        {/* Informações de segurança */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>Dados protegidos</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3" />
              <span>100% gratuito</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 