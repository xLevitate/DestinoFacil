import { PaisLocal, CidadeLocal } from '../tipos';

// Cache para países (que são poucos)
let paisesCache: PaisLocal[] | null = null;
let cidadesCache: CidadeLocal[] | null = null; // O cache de cidades será removido para buscas dinâmicas

const carregarPaises = async (): Promise<PaisLocal[]> => {
  if (paisesCache) return paisesCache;

  try {
    const response = await fetch('/countries.json');
    if (!response.ok) throw new Error('Erro ao carregar países.');
    paisesCache = await response.json();
    return paisesCache!;
  } catch (error) {
    console.error('Erro ao carregar countries.json:', error);
    return [];
  }
};

const carregarCidades = async (): Promise<CidadeLocal[]> => {
    // Para buscas dinâmicas, não vamos mais cachear todas as cidades em memória
    // O ideal seria um backend, mas vamos carregar sob demanda para a busca
    if (cidadesCache) return cidadesCache;
    try {
        const response = await fetch('/cities.json');
        if (!response.ok) throw new Error('Erro ao carregar cidades.');
        cidadesCache = await response.json();
        return cidadesCache!;
    } catch (error) {
        console.error('Erro ao carregar cities.json:', error);
        return [];
    }
};

export const servicoDadosLocais = {
  async buscarCidades(nome: string, limite: number = 10): Promise<CidadeLocal[]> {
    const cidades = await carregarCidades();
    const nomeLower = nome.toLowerCase();
    
    return cidades.filter(c => c.name.toLowerCase().includes(nomeLower)).slice(0, limite);
  },

  async buscarPaisPorCodigo(codigo: string): Promise<PaisLocal | null> {
    const paises = await carregarPaises();
    return paises.find(p => p.iso2 === codigo || p.iso3 === codigo) || null;
  },

  async buscarPaisPorId(id: number): Promise<PaisLocal | null> {
    const paises = await carregarPaises();
    return paises.find(p => p.id === id) || null;
  },

  /**
   * Busca destinos. Se um termo de busca for fornecido, filtra todas as cidades.
   * Se nenhum termo for fornecido, retorna uma lista de cidades populares (capitais).
   */
  async buscarDestinos(termo?: string, limite: number = 100): Promise<CidadeLocal[]> {
    const [cidades, paises] = await Promise.all([carregarCidades(), carregarPaises()]);

    if (termo) {
      const termoLower = termo.toLowerCase().trim();
      if (!termoLower) return this.obterCidadesPopulares(cidades, paises, limite);

      // Busca em toda a base de cidades
      const resultados = cidades.filter(c =>
        c.name.toLowerCase().includes(termoLower) ||
        c.country_name.toLowerCase().includes(termoLower) ||
        c.state_name?.toLowerCase().includes(termoLower)
      );
      return resultados.slice(0, limite);
    }

    // Retorna cidades populares se não houver busca
    return this.obterCidadesPopulares(cidades, paises, limite);
  },

  /**
   * Retorna uma lista de cidades populares (capitais e cidades com alta população).
   */
  obterCidadesPopulares(cidades: CidadeLocal[], paises: PaisLocal[], limite: number): CidadeLocal[] {
    const capitais = new Set(paises.map(p => p.capital.toLowerCase()));
    
    return cidades
      .filter(c => capitais.has(c.name.toLowerCase()))
      .sort((a, b) => {
          // Um critério de popularidade simples: capitais de países maiores primeiro
          const paisA = paises.find(p => p.id === a.country_id);
          const paisB = paises.find(p => p.id === b.country_id);
          // Este dado de população não existe no JSON, é um exemplo.
          // O ideal seria ter a população no JSON de países.
          // Por enquanto, vamos ordenar pelo nome.
          return a.name.localeCompare(b.name);
      })
      .slice(0, limite);
  },

  limparCache() {
    paisesCache = null;
    cidadesCache = null;
  },
}; 