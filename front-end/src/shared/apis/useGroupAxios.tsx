import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAxiosInstance, setupInterceptors } from './axiosInstance';
import { AxiosInstance } from 'axios';
import { CheckGroupNameDuplicateResponse, GetGroupDetailsResponse, GetGroupListResponse, GetGroupMembersResponse, GroupCreateResponse, GroupInviteLinkResponse, JoinGroupResponse, UpdateMemberRoleResponse } from '../types/groupApiResponse';

/**
 * Custom hook for handling Group-related API requests.
 */
const useGroupAxios = () => {
  const navigate = useNavigate();

  /**
   * Axios 인스턴스를 생성하는 함수
   */
  const groupAxios: AxiosInstance = createAxiosInstance(); // Axios 인스턴스 생성

  useEffect(() => {
    // 인터셉터 설정 및 ID 반환
    const { requestInterceptorId, responseInterceptorId } = setupInterceptors(groupAxios, navigate);

    // 클린업: 컴포넌트 언마운트 시 인터셉터 제거
    return () => {
      groupAxios.interceptors.request.eject(requestInterceptorId);
      groupAxios.interceptors.response.eject(responseInterceptorId);
    }; // 인터셉터 설정
  }, [groupAxios, navigate]);


  ////////------------이곳에서 추가------------////////
  // API 메서드 구현

  /**
   * 그룹 목록 조회
   */
  const getGroups = async (): Promise<GetGroupListResponse> => {
    try {
      const response = await groupAxios.get('/v1/groups');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching group list:', error);
      throw error;
    }
  };

  /**
   * 그룹 상세 조회
   */
  const getGroupDetails = async (groupId: number): Promise<GetGroupDetailsResponse> => {
    try {
      const response = await groupAxios.get(`/v1/groups/${groupId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching details for group ${groupId}:`, error);
      throw error;
    }
  };

  /**
   * 그룹명 중복 확인
   */
  const checkGroupNameDuplicate = async (name: string): Promise<CheckGroupNameDuplicateResponse> => {
    try {
      const response = await groupAxios.get(`/v1/groups/check-duplicate`, { params: { name } });
      return response.data.data;
    } catch (error) {
      console.error(`Error checking group name duplicate for name "${name}":`, error);
      throw error;
    }
  };

  /**
   * 그룹 생성
   */
  const createGroup = async (data: Record<string, unknown>): Promise<GroupCreateResponse> => {
    try {
      const response = await groupAxios.post('/v1/groups', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  };

  /**
   * 그룹명 변경
   */
  const updateGroupName = async (groupId: number, name: string): Promise<boolean> => {
    try {
      await groupAxios.patch(`/v1/groups/${groupId}`, { name });
      return true;
    } catch (error) {
      console.error(`Error updating group name for group ${groupId}:`, error);
      throw error;
    }
  };

  /**
   * 그룹 삭제
   */
  const deleteGroup = async (groupId: number): Promise<boolean> => {
    try {
      await groupAxios.delete(`/v1/groups/${groupId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting group ${groupId}:`, error);
      throw error;
    }
  };

  /**
   * 그룹 멤버 목록 조회
   */
  const getGroupMembers = async (groupId: number): Promise<GetGroupMembersResponse> => {
    try {
      const response = await groupAxios.get(`/v1/groups/${groupId}/users`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching members for group ${groupId}:`, error);
      throw error;
    }
  };

  /**
   * 그룹 초대 링크 조회
   */
  const getInvitationLink = async (groupId: number): Promise<GroupInviteLinkResponse> => {
    try {
      const response = await groupAxios.get(`/v1/groups/${groupId}/invitation`);
      return response.data.data;
    } catch (error) {
      console.error(`Error creating invitation link for group ${groupId}:`, error);
      throw error;
    }
  };

  /**
   * 그룹 초대 링크 생성
   */
  const createInvitationLink = async (groupId: number): Promise<GroupInviteLinkResponse> => {
    try {
      const response = await groupAxios.post(`/v1/groups/${groupId}/invitation`);
      return response.data.data;
    } catch (error) {
      console.error(`Error creating invitation link for group ${groupId}:`, error);
      throw error;
    }
  };

  /**
   * 그룹 참가
   */
   const joinGroup = async (groupId: number, code: string): Promise<JoinGroupResponse> => {
    try {
      const response = await groupAxios.post(`/v1/groups/${groupId}/join`, {code: `${code}`,});
      return response.data.data;
    } catch (error) {
      console.error(`Error joining group ${groupId}:`, error);
      throw error;
    }
  };

  /**
   * 그룹 나가기
   */
  const leaveGroup = async (groupId: number): Promise<boolean> => {
    try {
      await groupAxios.delete(`/v1/groups/${groupId}/quit`);
      return true;
    } catch (error) {
      console.error(`Error leaving group ${groupId}:`, error);
      throw error;
    }
  };

  /**
   * 멤버 권한 변경
   */
  const updateMemberRole = async (
    groupId: number,
    userId: number,
    role: string
  ): Promise<UpdateMemberRoleResponse> => {
    try {
      const response = await groupAxios.patch(`/v1/groups/${groupId}/users/${userId}`, { role });
      return response.data.data;
    } catch (error) {
      console.error(`Error updating role for user ${userId} in group ${groupId}:`, error);
      throw error;
    }
  };

  /**
   * 멤버 추방
   */
  const expelMember = async (groupId: number, userId: number): Promise<boolean> => {
    try {
      await groupAxios.delete(`/v1/groups/${groupId}/users/${userId}`);
      return true;
    } catch (error) {
      console.error(`Error expelling user ${userId} from group ${groupId}:`, error);
      throw error;
    }
  };

  /**
   * 오너 위임
   */
  const delegateOwner = async (groupId: number, newOwnerId: number): Promise<boolean> => {
    try {
      await groupAxios.patch(`/v1/groups/${groupId}/users/delegation`, { newOwnerId });
      return true;
    } catch (error) {
      console.error(`Error delegating owner for group ${groupId}:`, error);
      throw error;
    }
  };

  /**
   * 명세서 추가
   */
  const addSpec = async (groupId: number, specData: Record<string, unknown>): Promise<boolean> => {
    try {
      await groupAxios.post(`/v1/groups/${groupId}/spec`, specData);
      return true;
    } catch (error) {
      console.error(`Error adding spec for group ${groupId}:`, error);
      throw error;
    }
  };

  /**
   * 명세서 수정
   */
  const updateSpec = async (
    groupId: number,
    specId: number,
    specData: Record<string, unknown>
  ): Promise<boolean> => {
    try {
      await groupAxios.patch(`/v1/groups/${groupId}/spec/${specId}`, specData);
      return true;
    } catch (error) {
      console.error(`Error updating spec ${specId} for group ${groupId}:`, error);
      throw error;
    }
  };

  /**
   * 명세서 삭제
   */
  const deleteSpec = async (groupId: number, specId: number): Promise<boolean> => {
    try {
      await groupAxios.delete(`/v1/groups/${groupId}/spec/${specId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting spec ${specId} for group ${groupId}:`, error);
      throw error;
    }
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
