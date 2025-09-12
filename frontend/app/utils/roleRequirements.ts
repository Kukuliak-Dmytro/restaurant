import type { RoleRequirement, Role } from '../types/schedule';

export const createRoleRequirements = (roles: Role[]): RoleRequirement[] => {
  return roles.map(role => ({
    role_id: role.id,
    role_name: role.name,
    required: true, // For now, all roles are required
    assigned: false,
    assignedEmployees: []
  }));
};

export const updateRoleRequirements = (
  requirements: RoleRequirement[],
  employeeAssignments: any[],
  roles: Role[]
): RoleRequirement[] => {
  return requirements.map(requirement => {
    const assignedEmployees = employeeAssignments.filter(
      assignment => assignment.employee?.role_id === requirement.role_id
    );
    
    return {
      ...requirement,
      assigned: assignedEmployees.length > 0,
      assignedEmployees: assignedEmployees.map(assignment => assignment.employee).filter(Boolean)
    };
  });
};

export const getRequiredRolesCount = (requirements: RoleRequirement[]): number => {
  return requirements.filter(req => req.required).length;
};

export const getAssignedRolesCount = (requirements: RoleRequirement[]): number => {
  return requirements.filter(req => req.required && req.assigned).length;
};

export const getMissingRoles = (requirements: RoleRequirement[]): RoleRequirement[] => {
  return requirements.filter(req => req.required && !req.assigned);
};

export const getCompletionPercentage = (requirements: RoleRequirement[]): number => {
  const requiredCount = getRequiredRolesCount(requirements);
  if (requiredCount === 0) return 100;
  
  const assignedCount = getAssignedRolesCount(requirements);
  return Math.round((assignedCount / requiredCount) * 100);
};
