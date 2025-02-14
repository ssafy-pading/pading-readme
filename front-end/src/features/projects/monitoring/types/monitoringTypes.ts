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


export interface MonitoringResourceModel {
    cpuValue: number;
    cpuPercentage: number;
    memoryValue: number;
    memoryPercentage: number;
    // network: number[];
    rateTime: number;
  }