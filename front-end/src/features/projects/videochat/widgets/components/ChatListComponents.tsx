import React, { useEffect, useState, ChangeEvent, FormEvent, useRef } from 'react';
import './ChatListComponent.css';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import paperPlane from '/src/assets/paper-plane 1.svg';
import profileImage from "/src/assets/profile_image.png";
import { getChatMessages } from '../../../../../shared/apis/chatApi';
// import { useUser } from '../context/userContext';

// redux 초기 import 
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserInfo } from '../../../../../app/redux/user';
import type { RootState, AppDispatch } from '../../../../../app/redux/store';
import { useParams } from 'react-router-dom';

interface ChatMessage {
  id: string;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
}

interface ChatRoomProps {
  isChatOpen: boolean;
  onOpenStateChange: (state: boolean) => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ isChatOpen, onOpenStateChange }) => {
    const [chatList, setChatList] = useState<ChatMessage[]>([]);
    const [message, setMessage] = useState<string>('');
    const chatContainerRef = useRef<HTMLDivElement | null>(null);
    const stompClientRef = useRef<Client | null>(null);
    // URL 파라미터에서 groupId 추출 (nogroup 페이지에서는 undefined)
    const groupIdParams = useParams<{ groupId?: string }>().groupId;
    const groupId: number | undefined = groupIdParams ? Number(groupIdParams) : undefined;
    
    const extractParams = (): { groupId: number; projectId: number } | null => {
      const path = window.location.pathname; // e.g., "/project/8/1"
      const match = path.match(/\/project\/(\d+)\/(\d+)/);
      
    if (match) {
      const groupId = parseInt(match[1], 10);
      const projectId = parseInt(match[2], 10);
      return { groupId, projectId };
    }

    return null;
  };

  const params = extractParams();

  // redux dispatch, 유저 객체 사용
  const dispatch = useDispatch<AppDispatch>();
  const { user, status } = useSelector((state: RootState) => state.user);

  // 스크롤을 맨 아래로 이동시키는 함수
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // 유저 정보 확인
  useEffect(() => {
    if (!user && status === 'idle') {
      dispatch(fetchUserInfo()); // 유저 정보가 없으면 fetchUserInfo 호출
    }
  }, [dispatch, user, status]);

  // STOMP 클라이언트 연결 설정 (컴포넌트 마운트 시 실행)
  useEffect(() => {
    if (!user || !groupId) return
    const socket = new SockJS(`${import.meta.env.VITE_APP_API_BASE_URL}/ws`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      // debug: (str) => {
      //   console.log(str);
      // },
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        userId: user.id.toString(),
        groupId: groupId.toString()
      },
      reconnectDelay: 5000,
      onConnect: async () => {
        stompClient.subscribe(`/sub/chat/${params?.projectId}`, (messageData) => {
          const newChat: ChatMessage = JSON.parse(messageData.body);
          setChatList((prev) => {
            const updated = [...prev, newChat];
            return updated.sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          });
        });

        try {
          if (params) {
            const messageList = await getChatMessages(params.groupId, params.projectId);
            const sorted = messageList.sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            setChatList(sorted);
          }
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
  }, [groupId, user]);

  // chatList 변경 시 스크롤 이동
  useEffect(() => {
    scrollToBottom();
  }, [chatList]);

  // 채팅 전송 함수
  const handleSendChat = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!message.trim()) return;

    const myNewChat = {
      userId: user?.id,
      username: user?.name,
      content: message,
    };

    stompClientRef.current?.publish({
      destination: `/pub/chat/${params?.projectId}`,
      body: JSON.stringify(myNewChat),
    });

    setMessage('');
  };

  const handleMessageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setMessage(e.target.value);
  };

  const toggleState = () => {
    onOpenStateChange(!isChatOpen);
  };

  // 시간 변환 함수
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // 날짜 포맷 함수 (예: 2025. 2. 15.)
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    // 원하는 포맷으로 변경할 수 있음 (아래는 예시)
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#212426] text-white">
      <div className={`${isChatOpen ? '' : 'hidden'} h-[30px] bg-[#2F3336] flex items-center justify-between font-bold text-white text-xs px-4`}>
        Chat
        {isChatOpen ? <button onClick={toggleState}>▼</button> : null}
      </div>
      {/* 메시지 목록 영역 */}
      <div
        className={`custom-scrollbar ${isChatOpen ? '' : 'hidden'} flex-1 overflow-y-auto p-1 flex flex-col space-y-4`}
        ref={chatContainerRef}
      >
        {chatList.map((chat, index) => {
          const isMe = chat.userId === user?.id;
          // 현재 메시지의 날짜와 이전 메시지의 날짜 비교
          const currentChatDate = new Date(chat.createdAt).toLocaleDateString();
          const previousChatDate =
            index > 0 ? new Date(chatList[index - 1].createdAt).toLocaleDateString() : null;
          const showDateSeparator = index === 0 || currentChatDate !== previousChatDate;

          return (
            <React.Fragment key={chat.id}>
              {showDateSeparator && (
                <div className="flex items-center my-2">
                  <div className="flex-grow border-t border-gray-400"></div>
                  <span className="mx-2 text-xs text-gray-400">
                    {formatDate(chat.createdAt)}
                  </span>
                  <div className="flex-grow border-t border-gray-400"></div>
                </div>
              )}
              <div className={`flex items-start w-full ${isMe ? 'justify-end' : 'justify-start'} mb-3`}>
                {!isMe && (
                  <img
                    src={profileImage}
                    className="w-5 h-5 rounded-full mr-1 mt-1"
                    alt="profile"
                  />
                )}
                <div className="flex flex-col max-w-[11.5vw] relative">
                  {/* 이름 표시 (상단 왼쪽 또는 오른쪽) */}
                  {!isMe && (
                    <div className="text-[10px] mb-1 text-left text-gray-300">
                      {chat.username}
                    </div>
                  )}

                  {/* 채팅 메시지 */}
                  <div
                    className={`px-3 py-[0.3rem] rounded-lg ${
                      isMe ? 'bg-[#3B82F6]' : 'bg-[#273654]'
                    } mr-2 text-white relative`}
                  >
                    <div className="w-full break-all whitespace-pre-wrap text-[10px]">
                      {chat.content}
                    </div>

                    {/* 시간 표시 (채팅 박스의 왼쪽 하단 또는 오른쪽 하단) */}
                    <div
                      className={`absolute text-[8px] text-gray-400 bottom-0 ${
                        isMe ? 'right-[calc(100%+0.2rem)]' : 'left-[calc(100%+0.2rem)]'
                      }`}
                    >
                      {formatTime(chat.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* 채팅 입력창 + 전송 버튼 */}
      <div className={`${isChatOpen ? 'bg-[#212426]' : 'bg-[#2F3336]'} w-full h-[50px]`}>
        <form
          onSubmit={
            isChatOpen
              ? handleSendChat
              : (e) => {
                  e.preventDefault();
                  toggleState();
                }
          }
          className="flex w-full justify-between px-1.5 py-2"
        >
          <div className={`${isChatOpen ? '' : 'hidden'} mx-1`}>
            <input
              type="text"
              name="message"
              value={message}
              onChange={handleMessageChange}
              placeholder="메시지 입력"
              className="flex-1 w-[22vh] rounded-lg px-2 py-1 text-sm text-white bg-[#2F3336] focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
            />
          </div>
          <div className={`${isChatOpen ? 'hidden' : ''} font-bold text-white text-md pl-1.5`}>Chat</div>
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
