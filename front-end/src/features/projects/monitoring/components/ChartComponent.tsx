import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import "./ChartComponent.css";

type ChartDataPoint = {
  time: string;
  percentage: number;
  value: number;
};

type ChartComponentProps = {
  title: string;
  unit: string;
  newData: ChartDataPoint[];
  height: number;
};

const ChartComponent: React.FC<ChartComponentProps> = ({ title, unit, newData, height }) => {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [chartOptions, setChartOptions] = useState<any>({
    chart: { type: 'area', animations: { enabled: true, easing: 'easeout', speed: 500 }, toolbar: { show: false } },
    stroke: { curve: 'straight', width: 1, colors: ['#00E396'] },
    fill: { type: 'gradient', gradient: { shade: 'dark', type: 'vertical', shadeIntensity: 0.6, opacityFrom: 0.5, opacityTo: 0.5, stops: [0, 90, 100], gradientFromColors: ['#00E396'], gradientToColors: ['#00E396'], }, },
    xaxis: { categories: [], labels: { show: false }, axisTicks: { show: false } },
    yaxis: { min: 0, max: 100, tickAmount: 4, labels: { show: false }, axisTicks: { show: false } },
    grid: { borderColor: '#444', strokeDashArray: 3, yaxis: { labels: { show: false } } },
    tooltip: { enabled: true, marker: { show: false }, theme: 'dark' },
    markers: { size: 0, hover: { size: 0 } },
    dataLabels: { enabled: false }, // ✅ dataLabels 비활성화
  });

  useEffect(() => {
    if (newData.length > 0) {
      setData((prevData) => {
        const mergedData = [...prevData, ...newData];
        const uniqueData = mergedData.reduce((acc: ChartDataPoint[], current) => {
          if (!acc.find((item) => item.time === current.time)) acc.push(current);
          return acc;
        }, []);
        const cutoffTime = new Date(Date.now() - 2 * 60 * 1000).toLocaleTimeString();
        return uniqueData.filter((point) => point.time >= cutoffTime);
      });
    }
  }, [newData]);

  useEffect(() => {
    if (data.length === 0) return;

    const percentages = data.map((point) => point.percentage);
    const times = data.map((point) => point.time);

    setChartOptions((prevOptions:any) => ({
      ...prevOptions,
      xaxis: { categories: times },
    }));

    setSeries([{ name: 'Percentage', data: percentages }]);
  }, [data]);

  return (
    <div className="w-full p-[5px] bg-[#141617] rounded-md relative" style={{ height: `${height - 5}px` }}>
      <h4 className="text-white font-semibold mb-2">{title}</h4>
      <div className="absolute top-[40px] left-2 text-white text-sm">
        <p>{data.length > 0 ? `${data[data.length - 1].percentage}%` : '0%'}</p>
        <p>{data.length > 0 ? data[data.length - 1].value.toFixed(2) : '0.00'} {unit}</p>
      </div>
      <Chart options={chartOptions} series={series} type="area" height={height - 50} />
    </div>
  );
};

export default ChartComponent;
