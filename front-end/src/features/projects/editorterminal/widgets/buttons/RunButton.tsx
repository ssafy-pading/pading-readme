import React from "react";
import { VscPlay } from "react-icons/vsc";

interface RunButtonProps {
  onExecute: () => void;
}

const RunButton: React.FC<RunButtonProps> = ({ onExecute }) => {
  const handleClick = () => {
    onExecute();
  };

  return (
    <div className="relative group inline-block">
      <div className="inline-block">
        <button
          onClick={handleClick}
          className="flex items-center gap-2 p-2 bg-transparent border-none cursor-pointer opacity-100"
        >
          <VscPlay className="text-white text-md" />
        </button>
      </div>
      <div className="absolute top-full left-0 mt-1/2 px-2 py-1 bg-gray-700 text-white text-xs whitespace-nowrap rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        Run Command
      </div>
    </div>
  );
};

export default RunButton;
