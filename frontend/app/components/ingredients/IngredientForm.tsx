import { useState, useEffect } from 'react';
import type { Ingredient, CreateIngredientRequest, UpdateIngredientRequest } from '../../types/ingredients';

interface IngredientFormProps {
  ingredient?: Ingredient;
  onSubmit: (data: CreateIngredientRequest | UpdateIngredientRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const IngredientForm = ({ ingredient, onSubmit, onCancel, isLoading }: IngredientFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    quantity: 0,
  });

  useEffect(() => {
    if (ingredient) {
      setFormData({
        name: ingredient.name,
        description: ingredient.description || '',
        price: ingredient.price,
        quantity: ingredient.quantity,
      });
    }
  }, [ingredient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'quantity' ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-md">
      <div className="bg-white rounded-2xl p-10 w-full max-w-lg shadow-2xl border border-gray-200 transform transition-all duration-300 scale-100">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            {ingredient ? '✏️ Edit Ingredient' : '➕ Add New Ingredient'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="relative">
            <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-3">
              🏷️ Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 transition-all duration-300 hover:bg-white hover:border-gray-300 text-gray-800 font-medium"
              placeholder="Enter ingredient name"
            />
          </div>

          <div className="relative">
            <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-3">
              📝 Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 transition-all duration-300 hover:bg-white hover:border-gray-300 text-gray-800 font-medium resize-none"
              placeholder="Enter ingredient description"
            />
          </div>

          <div className="relative">
            <label htmlFor="price" className="block text-sm font-bold text-gray-700 mb-3">
              💰 Price *
            </label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">$</span>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full pl-10 pr-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 transition-all duration-300 hover:bg-white hover:border-gray-300 text-gray-800 font-medium"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="relative">
            <label htmlFor="quantity" className="block text-sm font-bold text-gray-700 mb-3">
              📦 Quantity *
            </label>
            <div className="relative">
              <span className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold text-sm">units</span>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full pl-5 pr-16 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 transition-all duration-300 hover:bg-white hover:border-gray-300 text-gray-800 font-medium"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-8 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  {ingredient ? '✏️ Update Ingredient' : '➕ Create Ingredient'}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 py-4 px-8 rounded-xl hover:from-gray-300 hover:to-gray-400 font-bold transition-all duration-300 shadow-md hover:shadow-lg"
            >
              ❌ Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
