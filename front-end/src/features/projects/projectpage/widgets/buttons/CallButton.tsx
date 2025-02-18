import React, { useState, useEffect } from 'react';
import { FaRegBell } from 'react-icons/fa';
import { useCallSocket } from '../../components/CallSocket';

const CallButton: React.FC = () => {
  const { sendCallActive } = useCallSocket();
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    sendCallActive();
    setClicked(true);
  };

  useEffect(() => {
    if (clicked) {
      const timer = setTimeout(() => {
        setClicked(false);
      }, 1000); // 1초 동안 "호출완료" 텍스트 표시
      return () => clearTimeout(timer);
    }
  }, [clicked]);

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        className="group bg-transparent border-none cursor-pointer py-1 ml-2 focus:outline-none"
      >
        {clicked ? (
          <span className="text-xs font-medium text-green-500">호출완료</span>
        ) : (
          <FaRegBell className="w-4 h-4" />
        )}
        {/* 툴팁 */}
        <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-gray-700 text-white text-xs whitespace-nowrap rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          Call Owner or Manager
        </span>
      </button>
    </div>
  );
};

export default CallButton;
