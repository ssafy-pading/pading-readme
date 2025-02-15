import { createContext, useContext, useState, ReactNode } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../app/redux/store";
import { FileTapType } from "../shared/types/projectApiResponse";

interface ProjectEditorContextType {
  activeFileIndex: number | null;
  setActiveFileIndex: (activeFileIndex: number | null) => void;
  fileTap: FileTapType;
  setFileTap: (fileTap: FileTapType) => void;
  user: any; // 추후에 수정 예정정
  defaultFileRoutes: string[];
  setDefaultFileRoutes: (defaultFileRoutes: string[]) => void;
}

const ProjectEditorContext = createContext<ProjectEditorContextType | undefined>(undefined);

export const ProjectEditorProvider = ({ children }: { children: ReactNode }) => {
  const [activeFileIndex, setActiveFileIndex] = useState<number | null>(null)
  const [fileTap, setFileTap] = useState<FileTapType>([])
  const { user } = useSelector((state: RootState) => state.user);
  const [ defaultFileRoutes, setDefaultFileRoutes ] = useState<string[]>([])
  
  
  return (
    <ProjectEditorContext.Provider value={{ 
      user, activeFileIndex, setActiveFileIndex, fileTap, setFileTap, defaultFileRoutes, setDefaultFileRoutes }}>
      {children}
    </ProjectEditorContext.Provider>
  );
};

export const useProjectEditor = (): ProjectEditorContextType => {
  const context = useContext(ProjectEditorContext);
  if (!context) {
    throw new Error("useProjectEditor must be used within a ProjectEditorProvider");
  }
  return context;
};
