import React, { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
import { io } from "socket.io-client";

const ProjectTerminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement | null>(null); // 터미널 DOM 참조
  const term = useRef<Terminal | null>(null); // xterm 인스턴스 참조
  const socket = useRef(io("http://localhost:3000")); // 소켓 연결

  useEffect(() => {
    // 터미널 초기화
    term.current = new Terminal({
      cursorBlink: true,
      theme: {
        background: "#000000", // 배경색
        foreground: "#ffffff", // 텍스트 색상
        cursor: "#00ff00", // 커서 색상
      },
      fontSize: 14,
      fontFamily: '"Courier New", monospace',
    });

    // 터미널 DOM 연결
    if (terminalRef.current) {
      term.current.open(terminalRef.current); // 터미널을 DOM에 연결
    }

    // 터미널 입력 -> 서버 전송
    term.current?.onData((data) => {
      socket.current.emit("input", data); // 입력 데이터를 서버로 전송
    });

    // 서버 출력 -> 터미널에 표시
    socket.current.on("output", (data) => {
      term.current?.write(data); // 서버로부터 받은 출력 데이터를 터미널에 표시
    });

    // 컴포넌트 언마운트 시 정리
    return () => {
      socket.current.disconnect(); // 소켓 연결 종료
      term.current?.dispose(); // 터미널 인스턴스 제거
    };
  }, []);

  return (
    <div
      ref={terminalRef} // 터미널 DOM 참조
      style={{
        width: "800px",
        height: "400px",
        border: "1px solid #ccc",
        overflow: "hidden",
      }}
    />
  );
};

export default ProjectTerminal;
