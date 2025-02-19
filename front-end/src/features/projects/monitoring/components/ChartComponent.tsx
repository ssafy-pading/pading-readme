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

const ChartComponent: React.FC<ChartComponentProps> = ({ title, unit, bUnit, maxValue, newData, height }) => {
  const [data, setData] = useState<ChartDataPoint[]>([]);
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
      tickAmount: 1, // ✅ y축 눈금 개수를 0과 100으로 제한
      tickPlacement: 'on', // ✅ 눈금 위치를 축 위에 정확히 표시
      opposite: true, // ✅ y축을 오른쪽에 배치
      labels: { 
        show: true, // ✅ y축 숫자 라벨 표시
        align: 'right',
        offsetX: 20,
        formatter: (value:any) => { // 디버깅용 콘솔 로그 추가
          return value.toFixed(0); // 반드시 정수로 변환해서 반환
        }
        , // ✅ 무조건 정수 형태로 숫자 반환
        style: {
          colors: '#fff', // ✅ 숫자 색상 설정
          fontSize: '12px',
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontWeight: 400
        },
      },
      axisTicks: { 
        show: true, // ✅ y축 눈금 표시
        color: '#fff', // ✅ 눈금 색상 (보이도록 설정)
        width: 2, // ✅ 눈금 두께 설정 (더 잘 보이도록)
      },
    },    
    grid: { borderColor: '#444', strokeDashArray: 3, yaxis: { labels: { show: true } } },
    tooltip: { enabled: true, marker: { show: false }, theme: 'dark' },
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

    // 최신 percentage 기준으로 색상 결정 (80% 초과면 빨강, 아니면 초록)
    const currentPercentage = percentages[percentages.length - 1];
    const newColor = currentPercentage > 80 ? '#FF0000' : '#00E396';

    setChartOptions((prevOptions: any) => ({
      ...prevOptions,
      xaxis: { categories: times },
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

    setSeries([{ name: 'Percentage', data: percentages }]);
  }, [data]);

  // 최신 데이터 포인트 표시 (value가 1000 이상이면 1024로 나누고 bUnit 표시)
  const lastDataPoint = data[data.length - 1];
  const displayValue = lastDataPoint
    ? lastDataPoint.value > 1000
      ? (lastDataPoint.value / 1024).toFixed(2)
      : lastDataPoint.value.toFixed(2)
    : '0.00';

  const displayMaxValue = lastDataPoint 
  ? title === 'Memory Usage'
    ? lastDataPoint.value > 1000 
      ? maxValue
      : maxValue * 1024
    : maxValue
  : '0.00';

  const displayUnit = lastDataPoint
    ? lastDataPoint.value > 1000
      ? bUnit
      : unit
    : unit;
  // console.log(`${title}`,  displayMaxValue);
  return (
    <div className="w-full pt-[15px] px-[5px] bg-[#141617] rounded-md relative" style={{ height: `${height - 5}px` }}>
      <h4 className="text-white font-semibold mb-2">{title}</h4>
      <div className="absolute top-[40px] left-2 text-white text-sm">
        <p>{displayValue} {displayUnit} / {displayMaxValue} {displayUnit}</p>
        <p>{data.length > 0 ? `${data[data.length - 1].percentage}%` : '0%'}</p>
      </div>
      <Chart options={chartOptions} series={series} type="area" height={height - 50} />
    </div>
  );
};

export default ChartComponent;
