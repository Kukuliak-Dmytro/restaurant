import { useState, useEffect } from 'react';
import type { Shift, ShiftRequest } from '../../types/schedule';
import { apiClient } from '../../lib/apiClient';

interface ShiftManagerProps {
  startDate: string;
  endDate: string;
  onShiftSelect: (shiftDate: string) => void;
  selectedShiftDate?: string;
}

export default function ShiftManager({ 
  startDate, 
  endDate, 
  onShiftSelect, 
  selectedShiftDate 
}: ShiftManagerProps) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newShift, setNewShift] = useState<ShiftRequest>({
    shift_date: '',
    profit: 0,
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
          profit: 0,
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
        <h3 className="text-lg font-semibold text-gray-900">Shift Management</h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {showCreateForm ? 'Cancel' : 'Create Shift'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {showCreateForm && (
        <form onSubmit={handleCreateShift} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-md font-medium text-gray-900 mb-3">Create New Shift</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shift Date
              </label>
              <input
                type="date"
                value={newShift.shift_date}
                onChange={(e) => setNewShift(prev => ({ ...prev, shift_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profit
              </label>
              <input
                type="number"
                value={newShift.profit || 0}
                onChange={(e) => setNewShift(prev => ({ ...prev, profit: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-2">
        <h4 className="text-md font-medium text-gray-900 mb-3">Available Shifts</h4>
        {loading && shifts.length === 0 ? (
          <div className="text-center py-4 text-gray-500">Loading shifts...</div>
        ) : shifts.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No shifts found for this period</div>
        ) : (
          <div className="space-y-2">
            {shifts.map((shift) => (
              <div
                key={shift.shift_date}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedShiftDate === shift.shift_date
                    ? 'bg-blue-100 border-blue-300'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => onShiftSelect(shift.shift_date)}
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {formatDate(shift.shift_date)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Profit: ${shift.profit || 0} | Started: {new Date(shift.started_at).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteShift(shift.shift_date);
                  }}
                  className="ml-2 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
