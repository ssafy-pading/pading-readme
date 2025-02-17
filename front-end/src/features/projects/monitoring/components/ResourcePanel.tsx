import React, { useEffect, useRef } from 'react';
import MonitoringDashboard from './MonitoringDashboard';
import { ResourceData } from '../types/monitoringTypes';

type ResourcePanelProps = {
  data: ResourceData[];
  height?: number; // 높이 prop (옵션)
};

const ResourcePanel: React.FC<ResourcePanelProps> = ({ data, height = 400 }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 필요하다면, window 리사이즈 이벤트를 통해 fit 조정을 할 수 있음
  useEffect(() => {
    // 예시: window resize 이벤트를 통해 강제 리렌더링하거나, 차트 사이즈 조정을 할 수 있음
  }, [height]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: `${height}px`,
        padding: "4px 8px",
        overflow: "hidden", // 내용이 넘치지 않도록 처리
      }}
      className="bg-[#141617] text-white"
    >
      <MonitoringDashboard 
        data={data} 
        height={height}
      />
    </div>
  );
};

export default ResourcePanel;
