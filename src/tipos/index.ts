export interface InfoPais {
  nome: string;
  nomeOficial: string;
  capital: string;
  regiao: string;
  subregiao: string;
  populacao: number;
  moedas: Array<{ name: string; symbol: string }>;
  idiomas: string[];
  bandeira: string;
}

export interface PaisLocal {
  id: number;
  name: string;
  iso3: string;
  iso2: string;
  phonecode: string;
  capital: string;
  currency: string;
  currency_name: string;
  currency_symbol: string;
  native: string;
  region: string;
  subregion: string;
  nationality: string;
  latitude: string;
  longitude: string;
  emoji: string;
  translations: {
    'pt-BR'?: string;
    pt?: string;
    [key: string]: string | undefined;
  };
  timezones: Array<{
    zoneName: string;
    gmtOffset: number;
    gmtOffsetName: string;
    abbreviation: string;
    tzName: string;
  }>;
}

export interface CidadeLocal {
  id: number;
  name: string;
  state_id: number;
  state_code: string;
  state_name: string;
  country_id: number;
  country_code: string;
  country_name: string;
  latitude: string;
  longitude: string;
  wikiDataId?: string;
}

export interface InfoDestino {
  id: number;
  nome: string;
  pais: string;
  regiao: string;
  populacao: number;
  latitude: number;
  longitude: number;
  infoPais: InfoPais | null;
  preco: 'baixo' | 'medio' | 'alto';
  clima: 'frio' | 'temperado' | 'quente';
  isFavorito?: boolean;
  continente: string;
  atividades: string[];
}

export interface Favorito {
  id: string;
  user_id: string;
  destino_id: string;
  destino_nome: string;
  destino_pais: string;
  destino_regiao: string;
  destino_populacao: number;
  destino_latitude: number;
  destino_longitude: number;
  created_at: string;
  updated_at: string;
}

export type Atividade = 'praia' | 'cidade' | 'montanha' | 'neve' | 'deserto' | 'rural';

export interface FiltrosDestino {
  regiao?: string;
  preco?: 'baixo' | 'medio' | 'alto';
  clima?: 'frio' | 'temperado' | 'quente';
  atividades?: Atividade[];
  populacaoMin?: number;
  populacaoMax?: number;
  ordenarPor?: 'nome' | 'populacao' | 'popularidade';
}

export interface ResultadoPaginado<T> {
  dados: T[];
  paginaAtual: number;
  totalPaginas: number;
  totalItens: number;
}

export interface ParametrosPaginacao {
  pagina: number;
  limite: number;
  filtros?: FiltrosDestino;
  termoBusca?: string;
} 