import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for handling Group-related API requests.
 */
const useGroupAxios = () => {
  const navigate = useNavigate();

  /**
   * Axios 인스턴스를 생성하는 함수
   */
  const createAxiosInstance = (): AxiosInstance => {
    return axios.create({
      baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  const groupAxios = createAxiosInstance(); // Axios 인스턴스 생성

  /**
   * 요청 인터셉터 설정
   */
  const setupRequestInterceptor = (): number => {
    return groupAxios.interceptors.request.use(
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
    return groupAxios.interceptors.response.use(
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
      groupAxios.interceptors.request.eject(requestInterceptorId);
      groupAxios.interceptors.response.eject(responseInterceptorId);
    };
  }, [groupAxios, navigate]);

  // API 메서드 구현

  /**
   * 그룹 목록 조회
   */
  const getGroups = async (): Promise<Record<string, unknown>> => {
    return groupAxios.get('/v1/groups').then((response) => response.data);
  };

  /**
   * 그룹 상세 조회
   */
  const getGroupDetails = async (groupId: string): Promise<Record<string, unknown>> => {
    return groupAxios.get(`/v1/groups/${groupId}`).then((response) => response.data);
  };

  /**
   * 그룹명 중복 확인
   */
  const checkGroupNameDuplicate = async (name: string): Promise<Record<string, unknown>> => {
    return groupAxios.get(`/v1/groups/check-duplicate`, { params: { name } }).then((response) => response.data);
  };

  /**
   * 그룹 생성
   */
  const createGroup = async (data: Record<string, unknown>): Promise<Record<string, unknown>> => {
    return groupAxios.post('/v1/groups', data).then((response) => response.data);
  };

  /**
   * 그룹명 변경
   */
  const updateGroupName = async (groupId: string, name: string): Promise<Record<string, unknown>> => {
    return groupAxios.patch(`/v1/groups/${groupId}`, { name }).then((response) => response.data);
  };

  /**
   * 그룹 삭제
   */
  const deleteGroup = async (groupId: string): Promise<void> => {
    return groupAxios.delete(`/v1/groups/${groupId}`).then((response) => response.data);
  };

  /**
   * 그룹 멤버 목록 조회
   */
  const getGroupMembers = async (groupId: string): Promise<Record<string, unknown>> => {
    return groupAxios.get(`/v1/groups/${groupId}/users`).then((response) => response.data);
  };

  /**
   * 그룹 초대 링크 생성
   */
  const createInvitationLink = async (groupId: string): Promise<Record<string, unknown>> => {
    return groupAxios.post(`/v1/groups/${groupId}/invitation`).then((response) => response.data);
  };

  /**
   * 그룹 참가
   */
  const joinGroup = async (groupId: string): Promise<Record<string, unknown>> => {
    return groupAxios.post(`/v1/groups/${groupId}/join`).then((response) => response.data);
  };

  /**
   * 그룹 나가기
   */
  const leaveGroup = async (groupId: string): Promise<void> => {
    return groupAxios.delete(`/v1/groups/${groupId}/quit`).then((response) => response.data);
  };

  /**
   * 멤버 권한 변경
   */
  const updateMemberRole = async (
    groupId: string,
    userId: string,
    role: string
  ): Promise<Record<string, unknown>> => {
    return groupAxios.patch(`/v1/groups/${groupId}/users/${userId}`, { role }).then((response) => response.data);
  };

  /**
   * 멤버 추방
   */
  const expelMember = async (groupId: string, userId: string): Promise<void> => {
    return groupAxios.delete(`/v1/groups/${groupId}/users/${userId}`).then((response) => response.data);
  };

  /**
   * 오너 위임
   */
  const delegateOwner = async (groupId: string, newOwnerId: string): Promise<Record<string, unknown>> => {
    return groupAxios.patch(`/v1/groups/${groupId}/users/delegation`, { newOwnerId }).then((response) => response.data);
  };

  /**
   * 명세서 추가
   */
  const addSpec = async (groupId: string, specData: Record<string, unknown>): Promise<Record<string, unknown>> => {
    return groupAxios.post(`/v1/groups/${groupId}/spec`, specData).then((response) => response.data);
  };

  /**
   * 명세서 수정
   */
  const updateSpec = async (
    groupId: string,
    specId: string,
    specData: Record<string, unknown>
  ): Promise<Record<string, unknown>> => {
    return groupAxios.patch(`/v1/groups/${groupId}/spec/${specId}`, specData).then((response) => response.data);
  };

  /**
   * 명세서 삭제
   */
  const deleteSpec = async (groupId: string, specId: string): Promise<void> => {
    return groupAxios.delete(`/v1/groups/${groupId}/spec/${specId}`).then((response) => response.data);
  };

  return {
    groupAxios,
    getGroups,
    getGroupDetails,
    checkGroupNameDuplicate,
    createGroup,
    updateGroupName,
    deleteGroup,
    getGroupMembers,
    createInvitationLink,
    joinGroup,
    leaveGroup,
    updateMemberRole,
    expelMember,
    delegateOwner,
    addSpec,
    updateSpec,
    deleteSpec,
  };
};

export default useGroupAxios;
