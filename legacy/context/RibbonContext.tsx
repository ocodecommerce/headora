// context/RibbonContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface RibbonContextType {
  showRibbon: boolean;
  setShowRibbon: React.Dispatch<React.SetStateAction<boolean>>;
}

const RibbonContext = createContext<RibbonContextType | undefined>(undefined);

export const useRibbon = () => {
  const context = useContext(RibbonContext);
  if (!context) {
    throw new Error("useRibbon must be used within a RibbonProvider");
  }
  return context;
};

export const RibbonProvider = ({ children }: { children: ReactNode }) => {
  const [showRibbon, setShowRibbon] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowRibbon(window.scrollY === 0);
    };

    window.addEventListener("scroll", handleScroll);
    const timer = setTimeout(() => {
      setShowRibbon(true);
    }, 1000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <RibbonContext.Provider value={{ showRibbon, setShowRibbon }}>
      {children}
    </RibbonContext.Provider>
  );
};
