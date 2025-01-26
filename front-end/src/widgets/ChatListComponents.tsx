import React, { useEffect, useState, ChangeEvent, FormEvent, useRef } from 'react';

interface ChatMessage {
  id: number;
  username: string;
  profileImage: string;
  content: string;
  created_at: string;
}

export default function ChatRoom(): JSX.Element {
  const [chatList, setChatList] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState<string>('');
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // 스크롤을 맨 아래로 이동시키는 함수
  const scrollToBottom = () => {
    console.log('1');
    if (chatContainerRef.current) {
      console.log('2');
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // 초기 데이터
    const initialChats: ChatMessage[] = [
      {
        id: 1,
        username: 'Alice',
        profileImage: 'https://via.placeholder.com/50?text=A',
        content: '안녕하세요!',
        created_at: '2025-01-26T12:00:00',
      },
      {
        id: 2,
        username: 'Me',
        profileImage: 'https://via.placeholder.com/50?text=ME',
        content: '안녕하세요, Alice님!',
        created_at: '2025-01-26T12:01:00',
      },
      {
        id: 3,
        username: 'Bob',
        profileImage: 'https://via.placeholder.com/50?text=B',
        content: '코드 상태가 이상한가요?',
        created_at: '2025-01-26T12:02:00',
      },
      {
        id: 4,
        username: 'Me',
        profileImage: 'https://via.placeholder.com/50?text=ME',
        content: '님 코드가 더 이상한데요?',
        created_at: '2025-01-26T12:03:00',
      },
    ];
    const sortedChats = initialChats.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    setChatList(sortedChats);

    // 초기 렌더링 시 스크롤 내려주기
    scrollToBottom();
  }, []);

  // chatList가 변경될 때마다 (새로운 메시지 추가) 자동 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [chatList]);

  // 채팅 받기 (웹소켓 시뮬레이션)
  const handleReceiveChat = (): void => {
    const newChat: ChatMessage = {
      id: Date.now(),
      username: 'ServerUser',
      profileImage: 'https://via.placeholder.com/50?text=S',
      content: '새로운 채팅이 도착했습니다!',
      created_at: new Date().toISOString(),
    };

    setChatList((prev) => {
      const updated = [...prev, newChat];
      return updated.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
  };

  // 채팅 전송
  const handleSendChat = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!message.trim()) return;

    const myNewChat: ChatMessage = {
      id: Date.now(),
      username: 'Me',
      profileImage: 'https://via.placeholder.com/50?text=ME',
      content: message,
      created_at: new Date().toISOString(),
    };

    setChatList((prev) => {
      const updated = [...prev, myNewChat];
      return updated.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
    setMessage('');
  };

  const handleMessageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setMessage(e.target.value);
  };

  return (
    <div className="flex flex-col w-full h-[50vh] w-[15vw] bg-gray-900 text-white">
      {/* 메시지 목록 영역 */}
      <div
        className="flex-1 overflow-y-auto p-1 w-full flex flex-col space-y space-y-4"
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
                <img src={chat.profileImage} className="w-4 h-4 rounded-full mr-2" />
              )}
              <div
                className={`max-w-sm px-4 py-[0.3rem] rounded-lg ${
                  isMe ? 'bg-green-600' : 'bg-gray-700'
                } text-white`}
              >
                <div className="text-sm break-all whitespace-pre-wrap">
                  {chat.content}
                </div>
              </div>
              {isMe && (
                <img src={chat.profileImage} className="w-4 h-4 rounded-full ml-2" />
              )}
            </div>
          );
        })}
      </div>

      {/* 채팅 받기 버튼 */}
      <div className="px-4 py-2">
        <button
          type="button"
          onClick={handleReceiveChat}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          새로운 채팅 받기
        </button>
      </div>

      {/* 채팅 입력창 + 전송 버튼 */}
      <form onSubmit={handleSendChat} className="bg-gray-800 flex">
        <input
          type="text"
          name="message"
          value={message}
          onChange={handleMessageChange}
          placeholder="메시지 입력"
          className="flex-1 rounded-l-lg px-2 py-1 text-black"
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-r-lg"
        >
          전송
        </button>
      </form>
    </div>
  );
}
