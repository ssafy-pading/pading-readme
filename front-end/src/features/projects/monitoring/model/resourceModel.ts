import { fetchCpu, fetchMemory, fetchMemoryPercent } from "../api/monitoringApis";
import { ResourceData } from "../types/monitoringTypes";
/**
 * CPU 사용량 퍼센티지 계산 함수
 * cpuUsage: 초당 사용된 CPU 시간 (예: 0.003682554)
 * allocatedVCpu: 할당된 vCPU 수 (기본값 1)
 */
function calculateCpuUsagePercentage(cpuUsage: number, allocatedVCpu = 1): number {
    const percentage = (cpuUsage / allocatedVCpu) * 100;
    return percentage;
  }
  
  /**
   * API에서 받아온 데이터를 가공하여 모니터링 리소스 모델을 생성합니다.
   */
  export const getMonitoringResource = async(
    containerId:string,
    cpuName:string,
  ): Promise<ResourceData> => {
    // API 함수 호출 (임시)
    const [cpuTime, cpuStr] = await fetchCpu(containerId);
    const [memoryTime, memoryStr] = await fetchMemory(containerId);
    // const uploadNetworkData = await fetchNetworkUpload(containerId);
    // const downloadNetworkData = await fetchNetworkDownload(containerId);
    // const networkData = [uploadNetworkData, downloadNetworkData];
    const [memoryPercentageTime, memoryPercentageValue] = await fetchMemoryPercent(containerId);

    // CPU 값 변환 및 퍼센티지 계산
    const allocatedVCpu = parseFloat(cpuName);
    const cpuValue = Number(cpuStr);
    const cpuPercentage = parseFloat(calculateCpuUsagePercentage(cpuValue, allocatedVCpu).toFixed(2));
    
    // 메모리 값 변환: 문자열(바이트) → number → 메가바이트 변환 및 소수점 2자리까지 반올림
    const memoryBytes = Number(memoryStr);
    const memoryValue = parseFloat((memoryBytes / (1024 * 1024)).toFixed(2));
    const memoryPercentage = parseFloat(Number(memoryPercentageValue).toFixed(2));
  
    // // 네트워크 값 변환: 각 값(바이트) → 메가바이트, 소수점 2자리까지 반올림
    // const network = networkData.map(([time, valueStr]) => {
    //   const valueBytes = Number(valueStr);
    //   return parseFloat((valueBytes / (1024 * 1024)).toFixed(2));
    // });

    // rateTime은 각 API에서 받은 시간 중 가장 마지막(최대) 값을 사용
    // const allTimes = [cpuTime, memoryTime, memoryPercentageTime, ...networkData.map(([time]) => time)];
    const allTimes = [cpuTime, memoryTime, memoryPercentageTime];
    const rateTime = Math.max(...allTimes);
    return {
      cpuValue,
      cpuPercentage,
      memoryValue,
      memoryPercentage,
      // network,
      rateTime,
    };
  }