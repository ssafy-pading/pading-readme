import React, { useCallback, useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";

interface WebTerminalProps {
  height?: number;
  isTerminalWidthChange?: boolean;
  groupId?: string;
  projectId?: string;
  active?: boolean;
  runCommand?: string; // 실행 명령어
  executeRunCommand?: boolean; // run 버튼 클릭 시에만 true로 설정
  isRunTabInitialized?: boolean // 실행버튼을 눌렀을 때 터미널 인스턴스 생성성
  onRunCommandExecuted?: () => void; 
}

const WebTerminal: React.FC<WebTerminalProps> = ({
  height,
  isTerminalWidthChange,
  groupId,
  projectId,
  active,
  runCommand,
  executeRunCommand,
  isRunTabInitialized,
  onRunCommandExecuted,
}) => {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const term = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const stompClient = useRef<Client | null>(null);
  const observer = useRef<MutationObserver | null>(null);

  // Stomp 연결 상태관리
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const terminalId = crypto.randomUUID();

  // 프롬프트 준비 여부 (예: "app#"이 나타나면 준비됨)
  const [isPromptReady, setIsPromptReady] = useState<boolean>(false);

  // 프롬프트 문자열 확인 (예: "app#"이 포함되어 있으면 프롬프트 준비 완료)
  const checkForPrompt = (text: string) => {
    if (text.includes("app#")) { // 여기에 프롬프트 준비 상태를 확인할 문자열 입력
      setIsPromptReady(true);
    }
  };

  // STOMP를 통해 데이터를 전송하는 함수 
  const handleInputData = useCallback((data: string) => {
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.publish({
        destination: `/pub/groups/${groupId}/projects/${projectId}/terminal/${terminalId}/input`,
        body: data,
      });
    } else {
      console.warn("STOMP connection not available.");
    }
  }, [groupId, projectId, terminalId]);

  // clipboard 이벤트를 시뮬레이션하여 텍스트를 붙여넣는 방식 (키보드 입력 처리는 xterm.js의 내부 로직 때문에 오류 발생)
  const simulatePasteEvent = (text: string) => {
    const textarea = document.querySelector('.xterm-helper-textarea') as HTMLTextAreaElement | null;
    if (!textarea) {
      console.warn("xterm-helper-textarea not found");
      return;
    }
    // DataTransfer 객체를 생성해 텍스트를 설정
    const clipboardData = new DataTransfer();
    clipboardData.setData('text/plain', text);
    const pasteEvent = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData,
    });
    textarea.dispatchEvent(pasteEvent);
  };

  useEffect(() => {
    // -------------------------
    // 1) 터미널 초기화
    // -------------------------
    term.current = new Terminal({
      cursorBlink: true,
      cols: 80,
      rows: 500,
      scrollback: 1000,
      disableStdin: false,
      theme: { background: "#2d2d2d" },
    });

    fitAddon.current = new FitAddon();
    term.current.loadAddon(fitAddon.current);

    if (terminalRef.current) {
      term.current.open(terminalRef.current);
      fitAddon.current.fit(); // 최초 마운트 시에도 한 번 fit
    }

    // -------------------------
    // 2) STOMP/SockJS 연결
    // -------------------------
    if (isRunTabInitialized) {
      const socket: WebSocket = new SockJS(
        `${import.meta.env.VITE_APP_API_BASE_URL}/ws`
      ) as WebSocket;
  
      stompClient.current = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        reconnectDelay: 5000,
        onConnect: () => {
          // 메시지 구독
          stompClient.current?.subscribe(
            `/sub/groups/${groupId}/projects/${projectId}/terminal/${terminalId}`,
            (message: IMessage) => {
              term.current?.write(message.body);
              checkForPrompt(message.body) // 메시지에서 #app이 포함되어있는지 확인 -> 마우스 포커싱을 위한 연결 확인
            }
          );
  
          // 연결 시점에 서버에 알림
          stompClient.current?.publish({
            destination: `/pub/groups/${groupId}/projects/${projectId}/terminal/${terminalId}/connect`,
            body: "",
          });
  
          // 사용자 입력을 서버로 전송 (Run모드일 때 runCommand를 보내기 위해 함수로 뺌)
          term.current?.onData(handleInputData);
  
          // 연결 직후 한 번 사이즈 동기화
          handleResize();
  
          setIsConnected(true);
        },
        onDisconnect: () => {
          setIsConnected(false);
          setIsPromptReady(false);
        },
      });
  
      stompClient.current.activate();
  
      // -------------------------
      // 3) 윈도우 리사이즈 이벤트 등록
      // -------------------------
      function handleResize() {
        if (terminalRef.current && terminalRef.current.offsetParent !== null) {
          fitAddon.current?.fit();
          if (stompClient.current?.connected) {
            const cols = term.current?.cols;
            const rows = term.current?.rows;        
            stompClient.current.publish({
              destination: `/pub/groups/${groupId}/projects/${projectId}/terminal/${terminalId}/resize`,
              body: JSON.stringify({ cols, rows })
            });
          }
        }
      }
  
      window.addEventListener("resize", handleResize);
  
      // -------------------------
      // 4) MutationObserver를 사용하여 display 상태 감지
      // -------------------------
      observer.current = new MutationObserver(() => {
        if (terminalRef.current && getComputedStyle(terminalRef.current).display !== "none") {
          setTimeout(() => {
            fitAddon.current?.fit();
          }, 100);
        }
      });
  
      if (terminalRef.current?.parentElement) {
        observer.current.observe(terminalRef.current.parentElement, {
          attributes: true,
          attributeFilter: ["style", "class"],
        });
      }
  
      // -------------------------
      // 5) 언마운트 시 정리(clean-up)
      // -------------------------
      return () => {
        window.removeEventListener("resize", handleResize);
        observer.current?.disconnect();
        stompClient.current?.deactivate();
        term.current?.dispose();
      };
    }
    }, [isRunTabInitialized]);
  
    // -------------------------
    // 6) 높이·너비·탭활성 변화 시 재조정
    // -------------------------
    useEffect(() => {
      if (active) {
        setTimeout(() => {
          fitAddon.current?.fit();
          if (stompClient.current?.connected) {
            const cols = term.current?.cols;
            const rows = term.current?.rows;
            stompClient.current?.publish({
              destination: `/pub/groups/${groupId}/projects/${projectId}/terminal/${terminalId}/resize`,
              body: JSON.stringify({ cols, rows }),
            });
          }
        }, 100);
      }
    }, [height, isTerminalWidthChange, active, isRunTabInitialized]);
    
    useEffect(() => {
      // cleanup: 기존 터미널 인스턴스가 있다면 dispose
      return () => {
        if (term.current) {
          term.current.dispose();
          term.current = null;
        }
      };
    }, [isRunTabInitialized]); // 컴포넌트 언마운트 시 한 번 실행
    
  // -------------------------
  // 7) runCommand 전송 (run 탭) - 붙여넣기 방식으로 해결
  // -------------------------
  useEffect(() => {
    if (
      runCommand &&
      executeRunCommand &&
      isConnected &&
      isPromptReady
    ) {
      term.current?.focus();
      setTimeout(() => {
        // 전체 문자열을 붙여넣기 방식으로 전송 (엔터키 포함)
        simulatePasteEvent(runCommand + "\n");
        if (onRunCommandExecuted) onRunCommandExecuted();
      }, 500); // 딜레이가 필요
    }
  }, [
    executeRunCommand,
    isConnected,
    isPromptReady,
    runCommand,
    groupId,
    projectId,
    terminalId,
    isRunTabInitialized,
    onRunCommandExecuted,
  ]);

  return (
    <div
      ref={terminalRef}
      style={{
        display: active ? "block" : "none",
        width: "100%",
        height: `${height}px`,
        padding: "4px 8px",
        overflow: "hidden",
        scrollbarColor: "#2d2d2d #404040",
      }}
    />
  );
};

export default WebTerminal;
