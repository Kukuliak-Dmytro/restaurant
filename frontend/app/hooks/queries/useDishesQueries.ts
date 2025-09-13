import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';

export const useDishes = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['dishes', page, limit],
    queryFn: async () => {
      console.log(`Fetching dishes - page: ${page}, limit: ${limit}`);
      const response = await apiClient.getDishes(page, limit);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch dishes');
      }
      console.log('Dishes data received:', response.data);
      return response.data;
    },
  });
};

export const useDish = (id: number) => {
  return useQuery({
    queryKey: ['dish', id],
    queryFn: async () => {
      const response = await apiClient.getDish(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch dish');
      }
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.getCategories();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch categories');
      }
      return response.data || [];
    },
  });
};
