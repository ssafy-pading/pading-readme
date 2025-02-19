import { createContext, useContext, useState, ReactNode } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../app/redux/store";
import { FileTabType, TabManagerType } from "../shared/types/projectApiResponse";

interface ProjectEditorContextType {
  user: any; // 추후에 수정 예정정
  deleteFile: (fileRouteAndName: string) => void;
  tabManager: TabManagerType[];
  setTabManager: (tabManager: TabManagerType[]) => void;
}

const ProjectEditorContext = createContext<
  ProjectEditorContextType | undefined
>(undefined);

export const ProjectEditorProvider = ({ children }: { children: ReactNode }) => {
  const [tabManager, setTabManager] = useState<TabManagerType[]>([])


// 파일 삭제 함수: 현재 사용자의 탭 배열에서 특정 파일을 제거하고,
  // 만약 삭제한 파일이 activetab이라면 첫 번째 파일로 activetab을 업데이트하거나 탭이 없으면 null로 설정합니다.
  const deleteFile = (deleteFileRouteAndName: string) => {
    const email = localStorage.getItem("email")
    if (!email) return;

    setTabManager((prev) =>
      prev.map((tm) => {
        if (tm.email !== email) return tm;
        console.log("탭 삭제할 이메일: ", email);
        
        const newTabs = tm.tabs.filter(
          (file) => file.fileRouteAndName !== deleteFileRouteAndName
        );
        let newActiveTab = tm.activeTab;
        if (tm.activeTab === deleteFileRouteAndName) {
          newActiveTab = newTabs.length > 0 ? newTabs[0].fileRouteAndName : null;
        }
        return { ...tm, tabs: newTabs, activeTab: newActiveTab };
      })
    );
  };
  const { user } = useSelector((state: RootState) => state.user);
  return (
    <ProjectEditorContext.Provider
      value={{
        user,
        tabManager,
        setTabManager,
        deleteFile,
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
