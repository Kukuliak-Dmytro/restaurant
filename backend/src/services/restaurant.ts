import supabaseClient from "../utils/supabase";
import Restaurant from "../types/restaurant";
import { addCreationTimestamps, addUpdateTimestamp } from "../utils/timestamps";

export async function getRestaurants(): Promise<{data: Restaurant[], error: any}> {
    try {
        const { data, error } = await supabaseClient.from('restautant_locations').select('*')
        if (error) {
            const enhancedError = {
                ...error,
                context: 'Failed to fetch restaurants from database',
                operation: 'getRestaurants'
            };
            return {data: [], error: enhancedError}
        }
        return {data: data || [], error: null}
    } catch (err) {
        return { data: [], error: { message: 'Database connection failed', context: 'getRestaurants operation failed' } }
    }
}

export async function getRestaurantById(id: number): Promise<{data: Restaurant | null, error: any}> {
    try {
        if (!id || isNaN(id)) {
            return { data: null, error: { message: 'Valid restaurant ID is required', code: 'MISSING_ID' } }
        }
        
        const { data, error } = await supabaseClient.from('restautant_locations').select('*').eq('id', id)
        if (error) {
            const enhancedError = {
                ...error,
                context: `Failed to fetch restaurant with ID: ${id}`,
                operation: 'getRestaurantById',
                resourceId: id
            };
            return {data: null, error: enhancedError}
        }
        return {data: data?.[0] || null, error: null}
    } catch (err) {
        return { data: null, error: { message: 'Database connection failed', context: 'getRestaurantById operation failed' } }
    }
}

export async function createRestaurant(restaurant: Partial<Restaurant>): Promise<{data: Restaurant | null, error: any}> {
    try {
        if (!restaurant || Object.keys(restaurant).length === 0) {
            return { data: null, error: { message: 'Restaurant data is required', code: 'MISSING_DATA' } }
        }
        
        // Add created_at and updated_at timestamps
        const createData = addCreationTimestamps(restaurant);
        
        const { data, error } = await supabaseClient.from('restautant_locations').insert(createData).select()
        if (error) {
            const enhancedError = {
                ...error,
                context: 'Failed to create restaurant in database',
                operation: 'createRestaurant',
                inputData: restaurant
            };
            return {data: null, error: enhancedError}
        }
        return {data: data?.[0] || null, error: null}
    } catch (err) {
        return { data: null, error: { message: 'Database connection failed', context: 'createRestaurant operation failed' } }
    }
}

export async function updateRestaurant(id: number, restaurant: Partial<Restaurant>): Promise<{data: Restaurant | null, error: any}> {
    try {
        if (!id || isNaN(id)) {
            return { data: null, error: { message: 'Valid restaurant ID is required for update', code: 'MISSING_ID' } }
        }
        
        if (!restaurant || Object.keys(restaurant).length === 0) {
            return { data: null, error: { message: 'Update data is required', code: 'MISSING_DATA' } }
        }
        
        // Add updated_at timestamp
        const updateData = addUpdateTimestamp(restaurant);
        
        const { data, error } = await supabaseClient.from('restautant_locations').update(updateData).eq('id', id).select()
        if (error) {
            const enhancedError = {
                ...error,
                context: `Failed to update restaurant with ID: ${id}`,
                operation: 'updateRestaurant',
                resourceId: id,
                inputData: restaurant
            };
            return {data: null, error: enhancedError}
        }
        return {data: data?.[0] || null, error: null}
    } catch (err) {
        return { data: null, error: { message: 'Database connection failed', context: 'updateRestaurant operation failed' } }
    }
}