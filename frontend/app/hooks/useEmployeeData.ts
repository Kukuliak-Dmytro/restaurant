import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Employee, Role, RestaurantLocation } from '../types/schedule';

export const useEmployeeData = (locationId: number) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [locations, setLocations] = useState<RestaurantLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch employees for the specific location
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select(`
            id,
            full_name,
            age,
            email,
            is_featured,
            role_id,
            location_id,
            created_at,
            updated_at,
            role:role_id (
              id,
              name,
              description,
              shift_pay,
              created_at,
              updated_at
            )
          `)
          .eq('location_id', locationId);


        if (employeesError) throw employeesError;

        // Fetch all roles
        const { data: rolesData, error: rolesError } = await supabase
          .from('role')
          .select('*');

        if (rolesError) throw rolesError;

        // Fetch all locations
        const { data: locationsData, error: locationsError } = await supabase
          .from('restaurant_locations')
          .select('*');

        if (locationsError) throw locationsError;


        setEmployees(employeesData || []);
        setRoles(rolesData || []);
        setLocations(locationsData || []);
      } catch (err) {
        console.error('Error fetching employee data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch employee data');
      } finally {
        setLoading(false);
      }
    };

    if (locationId) {
      fetchEmployeeData();
    }
  }, [locationId]);

  return {
    employees,
    roles,
    locations,
    loading,
    error
  };
};
