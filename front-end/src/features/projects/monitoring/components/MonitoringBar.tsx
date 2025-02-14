import { useEffect, useRef, useState } from "react";
import { MonitoringResourceModel } from "../types/monitoringTypes";
import ResourceBar from "./ResourceBar";
import cpu from "../../../../assets/cpu.svg"
import memory from "../../../../assets/memory.svg"

interface MonitoringDataProps {
    monitoringDataList: MonitoringResourceModel[];
  }
  
  const ResourceMonitorBar = ({ monitoringDataList }: MonitoringDataProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isCompact, setIsCompact] = useState(false);
    const [monitoringData, setMonitoringData] = useState<MonitoringResourceModel | null>(null);
  
    // monitoringDataList가 바뀔 때마다 최신 데이터를 설정
    useEffect(() => {
      if (monitoringDataList.length > 0) {
        const lastData = monitoringDataList[monitoringDataList.length - 1];
        setMonitoringData(lastData);
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
        <div className={`${isCompact ? 'w-[40px] mr-1' :'w-[90px] mr-2'} flex mr-2`}>
          <img src={cpu} alt="cpu" />
          <ResourceBar 
            name="CPU"
            percent={monitoringData?.cpuPercentage}
            isCompact={isCompact}
          />
        </div>
        <div className={`${isCompact ? 'w-[40px]' :'w-[90px] mr-2'} flex mr-2`}>
          <img src={memory} alt="memory" />
          <ResourceBar 
            name="Mem"
            percent={monitoringData?.memoryPercentage}
            isCompact={isCompact}
          />
        </div>
      </div>
    );
  };
  
  export default ResourceMonitorBar;
  