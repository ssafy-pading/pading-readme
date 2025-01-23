import React from "react";
import Modal from "react-modal";
import cross from "../assets/cross.svg";

interface GroupJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToCreate: () => void; // GroupCreateModal로 전환
}

Modal.setAppElement("#root");

const GroupJoinModal: React.FC<GroupJoinModalProps> = ({ isOpen, onClose, onSwitchToCreate }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="그룹 참여하기"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      className="bg-white rounded-xl py-5 px-4 shadow-lg relative w-[500px] h-[350px]"
    >
      <div className="w-full h-full flex flex-col">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">그룹 참여하기</span>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-300"
            onClick={onClose}
          >
            <img src={cross} alt="close" className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 mt-10">
          <p className="text-lg text-gray-700">그룹 링크</p>
          <input
            type="text"
            placeholder="초대 링크를 입력하세요"
            className="mt-4 w-full border border-gray-300 rounded-lg px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-[#5C8290]"
          />
          <p
            className="mt-7 text-center text-blue-500 hover:underline hover:text-blue-700 cursor-pointer"
            onClick={onSwitchToCreate}
          >
            그룹을 생성하고 싶으신가요?
          </p>
          <button className="mt-7 bg-[#5C8290] text-white py-4 px-4 rounded-xl w-full text-xl">
            참여하기
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default GroupJoinModal;
