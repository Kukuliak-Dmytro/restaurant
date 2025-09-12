interface UserPermissions {
  canViewSchedules: boolean;
  canEditSchedules: boolean;
  canDeleteSchedules: boolean;
  canCreateSchedules: boolean;
  isAdmin: boolean;
  roleId: number;
  roleName: string;
}

interface PermissionCheck {
  hasPermission: boolean;
  message?: string;
}

const ADMIN_ROLE_ID = 7;

const getPermissionsByRole = (roleId: number): UserPermissions => {
  const isAdmin = roleId === ADMIN_ROLE_ID;
  
  return {
    canViewSchedules: true, // All roles can view schedules
    canEditSchedules: isAdmin,
    canDeleteSchedules: isAdmin,
    canCreateSchedules: isAdmin,
    isAdmin,
    roleId,
    roleName: isAdmin ? 'Admin' : 'Employee'
  };
};

export { UserPermissions, PermissionCheck, ADMIN_ROLE_ID, getPermissionsByRole };