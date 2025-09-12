import { useState, useEffect, useCallback } from 'react';
import type { Shift, ShiftRequest } from '../types/schedule';
import { apiClient } from '../lib/apiClient';

export const useShiftData = (startDate: string, endDate: string) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShifts = useCallback(async () => {
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
  }, [startDate, endDate]);

  const createShift = async (shiftData: ShiftRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.createShift(shiftData);
      
      if (response.success) {
        await fetchShifts();
        return true;
      } else {
        setError(response.error || 'Failed to create shift');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create shift');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateShift = async (shiftDate: string, updateData: Partial<ShiftRequest>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.updateShift(shiftDate, updateData);
      
      if (response.success) {
        await fetchShifts();
        return true;
      } else {
        setError(response.error || 'Failed to update shift');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update shift');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteShift = async (shiftDate: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.deleteShift(shiftDate);
      
      if (response.success) {
        await fetchShifts();
        return true;
      } else {
        setError(response.error || 'Failed to delete shift');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete shift');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getShiftByDate = (shiftDate: string): Shift | undefined => {
    return shifts.find(shift => shift.shift_date === shiftDate);
  };

  const shiftExists = (shiftDate: string): boolean => {
    return shifts.some(shift => shift.shift_date === shiftDate);
  };

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  return {
    shifts,
    loading,
    error,
    createShift,
    updateShift,
    deleteShift,
    getShiftByDate,
    shiftExists,
    refetch: fetchShifts
  };
};
