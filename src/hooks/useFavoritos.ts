import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Favorito, InfoDestino } from '@/tipos';

export const useFavoritos = (userId?: string) => {
  const [carregando, setCarregando] = useState(true);
  const [favoritoIds, setFavoritoIds] = useState<Set<string>>(new Set());
  const abortControllerRef = useRef<AbortController | null>(null);

  // Carregar favoritos do usuário
  const carregarFavoritos = useCallback(async () => {
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!userId) {
      setFavoritoIds(new Set());
      setCarregando(false);
      return;
    }

    // Criar novo controller de abort para esta requisição
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setCarregando(true);
    try {
      const { data, error } = await supabase
        .from('favoritos')
        .select('destino_id')
        .eq('user_id', userId)
        .abortSignal(signal);

      // Verificar se a requisição foi cancelada
      if (signal.aborted) return;

      if (error) throw error;
      
      setFavoritoIds(new Set(data?.map(f => f.destino_id) || []));

    } catch (error: any) {
      // Não registrar erros para requisições canceladas
      if (!signal.aborted) {
        console.error('Erro ao carregar favoritos:', error?.message || error || 'Erro desconhecido');
      }
    } finally {
      if (!signal.aborted) {
        setCarregando(false);
      }
    }
  }, [userId]);

  useEffect(() => {
    carregarFavoritos();
    
    // Função de limpeza
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [carregarFavoritos]);

  // Verificar se um destino está favoritado
  const isFavoritado = useCallback((destinoId: string | number): boolean => {
    if (!destinoId) return false;
    return favoritoIds.has(destinoId.toString());
  }, [favoritoIds]);

  // Alternar favorito
  const alternarFavorito = useCallback(async (destino: InfoDestino): Promise<boolean> => {
    if (!userId) {
      console.error("Usuário não autenticado para favoritar.");
      return false;
    }

    if (!destino?.id) {
      console.error("Destino inválido.");
      return false;
    }

    const jaFavoritado = isFavoritado(destino.id);
    const destinoIdStr = destino.id.toString();

    // Atualização otimista da UI
    const novoSet = new Set(favoritoIds);
    if (jaFavoritado) {
      novoSet.delete(destinoIdStr);
    } else {
      novoSet.add(destinoIdStr);
    }
    setFavoritoIds(novoSet);

    try {
      if (jaFavoritado) {
        // Remover
        const { error } = await supabase
          .from('favoritos')
          .delete()
          .eq('user_id', userId)
          .eq('destino_id', destinoIdStr);
        if (error) throw error;

      } else {
        // Adicionar - validar campos obrigatórios
        const destinoData = {
          user_id: userId,
          destino_id: destinoIdStr,
          destino_nome: (destino.nome || '').slice(0, 255),
          destino_pais: (destino.pais || '').slice(0, 255),
          destino_regiao: (destino.regiao || '').slice(0, 255),
          destino_populacao: Math.max(0, destino.populacao || 0),
          destino_latitude: Math.max(-90, Math.min(90, destino.latitude || 0)),
          destino_longitude: Math.max(-180, Math.min(180, destino.longitude || 0))
        };

        const { error } = await supabase
          .from('favoritos')
          .insert(destinoData);
        if (error) throw error;
      }
      return true;
    } catch (error) {
      console.error('Erro ao alternar favorito:', error);
      // Reverter a UI em caso de erro
      setFavoritoIds(favoritoIds); // Restaurar estado original
      return false;
    }
  }, [userId, favoritoIds, isFavoritado]);

  return {
    carregando,
    isFavoritado,
    alternarFavorito,
  };
}; 