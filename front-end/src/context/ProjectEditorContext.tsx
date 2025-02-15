import { createContext, useContext, useState, ReactNode } from "react";

type FileTapType = {
  fileName: string;
  fileRouteAndName: string
}[]

interface ProjectEditorContextType {
  fileRouteAndNameList: string[];
  setfileRouteAndNameList: (fileRouteAndNameList: string[]) => void;
  activeFileIndex: number | null;
  setActiveFileIndex: (activeFileIndex: number | null) => void;
  fileTap: FileTapType;
  setFileTap: (fileTap: FileTapType) => void;
}

const ProjectEditorContext = createContext<ProjectEditorContextType | undefined>(undefined);

export const ProjectEditorProvider = ({ children }: { children: ReactNode }) => {
  const [fileRouteAndNameList, setfileRouteAndNameList] = useState<string[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState<number | null>(null)
  const [fileTap, setFileTap] = useState<FileTapType>([])
  return (
    <ProjectEditorContext.Provider value={{ fileRouteAndNameList, setfileRouteAndNameList, activeFileIndex, setActiveFileIndex, fileTap, setFileTap }}>
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
