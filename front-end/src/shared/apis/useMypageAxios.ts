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

  const withAuthHeader = useCallback(() => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  }), []);

  const handle401Error = useCallback(async (originalRequest: () => Promise<any>) => {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newAccessToken = await refreshJwt();
        if (newAccessToken) {
          failedQueue.forEach((retry) => retry());
          failedQueue = [];
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Failed to refresh token:', error);
        navigate('/');
      } finally {
        isRefreshing = false;
      }
    } else {
      // 이미 갱신중이면 큐에 넣고 대기
      return new Promise((resolve) => {
        failedQueue.push(() => resolve(originalRequest()));
      });
    }
  }, [navigate]);

  /**
   * 프로필 조회
   */
  const getProfile = useCallback(async (): Promise<GetMyPageResponse> => {
    const request = async () => {
      const response = await axios.get(`${baseURL}/v1/mypage`, withAuthHeader());
      return response.data.data;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return getProfile(); // 재요청
      }
      throw error;
    }
  }, [baseURL, handle401Error, withAuthHeader]);

  /**
   * 이름(닉네임) 변경
   */
  const updateNickname = useCallback(async (nickname: string): Promise<UpdateNameResponse> => {
    const request = async () => {
      const response = await axios.patch(`${baseURL}/v1/mypage`, { nickname }, withAuthHeader());
      return response.data.data;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return updateNickname(nickname); // 재요청
      }
      throw error;
    }
  }, [baseURL, handle401Error, withAuthHeader]);

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
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
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
