import React from "react";
import Modal from "react-modal";
import Plus from "/src/assets/plus.svg";

interface MypageProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToCreate?: () => void; // 추가
}

interface Profile {
  username: string;
  email: string;
  joinDate: string;
  groupCount: number;
  projectCount: number;
  onEditProfile: () => void;
  onLeave: () => void;
}

Modal.setAppElement("#root");

const MypageModal: React.FC<MypageProps> = ({
  isOpen,
  onClose,
}) => {

  // 이곳에 user 정보를 불러올 수 있어야 함함

    // 임시 user정보
    const userProfile:Profile = {
      username: '김싸피',
      email: 'ssafykim@ssafy.com',
      joinDate: '2025-01-24',
      groupCount: 5,
      projectCount: 40,
      onEditProfile() {
          
      },
      onLeave() {
          
      },
    }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="마이 페이지"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      className="bg-white rounded-xl py-5 px-6 shadow-lg relative w-[400px]"
    >
      <div className="w-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">마이 페이지</h2>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-300"
            onClick={onClose}
          >
            ✖
          </button>
        </div>
        <div className="flex flex-col items-start">
          <div>
            <div className="relative w-16 h-16 mb-4 inline-block">
              <img
                src="/default-avatar.png" // Replace with the avatar URL
                alt="프로필 사진"
                className="w-full h-full rounded-full border border-gray-300"
              />
              <button
                className="absolute bottom-0 right-0 bg-[#5C8290] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm"
                // onClick={onEditProfile}
              >
                <img
                  src={Plus} alt="plus.svg"
                />
              </button>
            </div>
            <div className="mx-4 inline-block">
              <p className="text-lg font-bold">
                {userProfile.username}
                <button
                  className=""
                  // onClick={onEditProfile}
                >
                  ✏️
                </button>
              </p>
              <p className="text-gray-500 text-sm">
                {userProfile.email}
                </p>
            </div>
          </div>
          <div className="text-sm space-y-2 mb-6">
            <p>
              <span className="font-bold inline-block w-[80px]">가입일</span>
              : {userProfile.joinDate}
            </p>
          <div className="text-sm space-y-2 mb-6">
            <p>
              <span className="font-bold inline-block w-[80px]">그룹</span>
              : {userProfile.groupCount}
              개
            </p>
          </div>
          <div className="text-sm space-y-2 mb-6">
            <p>
              <span className="font-bold inline-block w-[80px]">프로젝트</span>
              : {userProfile.projectCount}
              개
            </p>
          </div>
        </div>
        <div className="mt-5">
          <p
            className="py-2 w-full underline font-bold text-black text-opacity-70"
            onClick={userProfile.onLeave}
          >
            회원 탈퇴
          </p>
        </div>
      </div>
    </div>
    </Modal>
  );
};

export default MypageModal;
