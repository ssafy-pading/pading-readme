import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GetMyPageResponse } from '../shared/types/mypageApiResponse';

interface UserContextProps {
  /* 유저 프로필 객체 */
  userProfile: GetMyPageResponse|null;
  setUserProfile: (object:GetMyPageResponse) => void;

  /** 액세스 토큰 */
  accessToken: string|undefined;
  setAccessToken: (accessToken:string) => void;

}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<GetMyPageResponse>({
    name:"", email:"", image:null
  });
  const [accessToken, setAccessToken] = useState<string>("");

  return (
    <UserContext.Provider 
      value={{ 
        userProfile,
        setUserProfile,
        accessToken,
        setAccessToken
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextProps => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
