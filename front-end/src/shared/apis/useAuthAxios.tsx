import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAxiosInstance, setupInterceptors } from './axiosInstance';
import { AxiosInstance } from 'axios';

/**
 * Custom hook for handling authentication-related API requests.
 */
const useAuthAxios = () => {
  const navigate = useNavigate();

  /**
   * Axios 인스턴스를 생성하는 함수
   */
  const authAxios: AxiosInstance = createAxiosInstance(); // Axios 인스턴스 생성

  useEffect(() => {
    // 인터셉터 설정 및 ID 반환
    const { requestInterceptorId, responseInterceptorId } = setupInterceptors(authAxios, navigate);

    // 클린업: 컴포넌트 언마운트 시 인터셉터 제거
    return () => {
      authAxios.interceptors.request.eject(requestInterceptorId);
      authAxios.interceptors.response.eject(responseInterceptorId);
    }; // 인터셉터 설정
  }, [authAxios, navigate]);

  ////////------------이곳에서 추가------------////////

  /**
   * 카카오 로그인
   * @returns 카카오 로그인 응답 데이터
   */
  // const loginWithKakao = async (): Promise<Record<string, unknown>> => {
  //   try {
  //     const response = await authAxios.get('/v1/auth/login/kakao');
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error during Kakao login:', error);
  //     throw error;
  //   }
  // };
  
  /**
   * 구글 로그인
   * @returns 구글 로그인 응답 데이터
   */
  const loginWithGoogle = async (): Promise<void> => {
    try {
      // const response:GoogleLoginResponse = await authAxios.post('/oauth2/authorization/google');
      
      window.location.href = import.meta.env.VITE_APP_API_BASE_URL + "/oauth2/authorization/google";
      // 로컬 스토리지에 토큰 저장
      // localStorage.setItem("accessToken", response.accessToken);
      // localStorage.setItem("refreshToken", response.refreshToken);
      // const userProfile:GetMyPageResponse = await getProfile();

      // return userProfile;
    } catch (error) {
      console.error('Error during Google login:', error);
      throw error;
    }
  };

  /**
   * JWT 유효성 검사
   * @returns 유효성 검사 결과
   */
  const validateJwt = async (): Promise<boolean> => {
    try {
      const response = await authAxios.get('/v1/auth/validate');
      return response.data = true;
    } catch (error) {
      console.error('Error validating JWT:', error);
      throw error;
    }
  };

  // 필요한 메서드와 Axios 인스턴스를 반환
  return {
    authAxios,
    // loginWithKakao,
    loginWithGoogle,
    validateJwt,
  };
};

export default useAuthAxios;
