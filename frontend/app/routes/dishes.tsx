import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useDishes } from '../hooks/queries/useDishesQueries';
import { useDishesMutations } from '../hooks/mutations/useDishesMutations';
import { useAdminRole } from '../hooks/useAdminRole';
import { DishesTable } from '../components/dishes/DishesTable';
import type { CreateDishRequest, UpdateDishRequest } from '../types/dishes';

export default function DishesPage() {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useAdminRole();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { data: dishesData, isLoading, error } = useDishes(currentPage, pageSize);
  
  console.log('Dishes page - currentPage:', currentPage, 'pageSize:', pageSize);
  console.log('Dishes page - dishesData:', dishesData);
  console.log('Dishes page - error:', error);
  const { createDish, updateDish, deleteDish } = useDishesMutations();
  
  const dishes = dishesData?.data || [];
  const totalItems = dishesData?.total || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/home');
    }
  }, [isAdmin, roleLoading, navigate]);

  const handleCreateDish = async (data: CreateDishRequest) => {
    try {
      await createDish.mutateAsync(data);
    } catch (error) {
      console.error('Failed to create dish:', error);
    }
  };

  const handleUpdateDish = async (id: number, data: UpdateDishRequest) => {
    try {
      await updateDish.mutateAsync({ id, data });
    } catch (error) {
      console.error('Failed to update dish:', error);
    }
  };

  const handleDeleteDish = async (id: number) => {
    try {
      await deleteDish.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete dish:', error);
    }
  };

  if (roleLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">
              Failed to load dishes. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dishes Management</h1>
          <p className="text-gray-600">
            Manage your restaurant's dishes, including pricing and categories.
          </p>
        </div>

        <DishesTable
          dishes={dishes}
          onCreate={handleCreateDish}
          onUpdate={handleUpdateDish}
          onDelete={handleDeleteDish}
          isLoading={isLoading || createDish.isPending || updateDish.isPending || deleteDish.isPending}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === pageNum
                          ? 'text-white bg-blue-600'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
