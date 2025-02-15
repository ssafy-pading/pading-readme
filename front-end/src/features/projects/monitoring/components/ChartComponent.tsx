import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';

type ChartDataPoint = {
  time: string;  // HH:MM:SS 형식
  percentage: number;
  value: number;
};

type ChartComponentProps = {
  title: string;
  newData: ChartDataPoint[];
};

const ChartComponent: React.FC<ChartComponentProps> = ({ title, newData }) => {
  const [data, setData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    if (newData.length > 0) {
      setData((prevData) => {
        // 새로운 데이터와 기존 데이터 병합
        const mergedData = [...prevData, ...newData];

        // time 기준으로 중복 제거
        const uniqueData = mergedData.reduce((acc: ChartDataPoint[], current) => {
          if (!acc.find((item) => item.time === current.time)) {
            acc.push(current);
          }
          return acc;
        }, []);

        // 2분 기준으로 오래된 데이터 제거
        const cutoffTime = new Date(Date.now() - 2 * 60 * 1000).toLocaleTimeString();
        return uniqueData.filter((point) => point.time >= cutoffTime);
      });
    }
  }, [newData]);

  const latestData = data.length > 0 ? data[data.length - 1] : { percentage: 0, value: 0 };

  return (
    <div className="w-full h-[300px] bg-[#212426] p-4 rounded-md relative">
      <h4 className="text-white font-semibold mb-2">{title}</h4>
      <div className="absolute top-[40px] left-4 text-white text-sm">
        <p>{latestData.percentage}%</p>
        <p>{latestData.value.toFixed(2)}</p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#444" horizontal={true} vertical={false} />
          <XAxis
            dataKey="time"
            tickFormatter={(time) => {
              const parts = time.split(':');
              return parts.length === 3 ? `${parts[1]}:${parts[2]}` : time;
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} axisLine={false} tick={false} />
          <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#333' }} />
          <Area type="monotone" dataKey="percentage" stroke="#82ca9d" fill="rgba(130, 202, 157, 0.3)" />
          <Line type="monotone" dataKey="percentage" stroke="#82ca9d" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

};

export default ChartComponent;
