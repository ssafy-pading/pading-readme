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
  Cog6ToothIcon, // 추가: 환경설정 아이콘 (톱니바퀴)
} from "@heroicons/react/24/outline";
import profileImage from "../assets/profile_image.png";

// --- 커스텀 훅 임포트 ---
import useGroupAxios from "../shared/apis/useGroupAxios"; 
import useProjectAxios from "../shared/apis/useProjectAxios";
import { GetMyPageResponse } from "../shared/types/mypageApiResponse";

// MyPageModal 임포트
import MyPageModal from "../widgets/MypageModal";
import useMypageAxios from "../shared/apis/useMypageAxios";
import LeaveModal from "./UserLeaveModal";
import PictureModal from "./PictureChangeModal";
import { useUser } from "../context/userContext";
import { GetProjectListResponse } from "../shared/types/projectApiResponse";
import GroupUpdateNameModal from "./GroupUpdateNameModal";

interface GroupUser {
  id: number;
  name: string;
  image: string;
  status: boolean;
}

const ProfileNavigationBar: React.FC = () => {
  const { userProfile } = useUser();
  const { getGroupDetails, getGroupMembers } = useGroupAxios();
  const { getProjects } = useProjectAxios();
  const { logout } = useMypageAxios();
  
  const groupId = useParams<({ groupId })>().groupId;

  const [groupName, setGroupName] = useState("");
  const [groupCapacity, setGroupCapacity] = useState(0);

  // 그룹 이름 수정 모달 오픈 여부를 관리하는 상태
  const [isGroupUpdateModalOpen, setIsGroupUpdateModalOpen] = useState(false);

  // 그룹 이름이 수정되면 갱신
  const handleGroupNameUpdate = (newName: string) => {
    setGroupName(newName)
  };

  // 그룹 상세 정보 조회
  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        console.log("Fetching group details for groupId:", groupId);
        const data = await getGroupDetails(groupId);
        setGroupName(data.name);
        setGroupCapacity(data.capacity);
      } catch (error) {
        console.error("그룹 상세 정보 조회 중 오류:", error);
      }
    };
    fetchGroupDetails();
  }, [groupId, getGroupDetails]);

  // 큰 네비게이션 바의 열림/닫힘 상태 (Context에서 관리)
  const { isProfileNavOpen, toggleProfileNav } = useNavigation();

  // useNavigate 훅 사용
  const navigate = useNavigate();

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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  // 컨테이너 높이와 상단 위치
  const containerHeight = isProfileNavOpen ? "h-full" : "h-auto";
  const navTopClass = isProfileNavOpen ? "top-0" : "top-[80px] bottom-[80px]";

  // 멤버 목록 관련
  const [groupUsers, setGroupUsers] = useState<GroupUser[]>([]);
  const activeMemberCount = groupUsers.filter(user => user.status).length;

  // 토글 관련
  const [toggleStates, setToggleStates] = useState({
    isGroupInfoOpen: true,
    isMemberOpen: true,
  });
  
  const toggle = (key: "isGroupInfoOpen" | "isMemberOpen") => {
    setToggleStates((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  
  // 그룹 멤버 조회 및 접속상태 불러오기 (프로젝트 목록 API 미구현시 빈 배열 사용)
  useEffect(() => {
    const fetchMembers = async () => {
      if (!groupId) return;
      try {
        // 1️⃣ 그룹 멤버 정보 가져오기
        const groupData = await getGroupMembers(groupId);
        let updatedGroupUsers: GroupUser[] = groupData.users.map((user) => ({
          id: user.id,
          name: user.name,
          image: user.image || profileImage,
          status: false,
          role: user.role
        }));

        // 2️⃣ 프로젝트 정보 가져오기 (에러 발생 시 빈 배열 반환)
        let projectData;
        try {
          projectData = await getProjects(groupId);
        } catch (error) {
          console.warn("프로젝트 목록 조회 API가 구현되지 않았습니다. 기본값을 사용합니다.");
          projectData = { projects: [] };
        }

        // 3️⃣ 프로젝트 정보와 그룹 멤버 정보를 비교하여 접속 상태 업데이트
        updatedGroupUsers = updatedGroupUsers.map((groupUser) => {
          const projectUser = projectData.projects
            .flatMap((project) => project.users)
            .find((user) => user.user_id === groupUser.id);
          return projectUser
            ? { ...groupUser, status: projectUser.status }
            : groupUser;
        });

        setGroupUsers(updatedGroupUsers);
      } catch (error) {
        console.error("그룹 멤버 조회 중 오류:", error);
      }
    };

    fetchMembers();
  }, [groupId, ]);
  
  // 로그인한 유저 role 확인
  const userRole = groupUsers.find(user => user.id === userProfile?.id)?.role;
  
  // 드롭다운 토글 함수
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
    setActiveModal('mypage');
  };

  // 로그아웃 버튼 (예시)
  const handleLogout = async () => {
    try {
      logout();
    } catch (error) {
      console.log(error);
      console.log("logout 실패");
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
          <div className="grid grid-cols-4 gap-1 items-center">
            {/* 프로필 사진 */}
            <div className="relative w-[50px] h-[50px] rounded-full bg-white flex items-center justify-center">
              <img
                src={userProfile?.image || profileImage}
                alt="ProfileImage"
                className="w-full h-full rounded-full"
              />
            </div>
            {/* 마이페이지, 로그아웃 드롭다운 버튼 */}
            <div className="col-span-3 relative" ref={dropdownRef}>
              <div className="flex items-center">
                <span
                  onClick={handleDropdownToggle}
                  className="font-bold text-[#4D4650] cursor-pointer"
                >
                  {userProfile?.name}
                </span>
                <button onClick={handleDropdownToggle} className="ml-2">
                  {isDropdownOpen ? (
                    <ChevronUpIcon className="w-4 h-4 text-[#4D4650]" strokeWidth={2} />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-[#4D4650]" strokeWidth={2} />
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-600">{userProfile?.email}</p>
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
          <span
            className="text-xl cursor-pointer font-semibold text-[#4D4650] inline-flex items-center"
            onClick={() => toggle("isGroupInfoOpen")}
          >
            {groupName}
            {toggleStates.isGroupInfoOpen ? (
              <ChevronUpIcon className="w-5 h-5 text-[#4D4650] ml-2 pt-1" strokeWidth={2} />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-[#4D4650] ml-2 pt-1" strokeWidth={2} />
            )}
          </span>
        </div>
        {toggleStates.isGroupInfoOpen && (
          <div className="px-10 mb-2 text-[#4D4650] hover:font-bold">
            {userRole === "OWNER" && (
              <div
                className="p-2 cursor-pointer"
                onClick={() => setIsGroupUpdateModalOpen(true)}
                >
                그룹 설정
              </div>
            )}
          </div>
        )}

        {/* 멤버 목록 영역 */}
        <div>
        <p
          className="text-xl mx-5 mt-5 mb-2 cursor-pointer flex items-center"
          onClick={() => toggle("isMemberOpen")}
        >
          {toggleStates.isMemberOpen ? (
            <ChevronUpIcon
              className="w-5 h-5 text-[#4D4650] mr-2 pt-1"
              strokeWidth={2}
            />
          ) : (
            <ChevronDownIcon
              className="w-5 h-5 text-[#4D4650] mr-2 pt-1"
              strokeWidth={2}
            />
          )}
          {/* 내부 컨테이너에 flex-1과 justify-between을 추가 */}
          <div className="flex items-center justify-between flex-1 text-[#4D4650]">
            <span>
              Members{" "}
              <span className="text-base">
                ({activeMemberCount}/{groupCapacity})
              </span>
            </span>
            {(userRole === "OWNER" || userRole === "MANAGER") && (
              <Cog6ToothIcon
                className="w-4 h-4 text-[#4D4650] cursor-pointer"
                strokeWidth={2}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/userrole");
                }}
              />
            )}
          </div>
        </p>

          {toggleStates.isMemberOpen && (
            <div
              className="ml-10 mb-2 overflow-y-auto"
              style={{
                height: isProfileNavOpen ? "calc(100vh - 250px)" : "calc(100vh - 380px)",
              }}
            >
              <ul>
                {groupUsers.map((groupUser) => (
                  <li key={groupUser.id} className="flex items-center my-2">
                    <div className="relative w-[30px] h-[30px]">
                      <img
                        src={groupUser.image}
                        alt={groupUser.name}
                        className="w-full h-full rounded-full border-2 border-gray-300"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          groupUser.status ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <span className="ml-4 text-[#4D4650]">{groupUser.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 그룹 이름 수정 모달 렌더링 */}
      <GroupUpdateNameModal
        isOpen={isGroupUpdateModalOpen}
        onClose={() => setIsGroupUpdateModalOpen(false)}
        groupId={groupId}
        currentName={groupName}
        onUpdate={handleGroupNameUpdate}
      />

      {/* MyPageModal 렌더링 */}
      {activeModal === 'mypage' && (
        <MyPageModal
          isOpen={true}
          onClose={closeModal}
          onSwitchToLeave={openDeleteModal}
          onSwitchToPictureChange={openPictureModal}
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
