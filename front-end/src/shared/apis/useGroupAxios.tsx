import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAxiosInstance, setupInterceptors } from './axiosInstance';
import { AxiosInstance } from 'axios';
import { ApproveRequestResponse } from '../types/approveRequestResponse';
import { CheckGroupNameDuplicateResponse, GetGroupDetailsResponse, GetGroupListResponse, GetGroupMembersResponse, GroupInviteLinkResponse, JoinGroupResponse, UpdateMemberRoleResponse } from '../types/groupApiResponse';

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
    return groupAxios.get('/v1/groups').then((response) => response.data);
  };

  /**
   * 그룹 상세 조회
   */
  const getGroupDetails = async (groupId: string): Promise<GetGroupDetailsResponse> => {
    return groupAxios.get(`/v1/groups/${groupId}`).then((response) => response.data);
  };

  /**
   * 그룹명 중복 확인
   */
  const checkGroupNameDuplicate = async (name: string): Promise<CheckGroupNameDuplicateResponse> => {
    return groupAxios.get(`/v1/groups/check-duplicate`, { params: { name } }).then((response) => response.data);
  };

  /**
   * 그룹 생성
   */
  const createGroup = async (data: Record<string, unknown>): Promise<ApproveRequestResponse> => {
    return groupAxios.post('/v1/groups', data).then((response) => response.data);
  };

  /**
   * 그룹명 변경
   */
  const updateGroupName = async (groupId: string, name: string): Promise<ApproveRequestResponse> => {
    return groupAxios.patch(`/v1/groups/${groupId}`, { name }).then((response) => response.data);
  };

  /**
   * 그룹 삭제
   */
  const deleteGroup = async (groupId: string): Promise<ApproveRequestResponse> => {
    return groupAxios.delete(`/v1/groups/${groupId}`).then((response) => response.data);
  };

  /**
   * 그룹 멤버 목록 조회
   */
  const getGroupMembers = async (groupId: string): Promise<GetGroupMembersResponse> => {
    return groupAxios.get(`/v1/groups/${groupId}/users`).then((response) => response.data);
  };

  /**
   * 그룹 초대 링크 생성
   */
  const createInvitationLink = async (groupId: string): Promise<GroupInviteLinkResponse> => {
    return groupAxios.post(`/v1/groups/${groupId}/invitation`).then((response) => response.data);
  };

  /**
   * 그룹 참가
   */
  const joinGroup = async (groupId: string): Promise<JoinGroupResponse> => {
    return groupAxios.post(`/v1/groups/${groupId}/join`).then((response) => response.data);
  };

  /**
   * 그룹 나가기
   */
  const leaveGroup = async (groupId: string): Promise<ApproveRequestResponse> => {
    return groupAxios.delete(`/v1/groups/${groupId}/quit`).then((response) => response.data);
  };

  /**
   * 멤버 권한 변경
   */
  const updateMemberRole = async (
    groupId: string,
    userId: string,
    role: string
  ): Promise<UpdateMemberRoleResponse> => {
    return groupAxios.patch(`/v1/groups/${groupId}/users/${userId}`, { role }).then((response) => response.data);
  };

  /**
   * 멤버 추방
   */
  const expelMember = async (groupId: string, userId: string): Promise<ApproveRequestResponse> => {
    return groupAxios.delete(`/v1/groups/${groupId}/users/${userId}`).then((response) => response.data);
  };

  /**
   * 오너 위임
   */
  const delegateOwner = async (groupId: string, newOwnerId: string): Promise<ApproveRequestResponse> => {
    return groupAxios.patch(`/v1/groups/${groupId}/users/delegation`, { newOwnerId }).then((response) => response.data);
  };

  /**
   * 명세서 추가
   */
  const addSpec = async (groupId: string, specData: Record<string, unknown>): Promise<ApproveRequestResponse> => {
    return groupAxios.post(`/v1/groups/${groupId}/spec`, specData).then((response) => response.data);
  };

  /**
   * 명세서 수정
   */
  const updateSpec = async (
    groupId: string,
    specId: string,
    specData: Record<string, unknown>
  ): Promise<ApproveRequestResponse> => {
    return groupAxios.patch(`/v1/groups/${groupId}/spec/${specId}`, specData).then((response) => response.data);
  };

  /**
   * 명세서 삭제
   */
  const deleteSpec = async (groupId: string, specId: string): Promise<ApproveRequestResponse> => {
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
