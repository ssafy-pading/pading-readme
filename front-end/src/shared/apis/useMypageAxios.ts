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

  const withAuthHeader = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }, []);

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
   * 프로필 조회
   */
  const getProfile = useCallback((): Promise<GetMyPageResponse> => {
    const request = () => axios.get(`${baseURL}/v1/mypage`, withAuthHeader()).then((res) => res.data.data);
    return apiRequest(request, getProfile);
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 이름(닉네임) 변경
   */
  const updateNickname = useCallback((nickname: string): Promise<UpdateNameResponse> => {
    const request = () =>
      axios.patch(`${baseURL}/v1/mypage`, { nickname }, withAuthHeader()).then((res) => res.data.data);
    return apiRequest(request, () => updateNickname(nickname));
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 로그아웃
   */
  const logout = useCallback(async (): Promise<boolean> => {
    try {
      await axios.delete(`${baseURL}/v1/mypage/logout`, withAuthHeader());
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/');
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }, [baseURL, navigate, withAuthHeader]);

  /**
   * 회원탈퇴
   */
  const deleteAccount = useCallback(async (): Promise<boolean> => {
    try {
      await axios.delete(`${baseURL}/v1/mypage`, withAuthHeader());
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
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
