import { useState, useRef, useEffect } from 'react';
import Editor from "@monaco-editor/react";
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { MonacoBinding } from 'y-monaco';

// Yjs와 WebRTC 연결 설정
const ydoc = new Y.Doc();
const provider = new WebrtcProvider('monaco-room', ydoc);
const type = ydoc.getText('monaco');

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false); // 다크모드 상태
  const [theme, setTheme] = useState("light"); // 테마 상태
  const [terminalOutput, setTerminalOutput] = useState<string>(""); // 터미널 출력 상태
  const editorRef = useRef(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark'); // 다크모드 활성화
    } else {
      document.documentElement.classList.remove('dark'); // 라이트모드 활성화
    }
  }, [isDarkMode]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Yjs와 Monaco 연결
    const doc = new Y.Doc();
    const provider = new WebrtcProvider("test-room", doc);
    const type = doc.getText("monaco");
    const binding = new MonacoBinding(type, editorRef.current.getModel(), new Set([editorRef.current]), provider.awareness);
    console.log(provider.awareness);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode); // 다크 모드 토글
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "vs-dark" : "light")); // 테마 토글
  };

  // 터미널 명령어 처리
  const handleTerminalInput = (e) => {
    if (e.key === 'Enter') {
      const command = e.target.value.trim();
      if (command === '') return;

      // 명령어 처리 (예: log, help, echo)
      if (command === 'help') {
        setTerminalOutput("Available commands: help, echo <message>, log");
      } else if (command.startsWith('echo')) {
        const message = command.slice(5).trim();
        setTerminalOutput(message);
      } else if (command === 'log') {
        // Monaco Editor의 내용 출력
        if (editorRef.current) {
          const editorValue = editorRef.current.getValue(); // Monaco Editor의 내용 가져오기
          setTerminalOutput(editorValue); // 터미널에 출력
        }
      } else {
        setTerminalOutput(`Command not found: ${command}`);
      }
      e.target.value = ''; // 입력 필드 비우기
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-100 dark:bg-gray-800">
      <div className="mt-4 flex justify-between">
        <button
          onClick={toggleDarkMode}
          className="p-2 bg-blue-500 text-white rounded dark:bg-blue-700"
        >
          Toggle Dark Mode
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 bg-green-500 text-white rounded dark:bg-green-700"
        >
          {theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        </button>
      </div>

      <div className="mt-8 flex">
        <div className="w-1/4 bg-gray-200 dark:bg-gray-700 p-4">
          {/* 파일 탐색기 */}
          <h3 className="text-lg font-bold">Explorer</h3>
          <ul className="mt-4 space-y-2">
            <li className="text-blue-500 cursor-pointer">index.js</li>
            <li className="text-blue-500 cursor-pointer">App.js</li>
            <li className="text-blue-500 cursor-pointer">style.css</li>
          </ul>
        </div>
        <div className="flex-1">
          {/* Monaco Editor */}
          <Editor
            height="90vh"
            width="100%"
            theme={theme}
            onMount={handleEditorDidMount} // Editor 초기화
          />
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-900 text-white rounded">
        <h3 className="text-lg font-bold">Terminal</h3>
        <div className="mt-4 h-64 overflow-y-auto bg-black p-2">
          {/* 터미널 출력 */}
          <pre>{terminalOutput}</pre>
        </div>
        <input
          type="text"
          className="w-full p-2 mt-4 bg-gray-800 text-white border rounded"
          placeholder="Enter command..."
          onKeyDown={handleTerminalInput}
        />
      </div>
    </div>
  );
}

export default App;