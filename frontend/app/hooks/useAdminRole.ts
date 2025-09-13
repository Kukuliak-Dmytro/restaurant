import { usePermissions } from './usePermissions';

export const useAdminRole = () => {
  const { permissions, loading, error } = usePermissions();
  
  const isAdmin = permissions?.isAdmin ?? false;
  const canManageIngredients = permissions?.canManageIngredients ?? false;
  
  return {
    isAdmin,
    canManageIngredients,
    loading,
    error,
    permissions
  };
};
