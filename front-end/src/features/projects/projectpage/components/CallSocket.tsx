import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

interface CallSocketProps {
  callActive: boolean;
  sendCallActive: () => void;
  sendCallInactive: () => void;
}

const CallSocket = createContext<CallSocketProps | undefined>(undefined);

export const CallSocketProvider: React.FC<{ groupId: number; projectId: number; children: React.ReactNode; }> = ({ groupId, projectId, children }) => {
  const [callActive, setCallActive] = useState<boolean>(false);
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    const socket = new SockJS(`${import.meta.env.VITE_APP_API_BASE_URL}/ws`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("CallSocket: 웹소켓 연결완료");
        stompClient.subscribe(`/sub/project-status/groups/${groupId}`, (messageData) => {
          try {
            const data = JSON.parse(messageData.body);
            // 예시 데이터: { projectId: "1", status: "active" } 또는 { projectId: "1", status: "inactive" }
            if (Number(data.projectId) === projectId) {
              if (data.status === "active") {
                setCallActive(true);
              } else if (data.status === "inactive") {
                setCallActive(false);
              }
            }
          } catch (error) {
            console.error("Call 메시지 처리 오류:", error);
          }
        });
      },
      onStompError: (frame) => {
        console.error("CallSocket - STOMP 오류:", frame);
      },
    });
    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
    };
  }, [groupId, projectId]);

  const sendCallActive = () => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      const message = { projectId, status: "active" };
      stompClientRef.current.publish({
        destination: `/pub/project-status/groups/${groupId}/projects/${projectId}`,
        body: JSON.stringify(message),
      });
    }
  };

  const sendCallInactive = () => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      const message = { projectId, status: "inactive" };
      stompClientRef.current.publish({
        destination: `/pub/project-status/groups/${groupId}/projects/${projectId}`,
        body: JSON.stringify(message),
      });
    }
  };

  return (
    <CallSocket.Provider value={{ callActive, sendCallActive, sendCallInactive }}>
      {children}
    </CallSocket.Provider>
  );
};

export const useCallSocket = () => {
  const context = useContext(CallSocket);
  if (context === undefined) {
    throw new Error("useCallSocket must be used within a CallSocketProvider");
  }
  return context;
};
