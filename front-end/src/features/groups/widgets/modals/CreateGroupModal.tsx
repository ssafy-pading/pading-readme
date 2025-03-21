// GroupCreateModal.tsx
import React, { useState } from "react";
import Modal from "react-modal";
import { RxCross2 } from "react-icons/rx";

// 토스트
import { Toaster, toast } from 'react-hot-toast';
import useGroupAxios from "../../../../shared/apis/useGroupAxios";

Modal.setAppElement("#root");

interface GroupCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToJoin: () => void;
  onGroupCreated: () => void;  // 그룹 생성 후 부모에 알리는 콜백
}

const GroupCreateModal: React.FC<GroupCreateModalProps> = ({
  isOpen,
  onClose,
  onSwitchToJoin,
  onGroupCreated,
}) => {
  const [groupName, setGroupName] = useState<string>("");
  const [capacity, setCapacity] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [duplicateChecked, setDuplicateChecked] = useState<boolean>(false);
  const [isNameAvailable, setIsNameAvailable] = useState<boolean>(false);
  const [validMessage, setValidMessage] = useState<string>("")
  // 특수문자 정규식: 영어, 숫자, 한글, 공백 이외의 문자는 허용하지 않음
  const specialCharRegex: RegExp = /[^a-zA-Z0-9가-힣\s]/;
  const { createGroup, checkGroupNameDuplicate } = useGroupAxios();

  const handleCheckDuplicate = async (): Promise<void> => {
    if (groupName.trim() === "") {
      setValidMessage("그룹 이름을 입력하세요");
      setIsNameAvailable(false);
      setDuplicateChecked(true);
      return;
    }
    if (groupName.length < 3 || groupName.length > 15) {
      setValidMessage("그룹 이름은 3~15 글자로 설정 할 수 있습니다");
      setIsNameAvailable(false);
      setDuplicateChecked(true);
      return;
    }
    if (specialCharRegex.test(groupName)) {
      setValidMessage("특수문자는 허용되지 않습니다");
      setIsNameAvailable(false);
      setDuplicateChecked(true);
      return;
    }
    try {
      const duplicateCheck = await checkGroupNameDuplicate(groupName);
        if (duplicateCheck.duplicated) {
          setIsNameAvailable(false);
          setValidMessage("이미 사용 중인 그룹명입니다");
        } else {
          setIsNameAvailable(true);
        }
        setDuplicateChecked(true);
    } catch (error) {
      toast.error("그룹명 중복 확인 중 오류가 발생했습니다.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!duplicateChecked) {
          toast.error("먼저 그룹명 중복 확인을 해주세요.");
          return;
        }
    if (groupName.trim() === "") {
      toast.error("그룹 이름을 입력하세요.");
      return;
    }
    if (groupName.length < 3 || groupName.length > 15) {
      toast.error("그룹 이름은 3~15 글자로 설정 할 수 있습니다.");
      return;
    }
    if (specialCharRegex.test(groupName)) {
      toast.error("특수문자는 허용되지 않습니다")
      return;
    }
    if (capacity.trim() === "") {
      toast.error("인원 제한을 입력해주세요.");
      return;
    }
    const capNumber: number = Number(capacity);
    if (isNaN(capNumber) || capNumber < 2 || capNumber > 100) {
      toast.error("인원 제한은 2~100명까지 입니다.");
      return;
    }
    
    // 임시 테스트용으로 막았다는 문구
    toast.error("그룹 생성이 제한된 상태입니다. \n\n 테스트를 원하신다면 C202에 문의!");


    // setIsLoading(true);
    // try {
    //   const { id: groupId } = await createGroup({ name: groupName, capacity: capNumber });
    //   if (groupId) {
    //     toast.success("그룹이 성공적으로 생성되었습니다!");
    //     // 그룹 생성 성공 시, 부모에게 그룹 목록 갱신 요청
    //     onGroupCreated();
    //     setGroupName("");
    //     setCapacity("");
    //     setDuplicateChecked(false);
    //     setIsNameAvailable(false);
    //     onClose();
    //     window.location.href = `/projectlist/${groupId}`
    //   }
    // } catch (error) {
    //   toast.error("그룹 생성 실패: 알 수 없는 오류가 발생했습니다.");
    //   console.error("그룹 생성 실패:", error);
    // } finally {
    //   setIsLoading(false);
    // }
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
        <Toaster />
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
                {isNameAvailable ? "사용 가능한 그룹명입니다." : `${validMessage}.`}
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
              placeholder="인원 제한은 2~100명까지 입니다. 숫자만 입력해 주세요."
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
