import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { NavigateFunction } from 'react-router-dom';

/**
 * Axios 인스턴스 생성 함수
 */
export const createAxiosInstance = (): AxiosInstance => {
  return axios.create({
    baseURL: import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:3000',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * 인터셉터 설정 함수
 */
export const setupInterceptors = (axiosInstance: AxiosInstance, navigate: NavigateFunction) => {
  // 요청 인터셉터
  const requestInterceptorId = axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig ) => {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 응답 인터셉터
  const responseInterceptorId = axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        navigate('/login');
      }
      return Promise.reject(error);
    }
  );
  // 인터셉터 ID 반환
  return { requestInterceptorId, responseInterceptorId };
};
