// src/context/navigationContext.tsx
import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';

interface NavigationContextProps {
  // 토글 버튼 관리
  isProfileNavOpen: boolean;
  toggleProfileNav: () => void;
  // 호버 이벤트 관리리
  isSmallNavOpen: boolean;
  handleButtonMouseEnter: () => void;
  handleButtonMouseLeave: () => void;
  handleNavMouseEnter: () => void;
  handleNavMouseLeave: () => void;
  handleToggleClick: () => void;
  handleCloseClick: () => void;
}

const NavigationContext = createContext<NavigationContextProps | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 큰 네비게이션 바 상태
  const [isProfileNavOpen, setIsProfileNavOpen] = useState<boolean>(true);
  // 작은(호버) 네비게이션 바 상태
  const [isSmallNavOpen, setIsSmallNavOpen] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const toggleProfileNav = () => {
    setIsProfileNavOpen(prev => !prev);
  };

  // 토글 버튼 및 호버 이벤트 핸들러
  const handleButtonMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsSmallNavOpen(true);
  };

  const handleButtonMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setIsSmallNavOpen(false);
    }, 100);
  };

  const handleNavMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleNavMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setIsSmallNavOpen(false);
    }, 100);
  };

  // 토글 버튼 클릭 시: 작은 네비게이션 상태에서 큰 네비게이션으로 전환
  const handleToggleClick = () => {
    if (isSmallNavOpen && !isProfileNavOpen) {
      toggleProfileNav();
    }
  };

  // 큰 네비게이션 바 닫기 버튼
  const handleCloseClick = () => {
    toggleProfileNav();
  };

  return (
    <NavigationContext.Provider
      value={{
        isProfileNavOpen,
        toggleProfileNav,
        isSmallNavOpen,
        handleButtonMouseEnter,
        handleButtonMouseLeave,
        handleNavMouseEnter,
        handleNavMouseLeave,
        handleToggleClick,
        handleCloseClick,
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
