import React from 'react';
import ChartComponent from './ChartComponent';
import { ResourceData } from '../types/monitoringTypes';

type MonitoringDashboardProps = {
  data: ResourceData[];
  height: number; // 전달받을 전체 높이
  cpuDescription : string|undefined
  memoryDescription : string|undefined
};

const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ data, height, cpuDescription, memoryDescription }) => {
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



  const cpuMaxValue = parseFloat(cpuDescription ?? "0");
  const memoryMaxValue = parseFloat(memoryDescription ?? "0");

  // 차트 높이를 부모 높이의 절반씩 할당 (padding 등을 고려해 약간 줄임)
  const chartHeight = height;

  return (
    <div className="grid grid-cols-2 gap-4 px-2" style={{ height: `${height}px`, overflow: 'hidden' }}>
      <ChartComponent title="CPU Usage" unit="m" bUnit="m" maxValue={cpuMaxValue} newData={cpuData} height={chartHeight} />
      <ChartComponent title="Memory Usage" unit="Mi" bUnit="Gi" maxValue={memoryMaxValue} newData={memoryData} height={chartHeight} />
    </div>
  );
};

export default MonitoringDashboard;
