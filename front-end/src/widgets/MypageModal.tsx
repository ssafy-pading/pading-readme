import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import Plus from "/src/assets/plus.svg";
import cross from "/src/assets/cross.svg"

interface MypageProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToLeave?: () => void; // 추가
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
    onSwitchToLeave,
}) => {


  // 이곳에 user 정보를 불러올 수 있어야 함함

    // 임시 user정보
    const [userProfile, setUserProfile] = useState<Profile>({
      username: '김싸피',
      email: 'ssafykim@ssafy.com',
      joinDate: '2025-01-24',
      groupCount: 5,
      projectCount: 40,
      onEditProfile() {
          
      },
      onLeave() {
          
      },
    })

  // 이름 변경 상태관리
  const [isEditing, setIsEditing] = useState(false); // 편집 모드 여부
  const [inputValue, setInputValue] = useState(''); // 입력 값


  useEffect(() => {
    setInputValue(userProfile.username);
  }, [userProfile.username]);
  
  // 이름 편집 모드 활성화
  const handleEditClick = () => {
    setIsEditing(true); // 편집 모드 활성화
  };

  // 저장 버튼 클릭 시
  const handleSaveClick = () => {
    setUserProfile((prevProfile) => ({
      ...prevProfile,
      username: inputValue,
    }));
    alert('변경되었습니다!')
    setIsEditing(false); // 편집 모드 비활성화
  };

  // 취소 버튼 클릭 시
  const handleCancelClick = () => {
    setIsEditing(false); // 편집 모드 비활성화
  };

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
            <img src={cross} alt="close" className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col items-start">
        <div className="flex items-start">
          <div className="relative w-[60px] mb-4">
            <img
              src="https://img.freepik.com/premium-vector/black-silhouette-default-profile-avatar_664995-354.jpg"
              alt="프로필 사진"
              className="w-full h-full rounded-full border border-gray-300 object-cover"
            />
            <button
              className="absolute bottom-0 right-0 bg-[#5C8290] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm"
              onClick={handleEditClick}
            >
              <img src={Plus} alt="plus.svg" />
            </button>
          </div>
          <div className="relative w-[400px] ml-4">
            {isEditing ? (
              <div className="w-full">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1 font-semibold focus:outline-none focus:ring-2 focus:ring-[#5C8290]"
                />
                <br/>
                <button
                  className="bg-[#5C8290] text-white text-xs py-1 px-2 rounded-xl"
                  onClick={handleSaveClick}
                >
                  변경하기
                </button>
                <button
                  className="bg-[#d4d4d4] text-white text-xs py-1 px-2 rounded-xl ml-1"
                  onClick={handleCancelClick}
                >
                  취소하기
                </button>
              </div>
            ) : (
              <div className="w-full">
                <p className="text-lg font-bold">
                  <span id="user-name">{userProfile.username}</span>
                  <button className="ml-2" onClick={handleEditClick}>
                    ✏️
                  </button>
                </p>
                <p className="text-gray-500 text-sm">{userProfile.email}</p>
              </div>
            )}
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
            className="py-2 w-full underline font-bold text-black text-opacity-70 cursor-pointer"
            onClick={onSwitchToLeave}
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
