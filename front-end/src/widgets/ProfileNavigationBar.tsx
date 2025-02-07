import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNavigation } from "../context/navigationContext";
// heroicons 아이콘 임포트
import { 
  UserGroupIcon, 
  ChevronUpIcon, 
  ChevronDownIcon, 
  Bars3Icon, 
  ChevronDoubleLeftIcon, 
  ChevronDoubleRightIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

// --- 커스텀 훅 임포트 ---
import useGroupAxios from "../shared/apis/useGroupAxios"; 
import { GetGroupDetailsResponse, GetGroupMembersResponse } from "../shared/types/groupApiResponse";

// MyPageModal 임포트
import MyPageModal from "../widgets/MypageModal";
import useMypageAxios from "../shared/apis/useMypageAxios";
import LeaveModal from "./UserLeaveModal";
import PictureModal from "./PictureChangeModal";

const ProfileNavigationBar: React.FC = () => {
  const navigate = useNavigate();
  const { getGroupDetails, getGroupMembers } = useGroupAxios();
  const groupId = "1";
  const [groupName, setGroupName] = useState("");

  // 그룹 상세 정보 조회 (예시)
  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        // 실제 API 호출 예시:
        // const data = await getGroupDetails(groupId);
        // setGroupName(data.groupName);
        setGroupName("C202"); // 임시 데이터
      } catch (error) {
        console.error("그룹 상세 정보 조회 중 오류:", error);
      }
    };
    fetchGroupDetails();
  }, [groupId]);

  // 큰 네비게이션 바의 열림/닫힘 상태 (Context에서 관리)
  const { isProfileNavOpen, toggleProfileNav } = useNavigation();

  // 작은 네비게이션 바 상태 (로컬 상태)
  const [isSmallNavOpen, setIsSmallNavOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 드롭다운 메뉴 상태 및 드롭다운 영역 ref
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // "마이페이지" 모달 열림 상태 관리
    const [activeModal, setActiveModal] = useState<'mypage' | 'delete' | 'picture' | null>(null);

  // 드롭다운 외부 클릭 시 닫힘 처리
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ── 토글 버튼 이벤트 ──
  const handleButtonMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsSmallNavOpen(true);
  };

  const handleButtonMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setIsSmallNavOpen(false);
    }, 100);
  };

  // ── 네비게이션 바 컨테이너 이벤트 ──
  const handleNavMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleNavMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setIsSmallNavOpen(false);
    }, 100);
  };

  // 토글 버튼 클릭 시: small nav 상태에서 큰 네비게이션 바로 확장
  const handleToggleClick = () => {
    if (isSmallNavOpen && !isProfileNavOpen) {
      toggleProfileNav();
      setIsSmallNavOpen(false);
    }
  };

  // 큰 네비게이션 바 닫기 버튼
  const handleCloseClick = () => {
    toggleProfileNav();
    setIsSmallNavOpen(false);
  };

  // 컨테이너 높이와 상단 위치 (기존 위치 그대로)
  const containerHeight = isProfileNavOpen ? "h-full" : "h-auto";
  const navTopClass = isProfileNavOpen ? "top-0" : "top-[80px] bottom-[80px]";

  // 멤버 목록 관련
  const [members, setMembers] = useState<GetGroupMembersResponse["members"]>([]);
  const [isMemberOpen, setIsMemberOpen] = useState(true);
  const { logout } = useMypageAxios();
  const toggleMemberList = () => {
    setIsMemberOpen(!isMemberOpen);
  };

  // 임시 멤버 데이터
  const tempMembers: GetGroupMembersResponse["members"] = [
    {
      name: "이싸피",
      image: "https://picsum.photos/30/30?random=1",
      email: "alice@example.com",
      role: "MANAGER",
    },
    {
      name: "박싸피",
      image: "https://picsum.photos/30/30?random=2",
      email: "bob@example.com",
      role: "Member",
    },
    {
      name: "최싸피",
      image: "https://picsum.photos/30/30?random=3",
      email: "charlie@example.com",
      role: "Member",
    },
    // 추가 테스트 데이터
    {
      name: "홍길동",
      image: "https://picsum.photos/30/30?random=4",
      email: "hong@example.com",
      role: "Member",
    },
    {
      name: "이몽룡",
      image: "https://picsum.photos/30/30?random=5",
      email: "lee@example.com",
      role: "Member",
    },
    // 여러 번 추가해서 목록이 길어짐
    {
      name: "이싸피",
      image: "https://picsum.photos/30/30?random=1",
      email: "alice@example.com",
      role: "MANAGER",
    },
    {
      name: "박싸피",
      image: "https://picsum.photos/30/30?random=2",
      email: "bob@example.com",
      role: "Member",
    },
    {
      name: "최싸피",
      image: "https://picsum.photos/30/30?random=3",
      email: "charlie@example.com",
      role: "Member",
    },
  ];

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // 실제 API 호출 예시:
        // const data = await getGroupMembers(groupId);
        // setMembers(data.members);
        setMembers(tempMembers);
      } catch (error) {
        console.error("그룹 멤버 조회 중 오류:", error);
      }
    };
    fetchMembers();
  }, [groupId]);

  // 드롭다운 토글 함수 (이름 및 아이콘 버튼 둘 다 클릭 시 실행)
  const handleDropdownToggle = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // 모달 열기/닫기 함수
  const openMypageModal = () => setActiveModal('mypage');
  const openDeleteModal = () => setActiveModal('delete');
  const openPictureModal = () => setActiveModal('picture');
  const closeModal = () => setActiveModal(null);

  // "마이페이지" 버튼 클릭 시: 모달 열기
  const handleNavigateToMypage = () => {
    setIsDropdownOpen(false);
    setActiveModal('mypage')
  };

  // 로그아웃 버튼 (예시)
  const handleLogout = async() => {
    try{
      logout();
    }catch(error){
      console.log(error);
      console.log("logout 실패")
    }
  };
  return (
    <div className="relative">
      {/* 토글 버튼 (네비게이션 바가 닫힌 상태) */}
      {!isProfileNavOpen && (
        <button
          onMouseEnter={handleButtonMouseEnter}
          onMouseLeave={handleButtonMouseLeave}
          onClick={handleToggleClick}
          className="p-2 fixed top-5 left-[150px]"
        >
          {isSmallNavOpen ? (
            <ChevronDoubleRightIcon
              className="text-[#4D4650] w-7 h-7"
              strokeWidth={2}
            />
          ) : (
            <Bars3Icon className="text-[#4D4650] w-7 h-7" strokeWidth={2} />
          )}
        </button>
      )}

      {/* 네비게이션 바 컨테이너 */}
      <div
        onMouseEnter={handleNavMouseEnter}
        onMouseLeave={handleNavMouseLeave}
        className={`
          main-container
          w-[280px]
          ${containerHeight}
          bg-[#d3dede]
          fixed left-[80px] ${navTopClass}
          shadow-lg transform transition-all duration-700
          ${isProfileNavOpen || isSmallNavOpen ? "translate-x-0" : "-translate-x-full"}
          ${!isProfileNavOpen && isSmallNavOpen ? "rounded-r-xl border border-gray-300" : ""}
        `}
      >
        {/* 닫기 버튼 (네비게이션 바 열림 상태) */}
        {isProfileNavOpen && (
          <button
            onClick={handleCloseClick}
            className="p-2 absolute top-4 right-2 z-50"
          >
            <ChevronDoubleLeftIcon
              className="text-[#4D4650] w-6 h-6"
              strokeWidth={2}
            />
          </button>
        )}

        {/* 프로필 영역 */}
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4 items-center">
            {/* 프로필 사진 */}
            <div className="relative w-[70px] h-[70px] rounded-full bg-white flex items-center justify-center">
              <img
                src="https://picsum.photos/70/70"
                alt="프로필"
                className="w-full h-full rounded-full"
              />
            </div>
            {/* 이름, 이메일, 드롭다운 버튼 (이름과 버튼 모두 클릭 시 드롭다운 열림) */}
            <div className="col-span-2 relative" ref={dropdownRef}>
              <div className="flex items-center">
                <span
                  onClick={handleDropdownToggle}
                  className="text-xl font-bold text-gray-800 cursor-pointer"
                >
                  김싸피
                </span>
                <button onClick={handleDropdownToggle} className="ml-2">
                  {isDropdownOpen ? (
                    <ChevronUpIcon
                      className="w-5 h-5 text-[#4D4650]"
                      strokeWidth={2}
                    />
                  ) : (
                    <ChevronDownIcon
                      className="w-5 h-5 text-[#4D4650]"
                      strokeWidth={2}
                    />
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-600">example@email.com</p>
              {/* 드롭다운 메뉴 */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-md overflow-hidden z-10">
                  <button
                    onClick={handleNavigateToMypage}
                    className="block px-4 py-2 w-full text-left text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <UserIcon className="w-5 h-5 mr-2" />
                    마이페이지
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 w-full text-left text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <hr className="border-1 mx-2" />

        {/* 그룹 이름 영역 */}
        <div className="flex items-center mx-5 mt-5 mb-2">
          <UserGroupIcon className="w-6 h-6 text-gray-[#4D4650] mr-2" />
          <span className="text-xl font-semibold text-[#4D4650]">{groupName}</span>
        </div>

        {/* 멤버 목록 영역 */}
        <div>
          <p
            className="text-xl mx-5 mt-5 mb-2 cursor-pointer flex items-center"
            onClick={toggleMemberList}
          >
            {isMemberOpen ? (
              <ChevronUpIcon
                className="w-5 h-5 text-[#4D4650] mr-2"
                strokeWidth={2}
              />
            ) : (
              <ChevronDownIcon
                className="w-5 h-5 text-[#4D4650] mr-2"
                strokeWidth={2}
              />
            )}
            <span className="text-[#4D4650]">Members</span>
          </p>
          {isMemberOpen && (
            // 멤버 목록 스크롤 기능 구현
            <div
              className="ml-10 mb-2 overflow-y-auto"
              style={{
                height: isProfileNavOpen
                  ? "calc(100vh - 250px)" // 완전히 열린 상태
                  : "calc(100vh - 380px)" // 호버 상태
              }}
            >
              <ul>
                {members.map((member, idx) => (
                  <li key={idx} className="flex items-center my-2">
                    <div className="relative w-[30px] h-[30px]">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full rounded-full border-2 border-gray-300"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-green-500" />
                    </div>
                    <span className="ml-4 text-[#4D4650]">{member.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* MyPageModal 렌더링 */}
      {activeModal === 'mypage' && (
        <MyPageModal
          isOpen={true}
          onClose={closeModal}
          onSwitchToLeave={openDeleteModal}
          onSwitchToPictureChange={openPictureModal}
          // groupId={/* 현재 그룹 ID를 전달할 수 있다면 전달 */}
        />
      )}
      {activeModal === 'delete' && (
        <LeaveModal
          isOpen={true}
          onClose={closeModal}
          onSwitchToMypage={openMypageModal}
        />
      )}
      {activeModal === 'picture' && (
        <PictureModal
          isOpen={true}
          onClose={closeModal}
          onSwitchToMypage={openMypageModal}
        />
      )}
    </div>
  );
};

export default ProfileNavigationBar;
