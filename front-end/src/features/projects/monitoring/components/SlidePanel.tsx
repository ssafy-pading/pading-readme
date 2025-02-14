import React, { useState } from 'react';
import MonitoringDashboard from './MonitoringDashboard';
import { ResourceData } from '../types/monitoringTypes';

type SlidePanelProps = {
  data: ResourceData[];
};

const SlidePanel: React.FC<SlidePanelProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* 슬라이드 패널 - 화면 전체 기준 */}
      <div
        className={`fixed top-0 right-0 h-full w-[500px] bg-gray-900 text-white transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <h3 className="text-lg font-semibold p-4">Monitoring Dashboard</h3>
        <div className="p-4">
          <MonitoringDashboard data={data} />
        </div>
      </div>

      {/* 토글 버튼 */}
      <button
        onClick={togglePanel}
        className={`fixed top-1/2 transform -translate-y-1/2 bg-gray-700 text-white px-3 py-2 rounded-l z-50 ${
          isOpen ? 'right-[500px]' : 'right-0'
        }`}
      >
        {isOpen ? '◀' : '▶'}
      </button>
    </>
  );
};

export default SlidePanel;
