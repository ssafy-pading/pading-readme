import express from 'express'
import http from 'http';
import {Server} from 'socket.io';
import { Client } from 'ssh2';

const app = express();
const server = http.createServer(app);
// socket.io CORS 설정
const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173', // 프론트엔드 URL
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
      credentials: true, // 클라이언트에서 쿠키나 인증 정보를 포함하려면 true로 설정
    }
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
        return console.error('SSH 셸 할당 오류:', err);
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
    host: '192.168.1.100',
    port: 22,
    username: 'heewon',
    password: '0000'
});

  socket.on('disconnect', () => {
    console.log('클라이언트 연결 종료');
    conn.end();
  });
});

server.listen(3000, () => {
  console.log('서버 실행 중: http://localhost:3000');
});
