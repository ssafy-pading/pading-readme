import { createContext, useContext, useState, ReactNode } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../app/redux/store";
import { FileTapType } from "../shared/types/projectApiResponse";
import { Payload, PayloadAction } from "../features/projects/fileexplorer/type/directoryTypes";

interface ProjectEditorContextType {
  activeFile: string | null; // fileRouteAndName 으로 관리
  setActiveFile: (activeFile: string | null) => void;
  fileTap: FileTapType[];
  setFileTap: React.Dispatch<React.SetStateAction<FileTapType[]>>;
  user: any; // 추후에 수정 예정정
  sendActionRequest: ((action: PayloadAction, payload: Payload) => void) | null;
  setSendActionRequest: (fn: (action: PayloadAction, payload: Payload) => void) => void;
  // currentFile: Payload | null;
  // setCurrentFile: (currentFile: Payload | null) => void;
}

const ProjectEditorContext = createContext<
  ProjectEditorContextType | undefined
>(undefined);

export const ProjectEditorProvider = ({ children }: { children: ReactNode }) => {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [fileTap, setFileTap] = useState<FileTapType[]>([])
  const [sendActionRequest, setSendActionRequest] = useState<((action: PayloadAction, payload: Payload) => void) | null>(null);
  // const [currentFile, setCurrentFile] = useState<Payload | null>(null);

  const { user } = useSelector((state: RootState) => state.user);
  return (
    <ProjectEditorContext.Provider
      value={{
        user,
        activeFile,
        setActiveFile,
        fileTap,
        setFileTap,
        sendActionRequest,
        setSendActionRequest,
        // currentFile,
        // setCurrentFile,
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
