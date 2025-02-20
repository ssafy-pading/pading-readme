import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { MonacoBinding } from "y-monaco";
import { useProjectEditor } from "../../../../context/ProjectEditorContext";
import fileTransformer from "../FileTransFormer";
import { Payload } from "../../fileexplorer/type/directoryTypes";

interface ProjectEditorProps {
  groupId?: string;
  projectId?: string;
  framework?: string;
  fileName?: string;
  fileRoute?: string;
  fileRouteAndName?: string;
  userName?: string;
  content?: any;
}

// 자동저장 디바운스 함수
function debounce(func: Function, delay: number) {
  let timer: NodeJS.Timeout;

  return (...args: any[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

const ProjectEditor: React.FC<ProjectEditorProps> = ({
  groupId,
  projectId,
  framework,
  fileName,
  fileRoute,
  fileRouteAndName,
  userName,
  content,
}) => {
  const { sendActionRequest, activeFile } = useProjectEditor();
  const room: string = `${groupId}-${projectId}-${fileRouteAndName}`;
  const editorRef = useRef<any>(null);
  const providerRef = useRef<WebrtcProvider | null>(null); // provider ref 추가
  const contentRef = useRef<string>(content);
  const [value, setvalue] = useState<string>("");
  const [language, setLanguage] = useState<string>("java");
  const isLocal = window.location.hostname === "localhost";
  const ws = useRef<WebSocket | null>(null);
  const signalingServer: string | null = isLocal
    ? "ws://localhost:4444"
    : "wss://i12c202.p.ssafy.io:4444";

  const extension: string = fileTransformer(fileName);
  const doc = useRef(new Y.Doc()).current;
  const type = doc.getText("monaco");

  ///////////////////////// 자동완성 기능 /////////////////////////
  const [isSaving, setIsSaving] = useState<boolean>(false); // 자동 저장 중일 때때
  //// 자동완성 함수: Monaco의 기본 자동완성(Trigger Suggest) 호출
  const autoComplete = () => {
    if (editorRef.current) {
      setIsSaving(true);
      const currentValue: Payload = {
        action: "SAVE",
        type: "FILE",
        path: fileRoute!,
        name: fileName,
        content: editorRef.current.getValue(),
      };

      if (typeof sendActionRequest !== "function") {
        console.error("sendActionRequest is not initialized");
        return;
      }
      sendActionRequest("SAVE", currentValue);
      setTimeout(() => {
        setIsSaving(false);
      }, 2000);
    }
  };

  // 코드 칠 때마다 디바운싱 적용 (2000ms 후 실행)
  const debouncedAutoComplete = useRef(debounce(autoComplete, 2000)).current;

  // setCurrentFile({
  //   action: "SAVE",
  //   name: fileName,
  //   type: 'FILE',
  //   path: fileRoute!,
  //   content: value,
  // });
  ////////////////////////////////////////////////////////////////
  useEffect(() => {
    // 확장자에 따른 모나코 에디터 언어 설정정
    setLanguage(extension);

    // ✅ WebSocket이 없을 때만 생성
    if (!ws.current) {
      ws.current = new WebSocket(signalingServer);
      ws.current.onopen = () => {
        console.log("✅ YJS WebSocket Connected");
        ws.current?.send(
          JSON.stringify({
            type: "subscribe",
            topics: [room],
            userName,
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
      if (providerRef.current) {
        providerRef.current.destroy();
        providerRef.current = null;
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
          userName,
        })
      );
    }
  }

  // Editor 열릴 때 초기 셋팅
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    editor.focus();

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (typeof sendActionRequest !== "function") {
        console.error("sendActionRequest is not initialized");
        return;
      }
      setIsSaving(true);
      const currentValue: Payload = {
        action: "SAVE",
        type: "FILE",
        path: fileRoute!,
        name: fileName,
        content: editor.getValue(),
      };
      sendActionRequest("SAVE", currentValue);
      setTimeout(() => {
        setIsSaving(false);
      }, 2000);
    });

    // provider가 아직 생성되지 않은 경우에만 생성
    if (!providerRef.current) {
      providerRef.current = new WebrtcProvider(room, doc, {
        signaling: [signalingServer],
      });
      new MonacoBinding(
        type,
        editorRef.current.getModel(),
        new Set([editorRef.current]),
        providerRef.current.awareness
      );
    }
    // 파일 열고 에디터 첫 마운팅 시 파일 값 렌더링!
    setTimeout(() => {
      setvalue(content);
    }, 1000);
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
        onChange={(value) => {
          setvalue(value || "");
          debouncedAutoComplete();
        }}
        options={{
          mouseWheelZoom: true, // 마우스 휠로 줌
          smoothScrolling: true, // 부드러운 스크롤
        }}
      />
      {isSaving && (
        <div className="autosave-indicator top-4 left-1/2">Saving...</div>
      )}
    </div>
  );
};

export default ProjectEditor;
