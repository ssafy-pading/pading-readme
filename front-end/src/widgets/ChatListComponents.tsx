import React, { useEffect, useState, ChangeEvent, FormEvent, useRef } from 'react';
import paperPlane from '/src/assets/paper-plane 1.svg';

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
    // 초기 데이터 (방 입장시 서버와 연결)

    // 웹소켓 통신 구현시, 웹소켓 연결 필요


    // 임시 채팅리스트
    const initialChats: ChatMessage[] = [
      {
        id: 1,
        username: 'Alice',
        profileImage: 'https://img.freepik.com/premium-vector/black-silhouette-default-profile-avatar_664995-354.jpg',
        content: '안녕하세요!',
        created_at: '2025-01-26T12:00:00',
      },
      {
        id: 2,
        username: 'Me',
        profileImage: 'https://lh3.google.com/u/0/ogw/AF2bZyg9rR47tvlzW2LEkPDkx6Qs9SLuBWutaah5fBeJu2E8NQ=s32-c-mo',
        content: '안녕하세요, Alice님!',
        created_at: '2025-01-26T12:01:00',
      },
      {
        id: 3,
        username: 'Bob',
        profileImage: 'https://img.freepik.com/premium-vector/black-silhouette-default-profile-avatar_664995-354.jpg',
        content: '코드 상태가 이상한가요?',
        created_at: '2025-01-26T12:02:00',
      },
      {
        id: 4,
        username: 'Me',
        profileImage: 'https://lh3.google.com/u/0/ogw/AF2bZyg9rR47tvlzW2LEkPDkx6Qs9SLuBWutaah5fBeJu2E8NQ=s32-c-mo',
        content: '님 코드가 더 이상한데요?',
        created_at: '2025-01-26T12:03:00',
      },
    ];

    // 배열 정렬
    const sortedChats = initialChats.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    // 배열을 채팅리스트에 담기
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
    // 웹소켓으로 받은 채팅 메시지(임시)
    const newChat: ChatMessage = {
      id: Date.now(),
      username: 'ServerUser',
      profileImage: 'https://img.freepik.com/premium-vector/black-silhouette-default-profile-avatar_664995-354.jpg',
      content: '새로운 채팅이 도착했습니다!',
      created_at: new Date().toISOString(),
    };

    // 채팅을 받아서 정렬 후 담아주기
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
    // 채팅이 없으면 중지
    if (!message.trim()) return;

    // 채팅 객체 생성
    const myNewChat: ChatMessage = {
      id: Date.now(),
      username: 'Me',
      profileImage: 'https://lh3.google.com/u/0/ogw/AF2bZyg9rR47tvlzW2LEkPDkx6Qs9SLuBWutaah5fBeJu2E8NQ=s32-c-mo',
      content: message,
      created_at: new Date().toISOString(),
    };
    // 여기에 채팅 보내는 로직 추가


    // 채팅리스트에 담아주기
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
    <div className="flex flex-col h-[50vh] w-[15vw] bg-gray-900 text-white">
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
                <img src={chat.profileImage} className="w-8 h-8 rounded-full mr-2" />
              )}
              <div
                className={`w-full px-3 py-[0.3rem] rounded-lg ${
                  isMe ? 'bg-[#3B82F6] ml-5' : 'bg-[#273654] mr-5'
                } text-white`}
              >
                <div className="text-sm break-all whitespace-pre-wrap">
                  {chat.content}
                </div>
              </div>
              {isMe && (
                <img src={chat.profileImage} className="w-8 h-8 rounded-full ml-2" />
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
          className="bg-[#3B82F6] hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          새로운 채팅 받기
        </button>
      </div>

      {/* 채팅 입력창 + 전송 버튼 */}
      <div className="w-full">
      <form onSubmit={handleSendChat} className="flex w-full justify-center pl-1 py-2">
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
            <img src={paperPlane} alt="close" className="w-[16px] h-[16px]" />
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
