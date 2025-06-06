'use client';

import { useState } from 'react';
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
  aberto: boolean;
  onToggle: () => void;
}

export default function FiltrosDestinos({ 
  filtros, 
  onFiltrosChange, 
  onLimpar, 
  aberto, 
  onToggle 
}: FiltrosDestinosProps) {
  const [filtrosLocais, setFiltrosLocais] = useState<FiltrosDestino>(filtros);

  const aplicarFiltros = () => {
    onFiltrosChange(filtrosLocais);
  };

  const limparFiltros = () => {
    const filtrosVazios: FiltrosDestino = {};
    setFiltrosLocais(filtrosVazios);
    onLimpar();
  };

  const atualizarFiltro = (campo: keyof FiltrosDestino, valor: any) => {
    const novosFiltros = { ...filtrosLocais, [campo]: valor };
    setFiltrosLocais(novosFiltros);
  };

  const formatarPopulacao = (valor: string) => {
    const numero = parseInt(valor.replace(/\D/g, ''));
    if (isNaN(numero)) return '';
    return numero.toLocaleString('pt-BR');
  };

  const parsePopulacao = (valor: string): number => {
    return parseInt(valor.replace(/\D/g, '')) || 0;
  };

  if (!aberto) {
    return (
      <Button
        variant="outline"
        onClick={onToggle}
        className="flex items-center gap-2"
      >
        <Filter className="h-4 w-4" />
        Filtros
      </Button>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Filtros de Preço e Clima */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Faixa de Preço
            </label>
            <Select
              value={filtrosLocais.preco || ''}
              onValueChange={(value: string) => atualizarFiltro('preco', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Qualquer preço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Qualquer preço</SelectItem>
                <SelectItem value="baixo">💰 Baixo</SelectItem>
                <SelectItem value="medio">💰💰 Médio</SelectItem>
                <SelectItem value="alto">💰💰💰 Alto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Clima
            </label>
            <Select
              value={filtrosLocais.clima || ''}
              onValueChange={(value: string) => atualizarFiltro('clima', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Qualquer clima" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Qualquer clima</SelectItem>
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
            Região
          </label>
          <Input
            placeholder="Ex: Europa, Ásia, América..."
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
                  const valor = parsePopulacao(e.target.value);
                  atualizarFiltro('populacaoMin', valor || undefined);
                }}
              />
            </div>
            <div>
              <Input
                placeholder="Máximo"
                value={filtrosLocais.populacaoMax ? formatarPopulacao(filtrosLocais.populacaoMax.toString()) : ''}
                onChange={(e) => {
                  const valor = parsePopulacao(e.target.value);
                  atualizarFiltro('populacaoMax', valor || undefined);
                }}
              />
            </div>
          </div>
        </div>

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

        {/* Botões de Ação */}
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={aplicarFiltros}
            className="flex-1"
          >
            Aplicar Filtros
          </Button>
          <Button 
            variant="outline" 
            onClick={limparFiltros}
            className="flex-1"
          >
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 