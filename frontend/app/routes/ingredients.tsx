import { useNavigate } from 'react-router';
import { useIngredients } from '../hooks/queries/useIngredientsQueries';
import { useCreateIngredient, useUpdateIngredient, useDeleteIngredient } from '../hooks/mutations/useIngredientsMutations';
import { IngredientsTable } from '../components/ingredients/IngredientsTable';
import { IngredientForm } from '../components/ingredients/IngredientForm';
import { useAdminRole } from '../hooks/useAdminRole';
import { useEffect, useState } from 'react';
import type { CreateIngredientRequest, UpdateIngredientRequest } from '../types/ingredients';

export default function IngredientsPage() {
  const navigate = useNavigate();
  const { isAdmin, canManageIngredients, loading: permissionsLoading } = useAdminRole();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { data: ingredientsData, isLoading, error } = useIngredients(currentPage, pageSize);
  
  console.log('Ingredients page - currentPage:', currentPage, 'pageSize:', pageSize);
  console.log('Ingredients page - ingredientsData:', ingredientsData);
  console.log('Ingredients page - error:', error);
  const createIngredient = useCreateIngredient();
  const updateIngredient = useUpdateIngredient();
  const deleteIngredient = useDeleteIngredient();
  const [showForm, setShowForm] = useState(false);
  
  const ingredients = ingredientsData?.data || [];
  const totalItems = ingredientsData?.total || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  useEffect(() => {
    if (!permissionsLoading && !canManageIngredients) {
      navigate('/');
    }
  }, [canManageIngredients, permissionsLoading, navigate]);

  const handleCreateIngredient = async (data: CreateIngredientRequest) => {
    try {
      await createIngredient.mutateAsync(data);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create ingredient:', error);
    }
  };

  const handleUpdateIngredient = async (id: number, data: UpdateIngredientRequest) => {
    try {
      await updateIngredient.mutateAsync({ id, data });
    } catch (error) {
      console.error('Failed to update ingredient:', error);
    }
  };

  const handleDeleteIngredient = async (id: number) => {
    try {
      await deleteIngredient.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete ingredient:', error);
    }
  };

  if (permissionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!canManageIngredients) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">Failed to load ingredients: {error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Ingredients Management</h1>
              <p className="text-gray-600 text-lg">Manage restaurant ingredients and inventory</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
            >
              Back to Home
            </button>
          </div>
        </div>

        <IngredientsTable
          ingredients={ingredients || []}
          onUpdate={handleUpdateIngredient}
          onDelete={handleDeleteIngredient}
          isLoading={isLoading || createIngredient.isPending || updateIngredient.isPending || deleteIngredient.isPending}
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

        {showForm && (
          <IngredientForm
            onSubmit={handleCreateIngredient}
            onCancel={() => setShowForm(false)}
            isLoading={createIngredient.isPending}
          />
        )}
      </div>
    </div>
  );
}
