import { createContext, useContext, useState, ReactNode } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../app/redux/store";
import {
  FileTapType, TapManagerType
} from "../shared/types/projectApiResponse";

interface ProjectEditorContextType {
  user: any; // 추후에 수정 예정정
  deleteFile: (fileRouteAndName: string) => void;
  saveFile: (file: FileTapType) => void;
  tapManager: TapManagerType[];
  setTapManager: (tapManager: TapManagerType[]) => void;
  emailToTabs: (email: string) => FileTapType[]
}

const ProjectEditorContext = createContext<
  ProjectEditorContextType | undefined
>(undefined);

export const ProjectEditorProvider = ({ children }: { children: ReactNode }) => {
  const [tapManager, setTapManager] = useState<TapManagerType[]>([{
    email: "shinheewon0107@gmail.com", 
    activeTap: "file2Route", 
    Tabs: [
      {fileName: "file1",
      fileRouteAndName: "file1Route",
      content: "content1"},
      {fileName: "file2",
        fileRouteAndName: "file2Route",
        content: "content2"},
        {fileName: "file3",
          fileRouteAndName: "file3Route",
          content: "content3"}
  
    ]
  },
    {
      email: "shinpading@gmail.com", 
      activeTap: "shinpading1", 
      Tabs: [{fileName: "shinpading1",
        fileRouteAndName: "shinpading1",
        content: "shinpading1"},
        {fileName: "shinpading2",
          fileRouteAndName: "shinpading2",
          content: "shinpading2"},
          {fileName: "shinpading3",
            fileRouteAndName: "shinpading3",
            content: "shinpading3"}]
    }])

  // 파일 추가
  const emailToTabs = (email: string): FileTapType[] => {
    // 파일 변경하는 유저 정보(ex, email, activeTap, Tabs)
    const userTapInformation = tapManager.find((info) => info.email === email)
    
      return userTapInformation ? userTapInformation.Tabs : []
  }

// 파일 삭제 함수: 현재 사용자의 탭 배열에서 특정 파일을 제거하고,
  // 만약 삭제한 파일이 activeTap이라면 첫 번째 파일로 activeTap을 업데이트하거나 탭이 없으면 null로 설정합니다.
  const deleteFile = (deleteFileRouteAndName: string) => {
    const user = useSelector((state: RootState) => state.user).user;
    const userEmail: string | undefined = user?.email;
    if (!userEmail) return;

    setTapManager((prev) =>
      prev.map((tm) => {
        if (tm.email !== userEmail) return tm;

        const newTabs = tm.Tabs.filter(
          (file) => file.fileRouteAndName !== deleteFileRouteAndName
        );
        let newActiveTap = tm.activeTap;
        if (tm.activeTap === deleteFileRouteAndName) {
          newActiveTap = newTabs.length > 0 ? newTabs[0].fileRouteAndName : null;
        }
        return { ...tm, Tabs: newTabs, activeTap: newActiveTap };
      })
    );
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
        tapManager,
        setTapManager,
      
        saveFile,
        deleteFile,
        emailToTabs
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
