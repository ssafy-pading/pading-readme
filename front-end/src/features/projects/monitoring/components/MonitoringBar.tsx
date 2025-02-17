import { useEffect, useRef, useState } from "react";
import { ResourceData } from "../types/monitoringTypes";
import ResourceBar from "./ResourceBar";
import cpu from "../../../../assets/cpu.svg";
import memory from "../../../../assets/memory.svg";

interface MonitoringDataProps {
  monitoringDataList: ResourceData[];
}

const ResourceMonitorBar = ({ monitoringDataList }: MonitoringDataProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);
  const [monitoringData, setMonitoringData] = useState<ResourceData | null>(null);
  const monitoringDataRef = useRef<ResourceData | null>(null);

  useEffect(() => {
    if (monitoringDataList.length > 0) {
      const lastData = monitoringDataList[monitoringDataList.length - 1];

      // 직전 데이터와 비교 후 다를 때만 업데이트
      if (monitoringDataRef.current?.rateTime !== lastData.rateTime) {
        setMonitoringData(lastData);
        monitoringDataRef.current = lastData; // 최신 값 업데이트
        // console.log("Updated monitoring data:", lastData); // 확인용 로그
      }
    }
  }, [monitoringDataList]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width < 200) {
          setIsCompact(true);
        } else {
          setIsCompact(false);
        }
      }
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex items-center bg-[#212426] text-gray-400 text-xs h-6 px-2 border-t border-gray-700"
    >
      <div className={`${isCompact ? "w-[40px] mr-1" : "w-[90px] mr-2"} flex mr-2`}>
        <img src={cpu} alt="cpu" />
        <ResourceBar name="CPU" percent={monitoringData?.cpuPercentage} isCompact={isCompact} />
      </div>
      <div className={`${isCompact ? "w-[40px]" : "w-[90px] mr-2"} flex mr-2`}>
        <img src={memory} alt="memory" />
        <ResourceBar name="Mem" percent={monitoringData?.memoryPercentage} isCompact={isCompact} />
      </div>
    </div>
  );
};

export default ResourceMonitorBar;
