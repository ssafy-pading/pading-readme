import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextProps {
    isProfileNavOpen: boolean;
    toggleProfileNav: () => void;
}

const NavigationContext = createContext<NavigationContextProps | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isProfileNavOpen, setIsProfileNavOpen] = useState(false);

    const toggleProfileNav = () => {
        setIsProfileNavOpen(prevState => !prevState);
    };

    return (
        <NavigationContext.Provider value={{ isProfileNavOpen, toggleProfileNav }}>
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