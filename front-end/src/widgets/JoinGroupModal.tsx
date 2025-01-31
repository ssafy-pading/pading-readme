import React, { useState } from "react";
import Modal from "react-modal";
import cross from "../assets/cross.svg";
import useGroupAxios from "../shared/apis/useGroupAxios";
import { JoinGroupResponse } from "../shared/types/groupApiResponse";

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
  const extractGroupId = (link: string): string | null => {
    try {
      const url = new URL(link);
      const pathSegments = url.pathname.split("/");
      // 초대 링크 형식에 따라 groupId 추출 로직 수정
      // 예: '/invite/group-123'에서 'group-123' 추출
      const inviteSegment = pathSegments.find((segment) =>
        segment.startsWith("group-")
      );
      return inviteSegment || null;
    } catch (error) {
      console.log("초대 링크 파싱 에러:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 초대 링크 유효성 검사
    if (inviteLink.trim() === "") {
      alert("초대 링크를 입력해주세요.");
      return;
    }

    const groupId = extractGroupId(inviteLink.trim());
    if (!groupId) {
      alert("유효한 초대 링크를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const response: JoinGroupResponse = await joinGroup(groupId);
      if (response) {
        alert(
          `${response.name} 그룹에 성공적으로 참여하였습니다!`
        );
        setInviteLink(""); // 입력 필드 초기화
        onClose(); // 모달 닫기
      }
    } catch (error) {
      alert("그룹 참여에 실패하였습니다. 다시 시도해주세요.");
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
      className="bg-white rounded-xl py-5 px-4 shadow-lg relative w-[500px] h-[350px]"
      shouldCloseOnOverlayClick={true}
    >
      <div className="w-full h-full flex flex-col">
        {/* 헤더 */}
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">그룹 참여하기</span>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-300"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <img src={cross} alt="close" className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="flex-1 mt-10 flex flex-col">
          <label htmlFor="inviteLink" className="text-lg text-gray-700 mb-2">
            그룹 링크
          </label>
          <input
            id="inviteLink"
            type="text"
            value={inviteLink}
            onChange={(e) => setInviteLink(e.target.value)}
            placeholder="초대 링크를 입력하세요"
            className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-[#5C8290]"
          />
          <p
            className="mt-7 text-center text-blue-500 hover:underline hover:text-blue-700 cursor-pointer"
            onClick={onSwitchToCreate}
          >
            그룹을 생성하고 싶으신가요?
          </p>
          <button
            type="submit"
            disabled={isLoading}
            className={`mt-7 bg-[#5C8290] text-white py-4 px-4 rounded-xl w-full text-xl ${
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[#4a6d77]"
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
