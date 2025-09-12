import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ScheduleDay, ScheduleWeek, EmployeeSchedule, RoleRequirement, ScheduleValidation } from '../types/schedule';

export const useScheduleData = (locationId: number, startDate: string, endDate: string) => {
  const [scheduleWeek, setScheduleWeek] = useState<ScheduleWeek | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateDateRange = (start: string, end: string): string[] => {
    const dates: string[] = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const validateScheduleDay = (day: ScheduleDay): ScheduleValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check if all required roles are assigned
    const missingRoles = day.roleRequirements.filter(req => req.required && !req.assigned);
    
    if (missingRoles.length > 0) {
      errors.push(`Missing required roles: ${missingRoles.map(r => r.role_name).join(', ')}`);
    }

    // Check for double-booked employees
    const employeeIds = day.employees.map(emp => emp.employee_id);
    const duplicateEmployees = employeeIds.filter((id, index) => employeeIds.indexOf(id) !== index);
    
    if (duplicateEmployees.length > 0) {
      errors.push('Some employees are assigned multiple times to the same day');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      roleRequirements: day.roleRequirements
    };
  };

  const fetchScheduleData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const dates = generateDateRange(startDate, endDate);
      
      // Fetch all employees for the location
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select(`
          id,
          full_name,
          role_id,
          location_id,
          role:role_id (
            id,
            name,
            description,
            shift_pay
          )
        `)
        .eq('location_id', locationId);

      if (employeesError) throw employeesError;

      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from('role')
        .select('*');

      if (rolesError) throw rolesError;

      // Fetch existing schedule data
      const { data: scheduleData, error: scheduleError } = await supabase
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

      if (scheduleError) throw scheduleError;

      // Group schedule data by date
      const scheduleByDate = new Map<string, EmployeeSchedule[]>();
      scheduleData?.forEach(item => {
        if (!scheduleByDate.has(item.shift_date)) {
          scheduleByDate.set(item.shift_date, []);
        }
        scheduleByDate.get(item.shift_date)?.push(item as EmployeeSchedule);
      });

      // Create schedule days
      const days: ScheduleDay[] = dates.map(date => {
        const dayEmployees = scheduleByDate.get(date) || [];
        
        // Create role requirements for this day
        const roleRequirements: RoleRequirement[] = roles.map(role => {
          const assignedEmployees = dayEmployees.filter(emp => emp.employee?.role_id === role.id);
          return {
            role_id: role.id,
            role_name: role.name,
            required: true, // All roles are required for now
            assigned: assignedEmployees.length > 0,
            assignedEmployees: assignedEmployees.map(emp => emp.employee!).filter(Boolean)
          };
        });

        const validation = validateScheduleDay({
          date,
          location_id: locationId,
          employees: dayEmployees,
          roleRequirements,
          isComplete: false,
          completionPercentage: 0
        });

        const completionPercentage = Math.round(
          (roleRequirements.filter(req => req.assigned).length / roleRequirements.length) * 100
        );

        return {
          date,
          location_id: locationId,
          employees: dayEmployees,
          roleRequirements,
          isComplete: validation.isValid,
          completionPercentage
        };
      });

      const overallCompletion = Math.round(
        days.reduce((sum, day) => sum + day.completionPercentage, 0) / days.length
      );

      const scheduleWeek: ScheduleWeek = {
        startDate,
        endDate,
        days,
        location_id: locationId,
        overallCompletion
      };

      setScheduleWeek(scheduleWeek);
    } catch (err) {
      console.error('Error fetching schedule data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch schedule data');
    } finally {
      setLoading(false);
    }
  }, [locationId, startDate, endDate]);

  useEffect(() => {
    if (locationId && startDate && endDate) {
      fetchScheduleData();
    }
  }, [fetchScheduleData]);

  return {
    scheduleWeek,
    loading,
    error,
    refetch: fetchScheduleData
  };
};
