// 로딩 기능
import { Suspense, lazy } from "react";

import { createBrowserRouter, RouteObject } from "react-router-dom";

import ProjectSpinner from "../../features/projects/projectpage/widgets/spinners/ProjectSpinner";

import { ProjectEditorProvider } from "../../context/ProjectEditorContext";

const Loading = <div>로딩중입니다...</div>;

// 그룹 X 페이지
const NoGroupPage = lazy(() => import("../../pages/NoGroupPage"));
// NotFoundPage
const NotFoundPage = lazy(() => import("../../pages/NotFoundPage"));
// 프로젝트 리스트 페이지
const ProjectListPage = lazy(() => import("../../pages/ProjectListPage"));
// IDE 프로젝트 페이지
const ProjectPage = lazy(() => import("../../pages/ProjectPage"));
// 로그인 페이지
const LoginPage = lazy(() => import("../../pages/LoginPage"));
// 초대 페이지
const InvitePage = lazy(() => import("../../pages/InvietePage"));
// 멤버 권한 변경 페이지
const RoleChangePage = lazy(() => import("../../pages/RoleChangePage"));

// 멤버 권한 변경 페이지
const AboutPage = lazy(() => import("../../pages/AboutPage"));


const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <Suspense fallback={<ProjectSpinner />}>
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
        <ProjectEditorProvider>
          <ProjectPage />
        </ProjectEditorProvider>
      </Suspense>
    ),
  },
  {
    path: "nogroup",
    element: (
      <Suspense fallback={<ProjectSpinner />}>
        <NoGroupPage />
      </Suspense>
    ),
  },
  {
    path: "invite/:groupId/:inviteCode",
    element: (
      <Suspense fallback={<ProjectSpinner />}>
        <InvitePage />
      </Suspense>
    ),
  },
  {
    path: "rolechange/:groupId",
    element: (
      <Suspense fallback={<ProjectSpinner />}>
        <RoleChangePage />
      </Suspense>
    ),
  },
  {
    path: "about",
    element: (
      <Suspense fallback={<ProjectSpinner />}>
        <AboutPage />
      </Suspense>
    ),
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<ProjectSpinner />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
];

const root = createBrowserRouter(routes);

export default root;
