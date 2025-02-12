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

  // Axios 인스턴스 생성
  const groupAxios: AxiosInstance = axios.create({
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
        failedQueue.push(() => resolve(originalRequest().then(() => true).catch(() => false)));
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
   * 그룹 목록 조회 요청 함수
   * @returns 그룹 목록 데이터
   */
  const getGroups = useCallback((): Promise<GetGroupListResponse> => {
    const request = () => axios.get(`${baseURL}/v1/groups`, withAuthHeader()).then(res => res.data.data);
    return apiRequest(request, getGroups);
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 그룹 상세 정보 조회 요청 함수
   * @param groupId - 그룹 ID
   * @returns 그룹 상세 정보 데이터
   */
  const getGroupDetails = useCallback((groupId: number): Promise<GetGroupDetailsResponse> => {
    const request = () => axios.get(`${baseURL}/v1/groups/${groupId}`, withAuthHeader()).then(res => res.data.data);
    return apiRequest(request, () => getGroupDetails(groupId));
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 그룹 이름 중복 확인 요청 함수
   * @param name - 확인할 그룹 이름
   * @returns 중복 여부 데이터
   */
  const checkGroupNameDuplicate = useCallback((name: string): Promise<CheckGroupNameDuplicateResponse> => {
    const request = () => axios.get(`${baseURL}/v1/groups/check-duplicate`, { ...withAuthHeader(), params: { name } }).then(res => res.data.data);
    return apiRequest(request, () => checkGroupNameDuplicate(name));
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 그룹 생성 요청 함수
   * @param data - 생성할 그룹 정보
   * @returns 생성된 그룹 데이터
   */
  const createGroup = useCallback((data: Record<string, unknown>): Promise<GroupCreateResponse> => {
    const request = () => axios.post(`${baseURL}/v1/groups`, data, withAuthHeader()).then(res => res.data.data);
    return apiRequest(request, () => createGroup(data));
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 그룹 이름 수정 요청 함수
   * @param groupId - 그룹 ID
   * @param name - 새로운 그룹 이름
   * @returns 수정 성공 여부
   */
  const updateGroupName = useCallback((groupId: number, name: string): Promise<boolean> => {
    const request = () => axios.patch(`${baseURL}/v1/groups/${groupId}`, { name }, withAuthHeader()).then(() => true);
    return apiRequest(request, () => updateGroupName(groupId, name));
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 그룹 삭제 요청 함수
   * @param groupId - 그룹 ID
   * @returns 삭제 성공 여부
   */
  const deleteGroup = useCallback((groupId: number): Promise<boolean> => {
    const request = () => axios.delete(`${baseURL}/v1/groups/${groupId}`, withAuthHeader()).then(() => true);
    return apiRequest(request, () => deleteGroup(groupId));
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 그룹 멤버 목록 조회 요청 함수
   * @param groupId - 그룹 ID
   * @returns 그룹 멤버 목록 데이터
   */
  const getGroupMembers = useCallback((groupId: number): Promise<GetGroupMembersResponse> => {
    const request = () => axios.get(`${baseURL}/v1/groups/${groupId}/users`, withAuthHeader()).then(res => res.data.data);
    return apiRequest(request, () => getGroupMembers(groupId));
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 그룹 초대 링크 조회 요청 함수
   * @param groupId - 그룹 ID
   * @returns 초대 링크 데이터
   */
  const getInvitationLink = useCallback((groupId: number): Promise<GroupInviteLinkResponse> => {
    const request = () => axios.get(`${baseURL}/v1/groups/${groupId}/invitation`, withAuthHeader()).then(res => res.data.data);
    return apiRequest(request, () => getInvitationLink(groupId));
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 그룹 초대 링크 생성 요청 함수
   * @param groupId - 그룹 ID
   * @returns 생성된 초대 링크 데이터
   */
  const createInvitationLink = useCallback((groupId: number): Promise<GroupInviteLinkResponse> => {
    const request = () => axios.post(`${baseURL}/v1/groups/${groupId}/invitation`, null, withAuthHeader()).then(res => res.data.data);
    return apiRequest(request, () => createInvitationLink(groupId));
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 그룹 참여 요청 함수
   * @param groupId - 그룹 ID
   * @param code - 초대 코드
   * @returns 그룹 참여 결과 데이터
   */
  const joinGroup = useCallback((groupId: number, code: string): Promise<JoinGroupResponse> => {
    const request = () => axios.post(`${baseURL}/v1/groups/${groupId}/join`, { code }, withAuthHeader()).then(res => res.data.data);
    return apiRequest(request, () => joinGroup(groupId, code));
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 그룹 탈퇴 요청 함수
   * @param groupId - 그룹 ID
   * @returns 탈퇴 성공 여부
   */
  const leaveGroup = useCallback((groupId: number): Promise<boolean> => {
    const request = () => axios.delete(`${baseURL}/v1/groups/${groupId}/quit`, withAuthHeader()).then(() => true);
    return apiRequest(request, () => leaveGroup(groupId));
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 그룹 멤버 역할 수정 요청 함수
   * @param groupId - 그룹 ID
   * @param userId - 사용자 ID
   * @param role - 수정할 역할 (e.g., 'admin', 'member')
   * @returns 수정된 역할 데이터
   */
  const updateMemberRole = useCallback((groupId: number, userId: number, role: string): Promise<UpdateMemberRoleResponse> => {
    const request = () => axios.patch(`${baseURL}/v1/groups/${groupId}/users/${userId}`, { role }, withAuthHeader()).then(res => res.data.data);
    return apiRequest(request, () => updateMemberRole(groupId, userId, role));
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 그룹 멤버 추방 요청 함수
   * @param groupId - 그룹 ID
   * @param userId - 사용자 ID
   * @returns 추방 성공 여부
   */
  const expelMember = useCallback((groupId: number, userId: number): Promise<boolean> => {
    const request = () => axios.delete(`${baseURL}/v1/groups/${groupId}/users/${userId}`, withAuthHeader()).then(() => true);
    return apiRequest(request, () => expelMember(groupId, userId));
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 그룹 소유권 위임 요청 함수
   * @param groupId - 그룹 ID
   * @param newOwnerId - 새로운 소유자 ID
   * @returns 위임 성공 여부
   */
  const delegateOwner = useCallback((groupId: number, newOwnerId: number): Promise<boolean> => {
    const request = () => axios.patch(`${baseURL}/v1/groups/${groupId}/users/delegation`, { newOwnerId }, withAuthHeader()).then(() => true);
    return apiRequest(request, () => delegateOwner(groupId, newOwnerId));
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 그룹 사양 추가 요청 함수
   * @param groupId - 그룹 ID
   * @param specData - 추가할 사양 데이터
   * @returns 추가 성공 여부
   */
  const addSpec = useCallback((groupId: number, specData: Record<string, unknown>): Promise<boolean> => {
    const request = () => axios.post(`${baseURL}/v1/groups/${groupId}/spec`, specData, withAuthHeader()).then(() => true);
    return apiRequest(request, () => addSpec(groupId, specData));
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 그룹 사양 수정 요청 함수
   * @param groupId - 그룹 ID
   * @param specId - 수정할 사양 ID
   * @param specData - 수정할 사양 데이터
   * @returns 수정 성공 여부
   */
  const updateSpec = useCallback((groupId: number, specId: number, specData: Record<string, unknown>): Promise<boolean> => {
    const request = () => axios.patch(`${baseURL}/v1/groups/${groupId}/spec/${specId}`, specData, withAuthHeader()).then(() => true);
    return apiRequest(request, () => updateSpec(groupId, specId, specData));
  }, [baseURL, withAuthHeader, apiRequest]);

  /**
   * 그룹 사양 삭제 요청 함수
   * @param groupId - 그룹 ID
   * @param specId - 삭제할 사양 ID
   * @returns 삭제 성공 여부
   */
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
