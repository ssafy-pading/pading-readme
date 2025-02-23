import { useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

const useAuthAxios = () => {
  // const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_APP_API_BASE_URL;

  // 필요에 따라 인증 헤더를 추가하는 함수 (예: 토큰이 필요한 API 요청 시 사용)
  // const withAuthHeader = useCallback(() => ({
  //   headers: {
  //     Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  //   },
  // }), []);

  /**
   * 구글 로그인
   * 기존에는 axiosInstance와 인터셉터를 사용했지만,
   * 여기서는 단순히 OAuth2 엔드포인트로 리다이렉션 합니다.
   */
  const loginWith = useCallback(async (domain:string): Promise<void> => {
    try {
      // 구글 로그인 요청은 리다이렉션으로 처리되므로, 별도의 axios 호출 없이 URL 변경
      window.location.href = `${baseURL}/oauth2/authorization/${domain}`;
    } catch (error) {
      console.error('Error during Google login:', error);
      throw error;
    }
  }, [baseURL]);

  // 아래와 같이 다른 인증 관련 함수들도 axiosInstance 없이 axios를 직접 사용할 수 있습니다.
  // 예시: 카카오 로그인, JWT 유효성 검사 등
  // const loginWithKakao = useCallback(async (): Promise<Record<string, unknown>> => {
  //   try {
  //     const response = await axios.get(`${baseURL}/v1/auth/login/kakao`, withAuthHeader());
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error during Kakao login:', error);
  //     throw error;
  //   }
  // }, [baseURL, withAuthHeader]);
  //
  // const validateJwt = useCallback(async (): Promise<boolean> => {
  //   try {
  //     const response = await axios.get(`${baseURL}/v1/auth/validate`, withAuthHeader());
  //     return response.data === true;
  //   } catch (error) {
  //     console.error('Error validating JWT:', error);
  //     throw error;
  //   }
  // }, [baseURL, withAuthHeader]);

  return {
    loginWith,
    // loginWithKakao,
    // validateJwt,
  };
};

export default useAuthAxios;
