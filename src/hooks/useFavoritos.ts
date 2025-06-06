import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Favorito, InfoDestino } from '@/tipos';

export const useFavoritos = (userId?: string) => {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Carregar favoritos do usuário
  const carregarFavoritos = async () => {
    if (!userId) return;

    setCarregando(true);
    setErro(null);

    try {
      const { data, error } = await supabase
        .from('favoritos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavoritos(data || []);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      setErro('Erro ao carregar favoritos');
    } finally {
      setCarregando(false);
    }
  };

  // Verificar se um destino está favoritado
  const isFavoritado = (destinoId: string | number): boolean => {
    return favoritos.some(fav => fav.destino_id === destinoId.toString());
  };

  // Adicionar aos favoritos
  const adicionarFavorito = async (destino: InfoDestino): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('favoritos')
        .insert({
          user_id: userId,
          destino_id: destino.id.toString(),
          destino_nome: destino.nome,
          destino_pais: destino.pais,
          destino_regiao: destino.regiao,
          destino_populacao: destino.populacao,
          destino_latitude: destino.latitude,
          destino_longitude: destino.longitude
        });

      if (error) throw error;

      // Recarregar favoritos
      await carregarFavoritos();
      return true;
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      setErro('Erro ao adicionar favorito');
      return false;
    }
  };

  // Remover dos favoritos
  const removerFavorito = async (destinoId: string | number): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('favoritos')
        .delete()
        .eq('user_id', userId)
        .eq('destino_id', destinoId.toString());

      if (error) throw error;

      // Recarregar favoritos
      await carregarFavoritos();
      return true;
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      setErro('Erro ao remover favorito');
      return false;
    }
  };

  // Alternar favorito
  const alternarFavorito = async (destino: InfoDestino): Promise<boolean> => {
    const jaFavoritado = isFavoritado(destino.id);
    
    if (jaFavoritado) {
      return await removerFavorito(destino.id);
    } else {
      return await adicionarFavorito(destino);
    }
  };

  useEffect(() => {
    carregarFavoritos();
  }, [userId]);

  return {
    favoritos,
    carregando,
    erro,
    isFavoritado,
    adicionarFavorito,
    removerFavorito,
    alternarFavorito,
    recarregar: carregarFavoritos
  };
}; 