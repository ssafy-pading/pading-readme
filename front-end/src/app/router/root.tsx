// 로딩 기능
import { Suspense, lazy } from "react";

import { createBrowserRouter, RouteObject } from 'react-router-dom'

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

const routes: RouteObject[] = [
    {
        path: '/',
        element: (
            <Suspense fallback={Loading}>
                <LoginPage/>
            </Suspense>
        )
    },
    {
        path: 'projectlist',
        element: (
            <Suspense fallback={Loading}>
                <ProjectListPage/>
            </Suspense>
        )
    },
    // 언어, OS, 성능을 넣어줘야함함
    {
        path: 'project',
        element: (
            <Suspense fallback={Loading}>
                <ProjectPage/>
            </Suspense>
        )
    },
    {
        path: 'nogroup',
        element: (
            <Suspense fallback={Loading}>
                <NoGroupPage/>
            </Suspense>
        )
    },
    {
        path: '*', // 404 페이지
        element: (
            <Suspense fallback={Loading}>
                <NotFoundPage/>
            </Suspense>
        )
    }
];


const root = createBrowserRouter(routes)

export default root