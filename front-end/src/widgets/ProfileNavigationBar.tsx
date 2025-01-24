import React, { useState } from 'react';
import { useNavigation } from '../context/navigationContext';
import RightIcon from '../assets/right_icon.svg';
import LeftIcon from '../assets/left_icon.svg';

const ProfileNavigationBar: React.FC = () => {
  const { isProfileNavOpen, toggleProfileNav } = useNavigation(); // Navigation 상태 가져오기
  const [isMemberOpen, setIsMemberOpen] = useState(true); // Member 토글 상태
  const [members, setMembers] = useState<any[]>([
    { id: 1, name: 'Alice', isOnline: true },
    { id: 2, name: 'Bob', isOnline: false },
    { id: 3, name: 'Charlie', isOnline: true },
    { id: 4, name: 'Diana', isOnline: false },
  ]); // 임시 멤버 데이터

  // Member 토글
  const toggleMemberList = () => {
    setIsMemberOpen(!isMemberOpen); // 멤버 목록 열기/닫기 상태 변경
  };

  return (
    <div className="relative">
      {/* 열기 토글 버튼 */}
      {!isProfileNavOpen && (
        <button
          onClick={toggleProfileNav}
          className="p-2 bg-gray-200 hover:bg-gray-400 fixed top-5 left-20"
        >
          <img src={RightIcon} alt="Right Icon" className="w-6 h-6" />
        </button>
      )}

      {/* 사이드 메뉴 */}
      <div
        className={`main-container w-[280px] h-full bg-[#d3dede] fixed left-[80px] top-0 shadow-lg z-5
        transform transition-transform duration-1000 ${isProfileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={toggleProfileNav}
          className="p-2 hover:bg-gray-400 absolute top-5 right-2"
        >
          <img src={LeftIcon} alt="Left Icon" className="w-6 h-6" />
        </button>

        {/* 프로필 공간 */}
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="relative w-[70px] h-[70px] rounded-full bg-white flex items-center justify-center">
              {/* 프로필 이미지 */}
              <img
                src="https://picsum.photos/70/70"
                alt="프로필"
                className="w-full h-full rounded-full"
              />
            </div>
            <div className="col-span-2">
              <p className="text-xl font-bold text-gray-800">김싸피</p>
              <p className="text-sm text-gray-600">example@email.com</p>
            </div>
          </div>
        </div>

        <hr className="border-1 mx-2" />

        {/* 그룹 이름 */}
        <div className="text-xl mx-5 mt-5 mb-2">GroupName</div>

        {/* 멤버 목록 */}
        <div>
          <p
            className="text-xl mx-5 mt-5 mb-2 cursor-pointer"
            onClick={toggleMemberList}
          >
            Member {isMemberOpen ? '▲' : '▼'}
          </p>

          {isMemberOpen && (
            <ul className="mx-5 mt-5 mb-2">
              {members.map((member) => (
                <li key={member.id} className="flex items-center mx-7 my-2">
                  <div className="relative w-[30px] h-[30px]">
                    {/* 프로필 이미지 */}
                    <img
                      src="https://picsum.photos/30/30"
                      alt={member.name}
                      className="w-full h-full rounded-full border-2 border-gray-300"
                    />
                    {/* 접속 상태 표시 */}
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        member.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    ></span>
                  </div>
                  <span className="ml-4 text-gray-800">{member.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileNavigationBar;
