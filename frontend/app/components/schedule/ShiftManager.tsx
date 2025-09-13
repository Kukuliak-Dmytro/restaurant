import { useState, useEffect } from 'react';
import type { Shift, ShiftRequest } from '../../types/schedule';
import { apiClient } from '../../lib/apiClient';

interface ShiftManagerProps {
  startDate: string;
  endDate: string;
  onShiftSelect: (shiftDate: string) => void;
  selectedShiftDate?: string;
  canEdit?: boolean;
}

export default function ShiftManager({ 
  startDate, 
  endDate, 
  onShiftSelect, 
  selectedShiftDate,
  canEdit = true
}: ShiftManagerProps) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newShift, setNewShift] = useState<ShiftRequest>({
    shift_date: '',
    started_at: new Date().toISOString()
  });

  useEffect(() => {
    fetchShifts();
  }, [startDate, endDate]);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getShifts(startDate, endDate);
      
      if (response.success && Array.isArray(response.data)) {
        setShifts(response.data);
      } else {
        setError(response.error || 'Failed to fetch shifts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch shifts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newShift.shift_date) {
      setError('Shift date is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.createShift(newShift);
      
      if (response.success) {
        setShifts(prev => [...prev, response.data as Shift]);
        setShowCreateForm(false);
        setNewShift({
          shift_date: '',
          started_at: new Date().toISOString()
        });
      } else {
        setError(response.error || 'Failed to create shift');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create shift');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShift = async (shiftDate: string) => {
    if (!confirm('Are you sure you want to delete this shift?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.deleteShift(shiftDate);
      
      if (response.success) {
        setShifts(prev => prev.filter(shift => shift.shift_date !== shiftDate));
        if (selectedShiftDate === shiftDate) {
          onShiftSelect('');
        }
      } else {
        setError(response.error || 'Failed to delete shift');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete shift');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900">Shift Management</h3>
          {!canEdit && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              View Only
            </span>
          )}
        </div>
        {canEdit && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {showCreateForm ? 'Cancel' : 'Create Shift'}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {showCreateForm && canEdit && (
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h4 className="ml-3 text-lg font-medium text-gray-900">Create New Shift</h4>
          </div>
          
          <form onSubmit={handleCreateShift} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shift Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={newShift.shift_date}
                onChange={(e) => setNewShift(prev => ({ ...prev, shift_date: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
            
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-blue-200">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Create Shift</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="text-md font-medium text-gray-900 mb-3">Available Shifts</h4>
        {loading && shifts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Loading shifts...
          </div>
        ) : shifts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            No shifts found for this period
          </div>
        ) : (
          <div className="space-y-3">
            {shifts.map((shift) => (
              <div
                key={shift.shift_date}
                className={`group flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedShiftDate === shift.shift_date
                    ? 'bg-blue-100 border-blue-300 shadow-md'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:shadow-sm'
                }`}
                onClick={() => onShiftSelect(shift.shift_date)}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        selectedShiftDate === shift.shift_date ? 'bg-blue-600' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {formatDate(shift.shift_date)}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center space-x-4">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          ${shift.profit || 0}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(shift.started_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {canEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteShift(shift.shift_date);
                    }}
                    className="ml-3 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Delete shift"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
