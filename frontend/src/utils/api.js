import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:4000/api',
    timeout: 10000,
});

api.interceptors.request.use(cfg => {
    const token = localStorage.getItem('wk_token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

api.interceptors.response.use(
    r => r,
    err => {
        const isLoginPage =
            window.location.pathname === '/login' ||
            window.location.pathname === '/staff';
        const isLoginRequest =
            err.config && err.config.url && (
                err.config.url.includes('/auth/login') ||
                err.config.url.includes('/customers/login')
            );

        // ຖ້າເປັນ request login ທີ່ຜິດ — ບໍ່ redirect, ປ່ອຍໃຫ້ catch() ໃນໜ້ານັ້ນຈັດການ
        if (isLoginRequest) {
            return Promise.reject(err);
        }

        // ຖ້າ 401 ຈາກ request ອື່ນ ແລະ ບໍ່ໄດ້ຢູ່ໜ້າ login ຢູ່ແລ້ວ — redirect
        if (err.response && err.response.status === 401 && !isLoginPage) {
            localStorage.removeItem('wk_token');
            localStorage.removeItem('wk_type');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export default api;