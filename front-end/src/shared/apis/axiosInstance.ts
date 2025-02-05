import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { NavigateFunction } from 'react-router-dom';
// import { RefreshJWTResponse } from '../types/authApiResponse';

/**
 * Axios 인스턴스 생성 함수
 */
export const createAxiosInstance = (): AxiosInstance => {
  return axios.create({
    baseURL: import.meta.env.VITE_APP_API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};


const refreshJwt = async (): Promise<string | null> => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_APP_API_BASE_URL}/v1/auth/refresh`, {refreshToken: `Bearer ${sessionStorage.getItem('refreshToken')}`,});
    const newToken = response.data?.data;
    if (newToken) {
      sessionStorage.setItem('accessToken', newToken.accessToken); // 새로운 토큰 저장
      sessionStorage.setItem('refreshToken', newToken.refreshToken); // 새로운 토큰 저장
    }

    return newToken;
  } catch (error) {
    console.error('Error refreshing JWT:', error);
    throw error;
  }
};


/**
 * 인터셉터 설정 함수
 */
export const setupInterceptors = (axiosInstance: AxiosInstance, navigate: NavigateFunction) => {
  // 요청 인터셉터
  const requestInterceptorId = axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig ) => {
      const token = sessionStorage.getItem('accessToken');
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
    async (error) => {

      if (error.response) {
        // 잘못된 요청
        if (error.response?.status === 400) {
          alert('잘못된 요청입니다. 입력값을 다시 확인해주세요.');
        }
        // 인증 필요
        if (error.response?.status === 401) {
          const originalRequest = error.config;

          // 이미 리프레시 시도한 요청인지 확인
          if (!originalRequest._retry) {
            originalRequest._retry = true;
            // 리프레시 토큰으로 액세스 토큰 갱신
            const newAccessToken = await refreshJwt();
            if (newAccessToken) {
              // 새로운 액세스 토큰을 Authorization 헤더에 추가
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

              // 실패했던 요청 재시도
              return axiosInstance(originalRequest);
            } else {
              // 리프레시 실패 시 로그아웃 처리
              sessionStorage.removeItem('accessToken');
              sessionStorage.removeItem('refreshToken');
              // alert('다시 로그인 해 주세요.');
              navigate('/');
            }
          }
        }
        // 권한 없음
        if (error.response?.status === 403) {
          alert('접근 권한이 없습니다. 그룹 오너에게 문의하세요.');
        }
        // 리소스 없음
        if (error.response?.status === 404) {
          alert('요청한 페이지를 찾을 수 없습니다.');
        }
        // 충돌(Conflict)
        if (error.response?.status === 409) {
          alert("이미 이 그룹의 멤버입니다.");
        }
        // 요청 제한 초과
        if (error.response?.status === 429) {
          alert('요청 횟수가 초과되었습니다. 잠시 후 다시 시도해주세요.');
        }
        // 서버 내부 에러
        if (error.response?.status === 500) {
          alert('서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
        // 서비스 불가
        if (error.response?.status === 503) {
          alert('서버가 현재 사용할 수 없습니다. 잠시 후 다시 시도해주세요.');
        }
      }else{
        // 서버와 통신이 되지 않을 경우 처리
        if (error.code === 'ECONNABORTED') {
          // 요청 타임아웃
          console.error('Request timed out:', error.message);
          alert('요청이 타임아웃되었습니다. 네트워크 상태를 확인해주세요.');
        } else {
          // 네트워크 또는 기타 이유로 서버 응답 없음
          console.error('No response from server:', error.message);
          alert('서버와 통신할 수 없습니다. 네트워크 상태를 확인하거나 다시 시도해주세요.');
        }
      }
      return Promise.reject(error);
    }
  );
  // 인터셉터 ID 반환
  return { requestInterceptorId, responseInterceptorId };
};
