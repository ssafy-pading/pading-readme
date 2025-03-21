import React, { useState } from "react";
import Modal from "react-modal";
import { RxCross2 } from "react-icons/rx";

// 토스트
import { Toaster, toast } from 'react-hot-toast';
import useGroupAxios from "../../../../shared/apis/useGroupAxios";
import { JoinGroupResponse } from "../../../../shared/types/groupApiResponse";

Modal.setAppElement("#root");

interface GroupJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToCreate: () => void; // GroupCreateModal로 전환
}

const GroupJoinModal: React.FC<GroupJoinModalProps> = ({
  isOpen,
  onClose,
  onSwitchToCreate,
}) => {
  const [inviteLink, setInviteLink] = useState<string>(""); // 초대 링크 상태 관리
  const [isLoading, setIsLoading] = useState<boolean>(false); // 로딩 상태
  const { joinGroup } = useGroupAxios(); // useGroupAxios의 joinGroup 메서드 가져오기

  /**
   * 초대 링크에서 groupId 추출 함수
   * 예시: 'https://example.com/invite/group-123'에서 'group-123' 추출
   * 실제 초대 링크의 형식에 맞게 조정 필요
   */
  const extractGroupId = (link: string): { groupId:number, code:string } | null => {
    try {
      const url = new URL(link);
      const pathSegments = url.pathname.split("/");
      // 초대 링크 형식에 따라 groupId 추출 로직 수정
      const groupId:number = Number(pathSegments[2]);
      const code:string = pathSegments[3];
      
      return {groupId:groupId, code:code}

    } catch (error) {
      console.error("초대 링크 파싱 에러:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 초대 링크 유효성 검사
    if (inviteLink.trim() === "") {
      toast.error("초대 링크를 입력해주세요.");
      return;
    }

    const inviteInfo: { groupId:number, code:string } | null = extractGroupId(inviteLink.trim());
    if (inviteInfo == null) return;
    if (!inviteInfo.groupId || !inviteInfo.code) {
      toast.error("유효한 초대 링크를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const response: JoinGroupResponse = await joinGroup(inviteInfo.groupId, inviteInfo.code);
      if (response) {
        const groupId: number = response.id
        toast.success(
          `${response.name} 그룹에 성공적으로 참여하였습니다!`
        );
        setInviteLink(""); // 입력 필드 초기화
        onClose(); // 모달 닫기
        window.location.href = `/projectlist/${groupId}`
      }
    } catch (error) {
      toast.error("그룹 참여에 실패하였습니다. 다시 시도해주세요.");
      console.error("그룹 참여 에러:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setInviteLink(""); // 입력 필드 초기화
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="그룹 참여하기"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      className="bg-white rounded-xl pt-5 pb-4 px-4 shadow-lg relative"
      shouldCloseOnOverlayClick={true}
      shouldReturnFocusAfterClose={false}
    >
      <div className="w-full h-full flex flex-col">
      <Toaster />
        {/* 헤더 */}
        <div className="flex justify-between items-center w-[400px]">
          <span className="text-lg font-bold">그룹 참여하기</span>
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
            <label htmlFor="inviteLink" className="block text-sm font-semibold text-gray-700 mb-2">
              그룹 링크
            </label>
            <input
              id="inviteLink"
              type="text"
              value={inviteLink}
              onChange={(e) => setInviteLink(e.target.value)}
              placeholder="초대 링크를 입력하세요"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C8290]"
              />
          </div>
          <p className="text-center">
            <span
              className="text-sm text-black underline cursor-pointer hover:cursor-pointer"
              onClick={onSwitchToCreate}
            >
              그룹을 생성하고 싶으신가요?
            </span>
          </p>



          <button
            type="submit"
            disabled={isLoading}
            className={`py-3 w-full rounded-xl text-sm font-semibold ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#5C8290] hover:bg-[#4a6d77] text-white "
            }`}
          >
            {isLoading ? "참여 중..." : "참여하기"}
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default GroupJoinModal;
