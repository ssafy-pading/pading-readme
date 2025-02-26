import React, { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import ChatRoom from "./ChatListComponent"; // 기존 채팅 컴포넌트
import CodeReviewComponent from "./CodeReviewComponent"; // 기존 코드리뷰 컴포넌트

interface ChatReviewTabsProps {
  isOpen: boolean;
  onOpenStateChange: (state: boolean) => void;
}

const ChatReviewTabs: React.FC<ChatReviewTabsProps> = ({ isOpen, onOpenStateChange }) => {
  const [activeTab, setActiveTab] = useState<"chat" | "review">("chat"); // 현재 활성 탭

  return (
    <div className="flex flex-col h-full bg-[#2d2d2d] text-white">
      {/* ✅ 상단 헤더 (탭 선택 & 접기 버튼) */}
      <div className="h-[30px] bg-[#404040] flex items-center justify-between px-4 font-bold text-white text-xs">
        {/* 탭 선택 버튼 */}
        <div className="flex space-x-4">
          <button
            className={`px-2 py-1 rounded-md transition ${
              activeTab === "chat" ? "bg-[#3B82F6]" : "hover:bg-[#3B82F6]/50"
            }`}
            onClick={() => setActiveTab("chat")}
          >
            채팅
          </button>
          <button
            className={`px-2 py-1 rounded-md transition ${
              activeTab === "review" ? "bg-[#3B82F6]" : "hover:bg-[#3B82F6]/50"
            }`}
            onClick={() => setActiveTab("review")}
          >
            AI 코드 리뷰
          </button>
        </div>

        {/* 접기/펼치기 버튼 */}
        <button onClick={() => onOpenStateChange(!isOpen)} className="text-white">
          {isOpen ? <FiChevronDown /> :  <FiChevronUp />}
        </button>
      </div>

      {/* ✅ 내용 영역 (숨기기 시 `hidden` 적용) */}
      <div className={`${isOpen ? "flex-1 flex" : "hidden"} overflow-hidden`}>
        <div className={`w-full ${activeTab === "chat" ? "" : "hidden"}`}>
          <ChatRoom />
        </div>
        <div className={`w-full ${activeTab === "review" ? "" : "hidden"}`}>
          <CodeReviewComponent />
        </div>
      </div>
    </div>
  );
};

export default ChatReviewTabs;
