import React from 'react';
import { BsBellFill, BsBellSlash } from "react-icons/bs";
import { useCallSocket } from '../../components/CallSocket';

const CallButton: React.FC = () => {
  const { sendCallActive, sendCallInactive, callActive } = useCallSocket();

  const handleClick = () => {
    if (callActive) {
      sendCallInactive();
    } else {
      sendCallActive();
    }
  };

  return (
    <div className="relative inline-block group">
      <button
        onClick={handleClick}
        className="group bg-transparent border-none cursor-pointer py-1 ml-2 focus:outline-none"
      >
        {callActive ? (
          <div className="relative">
            {/* 기본 벨 아이콘: hover 시 숨김 */}
            <BsBellFill className="w-4 h-4 animate-ring text-[#059669] group-hover:hidden" />
            {/* 호버 시 나타나는 벨 슬래시 아이콘 */}
            <BsBellSlash className="w-4 h-4 animate-ring text-[#059669] hidden group-hover:block" />
          </div>
        ) : (
          <BsBellFill className="w-4 h-4" />
        )}
        {/* 툴팁 */}
        <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-gray-700 text-white text-xs whitespace-nowrap rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          {callActive ? '호출중 (취소하려면 클릭)' : '관리자 호출'}
        </span>
      </button>
    </div>
  );
};

export default CallButton;
