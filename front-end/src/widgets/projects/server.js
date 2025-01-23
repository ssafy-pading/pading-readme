// Nods.js의 웹 서버 프레임워크, HTTP 서버를 만들고 정적 파일 서빙
import express from 'express'

// Node.js 내장 모듈로, Express 서버를 위한 HTTP 서버를 생성하는 데 사용
import http from 'http';

// 클라이언트와 실시간 양방향 통신을 할 수 있도록 도와주는 라이브러리
import { Server } from 'socket.io';

// SSH 클라이언트를 Node.js에서 사용할 수 있도록 해주는 라이브러리 
// 원격 서버에 SSH로 연결하여 셸을 실행하고 명령어를 주고받음음
import { Client } from 'ssh2';

// 일단 넣음
import fs from 'fs'

// express()로 Express 애플리케이션을 만들고
// http.createServer(app)로 HTTP 서버를 생성
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
        console.log('받은 명령어:', data); // 명령어 출력
        // stream.write("\n\n\n"); // 원격 서버에서 명령어 실행
      });
    });
  }).connect({
    host: '', // EC2 인스턴스의 IP
    port: 22,
    username: 'ec2-user',
    privateKey: fs.readFileSync('./src/widgets/projects/socketserver-pem.pem'), // 키 파일 경로
  });

  socket.on('disconnect', () => {
    console.log('클라이언트 연결 종료');
    conn.end();
  });
});

server.listen(3000, () => {
  console.log('서버 실행 중: http://localhost:3000');
});
