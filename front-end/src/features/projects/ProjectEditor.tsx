import React, { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { MonacoBinding } from "y-monaco";
import { useProjectEditor } from "../../context/ProjectEditorContext";

interface ProjectEditorProps {
  groupId: string;
  projectId: string;
}

const ProjectEditor: React.FC<ProjectEditorProps> = ({
  groupId,
  projectId,
}) => {
  const editorRef = useRef<any>(null);
  const { value, setValue } = useProjectEditor();
  const [language, setlanguage] = useState("javascript");
  const isLocal = window.location.hostname === "localhost";

  const signalingServer: string | null = isLocal
    ? "ws://i12c202.p.ssafy.io:4444"
    : "wss://i12c202.p.ssafy.io:4444";

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();
    // Yjs와 Monaco 연결
    const doc = new Y.Doc();
    const provider = new WebrtcProvider(
      `${groupId}-${projectId}`, // 방 이름
      doc,
      {
        signaling: [
          signalingServer, // 원격 시그널링 서버
        ],
      }
    );
    const type = doc.getText("monaco");
    // Monaco의 변경 사항을 Yjs로 동기화

    
    type.observe((event) => {
      console.log(editorRef.current.getValue());
      
    });
    // 데이터 변경 테스트
    const binding = new MonacoBinding(
      type,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness
    );
  };

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        width="100%"
        theme={"vs-dark"}
        language={language}
        onMount={handleEditorDidMount} // Editor 초기화
        value={value}
        onChange={(value) => setValue(value || "")}
        options={{
          mouseWheelZoom: true, // 마우스 휠로 줌
          smoothScrolling: true, // 부드러운 스크롤
        }}
      />
    </div>
  );
};

export default ProjectEditor;
