import React from "react";
import { CiPlay1 } from "react-icons/ci";

interface RunButtonProps {
  onExecute: () => void;
}

const RunButton: React.FC<RunButtonProps> = ({ onExecute }) => {
  const handleClick = () => {
    onExecute();
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        className="group bg-transparent border-none cursor-pointer opacity-100 py-1"
      >
        <CiPlay1 className="text-[#059669] text-md" style={{ strokeWidth: 3 }}/>
        {/* 툴팁 */}
        <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1/2 px-2 py-1 bg-gray-700 text-white text-xs whitespace-nowrap rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          실행 버튼
        </span>
      </button>
    </div>
  );
};

export default RunButton;
