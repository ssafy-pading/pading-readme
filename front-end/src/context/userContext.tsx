import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GetMyPageResponse } from '../shared/types/mypageApiResponse';
import useMypageAxios from '../shared/apis/useMypageAxios';

interface UserContextProps {
  /** 유저 프로필 객체 */
  userProfile: GetMyPageResponse | null;
  setUserProfile: (profile: GetMyPageResponse | null) => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<GetMyPageResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { getProfile } = useMypageAxios();
  useEffect(() => {
    // 1. 로그인 상태 체크 (예: JWT 토큰 확인)
    const token = sessionStorage.getItem('accessToken'); // 혹은 sessionStorage 사용 가능
    if (!token) {
      setIsAuthenticated(false);
      return; // 로그인되지 않았다면 fetchUserProfile 호출하지 않음
    }

    setIsAuthenticated(true);

    // 2. 로그인된 경우 프로필 가져오기
    if (!userProfile) {
      fetchUserProfile();
    }
    console.log(userProfile);
  }, [userProfile]);

  // 백엔드에서 유저 프로필을 불러오는 함수
  const fetchUserProfile = async () :Promise<void> => {
    try {
      const response:GetMyPageResponse = await getProfile();

      if (!response) {
        throw new Error('프로필 불러오기에 실패하였습니다.');
      }
      setUserProfile(response);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  return (
    <UserContext.Provider 
      value={{ 
        userProfile,
        setUserProfile,
        isAuthenticated
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextProps => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
