import React, { useEffect, useRef } from "react";
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
}

const WebTerminal: React.FC<WebTerminalProps> = ({
  height,
  isTerminalWidthChange,
  groupId,
  projectId,
  active,
}) => {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const term = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const stompClient = useRef<Client | null>(null);
  const observer = useRef<MutationObserver | null>(null);

  const terminalId = crypto.randomUUID();

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
      theme: { background: "#141617" },
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
          }
        );

        // 연결 시점에 서버에 알림
        stompClient.current?.publish({
          destination: `/pub/groups/${groupId}/projects/${projectId}/terminal/${terminalId}/connect`,
          body: "",
        });

        // 사용자 입력을 서버로 전송
        term.current?.onData((data) => {
          stompClient.current?.publish({
            destination: `/pub/groups/${groupId}/projects/${projectId}/terminal/${terminalId}/input`,
            body: data,
          });
        });

        // 연결 직후 한 번 사이즈 동기화
        handleResize();
      },
      onDisconnect: () => console.log("Disconnected"),
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
  }, []);

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
  }, [height, isTerminalWidthChange, active]);

  return (
    <div
      ref={terminalRef}
      style={{
        display: active ? "block" : "none",
        width: "100%",
        height: `${height}px`,
        padding: "4px 8px",
        overflow: "hidden",
        scrollbarColor: "#4a5568 #2d3748",
      }}
    />
  );
};

export default WebTerminal;
