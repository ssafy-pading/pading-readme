import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosInstance } from 'axios';
import { refreshJwt } from './refreshJwt';
import {
  CheckGroupNameDuplicateResponse,
  GetGroupDetailsResponse,
  GetGroupListResponse,
  GetGroupMembersResponse,
  GroupCreateResponse,
  GroupInviteLinkResponse,
  JoinGroupResponse,
  UpdateMemberRoleResponse,
} from '../types/groupApiResponse';

let isRefreshing = false; // 토큰 갱신 플래그
let failedQueue: (() => void)[] = []; // 실패한 요청 재시도를 위한 큐

const useGroupAxios = () => {
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_APP_API_BASE_URL;

  const groupAxios: AxiosInstance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });

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
        failedQueue.push(() => resolve(originalRequest().then(() => true).catch(() => false)));
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

  const getGroups = useCallback((): Promise<GetGroupListResponse> => {
    const request = () => axios.get(`${baseURL}/v1/groups`, withAuthHeader()).then(res => res.data.data);
    return apiRequest(request, getGroups);
  }, [baseURL, withAuthHeader, apiRequest]);

  const getGroupDetails = useCallback((groupId: number): Promise<GetGroupDetailsResponse> => {
    const request = () => axios.get(`${baseURL}/v1/groups/${groupId}`, withAuthHeader()).then(res => res.data.data);
    return apiRequest(request, () => getGroupDetails(groupId));
  }, [baseURL, withAuthHeader, apiRequest]);

  const checkGroupNameDuplicate = useCallback((name: string): Promise<CheckGroupNameDuplicateResponse> => {
    const request = () => axios.get(`${baseURL}/v1/groups/check-duplicate`, { ...withAuthHeader(), params: { name } }).then(res => res.data.data);
    return apiRequest(request, () => checkGroupNameDuplicate(name));
  }, [baseURL, withAuthHeader, apiRequest]);

  const createGroup = useCallback((data: Record<string, unknown>): Promise<GroupCreateResponse> => {
    const request = () => axios.post(`${baseURL}/v1/groups`, data, withAuthHeader()).then(res => res.data.data);
    return apiRequest(request, () => createGroup(data));
  }, [baseURL, withAuthHeader, apiRequest]);

  const updateGroupName = useCallback((groupId: number, name: string): Promise<boolean> => {
    const request = () => axios.patch(`${baseURL}/v1/groups/${groupId}`, { name }, withAuthHeader()).then(() => true);
    return apiRequest(request, () => updateGroupName(groupId, name));
  }, [baseURL, withAuthHeader, apiRequest]);

  const deleteGroup = useCallback((groupId: number): Promise<boolean> => {
    const request = () => axios.delete(`${baseURL}/v1/groups/${groupId}`, withAuthHeader()).then(() => true);
    return apiRequest(request, () => deleteGroup(groupId));
  }, [baseURL, withAuthHeader, apiRequest]);

  const getGroupMembers = useCallback((groupId: number): Promise<GetGroupMembersResponse> => {
    const request = () => axios.get(`${baseURL}/v1/groups/${groupId}/users`, withAuthHeader()).then(res => res.data.data);
    return apiRequest(request, () => getGroupMembers(groupId));
  }, [baseURL, withAuthHeader, apiRequest]);

  const getInvitationLink = useCallback((groupId: number): Promise<GroupInviteLinkResponse> => {
    const request = () => axios.get(`${baseURL}/v1/groups/${groupId}/invitation`, withAuthHeader()).then(res => res.data.data);
    return apiRequest(request, () => getInvitationLink(groupId));
  }, [baseURL, withAuthHeader, apiRequest]);

  const createInvitationLink = useCallback((groupId: number): Promise<GroupInviteLinkResponse> => {
    const request = () => axios.post(`${baseURL}/v1/groups/${groupId}/invitation`, null, withAuthHeader()).then(res => res.data.data);
    return apiRequest(request, () => createInvitationLink(groupId));
  }, [baseURL, withAuthHeader, apiRequest]);

  const joinGroup = useCallback((groupId: number, code: string): Promise<JoinGroupResponse> => {
    const request = () => axios.post(`${baseURL}/v1/groups/${groupId}/join`, { code }, withAuthHeader()).then(res => res.data.data);
    return apiRequest(request, () => joinGroup(groupId, code));
  }, [baseURL, withAuthHeader, apiRequest]);

  const leaveGroup = useCallback((groupId: number): Promise<boolean> => {
    const request = () => axios.delete(`${baseURL}/v1/groups/${groupId}/quit`, withAuthHeader()).then(() => true);
    return apiRequest(request, () => leaveGroup(groupId));
  }, [baseURL, withAuthHeader, apiRequest]);

  const updateMemberRole = useCallback((groupId: number, userId: number, role: string): Promise<UpdateMemberRoleResponse> => {
    const request = () => axios.patch(`${baseURL}/v1/groups/${groupId}/users/${userId}`, { role }, withAuthHeader()).then(res => res.data.data);
    return apiRequest(request, () => updateMemberRole(groupId, userId, role));
  }, [baseURL, withAuthHeader, apiRequest]);

  const expelMember = useCallback((groupId: number, userId: number): Promise<boolean> => {
    const request = () => axios.delete(`${baseURL}/v1/groups/${groupId}/users/${userId}`, withAuthHeader()).then(() => true);
    return apiRequest(request, () => expelMember(groupId, userId));
  }, [baseURL, withAuthHeader, apiRequest]);

  const delegateOwner = useCallback((groupId: number, newOwnerId: number): Promise<boolean> => {
    const request = () => axios.patch(`${baseURL}/v1/groups/${groupId}/users/delegation`, { newOwnerId }, withAuthHeader()).then(() => true);
    return apiRequest(request, () => delegateOwner(groupId, newOwnerId));
  }, [baseURL, withAuthHeader, apiRequest]);

  const addSpec = useCallback((groupId: number, specData: Record<string, unknown>): Promise<boolean> => {
    const request = () => axios.post(`${baseURL}/v1/groups/${groupId}/spec`, specData, withAuthHeader()).then(() => true);
    return apiRequest(request, () => addSpec(groupId, specData));
  }, [baseURL, withAuthHeader, apiRequest]);

  const updateSpec = useCallback((groupId: number, specId: number, specData: Record<string, unknown>): Promise<boolean> => {
    const request = () => axios.patch(`${baseURL}/v1/groups/${groupId}/spec/${specId}`, specData, withAuthHeader()).then(() => true);
    return apiRequest(request, () => updateSpec(groupId, specId, specData));
  }, [baseURL, withAuthHeader, apiRequest]);

  const deleteSpec = useCallback((groupId: number, specId: number): Promise<boolean> => {
    const request = () => axios.delete(`${baseURL}/v1/groups/${groupId}/spec/${specId}`, withAuthHeader()).then(() => true);
    return apiRequest(request, () => deleteSpec(groupId, specId));
  }, [baseURL, withAuthHeader, apiRequest]);

  return {
    groupAxios,
    getGroups,
    getGroupDetails,
    checkGroupNameDuplicate,
    createGroup,
    updateGroupName,
    deleteGroup,
    getGroupMembers,
    getInvitationLink,
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
