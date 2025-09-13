import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import type { CreateDishRequest, UpdateDishRequest } from '../../types/dishes';

export const useDishesMutations = () => {
  const queryClient = useQueryClient();

  const createDish = useMutation({
    mutationFn: async (dishData: CreateDishRequest) => {
      const response = await apiClient.createDish(dishData);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create dish');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dishes'] });
    },
  });

  const updateDish = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateDishRequest }) => {
      const response = await apiClient.updateDish(id, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update dish');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dishes'] });
    },
  });

  const deleteDish = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.deleteDish(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete dish');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dishes'] });
    },
  });

  return {
    createDish,
    updateDish,
    deleteDish,
  };
};
