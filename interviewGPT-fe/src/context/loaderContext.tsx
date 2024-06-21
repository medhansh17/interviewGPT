import { createContext, useContext, useState, ReactNode } from "react";
import Loader from "../components/Loader";

interface LoaderContextType {
  setLoading: (loading: boolean) => void;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const useLoader = (): LoaderContextType => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return context;
};

export const LoaderProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <LoaderContext.Provider value={{ setLoading }}>
      {children}
      {loading && <Loader />}
    </LoaderContext.Provider>
  );
};
