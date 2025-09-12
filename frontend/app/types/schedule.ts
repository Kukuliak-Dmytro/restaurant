// Updated types for shift management
export interface Schedule {
  shift_date: string;
  location_id: number;
  employee_id: string;
  created_at: string;
  updated_at?: string;
}

export interface Shift {
  shift_date: string;
  profit?: number;
  started_at: string;
  updated_at?: string;
  admin_id?: string;
}

export interface ShiftRequest {
  shift_date: string;
  profit?: number;
  started_at?: string;
  admin_id?: string;
}

export interface ShiftResponse {
  success: boolean;
  data?: Shift | Shift[];
  error?: string;
  message?: string;
}

export interface EmployeeSchedule {
  shift_date: string;
  location_id: number;
  employee_id: string;
  employee?: Employee;
  location?: RestaurantLocation;
  created_at: string;
  updated_at?: string;
}

export interface Employee {
  id: string;
  full_name: string;
  age: number;
  email: string;
  password_hash: string;
  is_featured: boolean;
  role_id: number;
  location_id: number;
  created_at: string;
  updated_at: string;
  role?: Role;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  shift_pay: number;
  created_at: string;
  updated_at: string;
}

export interface RestaurantLocation {
  id: number;
  address: string;
  employees_count: number;
  budget: number;
  start_construction: string;
  finish_construction?: string;
}

export interface ScheduleDay {
  date: string;
  location_id: number;
  employees: EmployeeSchedule[];
  roleRequirements: RoleRequirement[];
  isComplete: boolean;
  completionPercentage: number;
}

export interface RoleRequirement {
  role_id: number;
  role_name: string;
  required: boolean;
  assigned: boolean;
  assignedEmployees: Employee[];
}

export interface ScheduleWeek {
  startDate: string;
  endDate: string;
  days: ScheduleDay[];
  location_id: number;
  overallCompletion: number;
}

export interface ScheduleValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  roleRequirements: RoleRequirement[];
}

export interface SchedulePermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
  isAdmin: boolean;
}
