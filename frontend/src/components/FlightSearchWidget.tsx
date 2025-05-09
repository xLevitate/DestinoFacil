'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiCalendar, FiUsers, FiArrowRight, FiDollarSign, FiMapPin, FiSearch } from 'react-icons/fi';
import { FaPlane } from 'react-icons/fa';
import flightsService, { FlightSearchParams } from '../services/flightsService';
import CitySelector from './CitySelector';

interface FlightSearchWidgetProps {
  destinationName: string;
  originName?: string;
}

export default function FlightSearchWidget({ 
  destinationName, 
  originName = 'São Paulo' 
}: FlightSearchWidgetProps) {
  const router = useRouter();
  const [departureDate, setDepartureDate] = useState<string>('');
  const [returnDate, setReturnDate] = useState<string>('');
  const [passengers, setPassengers] = useState<number>(1);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dealLoading, setDealLoading] = useState<boolean>(true);
  const [deals, setDeals] = useState<{price: number, origin: string}[]>([]);
  const [origin, setOrigin] = useState<string>(originName);

  useEffect(() => {
    const today = new Date();
    const departureDateObj = new Date(today);
    departureDateObj.setDate(today.getDate() + 14);
    
    const returnDateObj = new Date(today);
    returnDateObj.setDate(today.getDate() + 21);
    
    setDepartureDate(departureDateObj.toISOString().split('T')[0]);
    setReturnDate(returnDateObj.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (origin) {
      getEstimatedPrice();
      getFlightDeals();
    }
  }, [origin, destinationName]);
  
  const getEstimatedPrice = async () => {
    setIsLoading(true);
    try {
      const price = await flightsService.estimateFlightPrice(origin, destinationName);
      setEstimatedPrice(price);
    } catch (error) {
      console.error('Error getting flight price', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getFlightDeals = async () => {
    setDealLoading(true);
    try {
      const dealsList = await flightsService.getFlightDeals(destinationName);
      setDeals(dealsList);
    } catch (error) {
      console.error('Error getting flight deals', error);
    } finally {
      setDealLoading(false);
    }
  };

  const handleSearch = () => {
    if (!departureDate || !origin) return;
    
    const searchParams: FlightSearchParams = {
      origin: origin,
      destination: destinationName,
      dates: {
        departure: new Date(departureDate),
        return: returnDate ? new Date(returnDate) : undefined
      },
      adults: passengers,
      currency: 'BRL'
    };
    
    const flightUrl = flightsService.getFlightUrl(searchParams);
    
    window.open(flightUrl, '_blank');
  };

  const formatPrice = (price: number): string => {
    return `R$ ${price.toLocaleString('pt-BR')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 mb-8">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
        <FaPlane className="inline-block mr-2" />
        Passagens Aéreas
      </h3>
      
      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        estimatedPrice && (
          <div className="mb-4 sm:mb-6 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Preço estimado</span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatPrice(estimatedPrice)}
              </div>
            </div>
          </div>
        )
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Origem
        </label>
        <CitySelector
          selectedCity={origin}
          onCitySelect={setOrigin}
          placeholder="Selecione a cidade de origem"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Destino
        </label>
        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2">
          <FaPlane className="text-gray-400 mr-2" />
          <span className="text-gray-800 dark:text-gray-200">{destinationName}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="departure-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ida
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiCalendar className="text-gray-400" />
            </div>
            <input
              type="date"
              id="departure-date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="return-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Volta (opcional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiCalendar className="text-gray-400" />
            </div>
            <input
              type="date"
              id="return-date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            />
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <label htmlFor="passengers" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Passageiros
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiUsers className="text-gray-400" />
          </div>
          <select
            id="passengers"
            value={passengers}
            onChange={(e) => setPassengers(Number(e.target.value))}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
          >
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'passageiro' : 'passageiros'}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <button
        onClick={handleSearch}
        className="w-full py-3 px-4 flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700"
      >
        Buscar Voos no Google Flights <FiArrowRight className="ml-1" />
      </button>
      
      {!dealLoading && deals.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Melhores ofertas para {destinationName}
          </h4>
          <div className="space-y-2">
            {deals.map((deal, index) => (
              <div 
                key={index}
                className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-gray-700"
              >
                <div className="flex items-center">
                  <FaPlane className="text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{deal.origin}</span>
                </div>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {formatPrice(deal.price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 