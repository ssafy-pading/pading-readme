// types/apiResponse.ts

// -------개별-------
// 구글 로그인
export type GoogleLoginResponse = {
  accessToken: string;      // 액세스 토큰
  refreshToken: string;     // 리프레시 토큰
  // id: number;               // 사용자 ID
  // nickname: string;         // 닉네임
  // streamingApp: string;     // 연결된 스트리밍 앱 (예: SPOTIFY)
  // isPush: boolean;          // 푸시 알림 설정 여부
};
// // JWT 재발급
// export type RefreshJWTResponse = {
//   accessToken: string;  // 새로 발급된 액세스 토큰
//   refreshToken: string; // 새로 발급된 리프레시 토큰
// };
