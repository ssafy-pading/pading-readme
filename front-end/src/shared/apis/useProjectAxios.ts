import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosInstance } from 'axios';
import { refreshJwt } from './refreshJwt';
import {
  AccessProjectResponse,
  CreateProjectResponse,
  GetLanguageListResponse,
  GetMemberListResponse,
  GetOSListResponse,
  GetPerformanceListResponse,
  GetProjectDetailsResponse,
  GetProjectListResponse,
  GetProjectMemberStatusResponse,
} from '../types/projectApiResponse';

let isRefreshing = false; // 토큰 갱신 플래그
let failedQueue: (() => void)[] = []; // 실패한 요청 재시도를 위한 큐

const useProjectAxios = () => {
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_APP_API_BASE_URL;

  // Axios 인스턴스 생성
  const projectAxios: AxiosInstance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });

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
  const apiRequest = useCallback(async (request: () => Promise<any>, retryCallback: () => Promise<any>) => {
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
  }, [handle401Error]);

  /**
   * 언어 목록 조회 요청 함수
   * @returns 언어 목록 데이터
   */
  const getLanguages = useCallback((): Promise<GetLanguageListResponse> => {
    const request = () => axios.get(`${baseURL}/v1/projects/option/language`, withAuthHeader()).then((res) => res.data.data);
    return apiRequest(request, getLanguages);
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 운영체제(OS) 목록 조회 요청 함수
   * @param language - 선택한 언어
   * @returns 운영체제 목록 데이터
   */
  const getOSList = useCallback((language: string): Promise<GetOSListResponse> => {
    const request = () => axios.get(`${baseURL}/v1/projects/option/os?language=${language}`, withAuthHeader()).then((res) => res.data.data);
    return apiRequest(request, () => getOSList(language));
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 성능 목록 조회 요청 함수
   * @returns 성능 목록 데이터
   */
  const getPerformanceList = useCallback((): Promise<GetPerformanceListResponse> => {
    const request = () => axios.get(`${baseURL}/v1/projects/option/performance`, withAuthHeader()).then((res) => res.data.data);
    return apiRequest(request, getPerformanceList);
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 프로젝트 멤버 목록 조회 요청 함수
   * @param groupId - 그룹 ID
   * @returns 프로젝트 멤버 목록 데이터
   */
  const getProjectsMemberList = useCallback((groupId: number): Promise<GetMemberListResponse> => {
    const request = () => axios.get(`${baseURL}/v1/groups/${groupId}/projects/users`, withAuthHeader()).then((res) => res.data.data);
    return apiRequest(request, () => getProjectsMemberList(groupId));
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 프로젝트 목록 조회 요청 함수
   * @param groupId - 그룹 ID
   * @returns 프로젝트 목록 데이터
   */
  const getProjects = useCallback((groupId: number): Promise<GetProjectListResponse> => {
    const request = () => axios.get(`${baseURL}/v1/groups/${groupId}/projects`, withAuthHeader()).then((res) => res.data.data);
    return apiRequest(request, () => getProjects(groupId));
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 프로젝트 생성 요청 함수
   * @param groupId - 그룹 ID
   * @param projectData - 생성할 프로젝트 정보
   * @returns 생성된 프로젝트 데이터
   */
  const createProject = useCallback((groupId: number, projectData: Record<string, unknown>): Promise<CreateProjectResponse> => {
    const request = () => axios.post(`${baseURL}/v1/groups/${groupId}/projects`, projectData, withAuthHeader()).then((res) => res.data.data);
    return apiRequest(request, () => createProject(groupId, projectData));
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 프로젝트 상세 정보 조회 요청 함수
   * @param groupId - 그룹 ID
   * @param projectId - 프로젝트 ID
   * @returns 프로젝트 상세 정보 데이터
   */
  const getProjectDetails = useCallback((groupId: number, projectId: number): Promise<GetProjectDetailsResponse> => {
    const request = () => axios.get(`${baseURL}/v1/groups/${groupId}/projects/${projectId}`, withAuthHeader()).then((res) => res.data.data);
    return apiRequest(request, () => getProjectDetails(groupId, projectId));
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 프로젝트 참여 요청 함수
   * @param groupId - 그룹 ID
   * @param projectId - 프로젝트 ID
   * @returns 프로젝트 접근 결과 데이터
   */
  const joinProject = useCallback((groupId: number, projectId: number): Promise<AccessProjectResponse> => {
    const request = () => axios.post(`${baseURL}/v1/groups/${groupId}/projects/${projectId}/join`, null, withAuthHeader()).then((res) => res.data.data);
    return apiRequest(request, () => joinProject(groupId, projectId));
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 프로젝트 수정 요청 함수
   * @param groupId - 그룹 ID
   * @param projectId - 프로젝트 ID
   * @param projectData - 수정할 프로젝트 정보
   * @returns 수정 성공 여부
   */
  const updateProject = useCallback((groupId: number, projectId: number, projectData: Record<string, unknown>): Promise<boolean> => {
    const request = () => axios.patch(`${baseURL}/v1/groups/${groupId}/projects/${projectId}`, projectData, withAuthHeader()).then(() => true);
    return apiRequest(request, () => updateProject(groupId, projectId, projectData));
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 프로젝트 삭제 요청 함수
   * @param groupId - 그룹 ID
   * @param projectId - 프로젝트 ID
   * @returns 삭제 성공 여부
   */
  const deleteProject = useCallback((groupId: number, projectId: number): Promise<boolean> => {
    const request = () => axios.delete(`${baseURL}/v1/groups/${groupId}/projects/${projectId}`, withAuthHeader()).then(() => true);
    return apiRequest(request, () => deleteProject(groupId, projectId));
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 프로젝트 멤버 상태 조회 요청 함수
   * @param groupId - 그룹 ID
   * @param projectId - 프로젝트 ID
   * @returns 프로젝트 멤버 상태 데이터
   */
  const getProjectMemberStatus = useCallback((groupId: string, projectId: string): Promise<GetProjectMemberStatusResponse> => {
      const request = () => axios.get(`${baseURL}/v1/groups/${groupId}/projects/${projectId}/status`, withAuthHeader()).then((res) => res.data.data);

      return apiRequest(request, () => getProjectMemberStatus(groupId, projectId));
    },
    [baseURL, withAuthHeader, apiRequest]
  );

  return {
    projectAxios,
    getLanguages,
    getOSList,
    getPerformanceList,
    getProjectsMemberList,
    getProjects,
    createProject,
    getProjectDetails,
    joinProject,
    updateProject,
    deleteProject,
    getProjectMemberStatus,
  };
};

export default useProjectAxios;
