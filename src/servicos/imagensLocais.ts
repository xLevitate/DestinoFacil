import { ImagemCidade } from '../tipos';

// Países com bandeiras locais
const BANDEIRAS_LOCAIS = [
  'br', 'us', 'fr', 'it', 'es', 'gb', 'de', 'jp', 'cn', 'au', 'ca'
];

// Mapeamento de códigos de país para ISO2
const COUNTRY_CODE_MAP: { [key: string]: string } = {
  'Brazil': 'br',
  'United States': 'us',
  'France': 'fr',
  'Italy': 'it',
  'Spain': 'es',
  'United Kingdom': 'gb',
  'Germany': 'de',
  'Japan': 'jp',
  'China': 'cn',
  'Australia': 'au',
  'Canada': 'ca',
  'Mexico': 'mx',
  'Argentina': 'ar',
  'Chile': 'cl',
  'Peru': 'pe',
  'Colombia': 'co',
  'Netherlands': 'nl',
  'Belgium': 'be',
  'Switzerland': 'ch',
  'Austria': 'at',
  'Portugal': 'pt',
  'Greece': 'gr',
  'Turkey': 'tr',
  'Russia': 'ru',
  'India': 'in',
  'Thailand': 'th',
  'Vietnam': 'vn',
  'Indonesia': 'id',
  'Malaysia': 'my',
  'Singapore': 'sg',
  'Philippines': 'ph',
  'South Korea': 'kr',
  'Taiwan': 'tw',
  'Hong Kong': 'hk',
  'United Arab Emirates': 'ae',
  'Saudi Arabia': 'sa',
  'Egypt': 'eg',
  'Morocco': 'ma',
  'South Africa': 'za',
  'Kenya': 'ke',
  'Nigeria': 'ng',
  'New Zealand': 'nz',
  'Norway': 'no',
  'Sweden': 'se',
  'Denmark': 'dk',
  'Finland': 'fi',
  'Iceland': 'is',
  'Poland': 'pl',
  'Czech Republic': 'cz',
  'Hungary': 'hu',
  'Croatia': 'hr',
  'Slovenia': 'si',
  'Slovakia': 'sk',
  'Estonia': 'ee',
  'Latvia': 'lv',
  'Lithuania': 'lt'
};

// Imagens curadas para destinos principais via Unsplash Source
const IMAGENS_DESTINOS: { [key: string]: string[] } = {
  'paris': [
    'https://source.unsplash.com/800x600/?paris,eiffel-tower',
    'https://source.unsplash.com/800x600/?paris,louvre',
    'https://source.unsplash.com/800x600/?paris,champs-elysees',
    'https://source.unsplash.com/800x600/?paris,notre-dame',
    'https://source.unsplash.com/800x600/?paris,montmartre',
    'https://source.unsplash.com/800x600/?paris,architecture'
  ],
  'london': [
    'https://source.unsplash.com/800x600/?london,big-ben',
    'https://source.unsplash.com/800x600/?london,tower-bridge',
    'https://source.unsplash.com/800x600/?london,buckingham-palace',
    'https://source.unsplash.com/800x600/?london,thames',
    'https://source.unsplash.com/800x600/?london,westminster',
    'https://source.unsplash.com/800x600/?london,city'
  ],
  'new york': [
    'https://source.unsplash.com/800x600/?new-york,manhattan',
    'https://source.unsplash.com/800x600/?new-york,brooklyn-bridge',
    'https://source.unsplash.com/800x600/?new-york,central-park',
    'https://source.unsplash.com/800x600/?new-york,times-square',
    'https://source.unsplash.com/800x600/?new-york,skyline',
    'https://source.unsplash.com/800x600/?new-york,statue-liberty'
  ],
  'tokyo': [
    'https://source.unsplash.com/800x600/?tokyo,shibuya',
    'https://source.unsplash.com/800x600/?tokyo,mount-fuji',
    'https://source.unsplash.com/800x600/?tokyo,cherry-blossom',
    'https://source.unsplash.com/800x600/?tokyo,senso-ji',
    'https://source.unsplash.com/800x600/?tokyo,harajuku',
    'https://source.unsplash.com/800x600/?tokyo,skyline'
  ],
  'rio de janeiro': [
    'https://source.unsplash.com/800x600/?rio-de-janeiro,christ-redeemer',
    'https://source.unsplash.com/800x600/?rio-de-janeiro,copacabana',
    'https://source.unsplash.com/800x600/?rio-de-janeiro,sugarloaf',
    'https://source.unsplash.com/800x600/?rio-de-janeiro,ipanema',
    'https://source.unsplash.com/800x600/?rio-de-janeiro,carnival',
    'https://source.unsplash.com/800x600/?rio-de-janeiro,beach'
  ],
  'são paulo': [
    'https://source.unsplash.com/800x600/?sao-paulo,skyline',
    'https://source.unsplash.com/800x600/?sao-paulo,downtown',
    'https://source.unsplash.com/800x600/?sao-paulo,architecture',
    'https://source.unsplash.com/800x600/?sao-paulo,city',
    'https://source.unsplash.com/800x600/?sao-paulo,modern',
    'https://source.unsplash.com/800x600/?sao-paulo,urban'
  ],
  'rome': [
    'https://source.unsplash.com/800x600/?rome,colosseum',
    'https://source.unsplash.com/800x600/?rome,vatican',
    'https://source.unsplash.com/800x600/?rome,trevi-fountain',
    'https://source.unsplash.com/800x600/?rome,pantheon',
    'https://source.unsplash.com/800x600/?rome,ancient',
    'https://source.unsplash.com/800x600/?rome,architecture'
  ],
  'barcelona': [
    'https://source.unsplash.com/800x600/?barcelona,sagrada-familia',
    'https://source.unsplash.com/800x600/?barcelona,park-guell',
    'https://source.unsplash.com/800x600/?barcelona,gothic-quarter',
    'https://source.unsplash.com/800x600/?barcelona,beach',
    'https://source.unsplash.com/800x600/?barcelona,gaudi',
    'https://source.unsplash.com/800x600/?barcelona,architecture'
  ],
  'sydney': [
    'https://source.unsplash.com/800x600/?sydney,opera-house',
    'https://source.unsplash.com/800x600/?sydney,harbour-bridge',
    'https://source.unsplash.com/800x600/?sydney,bondi-beach',
    'https://source.unsplash.com/800x600/?sydney,darling-harbour',
    'https://source.unsplash.com/800x600/?sydney,skyline',
    'https://source.unsplash.com/800x600/?sydney,harbor'
  ],
  'dubai': [
    'https://source.unsplash.com/800x600/?dubai,burj-khalifa',
    'https://source.unsplash.com/800x600/?dubai,burj-al-arab',
    'https://source.unsplash.com/800x600/?dubai,palm-jumeirah',
    'https://source.unsplash.com/800x600/?dubai,skyline',
    'https://source.unsplash.com/800x600/?dubai,marina',
    'https://source.unsplash.com/800x600/?dubai,desert'
  ]
};

export const servicoImagensLocais = {
  // Obter bandeira do país
  obterBandeiraPais(nomePais: string, codigoIso2?: string): string {
    const codigo = codigoIso2?.toLowerCase() || COUNTRY_CODE_MAP[nomePais]?.toLowerCase();
    
    if (!codigo) {
      return this.obterPlaceholderBandeira();
    }

    // Se temos local, usar local
    if (BANDEIRAS_LOCAIS.includes(codigo)) {
      return `/flags/${codigo}.svg`;
    }

    // Senão, usar CDN do circle-flags
    return `https://hatscripts.github.io/circle-flags/flags/${codigo}.svg`;
  },

  // Placeholder para bandeira quando não encontrada
  obterPlaceholderBandeira(): string {
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="30" fill="#f3f4f6" stroke="#d1d5db" stroke-width="2"/>
        <text x="32" y="36" text-anchor="middle" font-family="system-ui" font-size="12" fill="#9ca3af">🌍</text>
      </svg>
    `)}`;
  },

  // Obter imagens de destinos
  async obterImagensDestino(nomeDestino: string): Promise<ImagemCidade[]> {
    const destinoKey = nomeDestino.toLowerCase();
    const imagens = IMAGENS_DESTINOS[destinoKey];

    if (!imagens) {
      return this.obterImagensGenericas(nomeDestino);
    }

    return imagens.map((url, index) => ({
      id: index + 1,
      url,
      miniatura: url.replace('800x600', '400x300'),
      alt: `Foto de ${nomeDestino}`,
      fotografo: {
        nome: 'Unsplash Community',
        perfil: 'https://unsplash.com'
      }
    }));
  },

  // Imagens genéricas para destinos sem imagens curadas
  obterImagensGenericas(nomeDestino: string): ImagemCidade[] {
    const termos = [
      `${nomeDestino}-city`,
      `${nomeDestino}-travel`,
      `${nomeDestino}-tourism`,
      `${nomeDestino}-landmark`,
      `${nomeDestino}-architecture`,
      `${nomeDestino}-skyline`
    ];

    return termos.map((termo, index) => ({
      id: index + 1,
      url: `https://source.unsplash.com/800x600/?${termo}`,
      miniatura: `https://source.unsplash.com/400x300/?${termo}`,
      alt: `Foto de ${nomeDestino}`,
      fotografo: {
        nome: 'Unsplash Community',
        perfil: 'https://unsplash.com'
      }
    }));
  },

  // Placeholder para quando não há imagens
  obterPlaceholderImagem(nomeDestino: string): ImagemCidade {
    const cores = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    const cor = cores[nomeDestino.length % cores.length];
    
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${cor};stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:${cor};stop-opacity:0.4" />
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="url(#grad)"/>
        <text x="400" y="280" text-anchor="middle" font-family="system-ui" font-size="48" fill="white" font-weight="bold">${nomeDestino}</text>
        <text x="400" y="320" text-anchor="middle" font-family="system-ui" font-size="18" fill="white" opacity="0.8">Destino de Viagem</text>
        <circle cx="400" cy="380" r="30" fill="white" opacity="0.2"/>
        <text x="400" y="390" text-anchor="middle" font-family="system-ui" font-size="24" fill="white">✈️</text>
      </svg>
    `;

    return {
      id: 0,
      url: `data:image/svg+xml,${encodeURIComponent(svg)}`,
      miniatura: `data:image/svg+xml,${encodeURIComponent(svg.replace('800', '400').replace('600', '300'))}`,
      alt: `Placeholder para ${nomeDestino}`,
      fotografo: {
        nome: 'DestinoFácil',
        perfil: '#'
      }
    };
  },

  // Verificar se uma imagem está disponível
  async verificarImagem(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  },

  // Obter imagem com fallback
  async obterImagemComFallback(nomeDestino: string): Promise<ImagemCidade> {
    try {
      const imagens = await this.obterImagensDestino(nomeDestino);
      if (imagens.length > 0) {
        return imagens[0];
      }
    } catch (error) {
      console.warn('Erro ao carregar imagem:', error);
    }
    
    return this.obterPlaceholderImagem(nomeDestino);
  }
}; 