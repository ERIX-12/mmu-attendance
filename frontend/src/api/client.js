import axios from 'axios';
import useAuthStore from '../context/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`,
    headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: attach access token ─────────────────────────────────
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ─── Response interceptor: refresh token on 401 ───────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }
            originalRequest._retry = true;
            isRefreshing = true;
            const refresh = useAuthStore.getState().refreshToken;
            try {
                const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh });
                useAuthStore.getState().setTokens(data.access, refresh);
                processQueue(null, data.access);
                originalRequest.headers.Authorization = `Bearer ${data.access}`;
                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                useAuthStore.getState().logout();
                window.location.href = '/login';
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
    login: (credentials) => api.post('auth/token/', credentials),
    register: (userData) => api.post('auth/register/', userData),
    resetPassword: (data) => api.post('auth/reset-password/', data),
    refresh: (refresh) => api.post('auth/token/refresh/', { refresh }),
    blacklist: (refresh) => api.post('auth/token/blacklist/', { refresh }),
    me: () => api.get('auth/users/me/'),
    listUsers: (params) => api.get('auth/users/', { params }),
    createUser: (data) => api.post('auth/users/', data),
    updateUser: (id, data) => api.patch(`auth/users/${id}/`, data),
    updateMe: (data) => api.patch('auth/users/me/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    deleteUser: (id) => api.delete(`auth/users/${id}/`),
    changePassword: (id, data) => api.post(`auth/users/${id}/change_password/`, data),
};

// ─── Courses ──────────────────────────────────────────────────────────────────
export const coursesApi = {
    list: (params) => api.get('courses/', { params }),
    get: (id) => api.get(`courses/${id}/`),
    create: (data) => api.post('courses/', data),
    update: (id, data) => api.patch(`courses/${id}/`, data),
    delete: (id) => api.delete(`courses/${id}/`),
    enrollments: (params) => api.get('courses/enrollments/', { params }),
    createEnrollment: (data) => api.post('courses/enrollments/', data),
    deleteEnrollment: (id) => api.delete(`courses/enrollments/${id}/`),
    enroll: (id) => api.post(`courses/${id}/enroll/`),
    unenroll: (id) => api.delete(`courses/${id}/unenroll/`),
};

// ─── Sessions ─────────────────────────────────────────────────────────────────
export const sessionsApi = {
    list: (params) => api.get('sessions/', { params }),
    get: (id) => api.get(`sessions/${id}/`),
    create: (data) => api.post('sessions/', data),
    update: (id, data) => api.patch(`sessions/${id}/`, data),
    delete: (id) => api.delete(`sessions/${id}/`),
    activate: (id) => api.post(`sessions/${id}/activate/`),
    deactivate: (id) => api.post(`sessions/${id}/deactivate/`),
    qrRefresh: (id) => api.post(`sessions/${id}/qr_refresh/`),
};

// ─── Attendance ───────────────────────────────────────────────────────────────
export const attendanceApi = {
    list: (params) => api.get('sessions/attendance/records/', { params }),
    getSessionRecords: (id) => api.get(`sessions/${id}/attendance/`),
    markAttendance: (data) => api.post('sessions/attendance/mark/', data),
    summary: (params) => api.get('sessions/attendance/summary/', { params }),
};

// ─── Reports ─────────────────────────────────────────────────────────────────
export const reportsApi = {
    downloadCsv: (courseId, params) =>
        api.get(`reports/${courseId}/csv/`, { params, responseType: 'blob' }),
    downloadPdf: (courseId, params) =>
        api.get(`reports/${courseId}/pdf/`, { params, responseType: 'blob' }),
    belowThreshold: (courseId, params) =>
        api.get(`reports/${courseId}/below-threshold/`, { params }),
    facultyStats: () => api.get('reports/faculties/'),
};

export default api;
