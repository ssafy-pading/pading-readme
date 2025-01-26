import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAxiosInstance, setupInterceptors } from './axiosInstance';
import { AxiosInstance } from 'axios';
import { GetMyPageResponse, UpdateNameResponse } from '../types/mypageApiResponse';

/**
 * Custom hook for handling mypage-related API requests.
 */
const useMypageAxios = () => {
  const navigate = useNavigate();

  /**
   * Axios 인스턴스를 생성하는 함수
   */
  const mypageAxios: AxiosInstance = createAxiosInstance(); // Axios 인스턴스 생성
  
  useEffect(() => {
    // 인터셉터 설정 및 ID 반환
    const { requestInterceptorId, responseInterceptorId } = setupInterceptors(mypageAxios, navigate);

    // 클린업: 컴포넌트 언마운트 시 인터셉터 제거
    return () => {
      mypageAxios.interceptors.request.eject(requestInterceptorId);
      mypageAxios.interceptors.response.eject(responseInterceptorId);
    }; // 인터셉터 설정
  }, [mypageAxios, navigate]);


  ////////------------이곳에서 추가------------////////
  /**
   * 프로필 조회
   * @returns 프로필 데이터
   */
  const getProfile = async (): Promise<GetMyPageResponse> => {
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
  const updateNickname = async (nickname: string): Promise<UpdateNameResponse> => {
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
  const logout = async (): Promise<boolean> => {
    try {
      const response = await mypageAxios.delete('/v1/mypage/logout');
      return response.data = true;
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  /**
   * 회원탈퇴
   * @returns 회원탈퇴 결과
   */
  const deleteAccount = async (): Promise<boolean> => {
    try {
      const response = await mypageAxios.delete('/v1/mypage');
      return response.data = true;
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
