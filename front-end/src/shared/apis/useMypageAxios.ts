import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GetMyPageResponse, UpdateNameResponse } from '../types/mypageApiResponse';
import { refreshJwt } from './refreshJwt';

let isRefreshing = false; // 토큰 갱신 플래그
let failedQueue: (() => void)[] = []; // 실패한 요청 재시도를 위한 큐

const useMypageAxios = () => {
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_APP_API_BASE_URL;

  /**
   * Access Token을 Authorization 헤더에 추가하는 함수
   * @returns Authorization 헤더가 포함된 객체
   */
  const withAuthHeader = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }, []);

  /**
   * 401 에러 발생 시 Access Token 갱신을 시도하는 함수
   * @param originalRequest - 재시도할 요청 함수
   * @returns 토큰 갱신 성공 여부
   */
  const handle401Error = useCallback(async (originalRequest: () => Promise<any>): Promise<boolean> => {
    if (!localStorage.getItem('refreshToken')) {
      navigate('/');
      return false;
    }

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newAccessToken = await refreshJwt();
        if (newAccessToken) {
          failedQueue.forEach((retry) => retry());
          failedQueue = [];
          return true;
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigate('/');
          return false;
        }
      } catch (error) {
        console.error('Failed to refresh token:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/');
        return false;
      } finally {
        isRefreshing = false;
      }
    } else {
      return new Promise((resolve) => {
        failedQueue.push(() =>
          originalRequest()
            .then(() => resolve(true))
            .catch(() => resolve(false))
        );
      });
    }
  }, [navigate]);

  /**
   * API 요청을 처리하고 401 에러 발생 시 토큰 갱신 후 재시도하는 함수
   * @param request - 원래의 요청 함수
   * @param retryCallback - 토큰 갱신 후 재시도할 함수
   * @returns 요청 결과 또는 에러
   */
  const apiRequest = useCallback(
    async (request: () => Promise<any>, retryCallback: () => Promise<any>) => {
      try {
        return await request();
      } catch (error: any) {
        if (error.response?.status === 401) {
          const refreshed = await handle401Error(request);
          if (refreshed) {
            return retryCallback();
          }
          throw new Error('Token refresh failed, redirected to login');
        }
        throw error;
      }
    },
    [handle401Error]
  );

  /**
   * 프로필 조회 요청 함수
   * @returns 프로필 데이터
   */
  const getProfile = useCallback((): Promise<GetMyPageResponse> => {
    const request = () => axios.get(`${baseURL}/v1/mypage`, withAuthHeader()).then((res) => res.data.data);
    return apiRequest(request, getProfile);
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 이름(닉네임) 변경 요청 함수
   * @param nickname - 변경할 닉네임
   * @returns 변경된 닉네임 데이터
   */
  const updateNickname = useCallback((nickname: string): Promise<UpdateNameResponse> => {
    const request = () =>
      axios.patch(`${baseURL}/v1/mypage`, { nickname }, withAuthHeader()).then((res) => res.data.data);
    return apiRequest(request, () => updateNickname(nickname));
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 로그아웃 요청 함수
   * @returns 로그아웃 성공 여부
   */
  const logout = useCallback(async (): Promise<boolean> => {
    try {
      await axios.delete(`${baseURL}/v1/mypage/logout`, withAuthHeader());
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('email');
      navigate('/');
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }, [baseURL, navigate, withAuthHeader]);

  /**
   * 회원탈퇴 요청 함수
   * @returns 회원탈퇴 성공 여부
   */
  const deleteAccount = useCallback(async (): Promise<boolean> => {
    try {
      await axios.delete(`${baseURL}/v1/mypage`, withAuthHeader());
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('email');

      navigate('/');
      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }, [baseURL, navigate, withAuthHeader]);

  return {
    getProfile,
    updateNickname,
    logout,
    deleteAccount,
  };
};

export default useMypageAxios;
