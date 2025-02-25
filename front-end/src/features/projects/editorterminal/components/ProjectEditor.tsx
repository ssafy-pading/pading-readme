import React, { useState, useRef, useEffect } from "react";
import Editor, {useMonaco} from "@monaco-editor/react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { MonacoBinding } from "y-monaco";
import { useProjectEditor } from "../../../../context/ProjectEditorContext";
import fileTransformer from "../FileTransFormer";
import { Payload } from "../../fileexplorer/type/directoryTypes";
// Redux 관련 임포트
import { useDispatch } from "react-redux";
import { setCode, setFileName } from "../../../../app/redux/codeSlice";

interface ProjectEditorProps {
  groupId?: string;
  projectId?: string;
  framework?: string;
  fileName?: string;
  fileRoute?: string;
  fileRouteAndName?: string;
  userName?: string;
  content?: any;
  isSaving: boolean;
  setIsSaving: (isSaving: boolean) => void;

}

// 인터페이스 정의
interface CursorPosition {
  lineNumber: number;
  column: number;
  color?: string;
  visualColumn?: number;
}
interface CursorPositions {
  [key: string]: CursorPosition;
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
// 유니코드 문자의 실제 길이를 계산하는 유틸리티 함수
const getCharLength = (char: string): number => {
  const code = char.charCodeAt(0);
  // ASCII 문자
  if (code < 128) return 1;
  // 한글 및 기타 유니코드 문자
  return 2;
};
// 커서까지의 실제 컬럼 위치를 계산하는 함수
const calculateVisualColumn = (text: string, column: number): number => {
  // column이 텍스트 길이보다 크면 텍스트 길이로 제한
  const maxColumn = Math.min(column, text.length + 1);
  let visualColumn = 0;
  let bytePosition = 0;

  for (let i = 0; i < text.length && bytePosition < maxColumn; i++) {
    bytePosition += getCharLength(text[i]);
    visualColumn = i + 1;
  }
  // 마지막 위치인 경우 visualColumn 조정
  if (column > text.length) {
    visualColumn = text.length + 1;
  }

  return visualColumn;
};

const ProjectEditor: React.FC<ProjectEditorProps> = ({
  groupId,
  projectId,
  framework,
  fileName,
  fileRoute,
  fileRouteAndName,
  userName,
  content,
  isSaving,
  setIsSaving
}) => {
  const monaco:any = useMonaco()
  const dispatch = useDispatch();
  const { sendActionRequest, activeFile } = useProjectEditor();
  const room: string = `${groupId}-${projectId}-${fileRouteAndName}`;
  const editorRef = useRef<any>(null);
  const providerRef = useRef<WebrtcProvider | null>(null); // provider ref 추가
  const contentRef = useRef<string>(content);
  const [value, setvalue] = useState<string>("");
  const [language, setLanguage] = useState<string>("java");
  const isLocal = window.location.hostname === "localhost";
  const ws = useRef<WebSocket | null>(null);
  // const [users, setUsers] = useState<string[]>([]);
  const signalingServer: string | null = isLocal
    ? "ws://localhost:4444"
    : "wss://i12c202.p.ssafy.io:4444";

  const extension: string = fileTransformer(fileName);
  const doc = useRef(new Y.Doc()).current;
  const type = doc.getText("monaco");

  // 커서 WebSocket
  const [cursorPositions, setCursorPositions] = useState<CursorPositions>({});
  const [cursorDecorations, setCursorDecorations] = useState<string[]>([])
  // 커서 스타일을 위한 CSS 추가
  // CSS 스타일 수정
  const cursorStyles= `
  .remote-cursor {
    height: 18px !important;
    display: inline-block;
    position: relative;
    z-index: 1000;
  }
  .remote-cursor::before {
    content: attr(data-name);
    bottom: 100%;
    transform: translateX(-50%);
  }
  .remote-cursor-text {
    color: white;
    padding: 6px 6px;
    border-radius: 6px;
    position: absolute;
    white-space: nowrap;
    transform: translateY(-100%) translateX(-50%);
    margin-left: 1px;
    font-size: 12px;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    transition: all 0.15s ease-in-out;
  }
  
  .remote-cursor-text::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
  }
  .remote-cursor-0 {
  background-color: var(--cursor-color, #007BFF);
}
.remote-cursor-0::after { 
  border-top: 5.5px solid var(--cursor-color, #007BFF);
}

.remote-cursor-1 {
  background-color: var(--cursor-color, #FFC107);
}
.remote-cursor-1::after { 
  border-top: 5.5px solid var(--cursor-color, #FFC107);
}

.remote-cursor-2 {
  background-color: var(--cursor-color, #DC3545);
}
.remote-cursor-2::after { 
  border-top: 5.5px solid var(--cursor-color, #DC3545);
}

.remote-cursor-3 {
  background-color: var(--cursor-color, #28A745);
}
.remote-cursor-3::after { 
  border-top: 5.5px solid var(--cursor-color, #28A745);
}

.remote-cursor-4 {
  background-color: var(--cursor-color, #17A2B8);
}
.remote-cursor-4::after { 
  border-top: 5.5px solid var(--cursor-color, #17A2B8);
}

.remote-cursor-5 {
  background-color: var(--cursor-color, #FD7E14);
}
.remote-cursor-5::after { 
  border-top: 5.5px solid var(--cursor-color, #FD7E14);
}

.remote-cursor-6 {
  background-color: var(--cursor-color, #6F42C1);
}
.remote-cursor-6::after { 
  border-top: 5.5px solid var(--cursor-color, #6F42C1);
}

  `;



  ///////////////////////// 자동완성 기능 /////////////////////////
  // const [isSaving, setIsSaving] = useState<boolean>(false); // 자동 저장 중일 때때
  //// 자동완성 함수: Monaco의 기본 자동완성(Trigger Suggest) 호출
  // const autoComplete = () => {
  //   if (editorRef.current) {
  //     setIsSaving(true);
  //     const currentValue: Payload = {
  //       action: "SAVE",
  //       type: "FILE",
  //       path: fileRoute!,
  //       name: fileName,
  //       content: editorRef.current.getValue(),
  //     };

  //     if (typeof sendActionRequest !== "function") {
  //       console.error("sendActionRequest is not initialized");
  //       return;
  //     }
  //     sendActionRequest("SAVE", currentValue);
  //     setTimeout(() => {
  //       setIsSaving(false);
  //     }, 2000);
  //   }
  // };

  // 코드 칠 때마다 디바운싱 적용 (2000ms 후 실행)
  // const debouncedAutoComplete = useRef(debounce(autoComplete, 2000)).current;

  // setCurrentFile({
  //   action: "SAVE",
  //   name: fileName,
  //   type: 'FILE',
  //   path: fileRoute!,
  //   content: value,
  // });
  ////////////////////////////////////////////////////////////////
  useEffect(() => {
    // 확장자에 따른 모나코 에디터 언어 설정
    setLanguage(extension);

    // 파일을 불러왔을 때 Redux에 파일내용과 파일이름 저장
    if (content) {
      dispatch(setCode(content));
      dispatch(setFileName(fileName || ""));
    }

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
      ws.current.onmessage = async (event) => {
        if (event.data == "new") {
          setTimeout(() => {
            setvalue(content);
          }, 1000)
        return
      }
        try {
          // 기존의 바이너리 데이터 처리
          if (event.data instanceof Blob || event.data instanceof ArrayBuffer) {
            let arrayBuffer;
            if (event.data instanceof Blob) {
              arrayBuffer = await event.data.arrayBuffer();
            } else {
              arrayBuffer = event.data;
            }
            const update = new Uint8Array(arrayBuffer);
            Y.applyUpdate(doc, update);
          }
          // 커서 업데이트 처리 추가
          else {
            const data = JSON.parse(event.data);
            if (data.type === "cursor-update") {
              setCursorPositions(prev => ({
                ...prev,
                [data.userName]: {
                  lineNumber: data.position.lineNumber,
                  column: data.position.column,
                  visualColumn: data.position.visualColumn, // visualColumn 추가
                  color: prev[data.userName]?.color ||
                    `#${Math.floor(Math.random() * 16777215).toString(16)}`
                }
              }));
            } 
            // else if (data.type === "user-list") {
            //   setUsers(data.users);
            // }

          }
        } catch (error) {
          console.error("⚠️ Error processing WebSocket message:", error);
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
    editor.updateOptions({ renderLineHighlight: "all" });
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
      // 파일 저장 시 Redux에 최신 코드와 파일 이름 업데이트
      dispatch(setCode(editor.getValue()));
      dispatch(setFileName(fileName || ""));
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
    editor.onDidChangeCursorPosition((event: any) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        const model = editor.getModel();
        const lineContent = model.getLineContent(event.position.lineNumber);
        const textBeforeCursor = lineContent.substring(0, event.position.column - 1);

        // 실제 시각적 컬럼 위치 계산
        const visualColumn = calculateVisualColumn(lineContent, event.position.column);
        ws.current.send(JSON.stringify({
          type: "cursor-update",
          room: room,
          userName: userName,
          position: {
            lineNumber: event.position.lineNumber,
            column: event.position.column,
            visualColumn: visualColumn,
            textBeforeCursor: textBeforeCursor // 디버깅용
          }
        }));
      }
    });
    // 파일 열고 에디터 첫 마운팅 시 파일 값 렌더링!
    // setTimeout(() => {
    //   setvalue(content);
    // }, 1000);
  };
  // 커서 데코레이션 렌더링
  useEffect(() => {
    if (!editorRef.current) return;
    const decorations = Object.entries(cursorPositions)
      .map(([name, pos], idx) => {
        // pos가 유효한지 확인
        if (!pos || !pos.lineNumber || !pos.column) return null;

        try {
          // 커서 위치 보정
          const model = editorRef.current.getModel();
          const lineContent = model.getLineContent(pos.lineNumber);
          const visualColumn = pos.visualColumn || pos.column;
          const isLastColumn = visualColumn > lineContent.length;
          return {
            range: new monaco.Range(
              pos.lineNumber,
              visualColumn,
              pos.lineNumber,
              visualColumn + 1
            ),
            options: {
              // className: `remote-cursor cursor-${name.replace(/[^a-zA-Z0-9]/g, '-')}`,
              className: `remote-cursor`,
              afterContentClassName: `remote-cursor-text remote-cursor-${idx}`,
              after: {
                // content: name, 
                margin: isLastColumn ? '0 0 0 1px' : '0 0 0 3px' // 마지막 컬럼일 때 마진 조정
              },
              hoverMessage: {
                value: name
              },
              stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
              zIndex: 1000
            }
          };
        } catch (error) {
          console.error('Error creating decoration:', error);
          return null;
        }
      }).filter(Boolean); // null 값 제거
    const oldDecorations = cursorDecorations || [];
    try {
      // 이전 데코레이션 제거 후 새로운 데코레이션 적용
      const newDecorations = editorRef.current.deltaDecorations(
        // cursorDecorations,
        oldDecorations,
        decorations
      );
      setCursorDecorations(newDecorations);
    } catch (error) {
      console.error('Error applying decorations:', error);
    }
  }, [cursorPositions]);

  return (
    <div className="h-full w-full">
      <style>{cursorStyles}</style>
      <Editor
        height="100%"
        width="100%"
        theme={"vs-dark"}
        language={language}
        onMount={handleEditorDidMount} // Editor 초기화
        value={value}
        onChange={(value) => {
          setvalue(value || "");
          // debouncedAutoComplete();
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
