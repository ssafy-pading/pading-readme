// types/ApproveRequestResponse.ts

// -------공통-------
// 요청 승인 (POST, PATCH, DELETE)
export type ApproveRequestResponse = {
    success: boolean; // 요청 성공 여부
    data: null;       // 성공 시 반환되는 데이터 (현재 null로 설정)
    error: null;      // 에러 메시지 (현재 null로 설정)
  };  