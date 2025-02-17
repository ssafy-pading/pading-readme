import React from 'react';
import ChartComponent from './ChartComponent';
import { ResourceData } from '../types/monitoringTypes';

type MonitoringDashboardProps = {
  data: ResourceData[];
  height: number; // 전달받을 전체 높이
};

const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ data, height }) => {
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

  // 차트 높이를 부모 높이의 절반씩 할당 (padding 등을 고려해 약간 줄임)
  const chartHeight = height;

  return (
    <div className="grid grid-cols-2 gap-4" style={{ height: `${height}px`, overflow: 'hidden' }}>
      <ChartComponent title="CPU Usage" unit="ms" newData={cpuData} height={chartHeight} />
      <ChartComponent title="Memory Usage" unit="MB" newData={memoryData} height={chartHeight} />
    </div>
  );
};

export default MonitoringDashboard;
