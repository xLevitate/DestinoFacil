export interface UsuarioMinimo {
  id: string;
  nome: string;
}

export interface Usuario extends UsuarioMinimo {
  email: string;
  criado_em: Date;
  favoritos?: string[];
  avatar?: string;
}

export interface Avaliacao {
  usuario: UsuarioMinimo;
  comentario: string;
  nota: number;
  data_publicacao?: Date;
}

export interface Destino {
  _id: string;
  nome: string;
  descricao: string;
  localizacao: string;
  imagens: string[];
  categorias: string[];
  precoEstimado: number;
  avaliacoes: Avaliacao[];
  pontos_de_interesse?: PontoDeInteresse[];
  clima?: InfoClima;
  melhor_epoca?: string;
  coordenadas?: Coordenadas;
}

export interface ParametrosBusca {
  localizacao?: string;
  categorias?: string[];
  precoMaximo?: number;
  dataChegada?: Date;
  dataPartida?: Date;
  qtdPessoas?: number;
}

export interface EstadoAutenticacao {
  token: string | null;
  estaAutenticado: boolean;
  carregando: boolean;
  usuario: Usuario | null;
  erro: string | null;
}

export interface CredenciaisLogin {
  email: string;
  senha: string;
}

export interface DadosRegistro {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

export interface RespostaImagemCidade {
  id: string | number;
  url: string;
  miniatura: string;
  alt: string;
  fotografo: {
    nome: string;
    perfil: string;
  };
}

export interface PontoDeInteresse {
  nome: string;
  descricao: string;
  categoria: string;
  endereco?: string;
  imagem?: string;
  preco?: number;
  avaliacao?: number;
}

export interface InfoClima {
  temperatura_media: number;
  temporada_atual: string;
  previsao_proximos_dias?: PrevisaoDia[];
}

export interface PrevisaoDia {
  data: Date;
  temperatura_min: number;
  temperatura_max: number;
  condicao: string;
  icone: string;
}

export interface Coordenadas {
  latitude: number;
  longitude: number;
}

export interface ParametrosPaginacao {
  pagina: number;
  por_pagina: number;
  total_paginas?: number;
  total_itens?: number;
} 