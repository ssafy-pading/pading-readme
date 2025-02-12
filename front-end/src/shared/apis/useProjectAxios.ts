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

let isRefreshing = false;
let failedQueue: (() => void)[] = [];

const useProjectAxios = () => {
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_APP_API_BASE_URL;

  const projectAxios: AxiosInstance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });

  const withAuthHeader = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }, []);

  const handle401Error = useCallback(async (originalRequest: () => Promise<any>): Promise<boolean> => {
    if (!localStorage.getItem('refreshToken')) {
      console.log('Handling 401, will navigate now.');
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
          console.log('Handling 401, will navigate now.');
          navigate('/');
          return false;
        }
      } catch (error) {
        console.error('Failed to refresh token:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        console.log('Handling 401, will navigate now.');
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

  const getLanguages = useCallback((): Promise<GetLanguageListResponse> => {
    const request = () => axios.get(`${baseURL}/v1/projects/option/language`, withAuthHeader()).then((res) => res.data.data);
    return apiRequest(request, getLanguages);
  }, [baseURL, withAuthHeader, apiRequest]);

  const getOSList = useCallback((language: string): Promise<GetOSListResponse> => {
    const request = () => axios.get(`${baseURL}/v1/projects/option/os?language=${language}`, withAuthHeader()).then((res) => res.data.data);
    return apiRequest(request, () => getOSList(language));
  }, [baseURL, withAuthHeader, apiRequest]);

  const getPerformanceList = useCallback((): Promise<GetPerformanceListResponse> => {
    const request = () => axios.get(`${baseURL}/v1/projects/option/performance`, withAuthHeader()).then((res) => res.data.data);
    return apiRequest(request, getPerformanceList);
  }, [baseURL, withAuthHeader, apiRequest]);

  const getProjectsMemberList = useCallback((groupId: number): Promise<GetMemberListResponse> => {
    const request = () => axios.get(`${baseURL}/v1/groups/${groupId}/projects/users`, withAuthHeader()).then((res) => res.data.data);
    return apiRequest(request, () => getProjectsMemberList(groupId));
  }, [baseURL, withAuthHeader, apiRequest]);

  const getProjects = useCallback((groupId: number): Promise<GetProjectListResponse> => {
    const request = () => axios.get(`${baseURL}/v1/groups/${groupId}/projects`, withAuthHeader()).then((res) => res.data.data);
    return apiRequest(request, () => getProjects(groupId));
  }, [baseURL, withAuthHeader, apiRequest]);

  const createProject = useCallback((groupId: number, projectData: Record<string, unknown>): Promise<CreateProjectResponse> => {
    const request = () => axios.post(`${baseURL}/v1/groups/${groupId}/projects`, projectData, withAuthHeader()).then((res) => res.data.data);
    return apiRequest(request, () => createProject(groupId, projectData));
  }, [baseURL, withAuthHeader, apiRequest]);

  const getProjectDetails = useCallback((groupId: number, projectId: number): Promise<GetProjectDetailsResponse> => {
    const request = () => axios.get(`${baseURL}/v1/groups/${groupId}/projects/${projectId}`, withAuthHeader()).then((res) => res.data.data);
    return apiRequest(request, () => getProjectDetails(groupId, projectId));
  }, [baseURL, withAuthHeader, apiRequest]);

  const joinProject = useCallback((groupId: number, projectId: number): Promise<AccessProjectResponse> => {
    const request = () => axios.post(`${baseURL}/v1/groups/${groupId}/projects/${projectId}/join`, null, withAuthHeader()).then((res) => res.data.data);
    return apiRequest(request, () => joinProject(groupId, projectId));
  }, [baseURL, withAuthHeader, apiRequest]);

  const updateProject = useCallback((groupId: number, projectId: number, projectData: Record<string, unknown>): Promise<boolean> => {
    const request = () => axios.patch(`${baseURL}/v1/groups/${groupId}/projects/${projectId}`, projectData, withAuthHeader()).then(() => true);
    return apiRequest(request, () => updateProject(groupId, projectId, projectData));
  }, [baseURL, withAuthHeader, apiRequest]);

  const deleteProject = useCallback((groupId: number, projectId: number): Promise<boolean> => {
    const request = () => axios.delete(`${baseURL}/v1/groups/${groupId}/projects/${projectId}`, withAuthHeader()).then(() => true);
    return apiRequest(request, () => deleteProject(groupId, projectId));
  }, [baseURL, withAuthHeader, apiRequest]);

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
  };
};

export default useProjectAxios;
