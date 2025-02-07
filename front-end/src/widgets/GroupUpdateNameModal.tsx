// GroupUpdateModal.tsx
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import cross from "../assets/cross.svg";
import useGroupAxios from "../shared/apis/useGroupAxios";

Modal.setAppElement("#root");

interface GroupUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  currentName: string;
  onUpdate: (newName: string) => void;
}

const GroupUpdateModal: React.FC<GroupUpdateModalProps> = ({
  isOpen,
  onClose,
  groupId,
  currentName,
  onUpdate,
}) => {
  const [newName, setNewName] = useState(currentName);
  const { updateGroupName, checkGroupNameDuplicate } = useGroupAxios();
  const [isLoading, setIsLoading] = useState(false);

  // 중복 확인 상태 관리
  const [duplicateChecked, setDuplicateChecked] = useState(false);
  const [isNameAvailable, setIsNameAvailable] = useState(false);

  // currentName이 바뀌면 입력값 및 중복 확인 상태 갱신
  useEffect(() => {
    setNewName(currentName);
    setDuplicateChecked(false);
    setIsNameAvailable(false);
  }, [currentName]);

  const handleCheckDuplicate = async () => {
    if (newName.trim() === "") {
      alert("먼저 그룹 이름을 입력해주세요.");
      return;
    }
    try {
      const duplicateCheck = await checkGroupNameDuplicate(newName);
      if (duplicateCheck.duplicated) {
        setIsNameAvailable(false);
      } else {
        setIsNameAvailable(true);
      }
      setDuplicateChecked(true);
    } catch (error) {
      alert("그룹명 중복 확인 중 오류가 발생했습니다.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newName.trim() === "") {
      alert("새 그룹 이름을 입력해주세요.");
      return;
    }

    if (newName.trim() === currentName.trim()) {
      alert("변경된 그룹명이 없습니다. 수정이 필요합니다.");
      return;
    }

    if (!duplicateChecked) {
      alert("먼저 그룹명 중복 확인을 해주세요.");
      return;
    }
    if (!isNameAvailable) {
      alert("이미 사용 중인 그룹명입니다. 다른 이름을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const success = await updateGroupName(groupId, newName);
      if (success) {
        alert("그룹 이름이 성공적으로 수정되었습니다!");
        onUpdate(newName);
        onClose();
      }
    } catch (error) {
      alert("그룹 이름 수정 중 오류가 발생했습니다.");
      console.error("그룹 수정 에러:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNewName(currentName);
    setDuplicateChecked(false);
    setIsNameAvailable(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="Update Group Name"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      className="bg-white rounded-xl py-5 px-4 shadow-lg relative"
      shouldCloseOnOverlayClick={true}
    >
      <div className="flex justify-between items-center w-96">
        <span className="text-xl font-bold">그룹 이름 수정</span>
        <button
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-300 rounded-full"
          onClick={handleClose}
        >
          <img src={cross} alt="close" className="w-4 h-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="w-full mt-8 space-y-6">
        {/* 인풋 박스와 중복확인 버튼을 하나의 컨테이너에 배치 */}
        <div className="relative w-full">
          <input
            type="text"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setDuplicateChecked(false);
              setIsNameAvailable(false);
            }}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-[#5C8290] pr-20"
          />
          <button
            type="button"
            onClick={handleCheckDuplicate}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 py-3 px-3 bg-[#5C8290] text-sm text-white rounded-r-lg hover:bg-[#4a6d77] shadow"
          >
            중복 확인
          </button>
        </div>
        {/* 중복 확인 결과 메시지 */}
        {duplicateChecked && (
          <span className="ml-2 text-sm text-gray-700">
            {isNameAvailable
              ? "사용 가능한 그룹명입니다."
              : "이미 사용중인 그룹명입니다."}
          </span>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full bg-[#5C8290] text-white py-2 rounded hover:bg-[#4a6d77]"
        >
          {isLoading ? "수정 중..." : "수정하기"}
        </button>
      </form>
    </Modal>
  );
};

export default GroupUpdateModal;
