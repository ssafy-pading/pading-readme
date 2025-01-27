import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { Client } from 'ssh2';
import fs from 'fs';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // 허용할 클라이언트 도메인
    methods: ['GET', 'POST'], // 허용할 HTTP 메서드
    allowedHeaders: ['Content-Type'], // 허용할 헤더
    credentials: true, // 인증 정보 포함 허용
  },
});

app.use(express.static('public')); // public 폴더 내 정적 파일 제공

io.on('connection', (socket) => {
  console.log('클라이언트 연결됨');

  // SSH 연결 생성
  const conn = new Client();
  conn.on('ready', () => {
    console.log('SSH 연결 완료');
    // 셸 할당
    conn.shell((err, stream) => {
      if (err) {
        console.error('SSH 셸 할당 오류:', err);
        return;
      }

      // 서버 -> 클라이언트
      stream.on('data', (data) => {
        socket.emit('output', data.toString());
      });

      // 클라이언트 -> 서버
      socket.on('input', (data) => {
        stream.write(data);
      });
    });
  }).connect({
    host: 'i12c202.p.ssafy.io', // 원격 서버 IP
    port: 22, // SSH 포트
    username: 'ubuntu', // SSH 사용자명
    privateKey: fs.readFileSync('./src/widgets/projects/I12C202T.pem'), // 개인 키 경로
  });

  socket.on('disconnect', () => {
    console.log('클라이언트 연결 종료');
    conn.end();
  });
});

server.listen(3000, () => {
  console.log('서버 실행 중: http://localhost:3000');
});
