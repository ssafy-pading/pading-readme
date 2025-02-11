import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';

interface WebTerminalProps {
  height?: number;
  widthChange?: boolean;
}

const WebTerminal: React.FC<WebTerminalProps> = ({ height, widthChange }) => {
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
      rows: 500,
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
      // debug: (str) => console.log(str),
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

  // 🔥 터미널 높이가 변경될 때 마다 fitAddon 적용
  useEffect(() => {
    setTimeout(() => {
      fitAddon.current?.fit();
      if (stompClient.current?.connected) {
        const cols = term.current?.cols;
        const rows = term.current?.rows;
        stompClient.current.publish({
          destination: `/pub/project/${projectName}/terminal/${terminalId}/resize`,
          body: JSON.stringify({ cols, rows })
        });
      }
    }, 100);
  }, [height, widthChange]);
  
  return <div ref={terminalRef}
    style={{
      width: '100%',
      // height: `${height}px`,
      height: '95%',
      padding: "4px 8px",
      overflow: "hidden",
      scrollbarColor: "#4a5568 #2d3748",
    }} />;
};

export default WebTerminal;
