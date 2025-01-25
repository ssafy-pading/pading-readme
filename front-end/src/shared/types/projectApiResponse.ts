// types/projectApiResponse.ts

// 언어 목록 조회
export type GetLanguageListResponse = {
  success: boolean; // 요청 성공 여부
  data: {
      os_code: string; // 언어 코드 (예: java, python)
      os_name: string; // 언어 이름 (예: 자바, 파이썬)
  }[] | null; // 성공 시 반환되는 데이터 (언어 목록)
  error: string | null; // 에러 메시지
};
// OS 목록 조회
export type GetOSListResponse = {
  success: boolean; // 요청 성공 여부
  data: {
      os_code: string; // OS 코드 (예: ubuntu_20_04_lts)
      os_name: string; // OS 이름 (예: 우분투 20.04 LTS)
  }[] | null; // 성공 시 반환되는 데이터 (OS 목록)
  error: string | null; // 에러 메시지
};
// 사양 목록 조회
export type GetSpecificationListResponse = {
  success: boolean; // 요청 성공 여부
  data: {
      code: string;      // 사양 코드 (예: micro, small)
      cpu_core: number;  // CPU 코어 수
      ram: string;       // RAM 용량 (예: 1GB, 2GB)
      disk: string;      // 디스크 용량 (예: 5GB)
  }[] | null; // 성공 시 반환되는 데이터 (사양 목록)
  error: string | null; // 에러 메시지
};
// 멤버 리스트 조회
export type GetMemberListResponse = {
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
// 프로젝트 목록 조회
export type GetProjectListResponse = {
  success: boolean; // 요청 성공 여부
  data: {
      id: number;             // 프로젝트 ID
      os_id: string;          // 운영 체제 ID (예: ubuntu_20_04_lts)
      language_id: string;    // 언어 ID (예: java, python)
      performance_id: string; // 성능 레벨 ID (예: medium, large)
      name: string;           // 프로젝트 이름
      container_id: string;   // 컨테이너 ID
      status: string;         // 프로젝트 상태 (예: active, inactive)
      users: {
          user_id: number;          // 사용자 ID
          name: string;             // 사용자 이름
          email: string;            // 사용자 이메일
          role: string;             // 사용자 역할 (예: OWNER, MANAGER, MEMBER)
          profile_image: string;    // 사용자 프로필 이미지 URL
          status: boolean;          // 사용자 상태 (true: 활성, false: 비활성)
      }[]; // 프로젝트 사용자 목록
  }[] | null; // 성공 시 반환되는 데이터 (프로젝트 목록)
  error: string | null; // 에러 메시지
};
// 프로젝트 생성
export type CreateProjectResponse = {
  success: boolean; // 요청 성공 여부
  data: {
      project_id: number;   // 프로젝트 ID
      name: string;         // 프로젝트 이름
      status: string;       // 프로젝트 상태 (예: active)
      created_at: string;   // 프로젝트 생성 시간
  } | null; // 성공 시 반환되는 데이터
  error: string | null; // 에러 메시지
};
// 프로젝트 상세 조회
export type GetProjectDetailsResponse = {
  success: boolean; // 요청 성공 여부
  data: {
      id: number;             // 프로젝트 ID
      name: string;           // 프로젝트 이름
      os_id: string;          // 운영 체제 ID (예: ubuntu_20_04_lts)
      language_id: string;    // 언어 ID (예: java)
      performance_id: string; // 성능 레벨 ID (예: medium)
      container_id: string;   // 컨테이너 ID
      status: string;         // 프로젝트 상태 (예: active)
      created_at: string;     // 프로젝트 생성 시간
      updated_at: string;     // 프로젝트 업데이트 시간
      users: {
          user_id: number;          // 사용자 ID
          name: string;             // 사용자 이름
          email: string;            // 사용자 이메일
          role: string;             // 사용자 역할 (예: OWNER, MANAGER)
          profile_image: string;    // 사용자 프로필 이미지 URL
          status: boolean;          // 사용자 상태 (true: 활성, false: 비활성)
      }[]; // 프로젝트 사용자 목록
  } | null; // 성공 시 반환되는 데이터
  error: string | null; // 에러 메시지
};
// 프로젝트 접속
export type AccessProjectResponse = {
  success: boolean; // 요청 성공 여부
  data: {
      project_id: number;   // 프로젝트 ID
      name: string;         // 프로젝트 이름
      status: string;       // 프로젝트 상태 (예: active)
      access_granted: boolean; // 프로젝트 접속 권한 여부
      role: string;         // 사용자 역할 (예: MEMBER, OWNER, MANAGER)
  } | null; // 성공 시 반환되는 데이터
  error: string | null; // 에러 메시지
};

