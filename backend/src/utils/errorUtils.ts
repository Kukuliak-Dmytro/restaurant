// Utility functions for error handling across the application

/**
 * Maps error codes to appropriate HTTP status codes
 */
export function getStatusFromError(error: any): number {
    // Custom application error codes
    if (error?.code === 'MISSING_ID' || error?.code === 'MISSING_DATA') {
        return 400; // Bad Request
    }
    if (error?.code === 'NOT_FOUND' || error?.code === 'PAGE_NOT_FOUND') {
        return 404; // Not Found
    }
    if (error?.code === 'INVALID_PAGINATION' || error?.code === 'INVALID_DATA') {
        return 400; // Bad Request
    }
    
    // Supabase database error codes
    if (error?.code === '23505') { // Unique violation
        return 409; // Conflict
    }
    if (error?.code === '23503') { // Foreign key violation
        return 400; // Bad Request
    }
    if (error?.code === '42P01') { // Undefined table
        return 500; // Internal Server Error
    }
    if (error?.code === '42703') { // Undefined column
        return 500; // Internal Server Error
    }
    if (error?.code === '23502') { // Not null violation
        return 400; // Bad Request
    }
    if (error?.code === '22P02') { // Invalid text representation
        return 400; // Bad Request
    }
    if (error?.code === '22001') { // String data right truncation
        return 400; // Bad Request
    }
    
    return 500; // Internal Server Error (default)
}

/**
 * Formats error response based on environment
 */
export function formatErrorResponse(error: any, isProduction: boolean) {
    if (isProduction) {
        return {
            error: 'Internal server error',
            code: 'INTERNAL_ERROR'
        };
    }
    
    return {
        error: error?.message || 'An error occurred',
        code: error?.code || 'UNKNOWN_ERROR',
        context: error?.context,
        operation: error?.operation,
        layer: error?.layer,
        details: error?.details || error?.inputData
    };
}

/**
 * Checks if NODE_ENV is set to production
 */
export function isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
}
