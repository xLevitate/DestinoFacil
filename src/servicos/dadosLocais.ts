import { PaisLocal, CidadeLocal } from '../tipos';

// Cache dos dados carregados
let paisesCache: PaisLocal[] | null = null;
let cidadesCache: CidadeLocal[] | null = null;

// Carregamento assíncrono dos dados
const carregarDados = async (): Promise<{ paises: PaisLocal[], cidades: CidadeLocal[] }> => {
  if (!paisesCache || !cidadesCache) {
    try {
      const [paisesResponse, cidadesResponse] = await Promise.all([
        fetch('/countries.json'),
        fetch('/cities.json')
      ]);

      if (!paisesResponse.ok || !cidadesResponse.ok) {
        throw new Error('Erro ao carregar dados locais');
      }

      paisesCache = await paisesResponse.json();
      cidadesCache = await cidadesResponse.json();
    } catch (error) {
      console.error('Erro ao carregar dados locais:', error);
      // Dados de fallback mínimos
      paisesCache = [];
      cidadesCache = [];
    }
  }

  return { paises: paisesCache!, cidades: cidadesCache! };
};

export const servicoDadosLocais = {
  // Buscar cidades por nome (busca exata e fuzzy)
  async buscarCidades(nome: string, limite: number = 10): Promise<CidadeLocal[]> {
    const { cidades } = await carregarDados();
    const nomeLower = nome.toLowerCase();

    // Busca exata primeiro
    const exactMatch = cidades.filter(cidade => 
      cidade.name.toLowerCase() === nomeLower
    );

    // Busca fuzzy como fallback
    const fuzzyMatch = cidades.filter(cidade => 
      cidade.name.toLowerCase().includes(nomeLower) && 
      !exactMatch.some(exact => exact.id === cidade.id) // Evitar duplicatas
    );

    return [...exactMatch, ...fuzzyMatch].slice(0, limite);
  },

  // Buscar país por código ISO
  async buscarPaisPorCodigo(codigo: string): Promise<PaisLocal | null> {
    const { paises } = await carregarDados();
    return paises.find(pais => pais.iso2 === codigo || pais.iso3 === codigo) || null;
  },

  // Buscar país por ID
  async buscarPaisPorId(id: number): Promise<PaisLocal | null> {
    const { paises } = await carregarDados();
    return paises.find(pais => pais.id === id) || null;
  },

  // Buscar cidades por país
  async buscarCidadesPorPais(codigoPais: string, limite: number = 50): Promise<CidadeLocal[]> {
    const { cidades } = await carregarDados();
    
    const cidadesPais = cidades.filter(cidade => 
      cidade.country_code === codigoPais.toUpperCase()
    );

    // Ordenar por nome
    return cidadesPais
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, limite);
  },

  // Buscar cidades populares para destinos turísticos
  async buscarDestinos(termo?: string, limite: number = 20): Promise<CidadeLocal[]> {
    const { cidades, paises } = await carregarDados();
    
    // Lista melhorada de cidades turisticamente importantes
    let cidadesDesejadas = cidades.filter(cidade => {
      const pais = paises.find(p => p.id === cidade.country_id);
      if (!pais) return false;
      
      // Incluir capitais importantes
      if (pais.capital.toLowerCase() === cidade.name.toLowerCase()) {
        return true;
      }
      
      // Lista expandida de cidades importantes turisticamente
      const cidadesImportantes = [
        // Brasil
        'rio de janeiro', 'são paulo', 'salvador', 'fortaleza', 'brasília', 'recife', 'belo horizonte', 'porto alegre', 'curitiba', 'manaus',
        // Estados Unidos
        'new york', 'los angeles', 'san francisco', 'las vegas', 'miami', 'chicago', 'boston', 'washington', 'seattle', 'philadelphia',
        // França
        'paris', 'marseille', 'nice', 'lyon', 'cannes', 'bordeaux', 'toulouse', 'strasbourg',
        // Reino Unido
        'london', 'manchester', 'edinburgh', 'liverpool', 'birmingham', 'glasgow', 'oxford', 'cambridge',
        // Itália
        'rome', 'milan', 'venice', 'florence', 'naples', 'turin', 'bologna', 'genoa', 'palermo',
        // Espanha
        'barcelona', 'madrid', 'seville', 'valencia', 'bilbao', 'granada', 'toledo', 'salamanca',
        // Alemanha
        'berlin', 'munich', 'hamburg', 'cologne', 'frankfurt', 'stuttgart', 'dresden', 'heidelberg',
        // Países Baixos
        'amsterdam', 'rotterdam', 'the hague', 'utrecht', 'eindhoven',
        // Áustria
        'vienna', 'salzburg', 'innsbruck', 'graz',
        // República Tcheca
        'prague', 'brno', 'ostrava',
        // Japão
        'tokyo', 'osaka', 'kyoto', 'hiroshima', 'nagoya', 'yokohama', 'kobe', 'fukuoka',
        // Coreia do Sul
        'seoul', 'busan', 'incheon', 'daegu',
        // Tailândia
        'bangkok', 'phuket', 'chiang mai', 'pattaya',
        // Singapura
        'singapore',
        // Hong Kong
        'hong kong',
        // China
        'beijing', 'shanghai', 'guangzhou', 'shenzhen', 'chengdu', 'hangzhou', 'nanjing',
        // Austrália
        'sydney', 'melbourne', 'perth', 'brisbane', 'adelaide', 'canberra',
        // Emirados Árabes Unidos
        'dubai', 'abu dhabi', 'sharjah',
        // Turquia
        'istanbul', 'ankara', 'izmir', 'antalya',
        // Rússia
        'moscow', 'st petersburg', 'novosibirsk', 'yekaterinburg',
        // Egito
        'cairo', 'alexandria', 'luxor', 'aswan',
        // Marrocos
        'marrakech', 'casablanca', 'fez', 'rabat',
        // África do Sul
        'cape town', 'johannesburg', 'durban', 'pretoria',
        // Argentina
        'buenos aires', 'córdoba', 'rosario', 'mendoza',
        // Chile
        'santiago', 'valparaíso', 'concepción',
        // Peru
        'lima', 'cusco', 'arequipa',
        // Índia
        'mumbai', 'delhi', 'bangalore', 'goa', 'kolkata', 'chennai', 'hyderabad', 'pune',
        // Portugal
        'lisbon', 'porto', 'faro', 'coimbra',
        // Grécia
        'athens', 'thessaloniki', 'patras',
        // Suíça
        'zurich', 'geneva', 'basel', 'bern',
        // Canadá
        'toronto', 'vancouver', 'montreal', 'calgary', 'ottawa',
        // México
        'mexico city', 'guadalajara', 'monterrey', 'cancun', 'puerto vallarta'
      ];
      
      return cidadesImportantes.includes(cidade.name.toLowerCase());
    });

    // Se há termo de busca, filtrar e expandir busca
    if (termo) {
      const termoLower = termo.toLowerCase().trim();
      
      // Busca expandida: nome da cidade, país, e busca parcial
      const cidadesBusca = cidades.filter(cidade =>
        cidade.name.toLowerCase().includes(termoLower) ||
        cidade.country_name.toLowerCase().includes(termoLower) ||
        cidade.state_name?.toLowerCase().includes(termoLower)
      );

      // Combinar resultados: cidades importantes + resultados da busca
      const cidadesCombinadas = [...cidadesDesejadas, ...cidadesBusca];
      
      // Remover duplicatas usando um Set com o ID da cidade
      const cidadesUnicas = cidadesCombinadas.filter((cidade, index, array) => 
        array.findIndex(c => c.id === cidade.id) === index
      );

      cidadesDesejadas = cidadesUnicas;
    }

    // NOVA LÓGICA: Remover duplicatas de nomes de cidades, priorizando as mais importantes
    const cidadesPriorizadas = new Map<string, CidadeLocal>();
    
    // Definir prioridades por país para cidades com nomes duplicados
    const prioridadesPaises: { [key: string]: number } = {
      'Egypt': 10,        // Alexandria, Egypt é a mais famosa
      'United States': 9, // Cidades americanas são conhecidas
      'United Kingdom': 8,
      'France': 8,
      'Italy': 8,
      'Spain': 7,
      'Germany': 7,
      'Japan': 8,
      'China': 7,
      'Brazil': 6,
      'Australia': 5,
      'Canada': 4,
      'Mexico': 5
    };

    cidadesDesejadas.forEach(cidade => {
      const nomeLower = cidade.name.toLowerCase();
      const prioridadePais = prioridadesPaises[cidade.country_name] || 1;
      
      // Se já temos uma cidade com esse nome, comparar prioridades
      if (cidadesPriorizadas.has(nomeLower)) {
        const cidadeExistente = cidadesPriorizadas.get(nomeLower)!;
        const prioridadeExistente = prioridadesPaises[cidadeExistente.country_name] || 1;
        
        // Só substituir se a nova cidade tem prioridade maior
        if (prioridadePais > prioridadeExistente) {
          cidadesPriorizadas.set(nomeLower, cidade);
        }
      } else {
        // Primeira cidade com esse nome
        cidadesPriorizadas.set(nomeLower, cidade);
      }
    });

    // Converter de volta para array
    const cidadesFinais = Array.from(cidadesPriorizadas.values());

    // Ordenar por relevância: capitais primeiro, depois por população estimada, depois alfabeticamente
    return cidadesFinais
      .sort((a, b) => {
        // Verificar se é capital
        const paisA = paises.find(p => p.id === a.country_id);
        const paisB = paises.find(p => p.id === b.country_id);
        
        const isCapitalA = paisA?.capital.toLowerCase() === a.name.toLowerCase();
        const isCapitalB = paisB?.capital.toLowerCase() === b.name.toLowerCase();
        
        if (isCapitalA && !isCapitalB) return -1;
        if (!isCapitalA && isCapitalB) return 1;
        
        // Depois por prioridade do país
        const prioridadeA = prioridadesPaises[a.country_name] || 1;
        const prioridadeB = prioridadesPaises[b.country_name] || 1;
        
        if (prioridadeA !== prioridadeB) return prioridadeB - prioridadeA;
        
        // Por último, ordenar alfabeticamente
        return a.name.localeCompare(b.name);
      })
      .slice(0, limite);
  },

  // Limpar cache (útil para debugging)
  limparCache() {
    paisesCache = null;
    cidadesCache = null;
  }
}; 