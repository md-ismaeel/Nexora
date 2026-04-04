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
        items: T[];
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

export interface PaginationParams {
    page?: number;
    limit?: number;
    before?: string;
}
