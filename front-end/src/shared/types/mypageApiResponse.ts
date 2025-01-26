// types/mypageApiResponse.ts

// 마이페이지 조회
export type GetMyPageResponse = {
  name: string;    // 사용자 이름
  image: string;   // 사용자 프로필 이미지 URL
  email: string;   // 사용자 이메일
};
// 이름(닉네임) 변경
export type UpdateNameResponse = {
  old_name: string;      // 이전 이름(닉네임)
  new_name: string;      // 변경된 이름(닉네임)
  updated_at: string;    // 변경된 시간
};

// 이름(닉네임) 변경
export type UpdateProfileResponse = {
  old_name: string;      // 이전 이름(닉네임)
  new_name: string;      // 변경된 이름(닉네임)
  updated_at: string;    // 변경된 시간
};
