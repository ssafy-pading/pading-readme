import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const WebTerminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const term = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const stompClient = useRef<Stomp.Client | null>(null);

  const projectName = 'test';
  const terminalId = crypto.randomUUID();

  useEffect(() => {
    term.current = new Terminal({
      cursorBlink: true,
      cols: 120,
      rows: 30,
    });

    fitAddon.current = new FitAddon();
    term.current.loadAddon(fitAddon.current);

    if (terminalRef.current) {
      term.current.open(terminalRef.current);
      fitAddon.current.fit();
    }

    const socket = new SockJS('http://localhost:8080/ws');
    stompClient.current = Stomp.over(socket);

    const handleResize = () => {
      fitAddon.current?.fit();
      if (stompClient.current?.connected) {
        const cols = term.current?.cols;
        const rows = term.current?.rows;
        stompClient.current.send(
          `/pub/project/${projectName}/terminal/${terminalId}/resize`,
          {},
          JSON.stringify({ cols, rows })
        );
      }
    };

    stompClient.current.connect({}, () => {
      stompClient.current?.subscribe(
        `/sub/project/${projectName}/terminal/${terminalId}`,
        (message) => {
          term.current?.write(message.body);
        }
      );

      stompClient.current?.send(
        `/pub/project/${projectName}/terminal/${terminalId}/connect`,
        {},
        ''
      );

      term.current?.onData((data) => {
        stompClient.current?.send(
          `/pub/project/${projectName}/terminal/${terminalId}/input`,
          {},
          data
        );
      });

      handleResize();
    });

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      stompClient.current?.disconnect(() => {
        console.log('Disconnected');
      });
      term.current?.dispose();
    };
  }, []);

  return <div ref={terminalRef} style={{ width: '100%', height: '100vh' }} />;
};

export default WebTerminal;
