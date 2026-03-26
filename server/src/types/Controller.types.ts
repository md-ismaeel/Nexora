import type { Request } from "express";
import type { IUser } from "@/types/models";

//  Augmented request types 
// Every authenticated route has req.user populated by the auth middleware.
// req.clientIp is populated by express-ip or similar middleware.
//
// We use `Omit<Request, "user">` because Express 5's `Request.user` is typed as
// `Express.User | undefined`, which conflicts with the full `IUser` interface.

export interface AuthenticatedRequest extends Omit<Request, "user"> {
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