import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { MonacoBinding } from "y-monaco";

interface ProjectEditorProps {
  groupId?: string;
  projectId?: string;
  framework?: string;
  fileRouteAndName?: string;
  userName?: string;
}

const ProjectEditor: React.FC<ProjectEditorProps> = ({
  groupId,
  projectId,
  framework,
  fileRouteAndName,
  userName
}) => {
  const room: string = `${groupId}-${projectId}-${fileRouteAndName}`
  const editorRef = useRef<any>(null);
  const [value, setvalue] = useState("")
  const [language, setLanguage] = useState<string>("java");
  const isLocal = window.location.hostname === "localhost";
  const ws = useRef<WebSocket | null>(null);
  const signalingServer: string | null = isLocal
    ? "ws://localhost:4444"
    : "wss://i12c202.p.ssafy.io:4444";

  const doc = useRef(new Y.Doc()).current;
  const type = doc.getText("monaco");

  useEffect(() => {
    switch (framework) {
      case "NodeJS":
        setLanguage("javascript");
        break;
      case "SpringBoot":
        setLanguage("java");
        break;

    }

    // ✅ WebSocket이 없을 때만 생성
    if (!ws.current) {
      ws.current = new WebSocket(signalingServer);
      ws.current.onopen = () => {
        console.log("✅ YJS WebSocket Connected");
        ws.current?.send(
          JSON.stringify({
            type: "subscribe",
            topics: [room],
            userName
          })
        );
      };
      ws.current.onclose = () => console.log("❌ YJS WebSocket Disconnected");
      // 웹소켓 서버의 바이너리 코드 받기기
      ws.current.onmessage = async (event) => {
        try {
          let arrayBuffer;
          if (event.data instanceof Blob) {
            arrayBuffer = await event.data.arrayBuffer();
          } else if (event.data instanceof ArrayBuffer) {
            arrayBuffer = event.data;
          } else {
            console.error("⚠️ Received unexpected data type:", event.data);
            return;
          }
          const update = new Uint8Array(arrayBuffer);
          Y.applyUpdate(doc, update);
        } catch (error) {
          console.error("⚠️ Error processing Yjs update:", error);
        }
      };
      // yjs문서 변경 감지
      doc.on("update", (update) => {
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

  // ✅ DOC이 변하면 Yjs 동기화 메시지 보내기
  function sendYjsUpdate(update: Uint8Array) {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "yjs-update",
          room,
          content: {
            type: "Buffer",
            data: Array.from(update), // Uint8Array -> JSON 배열 변환
          },
          userName
        })
      );
    }
  }

  // Editor 열릴 때 초기 셋팅
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();

    // Yjs와 Monaco 연결
    const provider = new WebrtcProvider(
      room, // 방 이름
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

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        width="100%"
        theme={"vs-dark"}
        language={language}
        onMount={handleEditorDidMount} // Editor 초기화
        value={value}
        onChange={(value) => 
          {
            setvalue(value || "")  
          }
        }
        options={{
          mouseWheelZoom: true, // 마우스 휠로 줌
          smoothScrolling: true, // 부드러운 스크롤
        }}
      />
    </div>
  );
};

export default ProjectEditor;
