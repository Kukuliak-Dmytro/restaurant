import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { UserPermissions } from '../types/permissions';
import { getPermissionsByRole, ADMIN_ROLE_ID } from '../types/permissions';
import type { Employee } from '../types/schedule';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        console.log('🔐 [usePermissions] Starting permission check...');
        setLoading(true);
        
        // Get current user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('🔐 [usePermissions] Session check:', {
          hasSession: !!session,
          userEmail: session?.user?.email,
          error: sessionError?.message || 'None'
        });
        
        if (sessionError || !session) {
          console.log('🔐 [usePermissions] No session found, setting guest permissions');
          setError('No active session');
          setPermissions({
            canViewSchedules: false,
            canEditSchedules: false,
            canDeleteSchedules: false,
            canCreateSchedules: false,
            canManageIngredients: false,
            isAdmin: false,
            roleId: 0,
            roleName: 'Guest'
          });
          return;
        }

        console.log('🔐 [usePermissions] Looking up employee record for:', session.user.email);
        
        // Get user's employee record to find role
        const { data: employee, error: employeeError } = await supabase
          .from('employees')
          .select(`
            id,
            full_name,
            email,
            role_id,
            location_id,
            role:role_id (
              id,
              name,
              description
            )
          `)
          .eq('email', session.user.email)
          .single();

        console.log('🔐 [usePermissions] Employee lookup result:', {
          hasEmployee: !!employee,
          roleId: employee?.role_id,
          roleName: employee?.role?.name,
          locationId: employee?.location_id,
          error: employeeError?.message || 'None'
        });

        if (employeeError) {
          console.log('🔐 [usePermissions] Error fetching employee record:', employeeError);
          
          // Check if it's a "not found" error
          if (employeeError.code === 'PGRST116') {
            setError('Employee profile not found - please complete your profile');
          } else {
            setError('Failed to fetch employee record: ' + employeeError.message);
          }
          
          setPermissions({
            canViewSchedules: false,
            canEditSchedules: false,
            canDeleteSchedules: false,
            canCreateSchedules: false,
            canManageIngredients: false,
            isAdmin: false,
            roleId: 0,
            roleName: 'Unknown'
          });
          return;
        }

        if (!employee) {
          console.log('🔐 [usePermissions] Employee record not found for email:', session.user.email);
          setError('Employee record not found - please complete your profile');
          setPermissions({
            canViewSchedules: false,
            canEditSchedules: false,
            canDeleteSchedules: false,
            canCreateSchedules: false,
            canManageIngredients: false,
            isAdmin: false,
            roleId: 0,
            roleName: 'Unknown'
          });
          return;
        }

        const roleId = employee.role_id;
        const roleName = employee.role?.name || 'Unknown';
        
        console.log('🔐 [usePermissions] Calculating permissions for role:', {
          roleId,
          roleName,
          isAdmin: roleId === ADMIN_ROLE_ID,
          adminRoleId: ADMIN_ROLE_ID
        });
        
        const userPermissions = getPermissionsByRole(roleId);
        
        console.log('🔐 [usePermissions] Final permissions:', {
          ...userPermissions,
          roleName
        });
        
        setPermissions({
          ...userPermissions,
          roleName
        });
        
        setCurrentUser(employee as Employee);
        
      } catch (err) {
        console.error('🔐 [usePermissions] Error fetching permissions:', err);
        setError('Failed to fetch permissions');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPermissions();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        fetchUserPermissions();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { permissions, currentUser, loading, error };
};
