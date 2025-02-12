import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for handling Project-related API requests.
 */
const useProjectAxios = () => {
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

  const projectAxios = createAxiosInstance(); // Axios 인스턴스 생성

  /**
   * 요청 인터셉터 설정
   */
  const setupRequestInterceptor = (): number => {
    return projectAxios.interceptors.request.use(
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
    return projectAxios.interceptors.response.use(
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
      projectAxios.interceptors.request.eject(requestInterceptorId);
      projectAxios.interceptors.response.eject(responseInterceptorId);
    };
  }, [projectAxios, navigate]);

  // API 메서드 구현

  /**
   * 언어 목록 조회
   */
  const getLanguages = async (): Promise<Record<string, unknown>> => {
    return projectAxios.get('/v1/projects/language').then((response) => response.data);
  };

  /**
   * OS 목록 조회
   */
  const getOSList = async (): Promise<Record<string, unknown>> => {
    return projectAxios.get('/v1/projects/os').then((response) => response.data);
  };

  /**
   * 사양 목록 조회
   */
  const getPerformanceList = async (): Promise<Record<string, unknown>> => {
    return projectAxios.get('/v1/projects/performance').then((response) => response.data);
  };

  /**
   * 프로젝트 목록 조회
   */
  const getProjects = async (groupId: string): Promise<Record<string, unknown>> => {
    return projectAxios.get(`/v1/groups/${groupId}/projects`).then((response) => response.data);
  };

  /**
   * 프로젝트 생성
   */
  const createProject = async (groupId: string, projectData: Record<string, unknown>): Promise<Record<string, unknown>> => {
    return projectAxios.post(`/v1/groups/${groupId}/projects`, projectData).then((response) => response.data);
  };

  /**
   * 프로젝트 상세 조회
   */
  const getProjectDetails = async (
    groupId: string,
    projectId: string
  ): Promise<Record<string, unknown>> => {
    return projectAxios.get(`/v1/groups/${groupId}/projects/${projectId}`).then((response) => response.data);
  };

  /**
   * 프로젝트 입장
   */
  const joinProject = async (
    groupId: string,
    projectId: string
  ): Promise<Record<string, unknown>> => {
    return projectAxios.post(`/v1/groups/${groupId}/projects/${projectId}/join`).then((response) => response.data);
  };

  /**
   * 프로젝트 수정
   */
  const updateProject = async (
    groupId: string,
    projectId: string,
    projectData: Record<string, unknown>
  ): Promise<Record<string, unknown>> => {
    return projectAxios.patch(`/v1/groups/${groupId}/projects/${projectId}`, projectData).then((response) => response.data);
  };

  /**
   * 프로젝트 삭제
   */
  const deleteProject = async (groupId: string, projectId: string): Promise<void> => {
    return projectAxios.delete(`/v1/groups/${groupId}/projects/${projectId}`).then((response) => response.data);
  };

  return {
    projectAxios,
    getLanguages,
    getOSList,
    getPerformanceList,
    getProjects,
    createProject,
    getProjectDetails,
    joinProject,
    updateProject,
    deleteProject,
  };
};

export default useProjectAxios;
