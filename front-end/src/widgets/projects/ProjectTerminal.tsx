import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
import { io } from 'socket.io-client'

// 터미널
function ProjectTerminal() {
  const terminalRef: React.MutableRefObject<null> = useRef(null);
  useEffect(() => {
    const socket = io("http://localhost:3000")


    const term = new Terminal({ cursorBlink: true });
    term.open(terminalRef.current);

    term.writeln("Welcome to xterm.js!");
    term.write("Type any command here...");

    term.focus()

    // 입력 감지 -> 서버로 전송
    term.onData((data) => {
      if (data === '\x08') { // 백스페이스가 눌렸을 때
        term.write('\b \b'); // 백스페이스 처리 (현재 위치에서 한 글자 삭제)
      } else if (data === "\r") {
        term.writeln(""); // 엔터 키가 눌렸을 때
      } else {
        term.write(data); // 일반 문자 입력
        socket.emit('input', data); // 서버로 입력 전송
      }
    });

    // 서버에서 받은 출력 -> 터미널에 표시
    socket.on('output', (data) => {
      term.write(data);
    });

  }, []);

  return (
    <div>
      <div ref={terminalRef} style={{ height: "300px", width: "100%" }}></div>
    </div>
  );
}

export default ProjectTerminal;

