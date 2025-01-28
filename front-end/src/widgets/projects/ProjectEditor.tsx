import { useState, useRef } from 'react';
import Editor from "@monaco-editor/react";
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { MonacoBinding } from 'y-monaco';

function ProjectEditor() {
  const editorRef = useRef(null);
  const [value, setvalue] = useState('')
  const [language, setlanguage] = useState("javascript")

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus()
    // Yjs와 Monaco 연결
    const doc = new Y.Doc();
    const provider = new WebrtcProvider("test-room", doc);
    const type = doc.getText("monaco");
    const binding = new MonacoBinding(type, editorRef.current.getModel(), new Set([editorRef.current]), provider.awareness);

  };

  return (
    <div>
      <div>
        <Editor
          height="100vh"
          width="100%"
          theme={"vs-dark"}
          language={language}
          onMount={handleEditorDidMount} // Editor 초기화
          value={value}
          onChange={(value) => setvalue(value)}
          options={
            {
              mouseWheelZoom: true, // 마우스 휠로 줌
              smoothScrolling: true, // 부드러운 스크롤
            }
          }
        />
      </div>
    </div>
  )
}

export default ProjectEditor