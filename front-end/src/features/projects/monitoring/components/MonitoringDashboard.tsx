import React from 'react';
import ChartComponent from './ChartComponent';
import { ResourceData } from '../types/monitoringTypes';

type MonitoringDashboardProps = {
  data: ResourceData[];
};

const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ data }) => {
    const cpuData = data.map((item) => ({
      time: new Date(item.rateTime * 1000).toLocaleTimeString(),
      percentage: item.cpuPercentage,
      value: item.cpuValue,
    }));
    const memoryData = data.map((item) => ({
      time: new Date(item.rateTime * 1000).toLocaleTimeString(),
      percentage: item.memoryPercentage,
      value: item.memoryValue,
    }));

  return (
    <div className="flex flex-col gap-4">
      <ChartComponent title="CPU Usage" newData={cpuData} />
      <ChartComponent title="Memory Usage" newData={memoryData} />
      {/* 다른 차트 (예: Memory)도 같은 방식으로 추가 가능 */}
    </div>
  );
};

export default MonitoringDashboard;
