import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import JwtService from "../jwt/index.js";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "";
if (baseURL) {
    axios.defaults.baseURL = baseURL;
}

// Interceptor: ante 401/419, limpiar token y redirigir a login
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        if (status === 401 || status === 419) {
            JwtService.destroyToken();
            if (typeof window !== "undefined" && !window.location.pathname.includes("/admin")) {
                window.location.href = "/";
            }
        }
        return Promise.reject(error);
    }
);

type Slug = string | number;

export interface ApiServiceType {
    setHeader: () => void;
    query<T = unknown>(
        resource: string,
        params?: AxiosRequestConfig,
    ): Promise<AxiosResponse<T>>;
    get<T = unknown>(resource: string, slug?: Slug): Promise<AxiosResponse<T>>;
    post<T = unknown, D = unknown>(
        resource: string,
        params?: D,
    ): Promise<AxiosResponse<T>>;
    update<T = unknown, D = unknown>(
        resource: string,
        slug: Slug,
        params?: D,
    ): Promise<AxiosResponse<T>>;
    put<T = unknown, D = unknown>(
        resource: string,
        params?: D,
    ): Promise<AxiosResponse<T>>;
    delete<T = unknown>(resource: string): Promise<AxiosResponse<T>>;
}

/**
 * Service to call HTTP request via Axios
 */
const ApiService: ApiServiceType = {
    /**
     * Set the default HTTP request headers
     */
    setHeader() {
        axios.defaults.headers.common["Authorization"] =
            `Bearer ${JwtService.getToken()}`;
        axios.defaults.headers.common["Accept"] = `application/json`;
    },

    query(resource, params) {
        return axios.get(resource, params);
    },

    /**
     * Send the GET HTTP request
     * @param resource
     * @param slug
     * @returns {*}
     */
    get(resource, slug = "") {
        return axios.get(`${resource}/${slug}`);
    },

    /**
     * Set the POST HTTP request
     * @param resource
     * @param params
     * @returns {*}
     */
    post(resource, params) {
        return axios.post(`${resource}`, params);
    },

    /**
     * Send the UPDATE HTTP request
     * @param resource
     * @param slug
     * @param params
     * @returns {IDBRequest<IDBValidKey> | Promise<void>}
     */
    update(resource, slug, params) {
        return axios.put(`${resource}/${slug}`, params);
    },

    /**
     * Send the PUT HTTP request
     * @param resource
     * @param params
     * @returns {IDBRequest<IDBValidKey> | Promise<void>}
     */
    put(resource, params) {
        return axios.put(`${resource}`, params);
    },

    /**
     * Send the DELETE HTTP request
     * @param resource
     * @returns {*}
     */
    delete(resource) {
        return axios.delete(resource);
    },
};

export default ApiService;
