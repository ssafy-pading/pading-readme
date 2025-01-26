import React, { useState } from "react";
import Modal from "react-modal";
import cross from "../assets/cross.svg";
import useGroupAxios from "../shared/apis/useGroupAxios"; // useGroupAxios 훅 가져오기

interface GroupCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToJoin: () => void; // GroupJoinModal로 전환
}

Modal.setAppElement("#root");

const GroupCreateModal: React.FC<GroupCreateModalProps> = ({ isOpen, onClose, onSwitchToJoin }) => {
  const [groupName, setGroupName] = useState(""); // 그룹 이름 상태 관리
  const { createGroup } = useGroupAxios(); // useGroupAxios의 createGroup 메서드 가져오기
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 그룹 이름 유효성 검사
    if (groupName.trim() === "") {
      alert("그룹 이름을 입력해주세요.");
      return;
    }
    if (groupName.trim().length < 2 || groupName.trim().length > 20) {
      alert("그룹 이름은 2~20자 사이여야 합니다.");
      return;
    }
    if (!/^[a-zA-Z가-힣0-9\s]+$/.test(groupName.trim())) {
      alert("그룹 이름에 특수 문자는 사용할 수 없습니다.");
      return;
    }

    setIsLoading(true);
    try {
      // 그룹 생성 API 호출
      const success = await createGroup({ name: groupName });
      if (success) {
        alert("그룹이 성공적으로 생성되었습니다!");
        setGroupName(""); // 입력 필드 초기화
        onClose(); // 모달 닫기
      }
    } catch (error) {
      const errorMessage = "알 수 없는 오류가 발생했습니다.";
      alert(`그룹 생성 실패: ${errorMessage}`);
      console.error("그룹 생성 에러:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setGroupName(""); // 입력 필드 초기화
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="그룹 생성하기"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      className="bg-white rounded-xl py-5 px-4 shadow-lg relative w-[500px] h-[350px]"
    >
      <div className="w-full h-full flex flex-col">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">그룹 생성하기</span>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-300"
            onClick={handleClose}
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
          <button
            type="submit"
            disabled={isLoading}
            className={`mt-7 py-4 px-4 rounded-xl w-full text-xl ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#5C8290] text-white hover:bg-[#4a6d77]"
            }`}
          >
            {isLoading ? "생성 중..." : "생성하기"}
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default GroupCreateModal;
