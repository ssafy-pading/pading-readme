// types/mypageApiResponse.ts

// 마이페이지 조회
export type GetMyPageResponse = {
  success: boolean; // 요청 성공 여부
  data: {
      name: string;    // 사용자 이름
      image: string;   // 사용자 프로필 이미지 URL
      email: string;   // 사용자 이메일
  } | null; // 성공 시 반환되는 데이터
  error: string | null; // 에러 메시지
};
// 이름(닉네임) 변경
export type UpdateNameResponse = {
  success: boolean; // 요청 성공 여부
  data: {
      old_name: string;      // 이전 이름(닉네임)
      new_name: string;      // 변경된 이름(닉네임)
      updated_at: string;    // 변경된 시간
  } | null; // 성공 시 반환되는 데이터
  error: string | null; // 에러 메시지
};

// 이름(닉네임) 변경
export type UpdateProfileResponse = {
  success: boolean; // 요청 성공 여부
  data: {
      old_name: string;      // 이전 이름(닉네임)
      new_name: string;      // 변경된 이름(닉네임)
      updated_at: string;    // 변경된 시간
  } | null; // 성공 시 반환되는 데이터
  error: string | null; // 에러 메시지
};
