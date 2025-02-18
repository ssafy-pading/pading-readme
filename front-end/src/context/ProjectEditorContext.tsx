import { createContext, useContext, useState, ReactNode } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../app/redux/store";
import {
  FileTapType,
} from "../shared/types/projectApiResponse";

interface ProjectEditorContextType {
  activeFile: string | null; // fileRouteAndName 으로 관리
  setActiveFile: (activeFile: string | null) => void;
  fileTap: FileTapType[];
  setFileTap: React.Dispatch<React.SetStateAction<FileTapType[]>>;
  user: any; // 추후에 수정 예정정
  saveFile: (file: FileTapType) => void;
}

const ProjectEditorContext = createContext<
  ProjectEditorContextType | undefined
>(undefined);

export const ProjectEditorProvider = ({ children }: { children: ReactNode }) => {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [fileTap, setFileTap] = useState<FileTapType[]>([])
  const saveFile = (file: FileTapType) => {
    // 파일 저장 로직 
    // 파일 저장 로직 
    // 파일 저장 로직 
  } 
  const { user } = useSelector((state: RootState) => state.user);
  return (
    <ProjectEditorContext.Provider
      value={{
        user,
        activeFile,
        setActiveFile,
        fileTap,
        setFileTap,
        saveFile
      }}
    >
      {children}
    </ProjectEditorContext.Provider>
  );
};

export const useProjectEditor = (): ProjectEditorContextType => {
  const context = useContext(ProjectEditorContext);
  if (!context) {
    throw new Error(
      "useProjectEditor must be used within a ProjectEditorProvider"
    );
  }
  return context;
};
