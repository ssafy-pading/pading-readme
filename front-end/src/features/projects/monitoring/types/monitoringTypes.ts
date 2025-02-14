// Matric Result
export type MonitoringData = [number, string];

export interface MonitoringResponse {
    data:{
        result:{
            metric: Record<string, unknown>,
            value: MonitoringData,
        }[]
    }
}

export type ResourceData = {
    cpuValue: number;
    cpuPercentage: number;
    memoryValue: number;
    memoryPercentage: number;
    rateTime: number; // Unix timestamp (초 단위)
};

// 차트에서 사용하는 타입
export type ChartDataPoint = {
    time: string; // 시간 (HH:MM:SS)
    value: number; // 사용량 값 (CPU 또는 메모리 %)
};
