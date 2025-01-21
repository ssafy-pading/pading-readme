// src/pages/LoginPage.tsx
import React, { useEffect } from 'react';

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
          <p className="text-lg">서비스 소개</p>
        </div>
        <div id="particles-js" className="absolute"></div>
      </div>

      {/* Right Section */}
      <div className="flex-[1] flex flex-col items-center justify-center bg-white rounded-xl">
        <h1 className="text-5xl font-bold mb-8">Padding</h1>
        <div className="flex flex-col gap-4 w-3/4 max-w-sm">
          <button className="flex items-center justify-center gap-2 border border-gray-400 rounded-lg py-2 px-4 hover:bg-gray-100">
            <img src="/kakao-logo.png" alt="Kakao Logo" className="w-6 h-6" />
            <span>Kakao로 로그인</span>
          </button>
          <button className="flex items-center justify-center gap-2 border border-gray-400 rounded-lg py-2 px-4 hover:bg-gray-100">
            <img src="/google-logo.png" alt="Google Logo" className="w-6 h-6" />
            <span>Google로 로그인</span>
          </button>
          <button className="flex items-center justify-center gap-2 border border-gray-400 rounded-lg py-2 px-4 hover:bg-gray-100">
            <img src="/naver-logo.png" alt="Naver Logo" className="w-6 h-6" />
            <span>Naver로 로그인</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
