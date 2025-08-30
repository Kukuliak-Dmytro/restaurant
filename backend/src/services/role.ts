import type Role from "../types/role";
import supabaseClient from "../utils/supabase";
import { addCreationTimestamps, addUpdateTimestamp } from "../utils/timestamps";

export async function getRoles(): Promise<{data: Role[], error: any}> {
    try {
        const { data, error } = await supabaseClient.from('role').select('*')
        if (error) {
            const enhancedError = {
                ...error,
                context: 'Failed to fetch roles from database',
                operation: 'getRoles'
            };
            return {data: [], error: enhancedError}
        }
        return {data: data || [], error: null}
    } catch (err) {
        return { data: [], error: { message: 'Database connection failed', context: 'getRoles operation failed' } }
    }
}

export async function getRoleById(id: string): Promise<{data: Role | null, error: any}> {
    try {
        if (!id || id.trim() === '') {
            return { data: null, error: { message: 'Role ID is required', code: 'MISSING_ID' } }
        }
        
        const { data, error } = await supabaseClient.from('role').select('*').eq('id', id)
        if (error) {
            const enhancedError = {
                ...error,
                context: `Failed to fetch role with ID: ${id}`,
                operation: 'getRoleById',
                resourceId: id
            };
            return {data: null, error: enhancedError}
        }
        return {data: data?.[0] || null, error: null}
    } catch (err) {
        return { data: null, error: { message: 'Database connection failed', context: 'getRoleById operation failed' } }
    }
}

export async function createRole(role: Partial<Role>): Promise<{data: Role | null, error: any}> {
    try {
        if (!role || Object.keys(role).length === 0) {
            return { data: null, error: { message: 'Role data is required', code: 'MISSING_DATA' } }
        }
        
        // Add created_at and updated_at timestamps
        const createData = addCreationTimestamps(role);
        
        const { data, error } = await supabaseClient.from('role').insert(createData).select()
        if (error) {
            const enhancedError = {
                ...error,
                context: 'Failed to create role in database',
                operation: 'createRole',
                inputData: role
            };
            return {data: null, error: enhancedError}
        }
        return {data: data?.[0] || null, error: null}
    } catch (err) {
        return { data: null, error: { message: 'Database connection failed', context: 'createRole operation failed' } }
    }
}

export async function updateRole(id: string, role: Partial<Role>): Promise<{data: Role | null, error: any}> {
    try {
        if (!id || id.trim() === '') {
            return { data: null, error: { message: 'Role ID is required for update', code: 'MISSING_ID' } }
        }
        
        if (!role || Object.keys(role).length === 0) {
            return { data: null, error: { message: 'Update data is required', code: 'MISSING_DATA' } }
        }
        
        // Add updated_at timestamp
        const updateData = addUpdateTimestamp(role);
        
        const { data, error } = await supabaseClient.from('role').update(updateData).eq('id', id).select()
        if (error) {
            const enhancedError = {
                ...error,
                context: `Failed to update role with ID: ${id}`,
                operation: 'updateRole',
                resourceId: id,
                inputData: role
            };
            return {data: null, error: enhancedError}
        }
        return {data: data?.[0] || null, error: null}
    } catch (err) {
        return { data: null, error: { message: 'Database connection failed', context: 'updateRole operation failed' } }
    }
}

export async function deleteRole(id: string): Promise<{data: Role | null, error: any}> {
    try {
        if (!id || id.trim() === '') {
            return { data: null, error: { message: 'Role ID is required for deletion', code: 'MISSING_ID' } }
        }
        
        const { data, error } = await supabaseClient.from('role').delete().eq('id', id).select()
        if (error) {
            const enhancedError = {
                ...error,
                context: 'Failed to delete role in database',
                operation: 'deleteRole',
                resourceId: id
            };
            return {data: null, error: enhancedError}
        }
        return {data: data?.[0] || null, error: null}
    } catch (err) {
        return { data: null, error: { message: 'Database connection failed', context: 'deleteRole operation failed' } }
    }
}
