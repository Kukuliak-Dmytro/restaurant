import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import type { Ingredient } from '../../types/ingredients';

export const useIngredients = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['ingredients', page, limit],
    queryFn: async () => {
      console.log(`Fetching ingredients - page: ${page}, limit: ${limit}`);
      const response = await apiClient.getIngredients(page, limit);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch ingredients');
      }
      console.log('Ingredients data received:', response.data);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useIngredient = (id: number) => {
  return useQuery({
    queryKey: ['ingredient', id],
    queryFn: async () => {
      const response = await apiClient.getIngredient(id);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch ingredient');
      }
      return response.data;
    },
    enabled: !!id,
  });
};
