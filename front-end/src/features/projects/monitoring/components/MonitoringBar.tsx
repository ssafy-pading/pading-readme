import { useEffect, useRef, useState } from "react";
import { MonitoringResourceModel } from "../types/monitoringTypes";
import ResourceBar from "./ResourceBar";
import cpu from "../../../../assets/cpu.svg"
import memory from "../../../../assets/memory.svg"

interface MonitoringDataProps{
    monitoringDataListRef: React.RefObject<MonitoringResourceModel[]>;
}

const ResourceMonitorBar = (
    { monitoringDataListRef }: MonitoringDataProps
) => {
    const containerRef = useRef(null);
    const [isCompact, setIsCompact] = useState(false);
    const [monitoringData, setMonitoringData] = useState<MonitoringResourceModel|null>(null);

    useEffect(() => {
        if(monitoringDataListRef && monitoringDataListRef.current){
            const lastData = monitoringDataListRef.current[monitoringDataListRef.current.length - 1]; // 마지막 값 가져오기
            setMonitoringData(lastData);
        }
        console.log(monitoringDataListRef);
    }, [monitoringDataListRef]); // 빈 배열로 의존성을 설정해 처음 마운트 시 한 번만 실행

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
          for (const entry of entries) {
            if (entry.contentRect.width < 200) { // 특정 너비 이하일 때 Compact 모드
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
        {/* <div>CPU {monitoringData?.cpuPercentage}%</div> */}
        <div className={`${isCompact? 'w-[40px] mr-1' :'w-[90px] mr-2'} flex mr-2`}>
            <img src={cpu} />
            <ResourceBar 
                name="CPU"
                // percent={12.25}
                percent={monitoringData?.cpuPercentage}
                isCompact={isCompact}
            />
        </div>
        <div className={`${isCompact? 'w-[40px]' :'w-[90px] mr-2'} flex mr-2`}>
            <img src={memory} />
            <ResourceBar 
                name="Mem"
                // percent={30.11}
                percent={monitoringData?.memoryPercentage}
                isCompact={isCompact}
            />
        </div>
        {/* <div>Mem {monitoringData?.memoryPercentage}%</div> */}
      </div>
    );
  };


export default ResourceMonitorBar;