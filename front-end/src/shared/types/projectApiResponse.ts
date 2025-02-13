// types/projectApiResponse.ts

// 언어 목록 조회
export type GetLanguageListResponse = {
  language: string; // 언어 코드 (예: java, python)
}[];
// OS 목록 조회
export type GetOSListResponse = {
  os: string; // OS 코드 (예: ubuntu_20_04_lts)
}[];
// 사양 목록 조회
export type GetPerformanceListResponse = {
  id: number;      // 사양 코드
  cpu: string;      // CPU 코어 수
  memory: string;       // RAM 용량 (예: 1GB, 2GB)
  storage: string;      // 디스크 용량 (예: 5GB)
}[];
// 멤버 리스트 조회
export type GetMemberListResponse = {
  id: number;
  name: string;    // 멤버 이름
  image: string;   // 멤버 프로필 이미지 URL
  email: string;   // 멤버 이메일
  role: string;    // 멤버 역할 (예: Owner, Member, Manager)
}[];
// // 멤버 리스트 조회
// export type GetMemberListResponse = {
//   members: {
//       name: string;    // 멤버 이름
//       image: string;   // 멤버 프로필 이미지 URL
//       email: string;   // 멤버 이메일
//       role: string;    // 멤버 역할 (예: Owner, Member, Manager)
//   }[]; // 멤버 목록
// };
// 프로젝트 목록 조회
export type ProjectListItem = {
  project: {
    id: number;
    group: { id: number; name: string; capacity: number };
    projectImage: { tag: string; language: string; os: string };
    performance: {
      id: number;
      cpu: string;
      cpuDescription: string;
      memory: string;
      memoryDescription: string;
      storage: string;
      storageDescription: string;
    };
    name: string;
    containerId: string;
    status: boolean;
    autoStop: boolean;
    isDeleted: boolean;
  };
  users: {
    id: number;
    name: string;
    image: string | null;
    email: string;
    status: boolean;
  }[];
};

// 전체 응답은 ProjectListItem의 배열
export type GetProjectListResponse = ProjectListItem[];

// 프로젝트 생성
export type CreateProjectResponse = {
  project_id: number;   // 프로젝트 ID
  name: string;         // 프로젝트 이름
  status: string;       // 프로젝트 상태 (예: active)
  created_at: string;   // 프로젝트 생성 시간
};

// 프로젝트 상세 조회
export type GetProjectDetailsResponse = {
  project: {
      id: number; // 프로젝트 ID
      group: {
          id: number; // 그룹 아이디
          name: string; // 그룹 이름
          capacity: number; // 그룹 정원
      };
      projectImage: {
          tag: string; // OS 이름
          language: string; // 언어 (예: java)
          os: string; // 운영 체제 (예: ubuntu_20_04_lts)
      };
      performance: {
          id: number; // 성능 id
          cpu: string; // cpu
          cpuDescription: string; // cpu CPU 이름
          memory: string; // 메모리
          memoryDescription: string; // 메모리 이름
          storage: string; // 저장공간
          storageDescription: string; // 저장공간 이름
      };
      name: string; // 프로젝트 이름
      containerId: string; // 컨테이너 ID
      status: boolean; // 프로젝트 상태 (예: active)
      autoStop: boolean; // autoStop 여부
      isDeleted: boolean; // 삭제 여부
  };
  users: {
      id: number; // 사용자 ID
      name: string; // 사용자 이름
      image: string | null; // 사용자 프로필 이미지 URL
      email: string; // 사용자 이메일
      status: boolean; // 사용자 상태 (true: 활성, false: 비활성)
  }[]; // 프로젝트 사용자 목록
};

// 프로젝트 접속
export type AccessProjectResponse = {
  project_id: number;   // 프로젝트 ID
  name: string;         // 프로젝트 이름
  status: string;       // 프로젝트 상태 (예: active)
  access_granted: boolean; // 프로젝트 접속 권한 여부
  role: string;         // 사용자 역할 (예: MEMBER, OWNER, MANAGER)
};

