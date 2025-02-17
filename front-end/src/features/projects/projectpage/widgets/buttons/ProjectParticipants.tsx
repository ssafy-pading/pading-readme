import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import useProjectAxios from "../../../../../shared/apis/useProjectAxios";
import profileImage from "../../../../../assets/profile_image.png";
import type { RootState } from "../../../../../app/redux/store";
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

interface Participant {
  id: number;
  name: string;
  image: string | null;
}

function ParticipantsButton() {
  const { getProjectMemberStatus } = useProjectAxios();
  const { groupId, projectId } = useParams<{ groupId: string; projectId: string }>();
  const userProfile = useSelector((state: RootState) => state.user.user);
  const [members, setMembers] = useState<Participant[]>([]);

  // API를 통해 온라인 멤버 목록을 가져오는 함수
  const fetchMembers = useCallback(async () => {
    if (!groupId || !projectId) return;
    try {
      const onlineMembers = await getProjectMemberStatus(groupId, projectId);
      // onlineMembers의 타입은 GetProjectMemberStatusResponse로, 
      // { id, name, image, email, role, status }[] 형태입니다.
      // Participant 타입은 { id, name, image }이므로 필요한 필드만 추출합니다.
      let updatedMembers: Participant[] = onlineMembers.map((member) => ({
        id: member.id,
        name: member.name,
        image: member.image || profileImage,
      }));
      // 로그인한 유저가 포함되어 있지 않으면 추가
      if (userProfile && !updatedMembers.some((m) => m.id === userProfile.id)) {
        updatedMembers = [
          ...updatedMembers,
          {
            id: userProfile.id,
            name: userProfile.name,
            image: userProfile.image || profileImage,
          },
        ];
      }
      setMembers(updatedMembers);
    } catch (error) {
      console.error("Error fetching project members:", error);
    }
  }, [groupId, projectId, getProjectMemberStatus, userProfile]);

  // 초기 데이터 로딩
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // 웹소켓 구독을 통해 실시간 업데이트 구현
  useEffect(() => {
    if (!groupId || !projectId) return;
    const socket = new SockJS(`${import.meta.env.VITE_APP_API_BASE_URL}/ws`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        userId: userProfile?.id?.toString() || "",
        groupId: groupId,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(
          `/sub/project-status/groups/${groupId}`,
          async (messageData) => {
            try {
              const data = JSON.parse(messageData.body);
              console.log("ParticipantsButton 메시지 데이터:", data);
              // 메시지 예시: { projectId: "1", status: "member" }
              if (data.status === "member") {
                await fetchMembers();
              }
            } catch (error) {
              console.error("웹소켓 업데이트 중 오류:", error);
            }
          }
        );
      },
      onStompError: (frame) => {
        console.error("ParticipantsButton STOMP Error:", frame);
      },
    });
    stompClient.activate();
    return () => {
      stompClient.deactivate();
    };
  }, [groupId, projectId, userProfile?.id, fetchMembers]);

  // 드롭다운 관련 상태 관리 (조건부 렌더링)
  const [showList, setShowList] = useState<boolean>(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const toggleList = () => setShowList((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setShowList(false);
      }
    };
    if (showList) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showList]);

  return (
    <div ref={buttonRef} className="relative">
      <button
        onClick={toggleList}
        className="group flex items-center bg-transparent border-none cursor-pointer"
      >
        {/* 프로필 이미지 2개 겹침 */}
        <div className="flex items-center -space-x-2">
          {members.slice(0, 2).map((p) => (
            <img
              key={p.id}
              src={p.image || profileImage}
              alt={p.name}
              className="w-5 h-5 rounded-full border-2 border-white"
            />
          ))}
          {members.length > 2 && (
            <span className="w-5 h-5 flex items-center justify-center text-xs font-bold bg-gray-500 text-white rounded-full border-2 border-white">
              +{members.length - 2}
            </span>
          )}
        </div>
        {/* 참가자 수 */}
        <div className="text-xs text-[#A1A1AF] font-bold ml-2">
          {members.length} participants
        </div>
      </button>
      {/* 참가자 목록 드롭다운 */}
      {showList && (
        <div className="absolute top-full left-0 mt-2 w-auto min-w-[150px] bg-white border border-gray-300 rounded-md shadow-md p-2 z-50">
          <ul className="text-xs text-gray-700">
            {members.map((p) => (
              <li key={p.id} className="py-1 px-2 flex items-center hover:bg-gray-100 rounded">
                <img src={p.image || profileImage} alt={p.name} className="w-4 h-4 rounded-full mr-2" />
                {p.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ParticipantsButton;
