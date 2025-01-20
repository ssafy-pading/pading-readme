// 로딩 기능
import { Suspense, lazy } from "react";

import { createBrowserRouter } from 'react-router-dom'

const Loading = <div>로딩중입니다...</div>


// IDE 프로젝트 페이지
const ProjectPage = lazy(() => import("../../pages/ProjectPage"))
const LoginPage = lazy(() => import("../../pages/LoginPage"))

const root: any = createBrowserRouter([
    {
        path: '/',
        element: (
            <Suspense fallback={Loading}>
                <LoginPage/>
            </Suspense>
        )
    },
    {
        path: 'project',
        element: (
            <Suspense fallback={Loading}>
                <ProjectPage/>
            </Suspense>
        )
    }
])

export default root