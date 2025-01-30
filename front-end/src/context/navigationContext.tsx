import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextProps {
  /** 프로필 사이드바가 완전히 열려 있는지 여부 */
  isProfileNavOpen: boolean;
  /** 사이드바 열림/닫힘 토글 함수 */
  toggleProfileNav: () => void;

  /** 호버 상태 (부분 열림 등) */
  isHover: boolean;
  /** 호버 상태를 직접 설정하는 함수 */
  setIsHover: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavigationContext = createContext<NavigationContextProps | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isProfileNavOpen, setIsProfileNavOpen] = useState(true);
  const [isHover, setIsHover] = useState(false);

  const toggleProfileNav = () => {
    setIsProfileNavOpen(prevState => !prevState);
  };

  return (
    <NavigationContext.Provider 
      value={{ 
        isProfileNavOpen, 
        toggleProfileNav, 
        isHover, 
        setIsHover 
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextProps => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
