// Utilitários e configurações de segurança

// Funções auxiliares de validação de entrada
export const validateInput = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 320; // Limite RFC 5321
  },

  password: (password: string): boolean => {
    return password.length >= 8 && password.length <= 128;
  },

  searchTerm: (term: string): string => {
    if (!term) return '';
    return term.trim().slice(0, 100).replace(/[<>'"&]/g, '');
  },

  text: (text: string, maxLength: number = 255): string => {
    return text.trim().slice(0, maxLength).replace(/[<>'"&]/g, '');
  },

  url: (url: string): boolean => {
    try {
      const parsedUrl = new URL(url);
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  },

  coordinates: {
    latitude: (lat: string | number): number => {
      const parsed = typeof lat === 'string' ? parseFloat(lat) : lat;
      if (isNaN(parsed) || parsed < -90 || parsed > 90) {
        return 0; // Padrão para o equador se inválido
      }
      return parsed;
    },

    longitude: (lng: string | number): number => {
      const parsed = typeof lng === 'string' ? parseFloat(lng) : lng;
      if (isNaN(parsed) || parsed < -180 || parsed > 180) {
        return 0; // Padrão para o meridiano principal se inválido
      }
      return parsed;
    }
  }
};

// Auxiliar de limitação de taxa (implementação simples em memória)
export class RateLimiter {
  private requests = new Map<string, number[]>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remover requisições antigas fora da janela
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }

  reset(identifier?: string) {
    if (identifier) {
      this.requests.delete(identifier);
    } else {
      this.requests.clear();
    }
  }
}

// Cabeçalhos de Política de Segurança de Conteúdo
export const cspConfig = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'connect-src': ["'self'", 'https://*.supabase.co', 'https://api.openweathermap.org', 'https://restcountries.com'],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'block-all-mixed-content': []
};

// Gerar string de cabeçalho CSP
export const generateCSP = (): string => {
  return Object.entries(cspConfig)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
};

// Configuração de cabeçalhos de segurança
export const securityHeaders = {
  'Content-Security-Policy': generateCSP(),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

// Validação de ambiente
export const validateEnvironment = (): void => {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Variáveis de ambiente obrigatórias não encontradas: ${missing.join(', ')}`);
  }

  // Validar formato da URL do Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && !validateInput.url(supabaseUrl)) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL deve ser uma URL válida');
  }
};

// Abertura segura de URL (previne ataques window.opener)
export const safeOpenUrl = (url: string, target: string = '_blank'): void => {
  if (!validateInput.url(url)) {
    console.error('URL inválida:', url);
    return;
  }

  const newWindow = window.open(url, target, 'noopener,noreferrer');
  if (newWindow) {
    newWindow.opener = null;
  }
};

// Auxiliar de debounce para entradas do usuário
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}; 