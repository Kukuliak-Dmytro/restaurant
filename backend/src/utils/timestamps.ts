/**
 * Utility functions for timestamp handling across the application
 */

/**
 * Gets the current timestamp in ISO string format
 */
export function getCurrentTimestamp(): string {
    return new Date().toISOString();
}

/**
 * Adds created_at and updated_at timestamps to data for creation
 */
export function addCreationTimestamps<T extends Record<string, any>>(data: T): T & { created_at: string; updated_at: string } {
    return {
        ...data,
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp()
    };
}

/**
 * Adds updated_at timestamp to data for updates
 */
export function addUpdateTimestamp<T extends Record<string, any>>(data: T): T & { updated_at: string } {
    return {
        ...data,
        updated_at: getCurrentTimestamp()
    };
}

/**
 * Formats a timestamp for display
 */
export function formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString();
}

/**
 * Checks if a timestamp is recent (within the last hour)
 */
export function isRecentTimestamp(timestamp: string, hours: number = 1): boolean {
    const timestampDate = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - timestampDate.getTime()) / (1000 * 60 * 60);
    return diffInHours <= hours;
}
