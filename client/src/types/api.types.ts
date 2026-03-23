/**
 * Shared API response wrappers.
 * Every backend response is wrapped in ApiResponse<T>.
 */

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    message: string;
    data: {
        items: T[];    // generic paginated list
        pagination: Pagination;
    };
    timestamp: string;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
}

/** Convenience type for RTK Query PaginationParams arg */
export interface PaginationParams {
    page?: number;
    limit?: number;
    before?: string; // cursor: message/dm _id
}