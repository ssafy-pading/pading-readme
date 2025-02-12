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
} from '../types/projectApiResponse';

let isRefreshing = false; // 토큰 갱신 플래그
let failedQueue: (() => void)[] = []; // 실패한 요청 재시도를 위한 큐

const useProjectAxios = () => {
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_APP_API_BASE_URL;

  // 참고용으로 Axios 인스턴스를 생성 (필요 시 반환)
  const projectAxios: AxiosInstance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });

  // 각 요청에 Authorization 헤더를 추가하는 함수
  const withAuthHeader = useCallback(() => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  }), []);

  // 401 에러 발생 시 토큰 갱신 후 대기 중인 요청들을 재시도하는 함수
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
      return new Promise((resolve) => {
        failedQueue.push(() => resolve(originalRequest()));
      });
    }
  }, [navigate]);

  /**
   * 언어 목록 조회
   */
  const getLanguages = useCallback(async (): Promise<GetLanguageListResponse> => {
    const request = async () => {
      const response = await axios.get(`${baseURL}/v1/projects/option/language`, withAuthHeader());
      return response.data.data;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return getLanguages();
      }
      throw error;
    }
  }, [baseURL, withAuthHeader, handle401Error]);

  /**
   * OS 목록 조회
   */
  const getOSList = useCallback(async (language: string): Promise<GetOSListResponse> => {
    const request = async () => {
      const response = await axios.get(`${baseURL}/v1/projects/option/os?language=${language}`, withAuthHeader());
      return response.data.data;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return getOSList(language);
      }
      throw error;
    }
  }, [baseURL, withAuthHeader, handle401Error]);

  /**
   * 사양 목록 조회
   */
  const getPerformanceList = useCallback(async (): Promise<GetPerformanceListResponse> => {
    const request = async () => {
      const response = await axios.get(`${baseURL}/v1/projects/option/performance`, withAuthHeader());
      return response.data.data;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return getPerformanceList();
      }
      throw error;
    }
  }, [baseURL, withAuthHeader, handle401Error]);

  /**
   * 멤버 목록 조회
   */
  const getProjectsMemberList = useCallback(async (groupId: number): Promise<GetMemberListResponse> => {
    const request = async () => {
      const response = await axios.get(`${baseURL}/v1/groups/${groupId}/projects/users`, withAuthHeader());
      return response.data.data;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return getProjectsMemberList(groupId);
      }
      throw error;
    }
  }, [baseURL, withAuthHeader, handle401Error]);

  /**
   * 프로젝트 목록 조회
   */
  const getProjects = useCallback(async (groupId: number): Promise<GetProjectListResponse> => {
    const request = async () => {
      const response = await axios.get(`${baseURL}/v1/groups/${groupId}/projects`, withAuthHeader());
      return response.data.data;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return getProjects(groupId);
      }
      throw error;
    }
  }, [baseURL, withAuthHeader, handle401Error]);

  /**
   * 프로젝트 생성
   */
  const createProject = useCallback(async (
    groupId: number,
    projectData: Record<string, unknown>
  ): Promise<CreateProjectResponse> => {
    const request = async () => {
      const response = await axios.post(`${baseURL}/v1/groups/${groupId}/projects`, projectData, withAuthHeader());
      return response.data.data;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return createProject(groupId, projectData);
      }
      throw error;
    }
  }, [baseURL, withAuthHeader, handle401Error]);

  /**
   * 프로젝트 상세 조회
   */
  const getProjectDetails = useCallback(async (
    groupId: number,
    projectId: number
  ): Promise<GetProjectDetailsResponse> => {
    const request = async () => {
      const response = await axios.get(`${baseURL}/v1/groups/${groupId}/projects/${projectId}`, withAuthHeader());
      return response.data.data;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return getProjectDetails(groupId, projectId);
      }
      throw error;
    }
  }, [baseURL, withAuthHeader, handle401Error]);

  /**
   * 프로젝트 입장
   */
  const joinProject = useCallback(async (
    groupId: number,
    projectId: number
  ): Promise<AccessProjectResponse> => {
    const request = async () => {
      const response = await axios.post(`${baseURL}/v1/groups/${groupId}/projects/${projectId}/join`, null, withAuthHeader());
      return response.data.data;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return joinProject(groupId, projectId);
      }
      throw error;
    }
  }, [baseURL, withAuthHeader, handle401Error]);

  /**
   * 프로젝트 수정
   */
  const updateProject = useCallback(async (
    groupId: number,
    projectId: number,
    projectData: Record<string, unknown>
  ): Promise<boolean> => {
    const request = async () => {
      await axios.patch(`${baseURL}/v1/groups/${groupId}/projects/${projectId}`, projectData, withAuthHeader());
      return true;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return updateProject(groupId, projectId, projectData);
      }
      throw error;
    }
  }, [baseURL, withAuthHeader, handle401Error]);

  /**
   * 프로젝트 삭제
   */
  const deleteProject = useCallback(async (
    groupId: number,
    projectId: number
  ): Promise<boolean> => {
    const request = async () => {
      await axios.delete(`${baseURL}/v1/groups/${groupId}/projects/${projectId}`, withAuthHeader());
      return true;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return deleteProject(groupId, projectId);
      }
      throw error;
    }
  }, [baseURL, withAuthHeader, handle401Error]);

  return {
    projectAxios, // 참고용으로 생성한 인스턴스 (필요 시 사용)
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
  };
};

export default useProjectAxios;
