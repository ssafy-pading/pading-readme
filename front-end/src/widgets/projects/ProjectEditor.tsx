import { useState, useRef } from 'react';
import Editor from "@monaco-editor/react";
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { MonacoBinding } from 'y-monaco';


import { LanguageSelector } from './LanguageSelector';
import { OutPut } from './ProjectOutPut';

// Yjs와 WebRTC 연결 설정
const ydoc = new Y.Doc();
const provider = new WebrtcProvider('monaco-room', ydoc);
const type = ydoc.getText('monaco');


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

      // 언어 셀렉터에 보낼 선택 함수
      const onSelect = (language: string) => {
        setlanguage(language)
      }
    return (
        <div>
          <LanguageSelector language={language} onSelect={onSelect}/>
            <div>
            <Editor
            height="60vh"
            width="100%"
            theme={"vs-dark"}
            language={language}
            onMount={handleEditorDidMount} // Editor 초기화
            value={value}
            onChange={(value) => setvalue(value)}
            />
            </div>
            <div>
              <OutPut editorRef={editorRef} language={language} />
            </div>
        </div>
    )
}

export default ProjectEditor