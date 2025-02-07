import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';

const WebTerminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const term = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const stompClient = useRef<Client | null>(null);

  const projectName = 'test';
  const terminalId = crypto.randomUUID();

  useEffect(() => {
    term.current = new Terminal({
      cursorBlink: true,
      cols: 80,
      rows: 24,
      scrollback: 1000,
      disableStdin: false,
      // fontSize
      theme: {
        background: '#0F172A'
      }
    });

    fitAddon.current = new FitAddon();
    term.current.loadAddon(fitAddon.current);

    if (terminalRef.current) {
      term.current.open(terminalRef.current);
      fitAddon.current.fit(); 
    }

    const socket: WebSocket = new SockJS('http://localhost:8080/ws') as WebSocket;
    stompClient.current = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000, // 자동 재연결 설정 (옵션)
      onConnect: () => {
        stompClient.current?.subscribe(
          `/sub/project/${projectName}/terminal/${terminalId}`,
          (message: IMessage) => {
            term.current?.write(message.body);
          }
        );

        stompClient.current?.publish({
          destination: `/pub/project/${projectName}/terminal/${terminalId}/connect`,
          body: ''
        });

        term.current?.onData((data) => {
          stompClient.current?.publish({
            destination: `/pub/project/${projectName}/terminal/${terminalId}/input`,
            body: data
          });
        });

        handleResize();
      },
      onDisconnect: () => console.log('Disconnected'),
      debug: (str) => console.log(str),
    });

    const handleResize = () => {
      fitAddon.current?.fit();
      if (stompClient.current?.connected) {
        const cols = term.current?.cols;
        const rows = term.current?.rows;
        stompClient.current.publish({
          destination: `/pub/project/${projectName}/terminal/${terminalId}/resize`,
          body: JSON.stringify({ cols, rows })
        });
      }
    };

    stompClient.current.activate();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      stompClient.current?.deactivate();
      term.current?.dispose();
    };
  }, []);

  return <div ref={terminalRef}
  style={{
    width: "100%",
    height: "40vh",
    border: "1px solid #ccc",
    padding: "0 8px",
    overflow: "hidden",
    scrollbarWidth: "thin",
    scrollbarColor: "#4a5568 #2d3748",
  }} />;
};

export default WebTerminal;
