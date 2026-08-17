import { PaginationInfo } from "./transaction";

export interface Admin {
    id: number;
    name: string;
    username: string;
    phone: string;
    email: string;
    location: string;
    locationId: number;
    isActive: boolean;
    lastLogin: string | null;
}

export interface AdminManagementData {
    totalAdmin: number;
    activeAdmin: number;
    inactiveAdmin: number;
    loginToday: number;
    admins: Admin[];
}

export interface AdminManagementResponse {
    status: string;
    message: string;
    data: AdminManagementData;
    pagination?: PaginationInfo;
}

export interface UpdateAdminRequest {
    name: string;
    username: string;
    email: string;
    password?: string;
    phone: string;
    locationId: number;
}
