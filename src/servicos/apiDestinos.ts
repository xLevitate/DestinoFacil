import axios from 'axios';
import { InfoDestino, ImagemCidade, InfoPais, FiltrosDestino, ResultadoPaginado, ParametrosPaginacao, PaisLocal, CidadeLocal } from '../tipos';
import { servicoDadosLocais } from './dadosLocais';
import { servicoImagensLocais } from './imagensLocais';

// URLs das APIs (mantendo Pexels como opção premium)
const URL_PEXELS = 'https://api.pexels.com/v1';

// Chaves de API (opcionais agora)
const CHAVE_PEXELS = process.env.NEXT_PUBLIC_PEXELS_API_KEY;

// Configuração do cliente HTTP para Pexels (opcional)
const apiPexels = axios.create({
  baseURL: URL_PEXELS,
  headers: { 
    Authorization: CHAVE_PEXELS,
    'User-Agent': 'DestinoFacil/1.0'
  }
});

// Sistema de cache simples
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();

  set<T>(key: string, data: T, expiresInMinutes: number = 60): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn: expiresInMinutes * 60 * 1000
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.expiresIn) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  // Método para limpar cache de destinos (útil para debugging)
  clearDestinationCache(): void {
    for (const key of this.cache.keys()) {
      if (key.includes('destino') || key.includes('imagens')) {
        this.cache.delete(key);
      }
    }
  }
}

const cache = new CacheManager();

// Funções auxiliares para estimativas
const estimarPreco = (regiao: string, pais: string): 'baixo' | 'medio' | 'alto' => {
  const regioesCostosas = ['Western Europe', 'Northern Europe', 'Northern America', 'Oceania'];
  const paisesCostosos = ['United States', 'Canada', 'Switzerland', 'Norway', 'Denmark', 'Iceland', 'Luxembourg', 'Japan', 'Australia', 'New Zealand'];
  const regioesBaratas = ['Southern Asia', 'South-Eastern Asia', 'Eastern Africa', 'Western Africa', 'South America'];
  const paisesBaratos = ['India', 'Thailand', 'Vietnam', 'Cambodia', 'Myanmar', 'Bangladesh', 'Nepal', 'Laos'];
  
  if (paisesCostosos.includes(pais) || regioesCostosas.some(r => regiao.includes(r))) {
    return 'alto';
  }
  
  if (paisesBaratos.includes(pais) || regioesBaratas.some(r => regiao.includes(r))) {
    return 'baixo';
  }
  
  return 'medio';
};

const estimarClima = (latitude: number): 'frio' | 'temperado' | 'quente' => {
  const latAbs = Math.abs(latitude);
  
  if (latAbs > 60) return 'frio';
  if (latAbs > 35) return 'temperado';
  return 'quente';
};

// Converter dados locais para InfoPais
const converterParaInfoPais = (paisLocal: PaisLocal): InfoPais => {
  return {
    nome: paisLocal.translations['pt-BR'] || paisLocal.name,
    nomeOficial: paisLocal.name,
    capital: paisLocal.capital,
    regiao: paisLocal.region,
    subregiao: paisLocal.subregion,
    populacao: 0, // Não disponível nos dados locais
    moedas: paisLocal.currency_name ? [{ name: paisLocal.currency_name, symbol: paisLocal.currency_symbol }] : [],
    idiomas: [], // Pode ser expandido se necessário
    bandeira: servicoImagensLocais.obterBandeiraPais(paisLocal.name, paisLocal.iso2)
  };
};

// Estimar população baseada no tipo de cidade
const estimarPopulacao = (nomeCidade: string, pais: string): number => {
  // Capitais e cidades conhecidas
  const cidadesGrandes: { [key: string]: number } = {
    'tokyo': 37400000,
    'delhi': 28500000,
    'shanghai': 25600000,
    'são paulo': 21650000,
    'mexico city': 21600000,
    'mumbai': 20400000,
    'beijing': 20400000,
    'osaka': 19300000,
    'cairo': 18800000,
    'new york': 18800000,
    'dhaka': 18600000,
    'karachi': 15400000,
    'buenos aires': 14900000,
    'kolkata': 14700000,
    'istanbul': 14400000,
    'chongqing': 14300000,
    'lagos': 13900000,
    'manila': 13500000,
    'rio de janeiro': 13300000,
    'guangzhou': 12700000,
    'los angeles': 12400000,
    'moscow': 12200000,
    'kinshasa': 11900000,
    'tianjin': 11600000,
    'paris': 10900000,
    'shenzhen': 10800000,
    'jakarta': 10600000,
    'london': 9500000,
    'lima': 9700000,
    'seoul': 9700000,
    'bogotá': 9600000,
    'bangkok': 9300000,
    'hyderabad': 9200000,
    'tehran': 8900000,
    'nanjing': 8200000,
    'chicago': 8200000,
    'wuhan': 8000000,
    'ho chi minh city': 8200000,
    'luanda': 7800000,
    'ahmedabad': 7700000,
    'kuala lumpur': 7600000,
    'xi\'an': 7400000,
    'hong kong': 7400000,
    'dongguan': 7200000,
    'hangzhou': 7000000,
    'foshan': 7000000,
    'shenyang': 6900000,
    'riyadh': 6900000,
    'baghdad': 6800000,
    'santiago': 6700000,
    'surat': 6600000,
    'madrid': 6600000,
    'suzhou': 6300000,
    'pune': 6300000,
    'harbin': 6100000,
    'houston': 6000000,
    'dallas': 5900000,
    'toronto': 5900000,
    'dar es salaam': 5900000,
    'miami': 5800000,
    'belo horizonte': 5800000,
    'singapore': 5700000,
    'philadelphia': 5700000,
    'atlanta': 5600000,
    'fukuoka': 5500000,
    'khartoum': 5400000,
    'barcelona': 5400000,
    'johannesburg': 5400000,
    'saint petersburg': 5400000,
    'qingdao': 5300000,
    'dalian': 5300000,
    'washington': 5200000,
    'yangon': 5200000,
    'alexandria': 5100000,
    'jinan': 5100000,
    'guadalajara': 5000000
  };

  const cidadeKey = nomeCidade.toLowerCase();
  if (cidadesGrandes[cidadeKey]) {
    return cidadesGrandes[cidadeKey];
  }

  // Estimativas baseadas no país
  const populacoesPadrao: { [key: string]: number } = {
    'China': 2000000,
    'India': 1500000,
    'United States': 800000,
    'Brazil': 600000,
    'Russia': 500000,
    'Germany': 400000,
    'Japan': 400000,
    'United Kingdom': 300000,
    'France': 250000,
    'Italy': 200000,
    'Spain': 200000,
    'South Korea': 350000,
    'Thailand': 200000,
    'Vietnam': 300000,
    'Indonesia': 400000,
    'Mexico': 400000,
    'Turkey': 300000,
    'Iran': 250000,
    'Nigeria': 600000,
    'Egypt': 400000,
    'South Africa': 200000
  };

  return populacoesPadrao[pais] || 150000;
};

// Serviços
export const servicoImagens = {
  // Método principal: Pexels primeiro, depois sistema local + placeholders
  async buscarImagensCidade(nomeCidade: string): Promise<ImagemCidade[]> {
    const cacheKey = `imagens_${nomeCidade}`;
    const cached = cache.get<ImagemCidade[]>(cacheKey);
    if (cached) return cached;

    try {
      // 1º: Tentar Pexels (se disponível)
      if (CHAVE_PEXELS) {
        try {
          const imagensPexels = await this.buscarImagensPexels(nomeCidade);
          if (imagensPexels.length > 0) {
            cache.set(cacheKey, imagensPexels, 1440); // Cache por 24h
            return imagensPexels;
          }
        } catch (error) {
          console.warn('Pexels indisponível, tentando sistema local:', error);
        }
      }

      // 2º: Fallback para sistema local (sempre funciona)
      const imagensLocais = await servicoImagensLocais.obterImagensDestino(nomeCidade);
      cache.set(cacheKey, imagensLocais, 60); // Cache por 1h
      return imagensLocais;

    } catch (erro) {
      console.error('Erro ao buscar imagens:', erro);
      // 3º: Último fallback - placeholder como ícone
      return [servicoImagensLocais.obterPlaceholderImagem(nomeCidade)];
    }
  },

  // Método para buscar no Pexels (prioritário)
  async buscarImagensPexels(nomeCidade: string): Promise<ImagemCidade[]> {
    const resposta = await apiPexels.get('/search', {
      params: {
        query: `${nomeCidade} city travel destination`,
        per_page: 6,
        orientation: 'landscape'
      }
    });

    return resposta.data.photos.map((foto: any) => ({
      id: foto.id,
      url: foto.src.large,
      miniatura: foto.src.medium,
      alt: `Foto de ${nomeCidade}`,
      fotografo: {
        nome: foto.photographer,
        perfil: foto.photographer_url
      }
    }));
  }
};

export const servicoDestinos = {
  // Limpar cache (útil para resolver problemas)
  limparCache() {
    cache.clear();
  },

  async obterInfoDestino(nomeCidade: string): Promise<InfoDestino | null> {
    const cacheKey = `destino_${nomeCidade}_${Date.now()}`.substring(0, 50); // Cache único
    const cached = cache.get<InfoDestino>(cacheKey);
    if (cached) return cached;

    try {
      // Buscar cidade nos dados locais
      const cidades = await servicoDadosLocais.buscarCidades(nomeCidade, 1);
      
      if (cidades.length === 0) {
        return null;
      }

      const cidade = cidades[0];
      
      // Buscar país nos dados locais
      const pais = await servicoDadosLocais.buscarPaisPorCodigo(cidade.country_code);
      
      // Buscar imagens usando sistema híbrido (Pexels primeiro)
      const imagens = await servicoImagens.buscarImagensCidade(nomeCidade);
      
      const populacao = estimarPopulacao(cidade.name, cidade.country_name);
      const latitude = parseFloat(cidade.latitude);
      const longitude = parseFloat(cidade.longitude);

      const destino: InfoDestino = {
        id: cidade.id, // Usar ID único da cidade
        nome: cidade.name,
        pais: cidade.country_name,
        regiao: pais?.region || 'Unknown',
        populacao,
        latitude,
        longitude,
        imagens,
        infoPais: pais ? converterParaInfoPais(pais) : null,
        preco: estimarPreco(pais?.region || '', cidade.country_name),
        clima: estimarClima(latitude)
      };

      cache.set(cacheKey, destino, 30); // Cache menor para evitar problemas
      return destino;
    } catch (erro) {
      console.error('Erro ao obter informações do destino:', erro);
      return null;
    }
  },

  async obterDestinosPaginados(parametros: ParametrosPaginacao): Promise<ResultadoPaginado<InfoDestino>> {
    const { pagina, limite, filtros, termoBusca } = parametros;
    const cacheKey = `destinos_v4_pag_${pagina}_${limite}_${JSON.stringify(filtros)}_${termoBusca || 'todos'}`;

    const cached = cache.get<ResultadoPaginado<InfoDestino>>(cacheKey);
    if (cached) return cached;

    try {
      servicoDadosLocais.limparCache();
      
      const limiteBusca = termoBusca ? 1000 : 500;
      const cidadesEncontradas = await servicoDadosLocais.buscarDestinos(termoBusca, limiteBusca);
      
      console.log(`🔍 Encontradas ${cidadesEncontradas.length} cidades candidatas para termo: "${termoBusca || 'todos'}"`);
      
      const destinosCompletos: InfoDestino[] = [];
      const loteSize = 25;
      
      for (let i = 0; i < cidadesEncontradas.length; i += loteSize) {
        const loteAtual = cidadesEncontradas.slice(i, i + loteSize);
        const destinosPromises = loteAtual.map(async (cidade) => {
          try {
            const pais = await servicoDadosLocais.buscarPaisPorCodigo(cidade.country_code);
            if (!pais) return null;

            const populacao = estimarPopulacao(cidade.name, cidade.country_name);
            const latitude = parseFloat(cidade.latitude);

            return {
              id: cidade.id,
              nome: cidade.name,
              pais: cidade.country_name,
              regiao: pais.region,
              populacao,
              latitude,
              longitude: parseFloat(cidade.longitude),
              imagens: [],
              infoPais: converterParaInfoPais(pais),
              preco: estimarPreco(pais.region, cidade.country_name),
              clima: estimarClima(latitude)
            } as InfoDestino;
          } catch (error) {
            console.error(`Erro ao processar ${cidade.name}:`, error);
            return null;
          }
        });
        
        const resultadosLote = await Promise.all(destinosPromises);
        destinosCompletos.push(...resultadosLote.filter(Boolean) as InfoDestino[]);
      }

      console.log(`✅ Processados ${destinosCompletos.length} destinos únicos`);

      let destinosFiltrados = destinosCompletos;
      if (filtros) {
        destinosFiltrados = this.aplicarFiltros(destinosFiltrados, filtros);
      }
      if (filtros?.ordenarPor) {
        destinosFiltrados = this.ordenarDestinos(destinosFiltrados, filtros.ordenarPor);
      }

      const inicioIndice = (pagina - 1) * limite;
      const destinosPaginados = destinosFiltrados.slice(inicioIndice, inicioIndice + limite);
      const totalItens = destinosFiltrados.length;
      const totalPaginas = Math.ceil(totalItens / limite);

      const resultado: ResultadoPaginado<InfoDestino> = {
        dados: destinosPaginados,
        paginaAtual: pagina,
        totalPaginas,
        totalItens,
        itensPorPagina: limite
      };

      console.log(`📊 Resultado final: ${destinosPaginados.length} destinos na página ${pagina} de ${totalPaginas} (Total: ${totalItens})`);

      cache.set(cacheKey, resultado, 5);
      return resultado;
    } catch (erro) {
      console.error('Erro ao obter destinos paginados:', erro);
      return {
        dados: [],
        paginaAtual: pagina,
        totalPaginas: 0,
        totalItens: 0,
        itensPorPagina: limite
      };
    }
  },

  aplicarFiltros(destinos: InfoDestino[], filtros: FiltrosDestino): InfoDestino[] {
    return destinos.filter(destino => {
      if (filtros.regiao && !destino.regiao?.toLowerCase().includes(filtros.regiao.toLowerCase())) {
        return false;
      }

      if (filtros.populacaoMin && destino.populacao < filtros.populacaoMin) {
        return false;
      }

      if (filtros.populacaoMax && destino.populacao > filtros.populacaoMax) {
        return false;
      }

      if (filtros.preco && destino.preco !== filtros.preco) {
        return false;
      }

      if (filtros.clima && destino.clima !== filtros.clima) {
        return false;
      }

      return true;
    });
  },

  ordenarDestinos(destinos: InfoDestino[], criterio: 'nome' | 'populacao' | 'popularidade'): InfoDestino[] {
    const destinosOrdenados = [...destinos];

    switch (criterio) {
      case 'nome':
        return destinosOrdenados.sort((a, b) => a.nome.localeCompare(b.nome));
      case 'populacao':
        return destinosOrdenados.sort((a, b) => b.populacao - a.populacao);
      case 'popularidade':
        // Baseado na população e região
        return destinosOrdenados.sort((a, b) => {
          const scoreA = a.populacao + (a.regiao === 'Europe' ? 1000000 : 0);
          const scoreB = b.populacao + (b.regiao === 'Europe' ? 1000000 : 0);
          return scoreB - scoreA;
        });
      default:
        return destinosOrdenados;
    }
  },

  async obterDestinosPopulares(): Promise<string[]> {
    const cidadesPopulares = await servicoDadosLocais.buscarDestinos(undefined, 10);
    return cidadesPopulares.map(cidade => cidade.name);
  }
};

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