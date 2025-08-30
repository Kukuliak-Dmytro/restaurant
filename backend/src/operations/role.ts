import { getRoles, getRoleById, createRole, updateRole, deleteRole } from "../services/role";
import type Role from "../types/role";

export async function getRolesOperation() {
    try {
        const { data, error } = await getRoles()
        if (error) {
            const enhancedError = {
                ...error,
                layer: 'operation',
                operation: 'getRolesOperation'
            };
            throw enhancedError;
        }
        return data
    } catch (error) {
        // Re-throw with operation context
        if (error && typeof error === 'object' && 'message' in error) {
            throw {
                ...error,
                layer: 'operation',
                operation: 'getRolesOperation'
            };
        }
        throw {
            message: 'Failed to get roles',
            layer: 'operation',
            operation: 'getRolesOperation',
            originalError: error
        };
    }
}

export async function getRoleByIdOperation(id: string){
    try {
        if (!id || id.trim() === '') {
            throw {
                message: 'Role ID is required',
                code: 'MISSING_ID',
                layer: 'operation',
                operation: 'getRoleByIdOperation'
            };
        }

        const { data, error } = await getRoleById(id)
        if (error) {
            const enhancedError = {
                ...error,
                layer: 'operation',
                operation: 'getRoleByIdOperation'
            };
            throw enhancedError;
        }
        return data
    } catch (error) {
        // Re-throw with operation context
        if (error && typeof error === 'object' && 'message' in error) {
            throw {
                ...error,
                layer: 'operation',
                operation: 'getRoleByIdOperation'
            };
        }
        throw {
            message: 'Failed to get role by ID',
            layer: 'operation',
            operation: 'getRoleByIdOperation',
            originalError: error
        };
    }
}

export async function createRoleOperation(role: Partial<Role>) { 
    try {
        if (!role || Object.keys(role).length === 0) {
            throw {
                message: 'Role data is required',
                code: 'MISSING_DATA',
                layer: 'operation',
                operation: 'createRoleOperation'
            };
        }

        const { data, error } = await createRole(role)
        if (error) {
            const enhancedError = {
                ...error,
                layer: 'operation',
                operation: 'createRoleOperation'
            };
            throw enhancedError;
        }
        return data
    } catch (error) {
        // Re-throw with operation context
        if (error && typeof error === 'object' && 'message' in error) {
            throw {
                ...error,
                layer: 'operation',
                operation: 'createRoleOperation'
            };
        }
        throw {
            message: 'Failed to create role',
            layer: 'operation',
            operation: 'createRoleOperation',
            originalError: error
        };
    }
}

export async function updateRoleOperation(id: string, role: Partial<Role>){
    try {
        if (!id || id.trim() === '') {
            throw {
                message: 'Role ID is required for update',
                code: 'MISSING_ID',
                layer: 'operation',
                operation: 'updateRoleOperation'
            };
        }

        if (!role || Object.keys(role).length === 0) {
            throw {
                message: 'Update data is required',
                code: 'MISSING_DATA',
                layer: 'operation',
                operation: 'updateRoleOperation'
            };
        }

        const { data, error } = await updateRole(id, role)
        if (error) {
            const enhancedError = {
                ...error,
                layer: 'operation',
                operation: 'updateRoleOperation'
            };
            throw enhancedError;
        }
        return data
    } catch (error) {
        // Re-throw with operation context
        if (error && typeof error === 'object' && 'message' in error) {
            throw {
                ...error,
                layer: 'operation',
                operation: 'updateRoleOperation'
            };
        }
        throw {
            message: 'Failed to update role',
            layer: 'operation',
            operation: 'updateRoleOperation',
            originalError: error
        };
    }
}

export async function deleteRoleOperation(id: string) {
    try {
        if (!id || id.trim() === '') {
            throw {
                message: 'Role ID is required for deletion',
                code: 'MISSING_ID',
                layer: 'operation',
                operation: 'deleteRoleOperation'
            };
        }

        const { data, error } = await deleteRole(id)
        if (error) {
            const enhancedError = {
                ...error,
                layer: 'operation',
                operation: 'deleteRoleOperation'
            };
            throw enhancedError;
        }
        return data
    } catch (error) {
        // Re-throw with operation context
        if (error && typeof error === 'object' && 'message' in error) {
            throw {
                ...error,
                layer: 'operation',
                operation: 'deleteRoleOperation'
            };
        }
        throw {
            message: 'Failed to delete role',
            layer: 'operation',
            operation: 'deleteRoleOperation',
            originalError: error
        };
    }
}