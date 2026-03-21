import type { Request } from "express";
import type { IUser } from "@/types/models";

//  Augmented request types 
// Every authenticated route has req.user populated by the auth middleware.
// req.clientIp is populated by express-ip or similar middleware.

export interface AuthenticatedRequest extends Request {
    user: IUser;
    clientIp?: string;
}

//  Common paginated response 
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
}