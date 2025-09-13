import { useState } from 'react';
import type { Ingredient } from '../../types/ingredients';
import { IngredientForm } from './IngredientForm';

interface IngredientsTableProps {
  ingredients: Ingredient[];
  onUpdate: (id: number, data: any) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export const IngredientsTable = ({ ingredients, onUpdate, onDelete, isLoading }: IngredientsTableProps) => {
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this ingredient?')) {
      onDelete(id);
    }
  };

  const handleFormSubmit = (data: any) => {
    if (editingIngredient) {
      onUpdate(editingIngredient.id, data);
    }
    setShowForm(false);
    setEditingIngredient(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingIngredient(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Ingredients</h2>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
            >
              Add Ingredient
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
              <tr>
                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {ingredients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-gray-500 text-lg">
                    No ingredients found
                  </td>
                </tr>
              ) : (
                ingredients.map((ingredient) => (
                  <tr key={ingredient.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {ingredient.name}
                    </td>
                    <td className="px-8 py-5 text-sm text-gray-600 max-w-xs truncate">
                      {ingredient.description || '-'}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-semibold text-green-600">
                      ${ingredient.price.toFixed(2)}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-semibold text-blue-600">
                      {ingredient.quantity}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEdit(ingredient)}
                          className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-150"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(ingredient.id)}
                          className="text-red-600 hover:text-red-800 font-semibold transition-colors duration-150"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <IngredientForm
          ingredient={editingIngredient || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isLoading={isLoading}
        />
      )}
    </>
  );
};
