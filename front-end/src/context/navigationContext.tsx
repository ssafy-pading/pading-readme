import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextProps {
  /** 프로필 사이드바가 완전히 열려 있는지 여부 */
  isProfileNavOpen: boolean;
  /** 사이드바 열림/닫힘 토글 함수 */
  toggleProfileNav: () => void;
}

const NavigationContext = createContext<NavigationContextProps | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isProfileNavOpen, setIsProfileNavOpen] = useState(true);

  const toggleProfileNav = () => {
    setIsProfileNavOpen(prevState => !prevState);
  };

  return (
    <NavigationContext.Provider 
      value={{ 
        isProfileNavOpen, 
        toggleProfileNav, 
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
