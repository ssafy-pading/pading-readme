import React, { useState, useEffect } from "react";

type ResourceMonitorProps = {
  name: string;
  percent?: number; // percent는 선택적
  isCompact:boolean // 부모 길이 특정 이하가 될 때 반응형
};

const getColor = (percent: number | undefined) => {
  if (percent === undefined) return "bg-gray-400"; // undefined일 때 회색
  if (percent > 75) return "bg-red-700";
  if (percent > 50) return "bg-yellow-700";
  return "bg-green-700";
};

const ResourceBar: React.FC<ResourceMonitorProps> = ({ name, percent, isCompact }) => {
  const [percentage, setPercentage] = useState<number | undefined>(percent);

  useEffect(() => {
    setPercentage(percent !== undefined ? Math.min(Math.max(percent, 0), 100) : undefined);
  }, [percent]);

  return (
    <div className="w-full max-w-sm rounded-md shadow-sm bg-[#212426] relative ml-1 my-auto">
      <div className={`w-full flex items-center justify-around absolute ${isCompact ? `hidden`:''}`}>
        <div className="text-[10px] font-semibold text-gray-300">{name}</div>
        <div className="text-[10px] font-semibold text-gray-300">
          {percentage !== undefined ? `${percentage}%` : "N/A"}
        </div>
      </div>
      {!isCompact ? 
      <div className="w-full h-4 bg-[#394648] rounded-md overflow-hidden">
        <div
          className={`h-full ${getColor(percentage)} transition-all duration-300 ease-out`}
          style={{ width: `${percentage !== undefined ? percentage : 100}%` }}
          ></div>
      </div>
      :<div className={`w-3 h-3 rounded-full ${getColor(percentage)}`}></div>
        }
    </div>
  );
};

export default ResourceBar;
