import { useEffect, useRef } from "react";
import { GrDocumentConfig } from "react-icons/gr";
import { FaShapes } from "react-icons/fa6";
import { GrGroup } from "react-icons/gr";
import onboarding from "../assets/onboarding.png";

const Mainpage = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 2번 섹션 박스들의 페이드인 효과를 위한 IntersectionObserver
  useEffect(() => {
    const boxes = containerRef.current?.querySelectorAll(".box");
    const boxObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 등장 시 opacity/translate 클래스 제거 -> 페이드인
            entry.target.classList.remove("opacity-0", "translate-y-5");
            boxObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    boxes?.forEach((box) => boxObserver.observe(box));

    return () => boxObserver.disconnect();
  }, []);

  // 특정 섹션으로 스크롤 이동
  const scrollToSection = (index: number) => {
    containerRef.current?.children[index].scrollIntoView({ behavior: "smooth" , block: "start", inline: "nearest" });
  };

  return (
    <div className="relative">
      {/* 왼쪽 점(dot) 네비게이션 */}

      {/* 스크롤 컨테이너 (풀페이지 스냅) */}
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll scroll-smooth"
        style={{ scrollSnapType: "y mandatory", height: "100vh" }}
      >
        {/* 1번 섹션: 배경이미지 + 사이트명 + 버튼 + 화살표(3개 깜빡임) */}
        <div
          data-index={0}
          className="section relative flex items-center justify-center h-screen text-white"
          style={{ scrollSnapAlign: "start" }}
        >
          {/* 백그라운드 이미지 */}
          <div
            className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
            style={{
              // 실제 이미지는 아래 부분 교체
              backgroundImage: `url("${onboarding}")`,
            }}
          />
          {/* 반투명 오버레이 */}
          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 z-0" />

          {/* 메인 콘텐츠 */}
          <div className="z-10 text-center relative">
            <h1 className="text-[4rem] font-bold mb-4">Coding with Pading</h1>
            <p className="text-[2rem] mb-6">추운 겨울 사무실에 출근해야하나? 그냥 패딩하자</p>
            <a
            href="LoginPage로 이동하는 주소"
            className="inline-block px-6 py-3 bg-[#3B82F6] rounded-md text-white font-bold mb-8 
                        transition duration-300 ease-in-out hover:brightness-95"
            >
                Get Started
            </a>

            {/* 아래로 스크롤을 유도하는 3개의 화살표 */}
          </div>
            <div
              className="absolute bottom-0 flex flex-col items-center cursor-pointer left-1/2 transform -translate-x-1/2"
              onClick={() => scrollToSection(1)}
            >
              <div className="relative">
                {/* 첫 번째 화살표 */}
                <span className="absolute bottom-7 left-[-40px] w-20 h-10 text-white" style={{ animation: "arrowBlink 1.5s infinite" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 50 30" strokeWidth={3} stroke="currentColor" className="w-20 h-10">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5l20 20 20-20" />
                    </svg>
                </span>

                {/* 두 번째 화살표 (0.3초 딜레이) */}
                <span className="absolute bottom-4 left-[-40px] w-20 h-10 text-white" style={{ animation: "arrowBlink 1.5s infinite", animationDelay: "0.3s" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 50 30" strokeWidth={3} stroke="currentColor" className="w-20 h-10">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5l20 20 20-20" />
                    </svg>
                </span>
                {/* 세 번째 화살표 (0.6초 딜레이) */}
                <span className="absolute bottom-1 left-[-40px] w-20 h-10 text-white" style={{ animation: "arrowBlink 1.5s infinite", animationDelay: "0.6s" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 50 30" strokeWidth={3} stroke="currentColor" className="w-20 h-10">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5l20 20 20-20" />
                    </svg>
                </span>
                </div>
            </div>
        </div>

        {/* 2번 섹션: 3개의 박스(사이트 소개) */}
        <div
          data-index={1}
          className="section h-screen flex flex-col text-gray-800 px-4 relative"
          style={{ scrollSnapAlign: "start", backgroundColor: "#f8f9fa" }}
        >
            <div className="relative top-5 left-[calc(100% - 30px)]">
                <a
                href="LoginPage로 이동하는 주소"
                className="inline-block px-6 py-3 bg-[#3B82F6] rounded-md text-white font-bold mb-8 
                            transition duration-300 ease-in-out hover:brightness-95"
                >
                    Get Started
                </a>
            </div>
            <div className="flex flex-col items-center justify-center h-[50%]">
                <div className="flex flex-wrap justify-center gap-12">
                    <div className="box w-72 bg-[#F8F9FF] flex items-center justify-center rounded-lg flex flex-col shadow-md p-6 text-center opacity-0 transform translate-y-5 transition-all duration-700">
                        {/* 아이콘 배경 원형 영역 */}
                        <div className="w-16 h-16 flex items-center justify-center bg-[#C6E2FF] rounded-full mb-4">
                            <GrDocumentConfig className="text-blue-500 text-4xl" />
                        </div>
                        
                        {/* 제목 */}
                        <h3 className="text-xl font-semibold text-gray-900">효율적인 관리</h3>

                        {/* 설명 */}
                        <p className="text-gray-500 text-sm mt-2">
                            여러 프로젝트를 생성하고 각 구성원을 실시간으로 관리할 수 있습니다.
                        </p>
                    </div>
                    <div className="box w-72 bg-[#F8F9FF] flex items-center justify-center rounded-lg flex flex-col shadow-md p-6 text-center opacity-0 transform translate-y-5 transition-all duration-700">
                        {/* 아이콘 배경 원형 영역 */}
                        <div className="w-16 h-16 flex items-center justify-center bg-[#F8DFFE] rounded-full mb-4">
                            <FaShapes className="text-purple-500 text-4xl" />
                        </div>
                        
                        {/* 제목 */}
                        <h3 className="text-xl font-semibold text-gray-900">다양한 환경 제공</h3>

                        {/* 설명 */}
                        <p className="text-gray-500 text-sm mt-2">
                            다양한 언어, 사양등을 지원하고 강력한 가상 개발 환경을 제공합니다.
                        </p>
                    </div>
                    <div className="box w-72 bg-[#F8F9FF] flex items-center justify-center rounded-lg flex flex-col shadow-md p-6 text-center opacity-0 transform translate-y-5 transition-all duration-700">
                        {/* 아이콘 배경 원형 영역 */}
                        <div className="w-16 h-16 flex items-center justify-center bg-[#D7FFD4] rounded-full mb-4">
                            <GrGroup className="text-green-500 text-4xl" />
                        </div>
                        
                        {/* 제목 */}
                        <h3 className="text-xl font-semibold text-gray-900">실시간 협업 환경</h3>

                        {/* 설명 */}
                        <p className="text-gray-500 text-sm mt-2">
                            화상연결과 채팅, 코드 공동 편집 환경을 제공합니다.
                        </p>
                    </div>
                </div>
            </div>

          <div className="flex flex-col items-center justify-center bg-[#F8F9FF] h-[50%]">
            <h2 className="text-3xl font-bold mb-12">주요 기능</h2>
            <div className="flex flex-wrap justify-center gap-8">
                <div className="max-w-xs text-center">
                <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    1
                </div>
                <h3 className="text-xl font-semibold mb-2">그룹 관리</h3>
                <p>초대링크 생성, 멤버관리 등 다양한 관리 기능을 제공받습니다.</p>
                </div>
                <div className="max-w-xs text-center">
                    <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                        2
                    </div>
                    <h3 className="text-xl font-semibold mb-2">그룹 참가</h3>
                    <p>사용자들은 초대링크로 그룹에 참가할 수 있습니다.</p>
                </div>
                <div className="max-w-xs text-center">
                <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    3
                </div>
                <h3 className="text-xl font-semibold mb-2">프로젝트 설정</h3>
                <p>다양한 개발 환경을 제공하며, 프로젝트에 참여할 사용자들을 지정할 수 있습니다.</p>
                </div>
                <div className="max-w-xs text-center">
                <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    4
                </div>
                <h3 className="text-xl font-semibold mb-2">프로젝트 사용</h3>
                <p>실시간 코드 동시 편집과 테스트, 다양한 실시간 협업도구로 개발 환경을 제공합니다.</p>
                </div>
            </div>
            </div>
          </div>
      </div>

      {/* 커스텀 keyframes를 위한 <style> (간단히 한 파일에 작성) */}
      <style>
        {`
          @keyframes arrowBlink {
            0%, 100% {
              opacity: 0.2;
            }
            50% {
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Mainpage;
