import { createContext, useContext, useState, ReactNode } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../app/redux/store";

type FileTapType = {
  fileName: string;
  fileRouteAndName: string
}[]

interface ProjectEditorContextType {
  // fileRouteAndNameList: string[];
  // setfileRouteAndNameList: (fileRouteAndNameList: string[]) => void;
  activeFileIndex: number | null;
  setActiveFileIndex: (activeFileIndex: number | null) => void;
  fileTap: FileTapType;
  setFileTap: (fileTap: FileTapType) => void;
  user: any
}

const ProjectEditorContext = createContext<ProjectEditorContextType | undefined>(undefined);
// Redux store에서 user 정보를 가져옵니다.

export const ProjectEditorProvider = ({ children }: { children: ReactNode }) => {
  const [fileRouteAndNameList, setfileRouteAndNameList] = useState<string[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState<number | null>(null)
  const [fileTap, setFileTap] = useState<FileTapType>([])
  const { user } = useSelector((state: RootState) => state.user);
  
  
  return (
    <ProjectEditorContext.Provider value={{ user, activeFileIndex, setActiveFileIndex, fileTap, setFileTap }}>
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
