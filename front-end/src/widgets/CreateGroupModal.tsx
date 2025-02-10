import React, { useState } from "react";
import Modal from "react-modal";
import cross from "../assets/cross.svg";
import useGroupAxios from "../shared/apis/useGroupAxios"; // useGroupAxios 훅 가져오기
import { JoinGroupResponse } from "../shared/types/groupApiResponse";
import { useNavigate } from "react-router-dom";

Modal.setAppElement("#root");

interface GroupCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToJoin: () => void; // GroupJoinModal로 전환
}

interface DuplicateCheckResponse {
  duplicated: boolean;
}

const GroupCreateModal: React.FC<GroupCreateModalProps> = ({
  isOpen,
  onClose,
  onSwitchToJoin,
}) => {
  const navigate = useNavigate()
  // 그룹 이름 상태 관리 (string)
  const [groupName, setGroupName] = useState<string>("");
  // 수용 인원 상태 관리 (문자열로 관리하여 input의 value와 일치)
  const [capacity, setCapacity] = useState<string>("");
  // 로딩 상태
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 중복 확인 상태 및 결과 메시지 관리
  const [duplicateChecked, setDuplicateChecked] = useState<boolean>(false);
  const [isNameAvailable, setIsNameAvailable] = useState<boolean>(false);

  // useGroupAxios 훅에서 제공하는 함수들
  const { createGroup, checkGroupNameDuplicate } = useGroupAxios();

  // 그룹명 중복 확인 버튼 클릭 핸들러
  const handleCheckDuplicate = async (): Promise<void> => {
    if (groupName.trim() === "") {
      alert("먼저 그룹 이름을 입력해주세요.");
      return;
    }
    try {
      const duplicateCheck: DuplicateCheckResponse = await checkGroupNameDuplicate(groupName);
      if (duplicateCheck.duplicated) {
        setIsNameAvailable(false);
      } else {
        setIsNameAvailable(true);
      }
      setDuplicateChecked(true);
    } catch (error) {
      alert("그룹명 중복 확인 중 오류가 발생했습니다.");
      console.error("중복 확인 에러:", error);
    }
  };

  // 그룹 생성 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // 그룹 이름 유효성 검사
    if (groupName.trim() === "") {
      alert("그룹 이름을 입력해주세요.");
      return;
    }

    // 수용 인원 유효성 검사
    if (capacity.trim() === "") {
      alert("수용 인원을 입력해주세요.");
      return;
    }
    const capNumber: number = Number(capacity);
    if (isNaN(capNumber) || capNumber < 2) {
      alert("유효한 수용 인원을 입력해주세요.");
      return;
    }

    // 그룹 생성 전에 중복 확인 결과를 체크
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
      // 그룹 이름과 수용 인원(capacity)을 함께 전달
      const { id: groupId } = await createGroup({ name: groupName, capacity: capNumber });

      if (groupId) {
        alert("그룹이 성공적으로 생성되었습니다!");
        setGroupName(""); // 입력 필드 초기화
        setCapacity(""); // 입력 필드 초기화
        setDuplicateChecked(false);
        setIsNameAvailable(false);
        onClose(); // 모달 닫기
        navigate(`/projectlist/${groupId}`); // 생성한 그룹으로 이동
      }
    } catch (error) {
      const errorMessage: string = "알 수 없는 오류가 발생했습니다.";
      alert(`그룹 생성 실패: ${errorMessage}`);
      console.error("그룹 생성 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 모달 닫기 핸들러
  const handleClose = (): void => {
    setGroupName(""); // 입력 필드 초기화
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
        <div className="flex justify-between items-center w-[500px]">
          <span className="text-xl font-bold">그룹 생성하기</span>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-300"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <img src={cross} alt="close" className="w-4 h-4" />
          </button>
        </div>
        {/* 폼 */}
        <form onSubmit={handleSubmit} className="w-full mt-8 space-y-6">
          {/* 그룹 이름 입력 */}
          <div>
            <label htmlFor="groupName" className="block text-lg font-medium text-gray-700 mb-2">
              그룹 이름
            </label>
            {/* 인풋 박스 및 중복 확인 버튼을 포함하는 컨테이너 */}
            <div className="relative">
              <input
                id="groupName"
                type="text"
                value={groupName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setGroupName(e.target.value);
                  setDuplicateChecked(false);
                  setIsNameAvailable(false);
                }}
                placeholder="그룹 이름을 입력하세요"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-[#5C8290] pr-20"
              />
              {/* 중복 확인 버튼 (입력 필드 내부, 오른쪽) */}
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
              <span className="mt-2 ml-2 block text-sm text-gray-700">
                {isNameAvailable ? "사용 가능한 그룹명입니다." : "이미 사용중인 그룹명입니다."}
              </span>
            )}
          </div>
          {/* 수용 인원 입력 */}
          <div>
            <label htmlFor="capacity" className="block text-lg font-medium text-gray-700 mb-2">
              인원 제한
            </label>
            <input
              id="capacity"
              type="number"
              value={capacity}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCapacity(e.target.value)}
              placeholder="예: 50"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-[#5C8290]"
              min="1"
            />
          </div>
          {/* 초대받은 경우 전환 링크 */}
          <p className="text-center">
            <span
              className="text-black underline cursor-pointer hover:cursor-pointer"
              onClick={onSwitchToJoin}
            >
              이미 초대를 받으셨나요?
            </span>
          </p>
          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className={`py-4 px-4 w-full rounded-xl text-xl ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#5C8290] text-white hover:bg-[#4a6d77]"
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
