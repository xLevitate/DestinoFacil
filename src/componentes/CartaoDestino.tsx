'use client';
import { InfoDestino } from '../tipos';
import { FiMapPin, FiUsers, FiExternalLink } from 'react-icons/fi';
import { obterUrlGoogleFlights } from '../servicos/apiDestinos';

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

  const abrirGoogleFlights = () => {
    const url = obterUrlGoogleFlights(cidadeOrigem, destino.nome);
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Galeria de Imagens */}
      {destino.imagens.length > 0 && (
        <div className="relative h-64 overflow-hidden">
          <div className="flex animate-scroll">
            {destino.imagens.map((imagem, index) => (
              <img
                key={imagem.id}
                src={imagem.url}
                alt={imagem.alt}
                className="w-full h-64 object-cover flex-shrink-0"
              />
            ))}
          </div>
        </div>
      )}

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

        {/* Botão para Google Flights */}
        <button
          onClick={abrirGoogleFlights}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <FiExternalLink />
          Ver voos no Google Flights
        </button>
      </div>
    </div>
  );
} 