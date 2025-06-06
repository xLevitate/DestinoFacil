import { InfoDestino, InfoPais, FiltrosDestino, ResultadoPaginado, ParametrosPaginacao, PaisLocal, CidadeLocal } from '../tipos';
import { servicoDadosLocais } from './dadosLocais';
import { enriquecerDestino, buscarRegiaoPorTermo, traduzirRegiao } from './enriquecimentoDados';

class CacheManager {
  private cache = new Map<string, any>();
  private readonly maxSize = 1000; // Limitar tamanho do cache
  private readonly defaultTTL = 30 * 60 * 1000; // 30 minutos

  set<T>(key: string, data: T, ttl: number = this.defaultTTL) { 
    // Remove itens mais antigos se o cache estiver cheio
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, { data, expire: Date.now() + ttl }); 
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item || Date.now() > item.expire) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

const cache = new CacheManager();

// Funções auxiliares para validação de entrada
const sanitizeSearchTerm = (term: string | undefined): string => {
  if (!term) return '';
  return term.trim().slice(0, 100).replace(/[<>'"&]/g, ''); // Proteção básica contra XSS
};

const validateLatitude = (lat: string): number => {
  const parsed = parseFloat(lat);
  if (isNaN(parsed) || parsed < -90 || parsed > 90) {
    return 0; // Padrão para o equador se inválido
  }
  return parsed;
};

const validateLongitude = (lng: string): number => {
  const parsed = parseFloat(lng);
  if (isNaN(parsed) || parsed < -180 || parsed > 180) {
    return 0; // Padrão para o meridiano principal se inválido
  }
  return parsed;
};

// Função para calcular popularidade baseada em vários fatores
const calcularPopularidade = (destino: InfoDestino): number => {
  let score = 0;
  
  // Pontuação baseada na região (destinos mais conhecidos)
  const regiaoScores: { [key: string]: number } = {
    'Europa Ocidental': 100,
    'Europa Meridional': 95,
    'América do Norte': 90,
    'Ásia Oriental': 85,
    'Sudeste Asiático': 80,
    'América Central': 75,
    'América do Sul': 70,
    'África Setentrional': 65,
    'Europa Oriental': 60,
    'África Meridional': 55,
    'Ásia Ocidental': 50,
    'Oceania': 45,
    'Ásia Central': 40,
    'África Oriental': 35,
    'África Ocidental': 30,
  };
  
  score += regiaoScores[destino.regiao] || 25;
  
  // Pontuação baseada no preço (destinos mais caros tendem a ser mais turísticos)
  switch (destino.preco) {
    case 'alto': score += 30; break;
    case 'medio': score += 20; break;
    case 'baixo': score += 10; break;
  }
  
  // Pontuação baseada no clima (temperado e quente são mais populares)
  switch (destino.clima) {
    case 'quente': score += 25; break;
    case 'temperado': score += 20; break;
    case 'frio': score += 10; break;
  }
  
  // Bonificação para capitais e cidades conhecidas
  const cidadesPopulares = [
    'Paris', 'London', 'New York', 'Tokyo', 'Rome', 'Barcelona', 'Amsterdam', 
    'Berlin', 'Prague', 'Vienna', 'Budapest', 'Lisbon', 'Madrid', 'Athens',
    'Istanbul', 'Moscow', 'Beijing', 'Seoul', 'Bangkok', 'Singapore',
    'Dubai', 'Cairo', 'Sydney', 'Melbourne', 'Los Angeles', 'San Francisco',
    'Miami', 'Las Vegas', 'Rio de Janeiro', 'São Paulo', 'Buenos Aires',
    'Lima', 'Santiago', 'Mexico City', 'Havana', 'Cancun', 'Mumbai', 'Delhi'
  ];
  
  if (cidadesPopulares.some(cidade => destino.nome.toLowerCase().includes(cidade.toLowerCase()))) {
    score += 50;
  }
  
  // Bonificação baseada na população (cidades maiores são mais populares)
  if (destino.populacao > 10000000) score += 40;
  else if (destino.populacao > 5000000) score += 30;
  else if (destino.populacao > 1000000) score += 20;
  else if (destino.populacao > 500000) score += 10;
  
  return score;
};

// Funções auxiliares simplificadas
const estimarPreco = (regiao: string): 'baixo' | 'medio' | 'alto' => {
  if (['Western Europe', 'Northern America', 'Oceania'].includes(regiao)) return 'alto';
  if (['South-Eastern Asia', 'South America', 'Eastern Europe'].includes(regiao)) return 'baixo';
  return 'medio';
};

const estimarClima = (latitude: number): 'frio' | 'temperado' | 'quente' => {
  const latAbs = Math.abs(latitude);
  if (latAbs > 50) return 'frio';
  if (latAbs > 30) return 'temperado';
  return 'quente';
};

const converterParaInfoPais = (paisLocal: PaisLocal): InfoPais => ({
  nome: paisLocal.translations['pt-BR'] || paisLocal.name,
  nomeOficial: paisLocal.name,
  capital: paisLocal.capital,
  regiao: paisLocal.region,
  subregiao: paisLocal.subregion,
  populacao: 0,
  moedas: [{ name: paisLocal.currency_name, symbol: paisLocal.currency_symbol }],
  idiomas: [],
  bandeira: `https://flagcdn.com/w320/${paisLocal.iso2.toLowerCase()}.png`,
});

const servicoDestinos = {
  async obterInfoDestino(cidade: CidadeLocal): Promise<InfoDestino | null> {
    const cacheKey = `destino_enriquecido_${cidade.id}`;
    const cached = cache.get<InfoDestino>(cacheKey);
    if (cached) return cached;

    try {
      const pais = await servicoDadosLocais.buscarPaisPorId(cidade.country_id);
      if (!pais) return null;

      // Usar o novo sistema de enriquecimento
      const infoDestino = enriquecerDestino(cidade, pais);

      cache.set(cacheKey, infoDestino, 30 * 60 * 1000); // Cache de 30 mins
      return infoDestino;
    } catch (error) {
      console.error(`Erro ao obter informações para ${cidade.name}:`, error);
      return null;
    }
  },

  async obterDestinosPaginados(params: ParametrosPaginacao): Promise<ResultadoPaginado<InfoDestino>> {
    const { pagina, limite, filtros, termoBusca } = params;
    
    // Validar parâmetros de paginação
    const paginaSegura = Math.max(1, Math.min(pagina, 1000)); // Limitar página máxima
    const limiteSeguro = Math.max(1, Math.min(limite, 100)); // Limitar itens máximos por página
    const termoSeguro = sanitizeSearchTerm(termoBusca);
    
    try {
      // Obter a lista de cidades candidatas
      const cidades = await servicoDadosLocais.buscarDestinos(termoSeguro);
      
      // Processar cidades em lotes para evitar sobrecarregar o sistema
      const batchSize = 50;
      const destinos: InfoDestino[] = [];
      
      for (let i = 0; i < cidades.length; i += batchSize) {
        const batch = cidades.slice(i, i + batchSize);
        const batchPromises = batch.map(c => this.obterInfoDestino(c));
        
        try {
          const batchResults = await Promise.allSettled(batchPromises);
          const validResults = batchResults
            .filter((result): result is PromiseFulfilledResult<InfoDestino> => 
              result.status === 'fulfilled' && result.value !== null
            )
            .map(result => result.value);
          
          destinos.push(...validResults);
        } catch (error) {
          console.error('Erro no lote de destinos:', error);
          // Continuar com o próximo lote em vez de falhar completamente
        }
      }

      // Aplicar filtros e ordenação
      let destinosFiltrados = destinos;
      if (filtros) {
        destinosFiltrados = this.aplicarFiltros(destinos, filtros);
        destinosFiltrados = this.ordenarDestinos(destinosFiltrados, filtros.ordenarPor || 'popularidade');
      }
      
      // Paginação
      const totalItens = destinosFiltrados.length;
      const totalPaginas = Math.ceil(totalItens / limiteSeguro);
      const dadosPaginados = destinosFiltrados.slice((paginaSegura - 1) * limiteSeguro, paginaSegura * limiteSeguro);

      return { 
        dados: dadosPaginados, 
        totalItens, 
        totalPaginas, 
        paginaAtual: paginaSegura 
      };
    } catch (error) {
      console.error('Erro ao obter destinos paginados:', error);
      return {
        dados: [],
        totalItens: 0,
        totalPaginas: 0,
        paginaAtual: 1
      };
    }
  },

  aplicarFiltros(destinos: InfoDestino[], filtros: FiltrosDestino): InfoDestino[] {
    return destinos.filter(d => {
      // Filtro por região - agora funciona com termos em português!
      if (filtros.regiao) {
        const termo = filtros.regiao.toLowerCase().trim();
        const regiaoDestino = d.regiao.toLowerCase();
        const paisDestino = d.pais.toLowerCase();
        
        // Buscar em região traduzida e nome do país
        if (!regiaoDestino.includes(termo) && !paisDestino.includes(termo)) {
          return false;
        }
      }
      
      // Filtro por preço
      if (filtros.preco && d.preco !== filtros.preco) return false;
      
      // Filtro por clima
      if (filtros.clima && d.clima !== filtros.clima) return false;
      
      // Filtro por população mínima
      if (filtros.populacaoMin && d.populacao < filtros.populacaoMin) return false;
      
      // Filtro por população máxima
      if (filtros.populacaoMax && d.populacao > filtros.populacaoMax) return false;
      
      // Filtro por atividades
      if (filtros.atividades?.length) {
        if (!filtros.atividades.every(a => d.atividades.includes(a))) return false;
      }
      
      return true;
    });
  },

  ordenarDestinos(destinos: InfoDestino[], criterio: 'nome' | 'populacao' | 'popularidade'): InfoDestino[] {
    switch (criterio) {
      case 'nome':
        return [...destinos].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      case 'populacao':
        return [...destinos].sort((a, b) => (b.populacao || 0) - (a.populacao || 0));
      case 'popularidade':
      default:
        // Usar função de cálculo de popularidade real
        return [...destinos].sort((a, b) => calcularPopularidade(b) - calcularPopularidade(a));
    }
  },
};

export function obterUrlGoogleFlights(origem: string, destino: string): string {
  // Limpar entradas para prevenir manipulação de URL
  const origemSegura = encodeURIComponent(origem.trim().slice(0, 50));
  const destinoSeguro = encodeURIComponent(destino.trim().slice(0, 50));
  
  if (!origemSegura || !destinoSeguro) {
    throw new Error('Origem e destino são obrigatórios');
  }

  const baseUrl = "https://www.google.com/flights";
  const dataPartida = new Date();
  dataPartida.setDate(dataPartida.getDate() + 30);
  const dataVolta = new Date(dataPartida);
  dataVolta.setDate(dataPartida.getDate() + 7);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const params = new URLSearchParams({ "hl": "pt-BR" });
  const trips = `${origemSegura}.${destinoSeguro}.${formatDate(dataPartida)}*${destinoSeguro}.${origemSegura}.${formatDate(dataVolta)}`;
  
  return `${baseUrl}?${params.toString()}#flt=${trips}`;
}

export { servicoDestinos }; 