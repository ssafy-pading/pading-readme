import React, { useEffect, useState, ChangeEvent, FormEvent, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import paperPlane from '/src/assets/paper-plane 1.svg';
import profileImage from "../assets/profile_image.png";
import { getChatMessages } from '../shared/apis/chatApi';

interface ChatMessage {
  id: string;
  username: string;
  content: string;
  createdAt: string;
}

interface ChatRoom {
  isChatOpen: boolean;
  onOpenStateChange: (state: boolean) => void;
}

const ChatRoom: React.FC<ChatRoom> = ({ isChatOpen, onOpenStateChange }) => {
  const [chatList, setChatList] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState<string>('');
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const stompClientRef = useRef<Client | null>(null);
  const projectId = 123;
  const groupId = 1;

  // 스크롤을 맨 아래로 이동시키는 함수
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // const [isOpen, setIsOpen] = useState<boolean>(true);
  // useEffect(() => {
  //   console.log(isChatOpen);
  // }, [isChatOpen])
  // STOMP 클라이언트 연결 설정 (컴포넌트 마운트 시 실행)
  useEffect(() => {
    const socket = new SockJS(`${import.meta.env.VITE_APP_API_BASE_URL}/ws`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        console.log(str);
      },
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      reconnectDelay: 5000,
      onConnect: async () => {
        console.log('STOMP 연결 성공');
        stompClient.subscribe(`/sub/chat/${projectId}`, (messageData) => {
          const newChat: ChatMessage = JSON.parse(messageData.body);
          setChatList((prev) => {
            const updated = [...prev, newChat];
            return updated.sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          });
        });
        console.log(`Connected to chat room ${projectId}`);

        try {
          const messageList = await getChatMessages(groupId, projectId);
          const sorted = messageList.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          setChatList(sorted);
        } catch (error) {
          console.error('Error loading previous messages:', error);
        }
      },
      onStompError: (frame) => {
        console.error('STOMP 에러', frame);
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
    };
  }, []);

  // chatList 변경 시 스크롤 이동
  useEffect(() => {
    scrollToBottom();
  }, [chatList]);

  // (선택 사항) 임시 더미 데이터 설정: 서버 데이터가 준비되면 이 부분은 생략하거나 조건부로 렌더링
  useEffect(() => {
    const initialChats: ChatMessage[] = [
      {
        id: "1",
        username: 'Alice',
        content: '안녕하세요!',
        createdAt: '2025-01-26T12:00:00',
      },
      {
        id: "2",
        username: 'Me',
        content: '안녕하세요, Alice님!',
        createdAt: '2025-01-26T12:01:00',
      },
      {
        id: "3",
        username: 'Bob',
        content: '코드 상태가 이상한가요?',
        createdAt: '2025-01-26T12:02:00',
      },
      {
        id: "4",
        username: 'Me',
        content: '님 코드가 더 이상한데요?',
        createdAt: '2025-01-26T12:03:00',
      },
    ];

    const sortedChats = initialChats.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    setChatList(sortedChats);
    scrollToBottom();
  }, []);

  // 채팅 전송 함수
  const handleSendChat = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!message.trim()) return;

    const myNewChat = {
      content: message,
    };

    stompClientRef.current?.publish({
      destination: `/pub/chat/${projectId}`,
      body: JSON.stringify(myNewChat),
    });

    setMessage('');
  };

  const handleMessageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setMessage(e.target.value);
  };

  const toggleState = () => {
    console.log("ss");
    onOpenStateChange(!isChatOpen);
  };

  return (
    <div className="flex flex-col h-full bg-[#212426] text-white">
      <div className={`${isChatOpen ? '': 'hidden'} h-[30px] bg-[#2F3336] flex items-center justify-between font-bold text-white text-xs px-4`}>
        Chat
        {isChatOpen ? <button onClick={toggleState}>▼</button> : null}
      </div>
      {/* 메시지 목록 영역 */}
      <div
        className={`${isChatOpen ? '': 'hidden'} flex-1 overflow-y-auto p-1 flex flex-col space-y-4`}
        ref={chatContainerRef}
      >
        {chatList.map((chat) => {
          const isMe = chat.username === 'Me';
          return (
            <div
              key={chat.id}
              className={`flex items-start w-full ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {!isMe && (
                <img src={profileImage} className="w-5 h-5 rounded-full mr-2 " alt="profile" />
              )}
              <div
                className={`max-w-[10vw] px-3 py-[0.3rem] rounded-lg ${
                  isMe ? 'bg-[#3B82F6] ml-5' : 'bg-[#273654] mr-5'
                } text-white`}
              >
                <div className="w-full text-sm break-all whitespace-pre-wrap text-xs">
                  {chat.content}
                </div>
              </div>
              {isMe && (
                <img src={profileImage} className="w-5 h-5 rounded-full ml-2" alt="profile" />
              )}
            </div>
          );
        })}
      </div>

      {/* 채팅 입력창 + 전송 버튼 */}
      <div className="w-full">
        <form onSubmit={isChatOpen ? handleSendChat : (e) => { e.preventDefault(); toggleState(); }} className="flex w-full justify-center pl-1 py-2">
          <div className="mx-1">
            <input
              type="text"
              name="message"
              value={message}
              onChange={handleMessageChange}
              placeholder="메시지 입력"
              className="flex-1 w-[22vh] rounded-lg px-2 py-1 text-white bg-[#273654] focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
            />
          </div>
          <div className="ml-1">
            <button
              type="submit"
              className="bg-[#3B82F6] hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              <img src={paperPlane} alt="send" className="w-[16px] h-[16px]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
