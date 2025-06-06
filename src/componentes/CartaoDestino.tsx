'use client';
import { InfoDestino } from '../tipos';
import { FiMapPin, FiUsers, FiExternalLink } from 'react-icons/fi';


interface CartaoDestinoProps {
  destino: InfoDestino;
  cidadeOrigem?: string;
}

export default function CartaoDestino({ destino, cidadeOrigem = 'São Paulo' }: CartaoDestinoProps) {
  const formatarPopulacao = (populacao: number) => {
    if (populacao >= 1000000) {
      return `${(populacao / 1000000).toFixed(1)}M habitantes`;
    } else if (populacao >= 1000) {
      return `${(populacao / 1000).toFixed(0)}K habitantes`;
    }
    return `${populacao} habitantes`;
  };

  const abrirSkyscanner = () => {
    const url = `https://www.skyscanner.com.br/transporte/voos/${encodeURIComponent(cidadeOrigem.toLowerCase().replace(/\s+/g, '-'))}/${encodeURIComponent(destino.nome.toLowerCase().replace(/\s+/g, '-'))}/`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Header com ícone */}
      <div className="h-32 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
        <FiMapPin className="h-12 w-12 text-white/80" />
      </div>

      {/* Informações */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{destino.nome}</h2>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <FiMapPin className="mr-2" />
            <span>{destino.regiao}, {destino.pais}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <FiUsers className="mr-2" />
            <span>{formatarPopulacao(destino.populacao)}</span>
          </div>
        </div>

        {/* Botão para Skyscanner */}
        <button
          onClick={abrirSkyscanner}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <FiExternalLink />
          Ver voos no Skyscanner
        </button>
      </div>
    </div>
  );
} 