import { createContext, useContext, useState, ReactNode } from "react";

interface ProjectEditorContextType {
  value: string;
  setValue: (value: string) => void;
}

const ProjectEditorContext = createContext<ProjectEditorContextType | undefined>(undefined);

export const ProjectEditorProvider = ({ children }: { children: ReactNode }) => {
  const [value, setValue] = useState("");

  return (
    <ProjectEditorContext.Provider value={{ value, setValue }}>
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
