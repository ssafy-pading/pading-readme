// 1. 맨 처음 페이지 로딩 시 리프레시 토큰 확인
// 1-1. 리프레시 토큰이 있다면 로그인 처리 하는 로직 만들기
// 2. 로그인을 하면 현재 페이지로 리다이렉트, params에 토큰을 확인하여 클라이언트에서 로그인 처리 진행
// 3. 1, 2번 처리 후 context에 프로필도 넣어줘야 함

// src/pages/LoginPage.tsx
import React, { useEffect, useState } from 'react';
import TxtRotate from '../app/TxtRotate';
import useAuthAxios from '../shared/apis/useAuthAxios';
import { useNavigate } from 'react-router-dom';
import useGroupAxios from '../shared/apis/useGroupAxios';

// redux 초기 import 
import { useDispatch } from 'react-redux';
import { resetUserState } from '../app/redux/user';
import type { AppDispatch } from '../app/redux/store';

// 토스트
import { Toaster, toast } from 'react-hot-toast';

// 스피너
import ProjectSpinner from "../features/projects/projectpage/widgets/spinners/ProjectSpinner";

declare global {
  interface Window {
    particlesJS: (elementId: string, options: ParticlesOptions) => void;
  }
}

interface ParticlesOptions {
  particles: {
    number: { value: number };
    color: { value: string };
    shape: { type: string };
    opacity: { value: number; random: boolean };
    size: { value: number };
    move: {
      enable: boolean;
      speed: number;
      direction: string;
      straight: boolean;
      random: boolean;
    };
    line_linked: { enable: boolean };
  };
  interactivity: {
    detect_on: string;
    events: {
      onhover: { enable: boolean };
      onclick: { enable: boolean };
    };
    resize: boolean;
  };
  modes: {
    grab: { distance: number };
    bubble: { distance: number };
    repulse: { distance: number };
    push: { particles_nb: number };
    remove: { particles_nb: number };
  };
}

const LoginPage: React.FC = () => {
  const { loginWithGoogle } = useAuthAxios();
  const { getGroups } = useGroupAxios();

  // 스피너 체크
  const [isLoading, setIsLoading] = useState(true);
  
  // useNavigate 훅 사용하여 페이지 이동
  const navigate = useNavigate();

  // redux에서 사용하는 함수
  // redux dispatch, 유저 객체 사용
  const dispatch = useDispatch<AppDispatch>();

  
  // 페이지 처음 로드 시, 리프레시 토큰이 있는지 확인
  const refreshCheck = async ():Promise<void> => {
    // 여기에 리프레시 토큰 확인 후 로그인 처리하는 로직
    if(localStorage.getItem("refreshToken")){
      
      // 기존 사용자 정보와 상태 초기화
      dispatch(resetUserState());

      try{
        // 그룹 정보 가져오기
        const groupData = await getGroups();
        if (groupData.groups.length > 0) {
          const groupId = groupData.groups[0].id; // 첫 번째 그룹의 id 사용
          navigate(`/projectlist/${groupId}`);
        } else {
          navigate(`/nogroup`);
        }
      }catch(error){
        console.error(error);
        setIsLoading(false); // 오류 없으면 로그인 화면 렌더링
      }
    }else{
      setIsLoading(false); // 오류 없으면 로그인 화면 렌더링
    }
  }

  // 로그인 성공 시 디폴트 페이지(그룹을 순회하여 가장 낮은 id의 그룹의 프로젝트 리스트 페이지)로 이동하는 함수
  const redirectDefault = async() => {

    // 기존 사용자 정보와 상태 초기화
    dispatch(resetUserState());
    try{
      // 그룹 정보 가져오기
      const groupData = await getGroups();
      if (groupData.groups.length > 0) {
        const groupId = groupData.groups[0].id; // 첫 번째 그룹의 id 사용
        navigate(`/projectlist/${groupId}`);
      } else {
        navigate(`/nogroup`);
      }
    }catch(error){
      console.error(error);
      setIsLoading(false); // 오류 없으면 로그인 화면 렌더링
    }
  }

  useEffect(() => {
    

    refreshCheck();

    // Particles.js 로드
    const particle = ():void => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/particles.js';
      script.onload = () => {
        // Particles.js 설정
        (window).particlesJS('particles-js', {
          particles: {
            number: { value: 100 },
            color: { value: '#ffffff' },
            shape: { type: 'edge' },
            opacity: { value: 0.8, random: true },
            size: { value: 2 },
            move: { enable: true, speed: 1, direction: 'top', straight: true, random: true },
            line_linked: { enable: false },
          },
          interactivity: { 
            detect_on: 'canvas',
            events:{
              onhover: { enable: false }, 
              onclick: { enable: false }, 
            },
            resize:true 
          },
          modes: {
            grab: { "distance": 0 },
            bubble: { "distance": 0 },
            repulse: { "distance": 0 },
            push: { "particles_nb": 0 },
            remove: { "particles_nb": 0 }
          }
        });
      };
      document.body.appendChild(script);
    }

    // 파라미터 체크
    const params = new URLSearchParams(location.search);
    const accessToken:string|null = params.get("accessToken");
    const refreshToken:string|null = params.get("refreshToken");

    // 파라미터가 있을 경우, 컨텍스트와 로컬에 담아주기
    const tokenCheck = () => {
      if(accessToken&&refreshToken){
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        const redirectPath = sessionStorage.getItem("redirectPath");
        if(redirectPath){
          sessionStorage.removeItem("redirectPath");
          navigate(redirectPath);
        }else{
          redirectDefault();
        }
      }
    }
    tokenCheck();
    particle();
  }, [isLoading]);

  const googleLoginClick = async () => {
    try{
        await loginWithGoogle();
      }catch(error){
        toast.error('로그인 실패')
      console.error(error);
    }
  }

  if (isLoading) {
    return <ProjectSpinner />
  }
  return (
    <div className="flex h-screen bg-gray-900">
      <Toaster />
      {/* Left Section */}
      <div className="flex-[1.8] text-white flex flex-col items-center justify-center">
        <div id="particles-js" className="w-full h-full"></div>
        {/* <div className="absolute w-[50%] h-[70%]"> */}
        <div className="absolute w-[50%] h-[50%]">
          <h1 className="text-5xl font-bold mb-[3rem]">Pading</h1>
          <TxtRotate className="text-lg" texts={["서비스 소개", "최고의 페어 프로그래밍 경험"]} period={2000} />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-[1] bg-white rounded-l-xl justify-center relative">
        <div className="relative w-full top-[25%] flex flex-col items-center">
          <h1 className="text-5xl font-bold mb-8">Pading</h1>
          <div className="flex flex-col gap-4 w-3/4 max-w-sm">
            <button className="flex items-center justify-center gap-2 border border-gray-400 rounded-lg py-2 px-4 hover:bg-gray-100" onClick={googleLoginClick}>
            <svg xmlns="https://www.w3.org/2000/svg" width="20" height="24" viewBox="0 0 40 48" aria-hidden="true"><path fill="#4285F4" d="M39.2 24.45c0-1.55-.16-3.04-.43-4.45H20v8h10.73c-.45 2.53-1.86 4.68-4 6.11v5.05h6.5c3.78-3.48 5.97-8.62 5.97-14.71z"></path><path fill="#34A853" d="M20 44c5.4 0 9.92-1.79 13.24-4.84l-6.5-5.05C24.95 35.3 22.67 36 20 36c-5.19 0-9.59-3.51-11.15-8.23h-6.7v5.2C5.43 39.51 12.18 44 20 44z"></path><path fill="#FABB05" d="M8.85 27.77c-.4-1.19-.62-2.46-.62-3.77s.22-2.58.62-3.77v-5.2h-6.7C.78 17.73 0 20.77 0 24s.78 6.27 2.14 8.97l6.71-5.2z"></path><path fill="#E94235" d="M20 12c2.93 0 5.55 1.01 7.62 2.98l5.76-5.76C29.92 5.98 25.39 4 20 4 12.18 4 5.43 8.49 2.14 15.03l6.7 5.2C10.41 15.51 14.81 12 20 12z"></path></svg>
              <span>Google로 로그인</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
