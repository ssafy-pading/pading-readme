import React, { useState, useRef, useEffect } from "react";
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
  const [language, setLanguage] = useState("javascript");
  const isLocal = window.location.hostname === "localhost";

  const ws = useRef<WebSocket | null>(null);
  const signalingServer: string | null = isLocal
    ? "ws://localhost:4444"
    : "wss://i12c202.p.ssafy.io:4444";

  const doc = useRef(new Y.Doc()).current;
  const type = doc.getText("monaco");

  useEffect(() => {
    // ✅ WebSocket이 없을 때만 생성
    if (!ws.current) {
      console.log("웹소켓 새로 생성됨: ", ws.current);

      ws.current = new WebSocket("ws://localhost:4444");

      ws.current.onopen = () => console.log("✅ WebSocket Connected");
      ws.current.onclose = () => console.log("❌ WebSocket Disconnected");

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "yjs-update") {
          console.log("🔄 Yjs 업데이트 받음", data.content);

          const update = new Uint8Array(data.content);
          Y.applyUpdate(doc, update);
        }
      };
      doc.on("update", (update) => {
        // console.log("🔄 Yjs 문서 변경 감지:", update);

        sendYjsUpdate(update);
      });
    }

    // ✅ 컴포넌트가 언마운트될 때 기존 WebSocket 연결 해제
    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, []); // ✅ 빈 배열을 사용하여 최초 한 번만 실행

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();

    // Yjs와 Monaco 연결
    const provider = new WebrtcProvider(
      `${groupId}-${projectId}`, // 방 이름
      doc,
      {
        signaling: [signalingServer], // WebRTC 시그널링 서버
      }
    );
    new MonacoBinding(
      type,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness
    );
  };

  // ✅ Yjs 동기화 메시지 보내기
  function sendYjsUpdate(update: any) {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      // console.log(update);

      ws.current.send(
        JSON.stringify({
          type: "yjs-update",
          room: "testroom",
          content: update,
        })
      );
    }
  }

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
