import axios from "axios";
import { MonitoringData, MonitoringResponse } from "../types/monitoringTypes";

// monitoringApi.ts
const API_BASE_URL = import.meta.env.VITE_APP_API_MONITORING_URL;

/**
 * 공통으로 사용하는 API 호출 함수.
 * @param query - 요청하는 
 * @returns [number, string] 형태의 메트릭 값
 */
const fetchMetric = async (
    query:string
  ): Promise<MonitoringData> => {
    
    const url = `${API_BASE_URL}/api/v1/query?query=${query}`
    // Axios를 사용하여 GET 요청을 보냅니다.
    const response = await axios.get<MonitoringResponse>(url);
    
    // 응답 데이터의 data.result 마지막 요소의 value를 반환합니다.
    return response.data.data.result[response.data.data.result.length - 1].value;
}



/** CPU 데이터를 가져오는 함수 */
export function fetchCpu(containerId: string): Promise<MonitoringData> {
    return fetchMetric(`rate(container_cpu_usage_seconds_total{container="${containerId}"}[5m])`);
  }
  
  /** Memory 데이터를 가져오는 함수 */
  export function fetchMemory(containerId: string): Promise<MonitoringData> {
    
    return fetchMetric(`container_memory_usage_bytes%7Bcontainer="${containerId}"%7D`);
  }
  
  /** Memory Percent 데이터를 가져오는 함수 */
  export function fetchMemoryPercent(
    containerId: string
  ): Promise<MonitoringData> {
    return fetchMetric(`(container_memory_usage_bytes{container="${containerId}"}%20/%20container_spec_memory_limit_bytes{container="${containerId}"})%20*%20100`);
  }
  
  /** Network 업로드양 데이터를 가져오는 함수 */
  export function fetchNetworkUpload(containerId: string): Promise<MonitoringData> {
    return fetchMetric(`rate(container_network_transmit_bytes_total%7Bpod="${containerId}"%7D%5B5m%5D)`);
  }
  
  /** Network 다운로드양 데이터를 가져오는 함수 */
  export function fetchNetworkDownload(containerId: string): Promise<MonitoringData> {
    return fetchMetric(`rate(container_network_receive_bytes_total%7Bpod="${containerId}"%7D%5B5m%5D)`);
  }