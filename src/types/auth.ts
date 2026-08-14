export interface LoginRequest {
    username: string;
    password: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'CUSTOMER' | 'SUPERADMIN';
    photoUrl: string;
    phone?: string;
    locationId?: number | null;
}

export interface LoginResponse {
    status: string;
    message: string;
    data: {
        token: string;
        user: User;
    };
}

export interface AuthError {
    status: string;
    message: string;
}

export interface LogoutResponse {
    status: string;
    message: string;
}

export interface RefreshTokenResponse {
    status: string;
    message: string;
    data: {
        token: string;
        user: User;
    };
}
