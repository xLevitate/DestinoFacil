import { InfoDestino, CidadeLocal, PaisLocal } from '../tipos';

// Mapeamento de regiões em inglês para português
const mapeamentoRegioes: { [key: string]: string } = {
  'Europe': 'Europa',
  'Asia': 'Ásia', 
  'Africa': 'África',
  'North America': 'América do Norte',
  'South America': 'América do Sul',
  'Central America': 'América Central',
  'Oceania': 'Oceania',
  'Antarctica': 'Antártida',
  'Western Europe': 'Europa Ocidental',
  'Eastern Europe': 'Europa Oriental',
  'Southern Europe': 'Europa Meridional',
  'Northern Europe': 'Europa Setentrional',
  'Western Asia': 'Ásia Ocidental',
  'Eastern Asia': 'Ásia Oriental',
  'Southern Asia': 'Ásia Meridional',
  'South-Eastern Asia': 'Sudeste Asiático',
  'Central Asia': 'Ásia Central',
  'Northern Africa': 'África Setentrional',
  'Western Africa': 'África Ocidental',
  'Eastern Africa': 'África Oriental',
  'Southern Africa': 'África Meridional',
  'Northern America': 'América do Norte',
  'Caribbean': 'Caribe',
  'Melanesia': 'Melanésia',
  'Micronesia': 'Micronésia',
  'Polynesia': 'Polinésia',
  'Australia and New Zealand': 'Austrália e Nova Zelândia'
};

// Estimativas de população baseadas em dados conhecidos de cidades importantes
const populacaoEstimada: { [key: string]: number } = {
  // Principais cidades mundiais
  'Tokyo': 37435191,
  'Delhi': 29399141,
  'Shanghai': 26317104,
  'São Paulo': 22043028,
  'Mexico City': 21671908,
  'Cairo': 20484965,
  'Mumbai': 20185064,
  'Beijing': 20035455,
  'Dhaka': 19578421,
  'Osaka': 19222665,
  'New York': 18823000,
  'Karachi': 15400000,
  'Buenos Aires': 15180000,
  'Chongqing': 15003000,
  'Istanbul': 15029231,
  'Kolkata': 14850000,
  'Manila': 13482462,
  'Lagos': 13463000,
  'Rio de Janeiro': 13293000,
  'Tianjin': 13215000,
  
  // Capitais e cidades importantes da Europa
  'London': 9648110,
  'Paris': 2161000,
  'Berlin': 3748148,
  'Madrid': 3223334,
  'Rome': 2872800,
  'Kiev': 2952301,
  'Bucharest': 2155240,
  'Hamburg': 1899160,
  'Warsaw': 1790658,
  'Vienna': 1911191,
  'Barcelona': 1620343,
  'Munich': 1484226,
  'Milan': 1378689,
  'Prague': 1318982,
  'Sofia': 1242568,
  'Budapest': 1759407,
  'Stockholm': 975551,
  'Amsterdam': 873555,
  'Lisbon': 544851,
  'Dublin': 554554,
  'Brussels': 1208542,
  'Copenhagen': 602481,
  'Helsinki': 648042,
  'Oslo': 697010,
  'Zurich': 415367,
  'Geneva': 201818,
  'Athens': 664046,
  
  // Outras cidades importantes
  'Toronto': 2930000,
  'Montreal': 1704694,
  'Vancouver': 631486,
  'Sydney': 5312163,
  'Melbourne': 5078193,
  'Perth': 2059484,
  'Auckland': 1695200,
  'Tel Aviv': 460613,
  'Dubai': 3331420,
  'Singapore': 5850342,
  'Hong Kong': 7482500,
  'Kuala Lumpur': 1768000,
  'Bangkok': 10156000,
  'Jakarta': 10562088,
  'Seoul': 9720846,
  'Bangalore': 12326532,
  'Chennai': 10971108,
  'Hyderabad': 10004000,
  'Pune': 7541946,
  'Ahmedabad': 7700000,
  'Surat': 6081322,
  'Jaipur': 3073350,
  'Lucknow': 3245000,
  'Kanpur': 3162000,
  'Nagpur': 2497777,
  'Indore': 2434000,
  'Thane': 2078281,
  'Bhopal': 2368145,
  'Visakhapatnam': 2358412,
  'Pimpri': 1729359,
  'Patna': 2049156
};

// Estimativas baseadas no tamanho e importância do país/região
const estimarPopulacaoPorContexto = (cidade: CidadeLocal, pais: PaisLocal): number => {
  const nomeCidade = cidade.name;
  
  // Verificar se temos dados específicos
  if (populacaoEstimada[nomeCidade]) {
    return populacaoEstimada[nomeCidade];
  }
  
  // Estimativas baseadas na região e se é capital
  const ehCapital = pais.capital.toLowerCase() === nomeCidade.toLowerCase();
  
  if (ehCapital) {
    // Capitais tendem a ter populações maiores
    switch (pais.region) {
      case 'Western Europe':
      case 'Northern America':
        return Math.random() * 3000000 + 1000000; // 1M - 4M
      case 'Eastern Asia':
      case 'Southern Asia':
        return Math.random() * 15000000 + 5000000; // 5M - 20M
      case 'South America':
      case 'Eastern Europe':
        return Math.random() * 8000000 + 2000000; // 2M - 10M
      default:
        return Math.random() * 2000000 + 500000; // 500K - 2.5M
    }
  } else {
    // Cidades não-capitais
    switch (pais.region) {
      case 'Western Europe':
      case 'Northern America':
        return Math.random() * 1000000 + 100000; // 100K - 1.1M
      case 'Eastern Asia':
      case 'Southern Asia':
        return Math.random() * 5000000 + 500000; // 500K - 5.5M
      default:
        return Math.random() * 500000 + 50000; // 50K - 550K
    }
  }
};

// Traduzir região para português
export const traduzirRegiao = (regiaoIngles: string): string => {
  return mapeamentoRegioes[regiaoIngles] || regiaoIngles;
};

// Obter estimativa de população
export const obterPopulacao = (cidade: CidadeLocal, pais: PaisLocal): number => {
  const nomeCidade = cidade.name;
  
  // Se temos dados específicos, usar esses
  if (populacaoEstimada[nomeCidade]) {
    return populacaoEstimada[nomeCidade];
  }
  
  // Senão, estimar baseado no contexto
  return Math.floor(estimarPopulacaoPorContexto(cidade, pais));
};

// Buscar região traduzida que corresponda ao termo de busca
export const buscarRegiaoPorTermo = (termo: string): string[] => {
  const termoLower = termo.toLowerCase().trim();
  const regioesPossíveis: string[] = [];
  
  // Buscar correspondências diretas
  Object.entries(mapeamentoRegioes).forEach(([ingles, portugues]) => {
    if (portugues.toLowerCase().includes(termoLower) || 
        ingles.toLowerCase().includes(termoLower)) {
      regioesPossíveis.push(ingles);
    }
  });
  
  // Buscar termos relacionados
  const termosRelacionados: { [key: string]: string[] } = {
    'europa': ['Europe', 'Western Europe', 'Eastern Europe', 'Southern Europe', 'Northern Europe'],
    'europe': ['Europe', 'Western Europe', 'Eastern Europe', 'Southern Europe', 'Northern Europe'],
    'asia': ['Asia', 'Western Asia', 'Eastern Asia', 'Southern Asia', 'South-Eastern Asia', 'Central Asia'],
    'ásia': ['Asia', 'Western Asia', 'Eastern Asia', 'Southern Asia', 'South-Eastern Asia', 'Central Asia'],
    'africa': ['Africa', 'Northern Africa', 'Western Africa', 'Eastern Africa', 'Southern Africa'],
    'áfrica': ['Africa', 'Northern Africa', 'Western Africa', 'Eastern Africa', 'Southern Africa'],
    'america': ['North America', 'South America', 'Central America', 'Northern America'],
    'américa': ['North America', 'South America', 'Central America', 'Northern America'],
  };
  
  if (termosRelacionados[termoLower]) {
    regioesPossíveis.push(...termosRelacionados[termoLower]);
  }
  
  return [...new Set(regioesPossíveis)]; // Remover duplicatas
};

// Cache para países enriquecidos
const cacheEnriquecimento = new Map<string, any>();

export const enriquecerDestino = (cidade: CidadeLocal, pais: PaisLocal): InfoDestino => {
  const cacheKey = `${cidade.id}-${pais.id}`;
  
  if (cacheEnriquecimento.has(cacheKey)) {
    return cacheEnriquecimento.get(cacheKey);
  }
  
  const latitude = parseFloat(cidade.latitude) || 0;
  const longitude = parseFloat(cidade.longitude) || 0;
  
  // Estimar preço baseado na região
  const estimarPreco = (regiao: string): 'baixo' | 'medio' | 'alto' => {
    if (['Western Europe', 'Northern America', 'Oceania', 'Australia and New Zealand'].includes(regiao)) return 'alto';
    if (['South-Eastern Asia', 'South America', 'Eastern Europe', 'Central America'].includes(regiao)) return 'baixo';
    return 'medio';
  };
  
  // Estimar clima baseado na latitude
  const estimarClima = (lat: number): 'frio' | 'temperado' | 'quente' => {
    const latAbs = Math.abs(lat);
    if (latAbs > 50) return 'frio';
    if (latAbs > 30) return 'temperado';
    return 'quente';
  };
  
  const destinoEnriquecido: InfoDestino = {
    id: cidade.id,
    nome: cidade.name,
    pais: pais.name,
    regiao: traduzirRegiao(pais.region), // TRADUZIDO PARA PORTUGUÊS
    populacao: obterPopulacao(cidade, pais), // POPULAÇÃO ESTIMADA
    latitude,
    longitude,
    infoPais: {
      nome: pais.translations?.['pt-BR'] || pais.name,
      nomeOficial: pais.name,
      capital: pais.capital,
      regiao: pais.region,
      subregiao: pais.subregion,
      populacao: 0,
      moedas: [{ name: pais.currency_name, symbol: pais.currency_symbol }],
      idiomas: [],
      bandeira: `https://flagcdn.com/w320/${pais.iso2.toLowerCase()}.png`,
    },
    isFavorito: false,
    preco: estimarPreco(pais.region),
    clima: estimarClima(latitude),
    atividades: [],
    continente: traduzirRegiao(pais.region), // TRADUZIDO PARA PORTUGUÊS
  };
  
  cacheEnriquecimento.set(cacheKey, destinoEnriquecido);
  return destinoEnriquecido;
}; 