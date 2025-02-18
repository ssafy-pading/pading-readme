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
  deleteFile: (fileRouteAndName: string) => void;
  saveFile: (file: FileTapType) => void;
}

const ProjectEditorContext = createContext<
  ProjectEditorContextType | undefined
>(undefined);

export const ProjectEditorProvider = ({ children }: { children: ReactNode }) => {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [fileTap, setFileTap] = useState<FileTapType[]>([])
  const deleteFile = (deleteFileRouteAndName: string) => {
// 삭제할 파일을 제외한 새 배열 생성
const newFileTap = fileTap.filter(
  (file) => file.fileRouteAndName !== deleteFileRouteAndName
);
setFileTap(newFileTap);

// 남은 탭이 없으면 활성 파일을 null로 설정
if (newFileTap.length === 0) {
  setActiveFile(null);
  return;
}

// 삭제된 파일이 현재 활성 파일이라면, 새 배열의 첫 번째 파일을 활성 파일로 설정
if (activeFile === deleteFileRouteAndName) {
  setActiveFile(newFileTap[0].fileRouteAndName);
}
// 삭제된 파일이 활성 파일이 아니라면 그대로 유지
};
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
        saveFile,
        deleteFile
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
