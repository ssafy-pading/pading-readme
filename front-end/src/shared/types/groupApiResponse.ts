// types/groupApiResponse.ts

// 그룹 목록 조회
export type GetGroupListResponse = {
  success: boolean; // 요청 성공 여부
  data: {
      groups: {
          id: number;    // 그룹 ID
          name: string;  // 그룹 이름
          capacity: number; // 그룹 정원
      }[]; // 그룹 리스트
  } | null; // 성공 시 반환되는 데이터
  error: string | null; // 에러 메시지
};
// 그룹 상세 조회
export type GetGroupDetailsResponse = {
  success: boolean; // 요청 성공 여부
  data: {
      id: number;         // 그룹 ID
      name: string;       // 그룹 이름
      capacity: number;   // 그룹 정원
      created_at: string; // 그룹 생성 시간
      updated_at: string; // 그룹 업데이트 시간
  } | null; // 성공 시 반환되는 데이터
  error: string | null; // 에러 메시지
};
// 그룹명 중복 확인
export type CheckGroupNameDuplicateResponse = {
  success: boolean; // 요청 성공 여부
  data: {
      is_duplicate: boolean; // 그룹명이 중복인지 여부 (true: 중복, false: 중복 아님)
  } | null; // 성공 시 반환되는 데이터
  error: string | null; // 에러 메시지
};
// 그룹 멤버 목록 조회
export type GetGroupMembersResponse = {
  success: boolean; // 요청 성공 여부
  data: {
      members: {
          name: string;    // 멤버 이름
          image: string;   // 멤버 프로필 이미지 URL
          email: string;   // 멤버 이메일
          role: string;    // 멤버 역할 (예: Owner, Member, Manager)
      }[]; // 멤버 목록
  } | null; // 성공 시 반환되는 데이터
  error: string | null; // 에러 메시지
};
// 그룹 초대 링크 생성
export type GroupInviteLinkResponse = {
  success: boolean; // 요청 성공 여부
  data: {
      invite_link: string; // 초대 링크
      expires_at: string;  // 초대 링크 만료 시간
  } | null; // 성공 시 반환되는 데이터
  error: string | null;   // 에러 메시지
};
// 그룹 참가
export type JoinGroupResponse = {
  success: boolean; // 요청 성공 여부
  data: {
      group_id: number; // 그룹 ID
      name: string;     // 그룹 이름
      capacity: number; // 그룹 정원
  } | null; // 성공 시 반환되는 데이터
  error: string | null; // 에러 메시지
};
// 멤버 권한 변경
export type UpdateMemberRoleResponse = {
  success: boolean; // 요청 성공 여부
  data: {
      group_id: number;       // 그룹 ID
      user_id: number;        // 사용자 ID
      previous_role: string;  // 이전 역할 (예: MEMBER)
      updated_role: string;   // 변경된 역할 (예: OWNER)
      updated_at: string;     // 역할 변경 시각
  } | null; // 성공 시 반환되는 데이터
  error: string | null; // 에러 메시지
};
