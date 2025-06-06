import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://exemplo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'exemplo-key'

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

// Funções de autenticação
export const authService = {
  // Registrar novo usuário
  async registrar(email: string, senha: string, nome: string) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Configuração do Supabase não encontrada. Configure as variáveis de ambiente.')
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          nome
        }
      }
    })
    
    if (error) throw error
    return data
  },

  // Fazer login
  async entrar(email: string, senha: string) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Configuração do Supabase não encontrada. Configure as variáveis de ambiente.')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
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
  async obterUsuario() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Resetar senha
  async resetarSenha(email: string) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Configuração do Supabase não encontrada. Configure as variáveis de ambiente.')
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    
    if (error) throw error
    return data
  }
} 