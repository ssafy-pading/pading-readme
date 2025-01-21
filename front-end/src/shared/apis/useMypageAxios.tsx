import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for handling mypage-related API requests.
 */
const useMypageAxios = () => {
  const navigate = useNavigate();

  /**
   * Axios 인스턴스를 생성하는 함수
   */
  const createAxiosInstance = (): AxiosInstance => {
    return axios.create({
      baseURL: process.env.REACT_APP_MYPAGE_API_BASE_URL || 'http://localhost:3000',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  const mypageAxios = createAxiosInstance(); // Axios 인스턴스 생성

  /**
   * 요청 인터셉터 설정
   */
  const setupRequestInterceptor = (): number => {
    return mypageAxios.interceptors.request.use(
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
    return mypageAxios.interceptors.response.use(
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
      mypageAxios.interceptors.request.eject(requestInterceptorId);
      mypageAxios.interceptors.response.eject(responseInterceptorId);
    };
  }, [mypageAxios, navigate]);

  /**
   * 프로필 조회
   * @returns 프로필 데이터
   */
  const getProfile = async (): Promise<Record<string, unknown>> => {
    try {
      const response = await mypageAxios.get('/v1/mypage');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  };

  /**
   * 이름(닉네임) 변경
   * @param nickname 새로운 닉네임
   * @returns 변경된 프로필 데이터
   */
  const updateNickname = async (nickname: string): Promise<Record<string, unknown>> => {
    try {
      const response = await mypageAxios.patch('/v1/mypage', { nickname });
      return response.data;
    } catch (error) {
      console.error('Error updating nickname:', error);
      throw error;
    }
  };

  /**
   * 로그아웃
   * @returns 로그아웃 결과
   */
  const logout = async (): Promise<Record<string, unknown>> => {
    try {
      const response = await mypageAxios.delete('/v1/mypage/logout');
      return response.data;
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  /**
   * 회원탈퇴
   * @returns 회원탈퇴 결과
   */
  const deleteAccount = async (): Promise<Record<string, unknown>> => {
    try {
      const response = await mypageAxios.delete('/v1/mypage');
      return response.data;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  // 필요한 메서드와 Axios 인스턴스를 반환
  return {
    mypageAxios,
    getProfile,
    updateNickname,
    logout,
    deleteAccount,
  };
};

export default useMypageAxios;
