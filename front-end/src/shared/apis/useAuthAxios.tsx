import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for handling authentication-related API requests.
 */
const useAuthAxios = () => {
  const navigate = useNavigate();

  /**
   * Axios 인스턴스를 생성하는 함수
   */
  const createAxiosInstance = (): AxiosInstance => {
    return axios.create({
      baseURL: process.env.REACT_APP_AUTH_API_BASE_URL || 'http://localhost:3000',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  const authAxios = createAxiosInstance(); // Axios 인스턴스 생성

  /**
   * 요청 인터셉터 설정
   */
  const setupRequestInterceptor = (): number => {
    return authAxios.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken'); // 토큰 가져오기
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`; // 인증 헤더 추가
        }
        return config;
      },
      (error) => Promise.reject(error) // 요청 에러 처리
    );
  };

  /**
   * 응답 인터셉터 설정
   */
  const setupResponseInterceptor = (): number => {
    return authAxios.interceptors.response.use(
      (response: AxiosResponse) => response, // 정상 응답 그대로 반환
      (error) => {
        if (error.response?.status === 401) {
          // 인증 실패 처리
          localStorage.removeItem('accessToken'); // 토큰 제거
          navigate('/login'); // 로그인 페이지로 이동
        }
        return Promise.reject(error); // 에러 전달
      }
    );
  };

  /**
   * useEffect로 인터셉터 초기화 및 클린업
   */
  useEffect(() => {
    const requestInterceptorId = setupRequestInterceptor(); // 요청 인터셉터 설정
    const responseInterceptorId = setupResponseInterceptor(); // 응답 인터셉터 설정

    // 클린업: 컴포넌트 언마운트 시 인터셉터 제거
    return () => {
      authAxios.interceptors.request.eject(requestInterceptorId);
      authAxios.interceptors.response.eject(responseInterceptorId);
    };
  }, [authAxios, navigate]);



  ////////------------이곳에서 추가------------////////

  /**
   * 카카오 로그인
   * @returns 카카오 로그인 응답 데이터
   */
  const loginWithKakao = async (): Promise<Record<string, unknown>> => {
    try {
      const response = await authAxios.get('/v1/auth/login/kakao');
      return response.data;
    } catch (error) {
      console.error('Error during Kakao login:', error);
      throw error;
    }
  };

  /**
   * 구글 로그인
   * @returns 구글 로그인 응답 데이터
   */
  const loginWithGoogle = async (): Promise<Record<string, unknown>> => {
    try {
      const response = await authAxios.get('/v1/auth/login/google');
      return response.data;
    } catch (error) {
      console.error('Error during Google login:', error);
      throw error;
    }
  };

  /**
   * JWT 유효성 검사
   * @returns 유효성 검사 결과
   */
  const validateJwt = async (): Promise<Record<string, unknown>> => {
    try {
      const response = await authAxios.get('/v1/auth/validate');
      return response.data;
    } catch (error) {
      console.error('Error validating JWT:', error);
      throw error;
    }
  };

  /**
   * JWT 재발급
   * @returns 새로운 JWT 토큰
   */
  const refreshJwt = async (): Promise<Record<string, unknown>> => {
    try {
      const response = await authAxios.get('/v1/auth/refresh');
      const newToken = response.data?.accessToken;

      if (newToken) {
        localStorage.setItem('accessToken', newToken); // 새로운 토큰 저장
      }

      return response.data;
    } catch (error) {
      console.error('Error refreshing JWT:', error);
      throw error;
    }
  };

  // 필요한 메서드와 Axios 인스턴스를 반환
  return {
    authAxios,
    loginWithKakao,
    loginWithGoogle,
    validateJwt,
    refreshJwt,
  };
};

export default useAuthAxios;
