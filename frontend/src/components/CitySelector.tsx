'use client';

import { useState, useEffect, useRef } from 'react';
import { FiMapPin, FiX, FiLoader, FiSearch, FiChevronDown } from 'react-icons/fi';
import { cityInfoServices } from '../services/apiServices';

export interface City {
  id: number;
  name: string;
  country: string;
  region: string;
}

interface CitySelectorProps {
  selectedCity: string;
  onCitySelect: (city: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CitySelector({
  selectedCity,
  onCitySelect,
  placeholder = 'Selecione uma cidade',
  className = ''
}: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const popularCities = [
    'São Paulo',
    'Rio de Janeiro',
    'Brasília',
    'Salvador',
    'Fortaleza',
    'Belo Horizonte',
    'Manaus',
    'Curitiba',
    'Recife',
    'Porto Alegre'
  ];

  useEffect(() => {
    if (isOpen && selectedCity) {
      setSearchTerm(selectedCity);
    }
  }, [isOpen, selectedCity]);

  useEffect(() => {
    const searchCities = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setCities([]);
        return;
      }
      
      setLoading(true);
      try {
        const results = await cityInfoServices.searchCities(searchTerm, 8);
        setCities(results);
      } catch (error) {
        console.error('Error searching for cities:', error);
        setCities([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      searchCities();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const detectUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Seu navegador não suporta geolocalização");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            { headers: { 'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7' } }
          );
          
          if (!response.ok) throw new Error('Falha ao obter localização');
          
          const data = await response.json();
          
          const city = 
            data.address.city || 
            data.address.town || 
            data.address.village || 
            data.address.county ||
            data.address.state;
          
          if (city) {
            onCitySelect(city);
            setSearchTerm(city);
            setIsOpen(false);
          }
        } catch (error) {
          console.error('Error getting location:', error);
          setLocationError("Não foi possível determinar sua localização");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsLocating(false);
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Acesso à localização negado");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Informações de localização indisponíveis");
            break;
          case error.TIMEOUT:
            setLocationError("Tempo esgotado para obter localização");
            break;
          default:
            setLocationError("Erro ao obter localização");
        }
      }
    );
  };

  const handleCitySelect = (city: string) => {
    onCitySelect(city);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div 
        className="flex items-center justify-between border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 cursor-pointer bg-white dark:bg-gray-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center flex-1">
          <FiMapPin className="text-gray-400 mr-2 flex-shrink-0" />
          <span className={`text-gray-800 dark:text-gray-200 truncate ${!selectedCity ? 'text-gray-400 dark:text-gray-400' : ''}`}>
            {selectedCity || placeholder}
          </span>
        </div>
        <FiChevronDown className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="p-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite para buscar cidades"
                autoFocus
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                >
                  <FiX />
                </button>
              )}
            </div>
            
            <button
              onClick={detectUserLocation}
              className="flex items-center w-full mt-2 px-3 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
            >
              {isLocating ? (
                <FiLoader className="mr-2 animate-spin" />
              ) : (
                <FiMapPin className="mr-2" />
              )}
              {isLocating ? 'Detectando localização...' : 'Usar minha localização atual'}
            </button>

            {locationError && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400 px-3">{locationError}</p>
            )}
            
            <div className="mt-2">
              {loading ? (
                <div className="flex justify-center py-3">
                  <FiLoader className="animate-spin text-blue-500" />
                </div>
              ) : cities.length > 0 ? (
                <div className="max-h-60 overflow-y-auto py-1">
                  {cities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleCitySelect(city.name)}
                      className="flex items-center w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">{city.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {city.region}, {city.country}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchTerm.length < 2 ? (
                <div className="py-2 px-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Cidades populares:</p>
                  <div className="flex flex-wrap gap-2">
                    {popularCities.map((city) => (
                      <button
                        key={city}
                        onClick={() => handleCitySelect(city)}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="py-3 px-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  Nenhuma cidade encontrada
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 