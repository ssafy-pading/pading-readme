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

// 로그인 이미지
import kakao_logo from "../assets/kakao_logo.svg"
import naver_logo from "../assets/naver_logo.svg"
import useMypageAxios from '../shared/apis/useMypageAxios';
import { GetMyPageResponse } from '../shared/types/mypageApiResponse';

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
  const { loginWith } = useAuthAxios();
  const { getGroups } = useGroupAxios();
  const { getProfile } = useMypageAxios();
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
  const getUserEmail = async () => {
    const user = await getProfile();
    localStorage.setItem("email", user.email);
  }
  useEffect(() => {
    // URL 파라미터에서 토큰 확인
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
  
    // 토큰 파라미터가 있으면 로그인 로직을 먼저 처리하고 refreshCheck는 호출하지 않음
    if (accessToken && refreshToken) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      getUserEmail();
      
      const redirectPath = sessionStorage.getItem("redirectPath");
      if (redirectPath) {
        sessionStorage.removeItem("redirectPath");
        navigate(redirectPath);
      } else {
        redirectDefault();
      }
    } else {
      // URL에 토큰 파라미터가 없을 경우에만 refreshCheck 호출
      refreshCheck();
    }
  
    // Particles.js 로드
    const particle = (): void => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/particles.js";
      script.onload = () => {
        window.particlesJS("particles-js", {
          particles: {
            number: { value: 100 },
            color: { value: "#ffffff" },
            shape: { type: "edge" },
            opacity: { value: 0.8, random: true },
            size: { value: 2 },
            move: { enable: true, speed: 1, direction: "top", straight: true, random: true },
            line_linked: { enable: false },
          },
          interactivity: {
            detect_on: "canvas",
            events: { onhover: { enable: false }, onclick: { enable: false } },
            resize: true,
          },
          modes: {
            grab: { distance: 0 },
            bubble: { distance: 0 },
            repulse: { distance: 0 },
            push: { particles_nb: 0 },
            remove: { particles_nb: 0 },
          },
        });
      };
      document.body.appendChild(script);
    };
  
    particle();
  }, []);

  const googleLoginClick = async () => {
    try{
        await loginWith('google');
      }catch(error){
        toast.error('로그인 실패')
      console.error(error);
    }
  }
  const naverLoginClick = async () => {
    try{
        await loginWith('naver');
      }catch(error){
        toast.error('로그인 실패')
      console.error(error);
    }
  }
  const kakaoLoginClick = async () => {
    try{
        await loginWith('kakao');
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
          <TxtRotate className="text-lg" texts={["최고의 페어 프로그래밍 경험"]} period={2000} />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-[1] bg-white rounded-l-xl justify-center relative">
        <div className="relative w-full top-[25%] flex flex-col items-center">
          <h1 className="text-5xl font-bold mb-8">Pading</h1>
          <div className="flex flex-col gap-4 w-1/2 max-w-sm">
            <div className="flex flex-col gap-4 max-w-sm">
              <button className="flex items-center font-semibold justify-around gap-2 border border-gray-400 rounded-lg py-1 px-4 hover:bg-gray-100 pl-4" onClick={googleLoginClick}>
                <svg xmlns="https://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 40 48" aria-hidden="true">
                  <path fill="#4285F4" d="M39.2 24.45c0-1.55-.16-3.04-.43-4.45H20v8h10.73c-.45 2.53-1.86 4.68-4 6.11v5.05h6.5c3.78-3.48 5.97-8.62 5.97-14.71z"></path>
                  <path fill="#34A853" d="M20 44c5.4 0 9.92-1.79 13.24-4.84l-6.5-5.05C24.95 35.3 22.67 36 20 36c-5.19 0-9.59-3.51-11.15-8.23h-6.7v5.2C5.43 39.51 12.18 44 20 44z"></path>
                  <path fill="#FABB05" d="M8.85 27.77c-.4-1.19-.62-2.46-.62-3.77s.22-2.58.62-3.77v-5.2h-6.7C.78 17.73 0 20.77 0 24s.78 6.27 2.14 8.97l6.71-5.2z"></path>
                  <path fill="#E94235" d="M20 12c2.93 0 5.55 1.01 7.62 2.98l5.76-5.76C29.92 5.98 25.39 4 20 4 12.18 4 5.43 8.49 2.14 15.03l6.7 5.2C10.41 15.51 14.81 12 20 12z"></path>
                </svg>
                <div>
                  <span>Google</span> <span>로그인</span>
                </div>
              </button>
            </div>
            <div className="flex flex-col gap-4 max-w-sm bg-[#2DB400] rounded-lg">
              <button className="flex text-white font-semibold items-center justify-around gap-2 border border-gray-400 rounded-lg py-1 px-4 hover:bg-[#259600] pl-4" onClick={naverLoginClick}>
                <img src={naver_logo} alt="naver" className="w-5 h-8" />
                <div>
                  <span>Naver</span> <span>로그인</span>
                </div>
              </button>
            </div>
            <div className="flex flex-col gap-4 max-w-sm bg-[#f9e000] rounded-lg">
              <button className="flex items-center font-semibold justify-around gap-2 border border-gray-400 rounded-lg py-1 px-4 hover:bg-[#D6C000] pl-4" onClick={kakaoLoginClick}>
                <img src={kakao_logo} alt="kakao" className="w-5 h-8" />
                <div>
                  <span>Kakao</span> <span>로그인</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LoginPage;
