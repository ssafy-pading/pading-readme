import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigation } from '../context/navigationContext';
import RightIcon from '../assets/right_icon.svg';
import LeftIcon from '../assets/left_icon.svg';
import { UserGroupIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

// --- 커스텀 훅 임포트 ---
import useGroupAxios from '../shared/apis/useGroupAxios'; 
import { GetGroupMembersResponse } from '../shared/types/groupApiResponse';

const ProfileNavigationBar: React.FC = () => {
  // (실제로는 useParams 사용 가능)
  // const { groupId } = useParams<{ groupId: string }>();
  const groupId = '1';

  // 사이드바 열림/닫힘 상태 (Context에서 가져옴)
  const { isProfileNavOpen, toggleProfileNav, isHover, setIsHover } = useNavigation();
  // [추가] 호버 상태: 닫혀 있을 때 버튼/사이드바 위로 마우스가 올라오면 부분 열림

  // 멤버 목록
  const [members, setMembers] = useState<GetGroupMembersResponse["members"]>([]);

  // 멤버 열고/닫기 토글
  const [isMemberOpen, setIsMemberOpen] = useState(true);
  const toggleMemberList = () => {
    setIsMemberOpen(!isMemberOpen);
  };

  // 그룹 멤버 조회 훅
  const { getGroupMembers } = useGroupAxios();

  // 임시 멤버 데이터
  const tempMembers: GetGroupMembersResponse["members"] = [
    {
      name: 'Alice',
      image: 'https://picsum.photos/30/30?random=1',
      email: 'alice@example.com',
      role: 'Member',
    },
    {
      name: 'Bob',
      image: 'https://picsum.photos/30/30?random=2',
      email: 'bob@example.com',
      role: 'Member',
    },
    {
      name: 'Charlie',
      image: 'https://picsum.photos/30/30?random=3',
      email: 'charlie@example.com',
      role: 'Member',
    },
  ];

  // 컴포넌트 마운트 시 멤버 불러오기 (데모용)
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // 실제 API 호출 예시
        // const data = await getGroupMembers(groupId);
        // setMembers(data.members);
        setMembers(tempMembers); // 임시 데이터
      } catch (error) {
        console.error('그룹 멤버 조회 중 오류:', error);
      }
    };
    fetchMembers();
  }, [groupId, ]);

  // ----- 호버 핸들러 -----
  const handleMouseEnter = () => {
    // 이미 열려있는 상태가 아니라면 부분 열림 활성화
    if (!isProfileNavOpen) {
      setIsHover(true);
    }
  };
  const handleMouseLeave = () => {
    // 열려있지 않다면 호버 해제 시 닫힘
    if (!isProfileNavOpen) {
      setIsHover(false);
    }
  };

  return (
    <div className="relative">
      {/* [1] 열림 토글 버튼 (사이드바가 닫혀있을 때만 보이도록) */}
      {!isProfileNavOpen && (
        <button
          onClick={toggleProfileNav} // 클릭 -> 완전 열림
          onMouseEnter={handleMouseEnter} // 버튼에 마우스 올림 -> 부분 열림
          onMouseLeave={handleMouseLeave} // 버튼에서 마우스 나감 -> 닫힘
          className="p-2 bg-gray-200 hover:bg-gray-400 fixed top-5 left-20 z-50"
        >
          <img src={RightIcon} alt="Right Icon" className="w-6 h-6" />
        </button>
      )}

      {/* [2] 사이드 메뉴 */}
      <div
        className={`
          main-container
          w-[280px] 
          h-full 
          bg-[#d3dede] 
          fixed 
          left-[80px] 
          top-0 
          shadow-lg 
          z-5
          transform 
          transition-transform 
          duration-1000
          ${
            // 1) 완전히 열려 있으면 translate-x-0
            isProfileNavOpen
              ? 'translate-x-0'
              // 2) 호버 중
              : isHover
              ? '-translate-x-280'
              // 3) 닫힘
              : '-translate-x-full'
          }
        `}
      >
        {/* [2-1] 닫기 버튼 (완전히 열림 상태일 때만 보임) */}
        {isProfileNavOpen && (
          <button
            onClick={() => {
              // 1) 사이드바 열림 상태 토글 -> false
              toggleProfileNav();
              // 2) 동시에 호버 상태도 false
              setIsHover(false);
            }}
            className="p-2 hover:bg-gray-400 absolute top-5 right-2"
          >
            <img src={LeftIcon} alt="Left Icon" className="w-6 h-6" />
          </button>
        )}

        {/* [2-2] 프로필 영역 */}
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
        <div className="flex items-center mx-5 mt-5 mb-2">
          {/* Heroicons 예시 아이콘 */}
          <UserGroupIcon className="w-6 h-6 text-gray-[#4D4650] mr-2" />
          <span className="text-xl font-semibold text-[#4D4650]">GroupName</span>
        </div>

        {/* 멤버 목록 */}
        <div>
        <p
          className="text-xl mx-5 mt-5 mb-2 cursor-pointer flex items-center"
          onClick={toggleMemberList}
        >
          {isMemberOpen ? (
            <ChevronUpIcon className="w-5 h-5 text-[#4D4650] mr-2" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-[#4D4650] mr-2" />
          )}
          <span className='text-[#4D4650]'>Members</span>
        </p>

          {isMemberOpen && (
            <ul className="mx-5 mt-5 mb-2">
              {/* 임시 데이터에 id가 없으므로 index 활용 */}
              {members.map((member, idx) => (
                <li key={idx} className="flex items-center mx-7 my-2">
                  <div className="relative w-[30px] h-[30px]">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full rounded-full border-2 border-gray-300"
                    />
                    {/* 예시: 온라인 상태는 가짜로 표시 */}
                    <span
                      className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-green-500"
                    />
                  </div>
                  <span className="ml-4 text-[#4D4650]">{member.name}</span>
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
