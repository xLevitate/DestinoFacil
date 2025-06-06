'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/componentes/ui/button';
import { Input } from '@/componentes/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentes/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/componentes/ui/select';
import { FiltrosDestino } from '@/tipos';
import { Filter, X, DollarSign, Thermometer, MapPin, Users, ArrowUpDown } from 'lucide-react';

interface FiltrosDestinosProps {
  filtros: FiltrosDestino;
  onFiltrosChange: (filtros: FiltrosDestino) => void;
  onLimpar: () => void;
}

export default function FiltrosDestinos({ 
  filtros, 
  onFiltrosChange, 
  onLimpar,
}: FiltrosDestinosProps) {
  const [filtrosLocais, setFiltrosLocais] = useState<FiltrosDestino>(filtros);

  // Sincronizar o estado local quando os filtros do pai mudarem (ex: ao limpar)
  useEffect(() => {
    setFiltrosLocais(filtros);
  }, [filtros]);

  const aplicarFiltros = () => {
    onFiltrosChange(filtrosLocais);
  };

  const limparFiltros = () => {
    onLimpar();
  };

  const atualizarFiltro = (campo: keyof FiltrosDestino, valor: any) => {
    const novosFiltros = { ...filtrosLocais, [campo]: valor };
    // Remover o campo se for "all" ou vazio
    if (valor === 'all' || valor === '' || valor === undefined || valor === null) {
      delete novosFiltros[campo];
    }
    setFiltrosLocais(novosFiltros);
  };

  const formatarPopulacao = (valor: string) => {
    const numero = parseInt(valor.replace(/\D/g, ''));
    if (isNaN(numero)) return '';
    return numero.toLocaleString('pt-BR');
  };

  const parsePopulacao = (valor: string): number | undefined => {
    const parsed = parseInt(valor.replace(/\D/g, ''));
    return isNaN(parsed) ? undefined : parsed;
  };
  
  return (
    <Card className="w-full border-dashed">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Opções de Filtro
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Ordenação */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              Ordenar por
            </label>
            <Select
              value={filtrosLocais.ordenarPor || 'popularidade'}
              onValueChange={(value: string) => atualizarFiltro('ordenarPor', value as 'nome' | 'populacao' | 'popularidade')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularidade">🔥 Popularidade</SelectItem>
                <SelectItem value="nome">🔤 Nome</SelectItem>
                <SelectItem value="populacao">👥 População</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Faixa de Preço */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Faixa de Preço
            </label>
            <Select
              value={filtrosLocais.preco || 'all'}
              onValueChange={(value: string) => atualizarFiltro('preco', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Qualquer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer</SelectItem>
                <SelectItem value="baixo">💰 Baixo</SelectItem>
                <SelectItem value="medio">💰💰 Médio</SelectItem>
                <SelectItem value="alto">💰💰💰 Alto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Clima */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Clima
            </label>
            <Select
              value={filtrosLocais.clima || 'all'}
              onValueChange={(value: string) => atualizarFiltro('clima', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Qualquer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer</SelectItem>
                <SelectItem value="frio">🌨️ Frio</SelectItem>
                <SelectItem value="temperado">🌤️ Temperado</SelectItem>
                <SelectItem value="quente">☀️ Quente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filtro de Região */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Continente ou Região
          </label>
          <Input
            placeholder="Ex: Europa, Ásia, América do Sul..."
            value={filtrosLocais.regiao || ''}
            onChange={(e) => atualizarFiltro('regiao', e.target.value || undefined)}
          />
        </div>

        {/* Filtros de População */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            População
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                placeholder="Mínimo"
                value={filtrosLocais.populacaoMin ? formatarPopulacao(filtrosLocais.populacaoMin.toString()) : ''}
                onChange={(e) => {
                  atualizarFiltro('populacaoMin', parsePopulacao(e.target.value));
                }}
              />
            </div>
            <div>
              <Input
                placeholder="Máximo"
                value={filtrosLocais.populacaoMax ? formatarPopulacao(filtrosLocais.populacaoMax.toString()) : ''}
                onChange={(e) => {
                  atualizarFiltro('populacaoMax', parsePopulacao(e.target.value));
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button 
            onClick={limparFiltros}
            variant="outline"
            className="flex-1"
          >
            Limpar Filtros
          </Button>
          <Button 
            onClick={aplicarFiltros}
            className="flex-1"
          >
            Aplicar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 