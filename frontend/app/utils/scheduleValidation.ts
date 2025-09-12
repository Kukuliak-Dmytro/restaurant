import type { ScheduleDay, ScheduleValidation, RoleRequirement, EmployeeSchedule } from '../types/schedule';

export const validateScheduleDay = (day: ScheduleDay): ScheduleValidation => {
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

  // Check if any employee is assigned to multiple roles on the same day
  const employeeRoleCounts = new Map<string, number>();
  day.employees.forEach(emp => {
    const count = employeeRoleCounts.get(emp.employee_id) || 0;
    employeeRoleCounts.set(emp.employee_id, count + 1);
  });

  const multiRoleEmployees = Array.from(employeeRoleCounts.entries())
    .filter(([_, count]) => count > 1)
    .map(([employeeId, _]) => {
      const employee = day.employees.find(emp => emp.employee_id === employeeId);
      return employee?.employee?.full_name || employeeId;
    });

  if (multiRoleEmployees.length > 0) {
    warnings.push(`Employees assigned to multiple roles: ${multiRoleEmployees.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    roleRequirements: day.roleRequirements
  };
};

export const validateScheduleWeek = (days: ScheduleDay[]): ScheduleValidation => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  
  days.forEach(day => {
    const validation = validateScheduleDay(day);
    allErrors.push(...validation.errors.map(error => `${day.date}: ${error}`));
    allWarnings.push(...validation.warnings.map(warning => `${day.date}: ${warning}`));
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    roleRequirements: days.flatMap(day => day.roleRequirements)
  };
};

export const canAssignEmployee = (
  employeeId: string,
  date: string,
  locationId: number,
  existingAssignments: EmployeeSchedule[]
): { canAssign: boolean; reason?: string } => {
  // Check if employee is already assigned to this date and location
  const existingAssignment = existingAssignments.find(
    assignment => assignment.employee_id === employeeId && 
    assignment.shift_date === date && 
    assignment.location_id === locationId
  );

  if (existingAssignment) {
    return {
      canAssign: false,
      reason: 'Employee is already assigned to this shift'
    };
  }

  return { canAssign: true };
};

export const getScheduleCompletionStatus = (day: ScheduleDay): {
  status: 'complete' | 'incomplete' | 'critical';
  message: string;
  color: string;
} => {
  const validation = validateScheduleDay(day);
  
  if (validation.isValid) {
    return {
      status: 'complete',
      message: 'All required roles assigned',
      color: 'green'
    };
  }

  const missingRoles = day.roleRequirements.filter(req => req.required && !req.assigned);
  
  if (missingRoles.length === day.roleRequirements.length) {
    return {
      status: 'critical',
      message: 'No roles assigned',
      color: 'red'
    };
  }

  return {
    status: 'incomplete',
    message: `${missingRoles.length} roles missing`,
    color: 'yellow'
  };
};
