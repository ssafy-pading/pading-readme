import React, { useState } from "react";
import Modal from "react-modal";
import cross from "../assets/cross.svg";

interface GroupCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToJoin: () => void; // GroupJoinModal로 전환
}

Modal.setAppElement("#root");

const GroupCreateModal: React.FC<GroupCreateModalProps> = ({ isOpen, onClose, onSwitchToJoin }) => {
  const [groupName, setGroupName] = useState(""); // 그룹 이름 상태 관리

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim() === "") {
      alert("그룹 이름을 입력해주세요.");
      return;
    }
    setGroupName(""); // 입력 필드 초기화
    onClose(); // 모달 닫기
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="그룹 생성하기"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      className="bg-white rounded-xl py-5 px-4 shadow-lg relative w-[500px] h-[350px]"
    >
      <div className="w-full h-full flex flex-col">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">그룹 생성하기</span>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-300"
            onClick={onClose}
          >
            <img src={cross} alt="close" className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="w-full mt-10">
          <label htmlFor="groupName" className="block text-lg font-medium text-gray-700 mb-2">
            그룹 이름
          </label>
          <input
            id="groupName"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="그룹 이름을 입력하세요"
            className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-[#5C8290]"
          />
          <p
            className="mt-7 text-center text-blue-500 hover:underline hover:text-blue-700 cursor-pointer"
            onClick={onSwitchToJoin}
          >
            이미 초대를 받으셨나요?
          </p>
          <button className="mt-7 bg-[#5C8290] text-white py-4 px-4 rounded-xl w-full text-xl">
            생성하기
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default GroupCreateModal;
