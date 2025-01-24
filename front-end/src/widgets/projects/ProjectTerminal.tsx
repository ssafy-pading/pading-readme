import React, { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit"; // Fit 애드온 추가
import "xterm/css/xterm.css";
import { io } from "socket.io-client";

const ProjectTerminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement | null>(null); // 터미널 DOM 참조
  const term = useRef<Terminal | null>(null); // xterm 인스턴스 참조
  const fitAddon = useRef<FitAddon | null>(null); // Fit 애드온 참조
  const socket = useRef(io("http://localhost:3000")); // 소켓 연결

  useEffect(() => {
    // xterm 초기화
    term.current = new Terminal({
      cursorBlink: true,
      theme: {
        background: "#000000",
        foreground: "#ffffff",
        cursor: "#00ff00",
      },
      fontSize: 14,
      fontFamily: '"Courier New", monospace',
    });

    // Fit 애드온 초기화 및 연결
    fitAddon.current = new FitAddon();
    term.current.loadAddon(fitAddon.current);

    // 터미널 DOM 연결
    if (terminalRef.current) {
      term.current.open(terminalRef.current); // 터미널을 DOM에 연결
      fitAddon.current.fit(); // 터미널 크기를 부모 컨테이너에 맞춤
      term.current?.focus(); // 터미널에 포커스 설정
    }

    // 터미널 입력 -> 서버 전송
    term.current?.onData((data) => {
      socket.current.emit("input", data);
    });

    // 서버 출력 -> 터미널에 표시
    socket.current.on("output", (data) => {
      term.current?.write(data);
    });

    // 창 크기 변경 시 터미널 크기 동기화
    const handleResize = () => {
      if (fitAddon.current) {
        fitAddon.current.fit();
      }
    };
    window.addEventListener("resize", handleResize);

    // 컴포넌트 언마운트 시 정리
    return () => {
      window.removeEventListener("resize", handleResize);
      socket.current.disconnect();
      term.current?.dispose();
    };
  }, []);

  return (
    <div
      ref={terminalRef}
      style={{
        width: "100%",
        height: "40vh",
        border: "1px solid #ccc",
        padding: "0 8px",
        overflow: "hidden",
        scrollbarWidth: "thin",
        scrollbarColor: "#4a5568 #2d3748",
      }}
    />
  );
};

export default ProjectTerminal;
