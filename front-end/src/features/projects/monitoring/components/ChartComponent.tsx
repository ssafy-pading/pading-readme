import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';

type ChartDataPoint = {
  time: string;
  percentage: number;
  value: number;
};

type ChartComponentProps = {
  title: string;
  unit: string;
  bUnit: string;
  maxValue: number;
  newData: ChartDataPoint[];
  height: number;
};

// 더미 데이터 생성 함수 (5초 단위, 2분 전까지)
const generateDummyData = (): ChartDataPoint[] => {
  const now = new Date();
  const dummyData: ChartDataPoint[] = [];

  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 5000).toLocaleTimeString();
    dummyData.push({ time, percentage: 0, value: 0 });
  }

  return dummyData;
};

const ChartComponent: React.FC<ChartComponentProps> = ({ title, unit, bUnit, maxValue, newData, height }) => {
  const [data, setData] = useState<ChartDataPoint[]>(generateDummyData());
  const [series, setSeries] = useState<any[]>([]);
  const [chartOptions, setChartOptions] = useState<any>({
    chart: { 
      type: 'area', 
      animations: { enabled: true, easing: 'easeout', speed: 500 }, 
      toolbar: { show: false } 
    },
    stroke: { curve: 'straight', width: 1, colors: ['#15803D'] },
    fill: { 
      type: 'gradient', 
      gradient: { 
        shade: 'dark', 
        type: 'vertical', 
        shadeIntensity: 0.6, 
        opacityFrom: 0.5, 
        opacityTo: 0.5, 
        stops: [0, 90, 100], 
        gradientFromColors: ['#15803D'], 
        gradientToColors: ['#15803D'], 
      }
    },
    xaxis: { categories: [], labels: { show: false }, axisTicks: { show: false } },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 5,
      tickPlacement: 'on',
      opposite: true,
      labels: { 
        show: true,
        align: 'right',
        offsetX: 40,
        formatter: (value: any) => (value === 0 || value === 100 ? value.toFixed(0) : ''),
        style: {
          colors: '#fff',
          fontSize: '12px',
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontWeight: 400
        },
      },
      axisTicks: { 
        show: false,
        color: '#fff',
        width: 2,
      },
    },    
    grid: { borderColor: '#444', strokeDashArray: 3, yaxis: { labels: { show: true } } },
    tooltip: { enabled: false, marker: { show: false }, theme: 'dark' },
    markers: { size: 0, hover: { size: 0 } },
    dataLabels: { enabled: false },
  });

  // 데이터 병합 및 cutoff 처리 (최근 2분 이내 데이터)
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

// chartOptions 및 series 업데이트
useEffect(() => {
  if (data.length === 0) return;

  const percentages = data.map((point) => point.percentage);
  const times = data.map((point) => point.time);

  // ✅ 최신 percentage 기준으로 색상 결정 (80% 초과면 빨강, 아니면 초록)
  const currentPercentage = percentages[percentages.length - 1];
  const newColor = currentPercentage > 80 ? '#FF0000' : '#00E396';

  // ✅ 차트 옵션 업데이트 (xaxis.categories 우선 업데이트)
  setChartOptions((prevOptions: any) => ({
    ...prevOptions,
    xaxis: { 
      ...prevOptions.xaxis,
      categories: times // ✅ x축 시간값 최신화
    },
    stroke: { ...prevOptions.stroke, colors: [newColor] },
    fill: { 
      ...prevOptions.fill, 
      gradient: {
        ...prevOptions.fill.gradient,
        gradientFromColors: [newColor],
        gradientToColors: [newColor],
      }
    },
  }));

  // ✅ `series`를 새로운 배열로 할당하여 ApexCharts가 변경을 감지하도록 함
  setSeries([{ name: 'Percentage', data: [...percentages] }]);

}, [data]); // ✅ data 변경 시 실행


  // 최신 데이터 포인트 표시 (value가 1000 이상이면 1024로 나누고 bUnit 표시)
  const lastDataPoint = data[data.length - 1];
  const displayValue = lastDataPoint
    ? title === 'CPU Usage' 
      ? (lastDataPoint.value * 1000).toFixed(2)
      : lastDataPoint.value > 1000
        ? (lastDataPoint.value / 1024).toFixed(2)
        : lastDataPoint.value.toFixed(2)
      : '0.00';

  const displayMaxValue = lastDataPoint 
    ? title === 'Memory Usage'
      ? lastDataPoint.value > 1000 
        ? maxValue
        : maxValue * 1024
      : maxValue * 1000
    : '0.00';

  const displayUnit = lastDataPoint
    ? lastDataPoint.value > 1000
      ? bUnit
      : unit
    : unit;

  return (
    <div className="w-full pt-[15px] pb-[10px] px-[5px] bg-[#141617] rounded-md relative" style={{ height: `${height - 25}px` }}>
      <h4 className="text-white font-semibold mb-2">
        {title} : &nbsp;
        <span className={`${data.length > 0 ? (data[data.length - 1].percentage < 80 ? 'text-[#1EC84E]' : 'text-[#FF0000]'): '0%'}`}>
          {data.length > 0 ? `${data[data.length - 1].percentage}% ` : '0% '}
        </span> 
         | {displayValue} / {displayMaxValue} {displayUnit}
      </h4>
      <Chart options={chartOptions} series={series} type="area" height={height - 30} />
    </div>
  );
};

export default ChartComponent;
