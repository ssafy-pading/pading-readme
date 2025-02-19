// types/projectApiResponse.ts
// 프로젝트 객체 타입
type Project = {
  id: number; // 프로젝트 ID
  group: {
    id: number; // 그룹 ID
    name: string; // 그룹 이름
    capacity: number; // 그룹 정원
  };
  projectImage: {
    tag: string; // 프로젝트 이미지 태그 (예: ubuntu-nodejs)
    language: string; // 사용 언어 (예: NodeJS)
    os: string; // 운영 체제 (예: Ubuntu 20.04 LTS)
    port: number; // 기본 포트 (예: 3000)
    defaultRunCommand: string; // 기본 실행 명령어 (예: npm start)
  };
  performance: {
    id: number; // 성능 ID
    cpu: string; // CPU 리소스 (예: 500m)
    cpuDescription: string; // CPU 설명 (예: 0.5 vCPU)
    memory: string; // 메모리 리소스 (예: 1Gi)
    memoryDescription: string; // 메모리 설명 (예: 1 Gi Memory)
    storage: string; // 저장 공간 리소스 (예: 5Gi)
    storageDescription: string; // 저장 공간 설명 (예: 5 Gi)
  };
  name: string; // 프로젝트 이름 (예: aaaa)
  containerId: string; // 컨테이너 ID (예: aaaa-libr)
  nodePort: number; // 노드 포트 번호 (예: 30101)
  deploymentUrl: string; // 프로젝트 실행 서브도메인 주소 (예: "dev-sss-fscr.pair-coding.site")
  runCommand: string; // 실행 명령어 (예: npm start)
  status: boolean; // 프로젝트 상태 (true: 활성, false: 비활성)
  autoStop: boolean; // 자동 중지 여부
  isDeleted: boolean; // 삭제 여부
};


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
  project: Project;
  users: {
    id: number;
    name: string;
    image: string | null;
    email: string;
    status: boolean;
  }[];
  callStatus: string;
};

// 전체 응답은 ProjectListItem의 배열
export type GetProjectListResponse = ProjectListItem[];

// 프로젝트 생성
export type CreateProjectResponse = Project;


// 프로젝트 상세 조회
export type GetProjectDetailsResponse = {
  project: Project;
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

// 파일 타입
export type FileTabType = {
  fileName: string;
  fileRoute: string;
  fileRouteAndName: string;
  content: string;
}

// 프로젝트에 접속중인 멤버 리스트
export type GetProjectMemberStatusResponse = {
  id: number;
  name: string;
  image: string | null;
  email: string;
  role: string;
  status: boolean | null;
}[];

// 탭 매니징 타입
export type TabManagerType = {
  email: string;
  activeTab: string | null;
  tabs: FileTabType[];
}