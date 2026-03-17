// Generic API response wrapper — matches backend sendSuccess / sendCreated shape
export interface ApiResponse<T = null> {
    success: boolean;
    message: string;
    data: T;
}

// Paginated list response
export interface PaginatedResponse<T> {
    success: boolean;
    message: string;
    data: {
        items: T[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

// Common query params
export interface PaginationParams {
    page?: number;
    limit?: number;
}