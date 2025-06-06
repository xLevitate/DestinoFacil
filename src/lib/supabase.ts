import { createClient, User } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validar variáveis de ambiente obrigatórias na inicialização
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase são obrigatórias: NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Tipos de usuário
export interface PerfilUsuario {
  id: string
  email: string
  nome: string
  created_at: string
  updated_at: string
}

// Funções auxiliares de validação
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 320 // Limite RFC 5321
}

const validatePassword = (password: string): boolean => {
  return password.length >= 8 && password.length <= 128
}

const sanitizeInput = (input: string): string => {
  return input.trim().slice(0, 255) // Limitar comprimento da entrada
}

// Funções de autenticação
export const authService = {
  // Registrar novo usuário
  async registrar(email: string, senha: string, nome: string) {
    // Validação de entrada
    if (!validateEmail(email)) {
      throw new Error('E-mail inválido')
    }
    if (!validatePassword(senha)) {
      throw new Error('A senha deve ter entre 8 e 128 caracteres')
    }
    
    const nomeSeguro = sanitizeInput(nome)
    if (!nomeSeguro || nomeSeguro.length < 2) {
      throw new Error('Nome deve ter pelo menos 2 caracteres')
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password: senha,
      options: {
        data: {
          nome: nomeSeguro
        }
      }
    })
    
    if (error) throw error
    return data
  },

  // Fazer login
  async entrar(email: string, senha: string) {
    // Validação de entrada
    if (!validateEmail(email)) {
      throw new Error('E-mail inválido')
    }
    if (!validatePassword(senha)) {
      throw new Error('Senha inválida')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: senha
    })
    
    if (error) throw error
    return data
  },

  // Logout
  async sair() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Obter usuário atual
  async obterUsuario(): Promise<User | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user ?? null;
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      return null;
    }
  },

  // Observar mudanças de autenticação
  onAuthStateChange(callback: (user: User | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null);
    });
    return subscription;
  },

  // Resetar senha
  async resetarSenha(email: string) {
    // Validação de entrada
    if (!validateEmail(email)) {
      throw new Error('E-mail inválido')
    }

    // Usar uma URL de redirecionamento segura e predefinida
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const redirectTo = `${baseUrl}/auth/reset-password`

    const { data, error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
      redirectTo
    })
    
    if (error) throw error
    return data
  }
} 