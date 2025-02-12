// GroupCreateModal.tsx
import React, { useState } from "react";
import Modal from "react-modal";
import { RxCross2 } from "react-icons/rx";
import useGroupAxios from "../shared/apis/useGroupAxios";
import { useNavigate } from "react-router-dom";

Modal.setAppElement("#root");

interface GroupCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToJoin: () => void;
  onGroupCreated: () => void;  // 그룹 생성 후 부모에 알리는 콜백
}

interface DuplicateCheckResponse {
  duplicated: boolean;
}

const GroupCreateModal: React.FC<GroupCreateModalProps> = ({
  isOpen,
  onClose,
  onSwitchToJoin,
  onGroupCreated,
}) => {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState<string>("");
  const [capacity, setCapacity] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [duplicateChecked, setDuplicateChecked] = useState<boolean>(false);
  const [isNameAvailable, setIsNameAvailable] = useState<boolean>(false);
  const { createGroup, checkGroupNameDuplicate } = useGroupAxios();

  const handleCheckDuplicate = async (): Promise<void> => {
    if (groupName.trim() === "") {
      alert("먼저 그룹 이름을 입력해주세요.");
      return;
    }
    try {
      const duplicateCheck: DuplicateCheckResponse = await checkGroupNameDuplicate(groupName);
      setIsNameAvailable(!duplicateCheck.duplicated);
      setDuplicateChecked(true);
    } catch (error) {
      alert("그룹명 중복 확인 중 오류가 발생했습니다.");
      console.error("중복 확인 에러:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (groupName.trim() === "") {
      alert("그룹 이름을 입력해주세요.");
      return;
    }
    if (capacity.trim() === "") {
      alert("수용 인원을 입력해주세요.");
      return;
    }
    const capNumber: number = Number(capacity);
    if (isNaN(capNumber) || capNumber < 2) {
      alert("유효한 수용 인원을 입력해주세요.");
      return;
    }
    if (!duplicateChecked) {
      alert("먼저 그룹명 중복 확인을 해주세요.");
      return;
    }
    if (!isNameAvailable) {
      alert("이미 사용중인 그룹명입니다. 다른 이름을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const { id: groupId } = await createGroup({ name: groupName, capacity: capNumber });
      if (groupId) {
        alert("그룹이 성공적으로 생성되었습니다!");
        // 그룹 생성 성공 시, 부모에게 그룹 목록 갱신 요청
        onGroupCreated();
        setGroupName("");
        setCapacity("");
        setDuplicateChecked(false);
        setIsNameAvailable(false);
        onClose();
        navigate(`/projectlist/${groupId}`);
      }
    } catch (error) {
      alert("그룹 생성 실패: 알 수 없는 오류가 발생했습니다.");
      console.error("그룹 생성 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = (): void => {
    setGroupName("");
    setCapacity("");
    setDuplicateChecked(false);
    setIsNameAvailable(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="Create Group"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      className="bg-white rounded-xl pt-5 pb-4 px-4 shadow-lg relative"
      shouldCloseOnOverlayClick={true}
      shouldReturnFocusAfterClose={false}
    >
      <div className="w-full h-full flex flex-col">
        {/* 헤더 */}
        <div className="flex justify-between items-center w-[400px]">
          <span className="text-lg font-bold">그룹 생성하기</span>
          <button
            className="flex items-center justify-center rounded-full hover:bg-gray-300 p-1"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <RxCross2 className="w-6 h-6"/>
          </button>
        </div>
        {/* 폼 */}
        <form onSubmit={handleSubmit} className="w-full mt-8 space-y-6">
          <div>
            <label htmlFor="groupName" className="block text-sm font-semibold text-gray-700 mb-2">
              그룹 이름
            </label>
            <div className="relative">
              <input
                id="groupName"
                type="text"
                value={groupName}
                onChange={(e) => {
                  setGroupName(e.target.value);
                  setDuplicateChecked(false);
                  setIsNameAvailable(false);
                }}
                placeholder="그룹 이름을 입력하세요"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C8290] pr-20"
              />
              <button
                type="button"
                onClick={handleCheckDuplicate}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 py-2.5 px-3 bg-[#5C8290] text-xs text-white font-semibold rounded-r-lg hover:bg-[#4a6d77] shadow"
              >
                중복 확인
              </button>
            </div>
            {duplicateChecked && (
              <span className="mt-2 ml-2 block text-xs text-gray-700">
                {isNameAvailable ? "사용 가능한 그룹명입니다." : "이미 사용중인 그룹명입니다."}
              </span>
            )}
          </div>
          <div>
            <label htmlFor="capacity" className="block text-sm font-semibold text-gray-700 mb-2">
              인원 제한
            </label>
            <input
              id="capacity"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="예: 50"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C8290]"
              min="1"
            />
          </div>
          <p className="text-center">
            <span
              className="text-sm text-black underline cursor-pointer hover:cursor-pointer"
              onClick={onSwitchToJoin}
            >
              이미 초대를 받으셨나요?
            </span>
          </p>
          <button
            type="submit"
            disabled={isLoading}
            className={`py-3 w-full rounded-xl text-sm font-semibold ${
              isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#5C8290] hover:bg-[#4a6d77] text-white"
            }`}
          >
            {isLoading ? "그룹 생성 중..." : "생성하기"}
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default GroupCreateModal;
