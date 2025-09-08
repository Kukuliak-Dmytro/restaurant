import type Employee from "../types/employee";
import supabaseClient from "../utils/supabase";

export async function getEmployees(): Promise<{data: Employee[], error: any}> {
    try {
        const { data, error } = await supabaseClient.from('employees').select('*')
        if (error) {
            const enhancedError = {
                ...error,
                context: 'Failed to fetch employees from database',
                operation: 'getEmployees'
            };
            return {data: [], error: enhancedError}
        }
        return {data: data || [], error: null}
    } catch (err) {
        return { data: [], error: { message: 'Database connection failed', context: 'getEmployees operation failed' } }
    }
}

export async function getEmployeeById(id: number): Promise<{data: Employee | null, error: any}> {
    try {
        if (!id || isNaN(id)) {
            return { data: null, error: { message: 'Valid employee ID is required', code: 'MISSING_ID' } }
        }
        
        const { data, error } = await supabaseClient.from('employees').select('*').eq('id', id)
        if (error) {
            const enhancedError = {
                ...error,
                context: `Failed to fetch employee with ID: ${id}`,
                operation: 'getEmployeeById',
                resourceId: id
            };
            return {data: null, error: enhancedError}
        }
        return {data: data?.[0] || null, error: null}
    } catch (err) {
        return { data: null, error: { message: 'Database connection failed', context: 'getEmployeeById operation failed' } }
    }
}

export async function createEmployee(employee: Partial<Employee>): Promise<{data: Employee | null, error: any}> {
    try {
        const { data, error } = await supabaseClient.from('employees').insert(employee).select()
        if (error) {
            const enhancedError = {
                ...error,
                context: 'Failed to create employee in database',
                operation: 'createEmployee',
                inputData: employee
            };
            return {data: null, error: enhancedError}
        }
        return {data: data?.[0] || null, error: null}
    } catch (err) {
        return { data: null, error: { message: 'Database connection failed', context: 'createEmployee operation failed' } }
    }
}

export async function updateEmployee(id: number, employee: Partial<Employee>): Promise<{data: Employee | null, error: any}> {

    try {
        if (!id || isNaN(id)) {
            return { data: null, error: { message: 'Valid employee ID is required for update', code: 'MISSING_ID' } }
        }
        
        if (!employee || Object.keys(employee).length === 0) {
            return { data: null, error: { message: 'Update data is required', code: 'MISSING_DATA' } }
        }
        
        const { data, error } = await supabaseClient.from('employees').update(employee).eq('id', id).select()
        if (error) {
            const enhancedError = {
                ...error,
                context: `Failed to update employee with ID: ${id}`,
                operation: 'updateEmployee',
                resourceId: id,
                inputData: employee
            };
            return {data: null, error: enhancedError}
        }
        return {data: data?.[0] || null, error: null}
    } catch (err) {
        return { data: null, error: { message: 'Database connection failed', context: 'updateEmployee operation failed' } }
    }
}

export async function fireEmployee(id: number): Promise<{data: Employee | null, error: any}> {
    try {
        if (!id || isNaN(id)) {
            return { data: null, error: { message: 'Valid employee ID is required for fire', code: 'MISSING_ID' } }
        }
        
        const { data, error } = await supabaseClient.from('employees').update({ is_featured: false }).eq('id', id).select()
        if (error) {
            const enhancedError = {
                ...error,
                context: `Failed to fire employee with ID: ${id}`,
                operation: 'fireEmployee',
                resourceId: id
            };
            return {data: null, error: enhancedError}
        }
        return {data: data?.[0] || null, error: null}
    } catch (err) {
        return { data: null, error: { message: 'Database connection failed', context: 'fireEmployee operation failed' } }
    }
}

export async function getEmployeeByUserId(userId: string): Promise<{data: Employee | null, error: any}> {
    try {
        if (!userId) {
            return { data: null, error: { message: 'Valid user ID is required', code: 'MISSING_USER_ID' } }
        }
        
        const { data, error } = await supabaseClient.from('employees').select('*').eq('id', userId).single()
        if (error) {
            if (error.code === 'PGRST116') { // Not found
                return { data: null, error: null }
            }
            const enhancedError = {
                ...error,
                context: `Failed to fetch employee with user ID: ${userId}`,
                operation: 'getEmployeeByUserId',
                resourceId: userId
            };
            return {data: null, error: enhancedError}
        }
        return {data: data || null, error: null}
    } catch (err) {
        return { data: null, error: { message: 'Database connection failed', context: 'getEmployeeByUserId operation failed' } }
    }
}

export async function upsertEmployeeByUserId(userId: string, employee: Partial<Employee>): Promise<{data: Employee | null, error: any}> {
    try {
        if (!userId) {
            return { data: null, error: { message: 'Valid user ID is required', code: 'MISSING_USER_ID' } }
        }
        
        if (!employee || Object.keys(employee).length === 0) {
            return { data: null, error: { message: 'Employee data is required', code: 'MISSING_DATA' } }
        }
        
        // Add updated_at timestamp
        const employeeData = {
            ...employee,
            updated_at: new Date().toISOString()
        }
        
        const { data, error } = await supabaseClient
            .from('employees')
            .upsert({ 
                id: userId,
                ...employeeData 
            })
            .select()
            .single()
            
        if (error) {
            const enhancedError = {
                ...error,
                context: `Failed to upsert employee with user ID: ${userId}`,
                operation: 'upsertEmployeeByUserId',
                resourceId: userId,
                inputData: employeeData
            };
            return {data: null, error: enhancedError}
        }
        return {data: data || null, error: null}
    } catch (err) {
        return { data: null, error: { message: 'Database connection failed', context: 'upsertEmployeeByUserId operation failed' } }
    }
}