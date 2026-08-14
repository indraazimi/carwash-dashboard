import apiClient from '@/api/apiClient';
import { LoginRequest, LoginResponse, RefreshTokenResponse } from '@/types/auth';

export const authService = {
    /**
     * Login user dengan username dan password
     * @param credentials - Object berisi username dan password
     * @returns Promise dengan data user dan token
     */
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>('/auth/login', credentials);

        // Simpan token ke localStorage dan cookies setelah login berhasil
        if (response.data.data.token) {
            const token = response.data.data.token;
            const user = response.data.data.user;

            // Simpan ke localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            if (user.locationId !== undefined && user.locationId !== null) {
                localStorage.setItem('locationId', user.locationId.toString());
            }

            // Simpan ke cookies untuk middleware (encode untuk handle special characters)
            document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 hari
            document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${60 * 60 * 24 * 7}`;
        }

        return response.data;
    },


    /**
     * Logout user - hit API endpoint dan hapus token dari localStorage dan cookies
     */
    logout: async (): Promise<void> => {
        try {
            // Hit API logout endpoint
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.error('Logout API error:', error);
            // Tetap lanjutkan logout di client meskipun API error
        } finally {
            // Hapus dari localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('locationId');

            // Hapus cookies
            document.cookie = 'token=; path=/; max-age=0';
            document.cookie = 'user=; path=/; max-age=0';
        }
    },

    /**
     * Refresh token - mendapatkan token baru dari server
     * @returns Promise dengan token dan user baru
     */
    refreshToken: async (): Promise<RefreshTokenResponse> => {
        const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh');

        // Simpan token baru ke localStorage dan cookies
        if (response.data.data.token) {
            const token = response.data.data.token;
            const user = response.data.data.user;

            // Simpan ke localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            if (user.locationId !== undefined && user.locationId !== null) {
                localStorage.setItem('locationId', user.locationId.toString());
            }

            // Simpan ke cookies dengan max-age 30 hari (sesuai token refresh)
            document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 hari
            document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${60 * 60 * 24 * 30}`;
        }

        return response.data;
    },

    /**
     * Helper function untuk menyimpan token baru (digunakan oleh interceptor)
     */
    setStoredToken: (token: string, user: any) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        if (user?.locationId !== undefined && user?.locationId !== null) {
            localStorage.setItem('locationId', user.locationId.toString());
        }

        // Update cookies
        document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 30}`;
        document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${60 * 60 * 24 * 30}`;
    },

    /**
     * Mendapatkan token dari localStorage
     */
    getToken: (): string | null => {
        return localStorage.getItem('token');
    },

    /**
     * Mendapatkan user dari localStorage
     */
    getUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Mendapatkan locationId dari localStorage
     */
    getLocationId: (): string | null => {
        return localStorage.getItem('locationId');
    },

    /**
     * Cek apakah user sudah login
     */
    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('token');
    },

    /**
     * Heartbeat - update status online secara berkala
     */
    heartbeat: async (): Promise<void> => {
        await apiClient.post('/auth/heartbeat');
    }
};
