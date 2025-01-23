import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

const ProjectTerminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const currentCommand = useRef<string>(""); // 현재 명령어 저장
  const commandHistory = useRef<string[]>([]); // 명령어 기록
  const historyIndex = useRef<number | null>(null); // 명령어 기록 인덱스
  const cursorPosition = useRef<number>(0); // 커서 위치
  const term = useRef<Terminal | null>(null);
  const [fileList, setFileList] = useState<string[]>([]); // 파일 목록

  useEffect(() => {
    const socket = io("http://localhost:3000");

    term.current = new Terminal({
      cursorBlink: true, // 커서 깜빡임
      convertEol: true, // 줄바꿈 처리
      theme: {
        background: "#000000", // 배경색
        foreground: "#ffffff", // 텍스트 색상
        cursor: "#00ff00", // 커서 색상
      },
      fontSize: 14,
      fontFamily: '"Courier New", monospace',
    });

    if (terminalRef.current) {
      term.current.open(terminalRef.current);
    }

    term.current?.onData((data) => {
      switch (data) {
        case "\r": // Enter 입력
          if (currentCommand.current.trim()) {
            socket.emit("input", currentCommand.current); // 서버로 명령어 전송
            commandHistory.current.push(currentCommand.current); // 명령어 저장
            historyIndex.current = null;
            term.current?.write("\r\n"); // 줄바꿈
            currentCommand.current = ""; // 명령어 초기화
            cursorPosition.current = 0;
          } else {
            term.current?.write("\r\n$ ");
          }
          break;

        case "\x7F": // 백스페이스 처리
          if (cursorPosition.current > 0) {
            currentCommand.current =
              currentCommand.current.slice(0, cursorPosition.current - 1) +
              currentCommand.current.slice(cursorPosition.current);
            cursorPosition.current--;
            term.current?.write("\b \b");
          } refreshCommandLine();
          break;

        case "\x1b[3~": // Delete key
          if (cursorPosition.current < currentCommand.current.length) {
            currentCommand.current =
              currentCommand.current.slice(0, cursorPosition.current) +
              currentCommand.current.slice(cursorPosition.current + 1);
            refreshCommandLine();
          }
          break;

        case "\x1b[A": // 위 방향키 (이전 명령어)
          if (historyIndex.current === null) {
            historyIndex.current = commandHistory.current.length - 1;
          } else if (historyIndex.current > 0) {
            historyIndex.current--;
          }
          loadHistoryCommand();
          break;

        case "\x1b[B": // 아래 방향키 (다음 명령어)
          if (historyIndex.current !== null && historyIndex.current < commandHistory.current.length - 1) {
            historyIndex.current++;
            loadHistoryCommand();
          } else if (historyIndex.current === commandHistory.current.length - 1) {
            historyIndex.current = null;
            currentCommand.current = "";
            cursorPosition.current = 0;
            refreshCommandLine();
          }
          break;

        case "\x1b[D": // 왼쪽 방향키
          if (cursorPosition.current > 0) {
            cursorPosition.current--;
            term.current?.write("\x1b[D");
          }
          break;

        case "\x1b[C": // 오른쪽 방향키
          if (cursorPosition.current < currentCommand.current.length) {
            cursorPosition.current++;
            term.current?.write("\x1b[C");
          }
          break;

        case "\t": // 탭 완성
          handleTabCompletion();
          break;

        case "\x1b[2~": // Shift+Insert (붙여넣기)
          navigator.clipboard.readText().then((text) => {
            currentCommand.current =
              currentCommand.current.slice(0, cursorPosition.current) +
              text +
              currentCommand.current.slice(cursorPosition.current);
            cursorPosition.current += text.length;
            refreshCommandLine();
          });
          break;

        default:
          if (data >= " " && data <= "~") {
            // 출력 가능한 문자 처리
            currentCommand.current =
              currentCommand.current.slice(0, cursorPosition.current) +
              data +
              currentCommand.current.slice(cursorPosition.current);
            cursorPosition.current++;
            term.current?.write(data);
            refreshCommandLine();
          }
          break;
      }
    });

    // 서버로부터 결과 출력
    socket.on("output", (data) => {
      term.current?.write(data);
    });

    // 파일 목록 업데이트
    socket.on("fileList", (files) => {
      setFileList(files);
    });

    socket.emit("getFileList"); // 초기 파일 목록 요청

    return () => {
      socket.disconnect();
      term.current?.dispose();
    };
  }, []);

  const refreshCommandLine = () => {
    if (term.current) {
      term.current.write("\x1b[2K\r$ " + currentCommand.current);
      term.current.write(`\x1b[${cursorPosition.current + 3}G`); // '$ ' 뒤에 커서를 놓음
    }
  };

  const loadHistoryCommand = () => {
    if (historyIndex.current === null) {
      currentCommand.current = "";
    } else {
      currentCommand.current = commandHistory.current[historyIndex.current];
    }
    cursorPosition.current = currentCommand.current.length;
    refreshCommandLine();
  };

  const handleTabCompletion = () => {
    const currentInput = currentCommand.current.split(" ").pop() || "";
    const matches = fileList.filter((file) => file.startsWith(currentInput));
    if (matches.length === 1) {
      const completedCommand =
        currentCommand.current.slice(0, currentCommand.current.lastIndexOf(currentInput)) +
        matches[0];
      currentCommand.current = completedCommand;
      cursorPosition.current = completedCommand.length;
      refreshCommandLine();
    }
  };

  return <div ref={terminalRef} style={{ width: "800px", height: "400px" }} />;
};

export default ProjectTerminal;
