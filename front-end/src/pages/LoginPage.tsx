// src/pages/LoginPage.tsx
import React, { useEffect } from 'react';
import TxtRotate from '../widgets/TxtRotate';


const LoginPage: React.FC = () => {
  useEffect(() => {
    // Particles.js 로드
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/particles.js';
    script.onload = () => {
      // Particles.js 설정
      (window as any).particlesJS('particles-js', {
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
  }, []);


  return (
    <div className="flex h-screen">
      {/* Left Section */}
      <div className="flex-[1.5] bg-gray-900 text-white flex flex-col items-center justify-center">
        <div className="absolute">
          <h1 className="text-5xl font-bold mb-4">Padding</h1>
          <TxtRotate className="text-lg" texts={["서비스 소개", "최고의 페어 프로그래밍 경험"]} period={2000} />
          <p>서비스 소개</p>
        </div>
        <div id="particles-js" className="absolute"></div>
      </div>

      {/* Right Section */}
      <div className="flex-[1] flex flex-col items-center justify-center bg-white rounded-xl">
        <h1 className="text-5xl font-bold mb-8">Padding</h1>
        <div className="flex flex-col gap-4 w-3/4 max-w-sm">
          <button className="flex items-center justify-center gap-2 border border-gray-400 rounded-lg py-2 px-4 hover:bg-gray-100">
          <svg xmlns="https://www.w3.org/2000/svg" width="20" height="24" viewBox="0 0 40 48" aria-hidden="true" jsname="jjf7Ff"><path fill="#4285F4" d="M39.2 24.45c0-1.55-.16-3.04-.43-4.45H20v8h10.73c-.45 2.53-1.86 4.68-4 6.11v5.05h6.5c3.78-3.48 5.97-8.62 5.97-14.71z"></path><path fill="#34A853" d="M20 44c5.4 0 9.92-1.79 13.24-4.84l-6.5-5.05C24.95 35.3 22.67 36 20 36c-5.19 0-9.59-3.51-11.15-8.23h-6.7v5.2C5.43 39.51 12.18 44 20 44z"></path><path fill="#FABB05" d="M8.85 27.77c-.4-1.19-.62-2.46-.62-3.77s.22-2.58.62-3.77v-5.2h-6.7C.78 17.73 0 20.77 0 24s.78 6.27 2.14 8.97l6.71-5.2z"></path><path fill="#E94235" d="M20 12c2.93 0 5.55 1.01 7.62 2.98l5.76-5.76C29.92 5.98 25.39 4 20 4 12.18 4 5.43 8.49 2.14 15.03l6.7 5.2C10.41 15.51 14.81 12 20 12z"></path></svg>
            <span>Google로 로그인</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
