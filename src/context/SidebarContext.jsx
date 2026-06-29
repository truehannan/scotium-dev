import { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(() => {
    const stored = localStorage.getItem('sidebar_open');
    return stored !== null ? JSON.parse(stored) : true;
  });
  const [isMinimized, setIsMinimized] = useState(() => {
    const stored = localStorage.getItem('sidebar_minimized');
    return stored !== null ? JSON.parse(stored) : false;
  });

  useEffect(() => {
    localStorage.setItem('sidebar_open', JSON.stringify(isOpen));
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem('sidebar_minimized', JSON.stringify(isMinimized));
  }, [isMinimized]);

  const toggle = () => setIsOpen(!isOpen);
  const toggleMinimize = () => setIsMinimized(!isMinimized);
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  return (
    <SidebarContext.Provider value={{ isOpen, isMinimized, toggle, toggleMinimize, close, open }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used within a SidebarProvider');
  return context;
}
