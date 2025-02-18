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
      }, 1000); // 2초 동안 "호출완료" 텍스트 표시
      return () => clearTimeout(timer);
    }
  }, [clicked]);

  return (
    <button onClick={handleClick} className="p-2 focus:outline-none ml-2">
      {clicked ? (
        <span className="text-xs font-medium text-green-500">호출완료</span>
      ) : (
        <FaRegBell className="w-4 h-4" />
      )}
    </button>
  );
};

export default CallButton;
