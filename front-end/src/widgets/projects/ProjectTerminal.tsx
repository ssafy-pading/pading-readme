import React, { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

const ProjectTerminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement | null>(null); // ref를 사용하여 div 접근
  const currentCommand = useRef<string>(''); // 현재 입력 중인 명령어 저장

  useEffect(() => {
    // 소켓 서버와 연결
    const socket = io("http://localhost:3000"); // 서버 주소는 기본적으로 현재 호스트로 연결됨

    // xterm.js 터미널 초기화
    const term = new Terminal({ cursorBlink: true });

    if (terminalRef.current) {
      term.open(terminalRef.current); // `ref`를 사용하여 터미널을 DOM에 연결
    }

    // 입력 감지 -> 엔터 키가 눌렸을 때만 서버로 전송
    term.onData((data) => {
      if (data === '\r') {  // 엔터 키 감지
        if (currentCommand.current.trim()) {
          socket.emit('input', currentCommand.current); // 명령어 전송
          currentCommand.current = ''; // 명령어 초기화
        }
      } else if (data === '\x08') { // 백스페이스 처리
        currentCommand.current = currentCommand.current.slice(0, -1); // 명령어에서 마지막 문자 삭제
        term.write('\x08'); // 터미널에서 백스페이스 처리
      } else if (data === '\t') { // 탭 키 (자동완성)
        socket.emit('complete', currentCommand.current); // 서버로 자동완성 요청
      }
      else {
        currentCommand.current += data; // 명령어에 입력된 값 추가
        term.write(data); // 터미널에 입력값 표시
      }
    });

    // 서버에서 받은 출력 -> 터미널에 표시
    socket.on('output', (data) => {
      // 서버에서 받은 출력만 터미널에 표시
      console.log(data);
      
      term.write(data); // 서버로부터 받은 출력 표시
    });

    // 컴포넌트가 언마운트되면 소켓 연결 종료
    return () => {
      socket.disconnect();
    };
  }, []); // 컴포넌트가 마운트 될 때만 실행

  return (
    <div>
      <div
        ref={terminalRef}
        style={{ width: "800px", height: "400px" }} // 터미널의 크기 설정
      ></div>
    </div>
  );
};

export default ProjectTerminal;
