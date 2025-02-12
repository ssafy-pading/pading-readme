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

  // 원래 반환 객체에 포함된 Axios 인스턴스를 그대로 생성 (참조용)
  const groupAxios: AxiosInstance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });

  // 매 요청에 Authorization 헤더를 추가하는 함수
  const withAuthHeader = useCallback(() => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  }), []);

  // 401 에러 발생 시 토큰 갱신 및 대기중인 요청 재시도 처리
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
   * 그룹 목록 조회
   */
  const getGroups = useCallback(async (): Promise<GetGroupListResponse> => {
    const request = async () => {
      const response = await axios.get(`${baseURL}/v1/groups`, withAuthHeader());
      return response.data.data;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return getGroups();
      }
      throw error;
    }
  }, [baseURL, withAuthHeader, handle401Error]);

  /**
   * 그룹 상세 조회
   */
  const getGroupDetails = useCallback(async (groupId: number): Promise<GetGroupDetailsResponse> => {
    const request = async () => {
      const response = await axios.get(`${baseURL}/v1/groups/${groupId}`, withAuthHeader());
      return response.data.data;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return getGroupDetails(groupId);
      }
      throw error;
    }
  }, [baseURL, withAuthHeader, handle401Error]);

  /**
   * 그룹명 중복 확인
   */
  const checkGroupNameDuplicate = useCallback(async (name: string): Promise<CheckGroupNameDuplicateResponse> => {
    const request = async () => {
      const response = await axios.get(`${baseURL}/v1/groups/check-duplicate`, {
        ...withAuthHeader(),
        params: { name },
      });
      return response.data.data;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return checkGroupNameDuplicate(name);
      }
      throw error;
    }
  }, [baseURL, withAuthHeader, handle401Error]);

  /**
   * 그룹 생성
   */
  const createGroup = useCallback(async (data: Record<string, unknown>): Promise<GroupCreateResponse> => {
    const request = async () => {
      const response = await axios.post(`${baseURL}/v1/groups`, data, withAuthHeader());
      return response.data.data;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return createGroup(data);
      }
      throw error;
    }
  }, [baseURL, withAuthHeader, handle401Error]);

  /**
   * 그룹명 변경
   */
  const updateGroupName = useCallback(async (groupId: number, name: string): Promise<boolean> => {
    const request = async () => {
      await axios.patch(`${baseURL}/v1/groups/${groupId}`, { name }, withAuthHeader());
      return true;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return updateGroupName(groupId, name);
      }
      throw error;
    }
  }, [baseURL, withAuthHeader, handle401Error]);

  /**
   * 그룹 삭제
   */
  const deleteGroup = useCallback(async (groupId: number): Promise<boolean> => {
    const request = async () => {
      await axios.delete(`${baseURL}/v1/groups/${groupId}`, withAuthHeader());
      return true;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return deleteGroup(groupId);
      }
      throw error;
    }
  }, [baseURL, withAuthHeader, handle401Error]);

  /**
   * 그룹 멤버 목록 조회
   */
  const getGroupMembers = useCallback(async (groupId: number): Promise<GetGroupMembersResponse> => {
    const request = async () => {
      const response = await axios.get(`${baseURL}/v1/groups/${groupId}/users`, withAuthHeader());
      return response.data.data;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return getGroupMembers(groupId);
      }
      throw error;
    }
  }, [baseURL, withAuthHeader, handle401Error]);

  /**
   * 그룹 초대 링크 조회
   */
  const getInvitationLink = useCallback(async (groupId: number): Promise<GroupInviteLinkResponse> => {
    const request = async () => {
      const response = await axios.get(`${baseURL}/v1/groups/${groupId}/invitation`, withAuthHeader());
      return response.data.data;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return getInvitationLink(groupId);
      }
      throw error;
    }
  }, [baseURL, withAuthHeader, handle401Error]);

  /**
   * 그룹 초대 링크 생성
   */
  const createInvitationLink = useCallback(async (groupId: number): Promise<GroupInviteLinkResponse> => {
    const request = async () => {
      // POST의 경우 body가 없으므로 null을 전달
      const response = await axios.post(`${baseURL}/v1/groups/${groupId}/invitation`, null, withAuthHeader());
      return response.data.data;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return createInvitationLink(groupId);
      }
      throw error;
    }
  }, [baseURL, withAuthHeader, handle401Error]);

  /**
   * 그룹 참가
   */
  const joinGroup = useCallback(async (groupId: number, code: string): Promise<JoinGroupResponse> => {
    const request = async () => {
      const response = await axios.post(`${baseURL}/v1/groups/${groupId}/join`, { code }, withAuthHeader());
      return response.data.data;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return joinGroup(groupId, code);
      }
      throw error;
    }
  }, [baseURL, withAuthHeader, handle401Error]);

  /**
   * 그룹 나가기
   */
  const leaveGroup = useCallback(async (groupId: number): Promise<boolean> => {
    const request = async () => {
      await axios.delete(`${baseURL}/v1/groups/${groupId}/quit`, withAuthHeader());
      return true;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return leaveGroup(groupId);
      }
      throw error;
    }
  }, [baseURL, withAuthHeader, handle401Error]);

  /**
   * 멤버 권한 변경
   */
  const updateMemberRole = useCallback(async (
    groupId: number,
    userId: number,
    role: string
  ): Promise<UpdateMemberRoleResponse> => {
    const request = async () => {
      const response = await axios.patch(
        `${baseURL}/v1/groups/${groupId}/users/${userId}`,
        { role },
        withAuthHeader()
      );
      return response.data.data;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return updateMemberRole(groupId, userId, role);
      }
      throw error;
    }
  }, [baseURL, withAuthHeader, handle401Error]);

  /**
   * 멤버 추방
   */
  const expelMember = useCallback(async (groupId: number, userId: number): Promise<boolean> => {
    const request = async () => {
      await axios.delete(`${baseURL}/v1/groups/${groupId}/users/${userId}`, withAuthHeader());
      return true;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return expelMember(groupId, userId);
      }
      throw error;
    }
  }, [baseURL, withAuthHeader, handle401Error]);

  /**
   * 오너 위임
   */
  const delegateOwner = useCallback(async (groupId: number, newOwnerId: number): Promise<boolean> => {
    const request = async () => {
      await axios.patch(
        `${baseURL}/v1/groups/${groupId}/users/delegation`,
        { newOwnerId },
        withAuthHeader()
      );
      return true;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return delegateOwner(groupId, newOwnerId);
      }
      throw error;
    }
  }, [baseURL, withAuthHeader, handle401Error]);

  /**
   * 명세서 추가
   */
  const addSpec = useCallback(async (groupId: number, specData: Record<string, unknown>): Promise<boolean> => {
    const request = async () => {
      await axios.post(`${baseURL}/v1/groups/${groupId}/spec`, specData, withAuthHeader());
      return true;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return addSpec(groupId, specData);
      }
      throw error;
    }
  }, [baseURL, withAuthHeader, handle401Error]);

  /**
   * 명세서 수정
   */
  const updateSpec = useCallback(async (
    groupId: number,
    specId: number,
    specData: Record<string, unknown>
  ): Promise<boolean> => {
    const request = async () => {
      await axios.patch(`${baseURL}/v1/groups/${groupId}/spec/${specId}`, specData, withAuthHeader());
      return true;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return updateSpec(groupId, specId, specData);
      }
      throw error;
    }
  }, [baseURL, withAuthHeader, handle401Error]);

  /**
   * 명세서 삭제
   */
  const deleteSpec = useCallback(async (groupId: number, specId: number): Promise<boolean> => {
    const request = async () => {
      await axios.delete(`${baseURL}/v1/groups/${groupId}/spec/${specId}`, withAuthHeader());
      return true;
    };
    try {
      return await request();
    } catch (error: any) {
      if (error.response?.status === 401) {
        await handle401Error(request);
        return deleteSpec(groupId, specId);
      }
      throw error;
    }
  }, [baseURL, withAuthHeader, handle401Error]);

  return {
    groupAxios, // 기존과 동일한 Axios 인스턴스
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
