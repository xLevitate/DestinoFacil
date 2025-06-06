import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatarPopulacao(populacao: number): string {
  if (populacao >= 1000000) {
    return `${(populacao / 1000000).toFixed(1)}M habitantes`;
  } else if (populacao >= 1000) {
    return `${(populacao / 1000).toFixed(0)}K habitantes`;
  }
  return `${populacao} habitantes`;
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

export function obterUrlGoogleFlights(origem: string, destino: string): string {
  const baseUrl = 'https://www.google.com/flights';
  const params = new URLSearchParams({
    'hl': 'pt-BR',
    'curr': 'BRL',
    'f': '0',
    'tfs': `f:${origem}.t:${destino}`
  });
  
  return `${baseUrl}?${params.toString()}`;
} 