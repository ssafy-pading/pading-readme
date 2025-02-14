// 로딩 기능
import { Suspense, lazy } from "react";

import { createBrowserRouter, Outlet, RouteObject } from 'react-router-dom'

import { UserProvider } from "../../context/userContext"; // 경로에 맞게 수정

import ProjectSpinner from "../../features/projects/projectpage/widgets/spinners/ProjectSpinner";

const Loading = <div>로딩중입니다...</div>

// 그룹 X 페이지
const NoGroupPage = lazy(() => import("../../pages/NoGroupPage"))
// NotFoundPage
const NotFoundPage = lazy(() => import("../../pages/NotFoundPage"))
// 프로젝트 리스트 페이지
const ProjectListPage = lazy(() => import("../../pages/ProjectListPage"))
// IDE 프로젝트 페이지
const ProjectPage = lazy(() => import("../../pages/ProjectPage"))
// 로그인 페이지
const LoginPage = lazy(() => import("../../pages/LoginPage"))
// 초대 페이지
const InvitePage = lazy(() => import("../../pages/InvietePage"))
// 멤버 권한 변경 페이지
const RoleChangePage = lazy(() => import("../../pages/RoleChangePage"))

// UserProvider로 전체 앱을 감싸는 Layout 컴포넌트
const AppLayout = () => (
    <UserProvider>
      <Outlet />
    </UserProvider>
  );
  
  const routes: RouteObject[] = [
    {
      path: "/",
      element: (
        // 최상위에 UserProvider를 적용
        // AppLayout의 Outlet은 자식요소가 있다면, 그 자식요소를 렌더링 하는 부분
        <AppLayout />
      ),
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={Loading}>
              <LoginPage />
            </Suspense>
          ),
        },
        {
          path: "projectlist/:groupId",
          element: (
            <Suspense fallback={<ProjectSpinner />}>
              <ProjectListPage />
            </Suspense>
          ),
        },
        {
          path: "project/:groupId/:projectId",
          element: (
            <Suspense fallback={<ProjectSpinner />}>
              <ProjectPage />
            </Suspense>
          ),
        },
        {
          path: "nogroup",
          element: (
            <Suspense fallback={Loading}>
              <NoGroupPage />
            </Suspense>
          ),
        },
        {
          path: "invite/:groupId/:inviteCode",
          element: (
            <Suspense fallback={Loading}>
              <InvitePage />
            </Suspense>
          ),
        },
        {
          path: "rolechange/:groupId",
          element: (
            <Suspense fallback={Loading}>
              <RoleChangePage />
            </Suspense>
          ),
        },
        {
          path: "*",
          element: (
            <Suspense fallback={Loading}>
              <NotFoundPage />
            </Suspense>
          ),
        },
      ],
    },
  ];


const root = createBrowserRouter(routes)

export default root