import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ScheduleWeek, Employee } from '../types/schedule';

interface UseOptimisticScheduleProps {
  initialSchedule: ScheduleWeek | null;
  employees: Employee[];
  locationId: number;
}

export const useOptimisticSchedule = ({ 
  initialSchedule, 
  employees, 
  locationId 
}: UseOptimisticScheduleProps) => {
  const [optimisticSchedule, setOptimisticSchedule] = useState<ScheduleWeek | null>(initialSchedule);
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());

  // Update optimistic schedule when initial schedule changes
  useEffect(() => {
    if (initialSchedule) {
      setOptimisticSchedule(initialSchedule);
      setLastSyncTime(Date.now());
    }
  }, [initialSchedule]);

  // Helper function to update optimistic schedule
  const updateOptimisticSchedule = useCallback((employeeId: string, date: string, isAdding: boolean) => {
    if (!optimisticSchedule) return;

    const updatedSchedule = {
      ...optimisticSchedule,
      days: optimisticSchedule.days.map(day => {
        if (day.date !== date) return day;

        if (isAdding) {
          // Find employee details
          const employee = employees.find(emp => emp.id === employeeId);
          if (!employee) return day;

          // Check if already assigned
          const alreadyAssigned = day.employees.some(emp => emp.employee_id === employeeId);
          if (alreadyAssigned) return day;

          return {
            ...day,
            employees: [...day.employees, {
              employee_id: employeeId,
              name: employee.name,
              role_id: employee.role_id,
              role_name: employee.role_name || 'Unknown Role',
              employee: employee
            }]
          };
        } else {
          return {
            ...day,
            employees: day.employees.filter(emp => emp.employee_id !== employeeId)
          };
        }
      })
    };

    setOptimisticSchedule(updatedSchedule);
  }, [optimisticSchedule, employees]);

  // Sync with database periodically (every 30 seconds)
  const syncWithDatabase = useCallback(async () => {
    if (!optimisticSchedule || Date.now() - lastSyncTime < 30000) return;

    try {
      // Only fetch schedule data, not employees/roles
      const dates = optimisticSchedule.days.map(day => day.date);
      
      const { data: scheduleData, error } = await supabase
        .from('employees_schedule')
        .select(`
          shift_date,
          employee_id,
          location_id,
          created_at,
          updated_at,
          employee:employee_id (
            id,
            full_name,
            role_id,
            role:role_id (
              id,
              name,
              description,
              shift_pay
            )
          )
        `)
        .eq('location_id', locationId)
        .in('shift_date', dates);

      if (error) throw error;

      // Update schedule with fresh data
      const scheduleByDate = new Map<string, any[]>();
      scheduleData?.forEach(item => {
        if (!scheduleByDate.has(item.shift_date)) {
          scheduleByDate.set(item.shift_date, []);
        }
        scheduleByDate.get(item.shift_date)?.push(item);
      });

      const updatedSchedule = {
        ...optimisticSchedule,
        days: optimisticSchedule.days.map(day => ({
          ...day,
          employees: scheduleByDate.get(day.date) || []
        }))
      };

      setOptimisticSchedule(updatedSchedule);
      setLastSyncTime(Date.now());
    } catch (err) {
      console.error('Error syncing with database:', err);
    }
  }, [optimisticSchedule, locationId, lastSyncTime]);

  // Auto-sync every 30 seconds
  useEffect(() => {
    const interval = setInterval(syncWithDatabase, 30000);
    return () => clearInterval(interval);
  }, [syncWithDatabase]);

  return {
    optimisticSchedule,
    updateOptimisticSchedule,
    syncWithDatabase
  };
};
