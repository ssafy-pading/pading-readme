// ProfileNavigationBar.tsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNavigation } from "../../../context/navigationContext";
// heroicons 아이콘 임포트
import { 
  ChevronUpIcon, 
  ChevronDownIcon, 
  Bars3Icon, 
  ChevronDoubleLeftIcon, 
  ChevronDoubleRightIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import profileImage from "../../../assets/profile_image.png"

// 토스트
import { Toaster, toast } from 'react-hot-toast';

// --- Redux 관련 임포트 ---
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../../app/redux/store";
import { fetchUserInfo } from "../../../app/redux/user";

// --- 커스텀 훅 임포트 ---
import useGroupAxios from "../../../shared/apis/useGroupAxios"; 
import useProjectAxios from "../../../shared/apis/useProjectAxios";
import useMypageAxios from "../../../shared/apis/useMypageAxios";
// import LeaveModal from "../../users/widgets/modals/UserLeaveModal";
// import PictureModal from "../../users/widgets/modals/PictureChangeModal";
import { GetProjectListResponse } from "../../../shared/types/projectApiResponse";
import GroupUpdateNameModal from "../../groups/widgets/modals/GroupUpdateNameModal";

interface GroupUser {
  id: number;
  name: string;
  image: string;
  status: boolean;
  role: string;
}

const ProfileNavigationBar: React.FC = () => {
  // Redux를 통해 유저 정보 가져오기
  const dispatch = useDispatch<AppDispatch>();
  const userProfile = useSelector((state: RootState) => state.user.user);
  const userStatus = useSelector((state: RootState) => state.user.status);

  // 유저 정보가 없으면 컴포넌트 마운트 시 fetchUserInfo 디스패치
  useEffect(() => {
    if (!userProfile && userStatus === "idle") {
      dispatch(fetchUserInfo());
    }
  }, [dispatch, userProfile, userStatus]);

  const navigate = useNavigate();
  // useGroupAxios에서 그룹 상세, 멤버 조회, 그리고 그룹 삭제 함수 추출
  const { getGroups, getGroupDetails, getGroupMembers, deleteGroup } = useGroupAxios();
  const { getProjects } = useProjectAxios();
  const { logout } = useMypageAxios();

  // 네비게이션 관련 커스텀 훅
  const { 
    isProfileNavOpen, 
    isSmallNavOpen,
    handleButtonMouseEnter,
    handleButtonMouseLeave,
    handleNavMouseEnter,
    handleNavMouseLeave,
    handleToggleClick,
    handleCloseClick,
  } = useNavigation();

  const containerHeight: string = isProfileNavOpen ? "h-full" : "h-auto";
  const navTopClass: string = isProfileNavOpen ? "top-0" : "top-[80px] bottom-[80px]";

  // 토글 상태 관리 (그룹 설정, 멤버 목록 토글)
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

  // 마이페이지 드롭다운 관리
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const handleDropdownToggle = () => {
    setIsDropdownOpen((prev) => !prev);
  };
    
  // const [activeModal, setActiveModal] = useState<'mypage' | 'delete' | 'picture' | null>(null);
  // const openMypageModal = () => setActiveModal('mypage');
  // const openDeleteModal = () => setActiveModal('delete');
  // const openPictureModal = () => setActiveModal('picture');
  // const closeModal = () => setActiveModal(null);
  // const handleNavigateToMypage = () => {
  //   setIsDropdownOpen(false);
  //   setActiveModal('mypage');
  // };

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

  // URL 파라미터에서 groupId 추출 (nogroup 페이지에서는 undefined)
  const groupIdParams = useParams<{ groupId?: string }>().groupId;
  const groupId: number | undefined = groupIdParams ? Number(groupIdParams) : undefined;
  
  // 그룹 이름 및 정원 관리
  const [groupName, setGroupName] = useState<string>("");
  const [groupCapacity, setGroupCapacity] = useState<number>(0);
  // 그룹 이름 수정 모달 상태
  const [isGroupUpdateModalOpen, setIsGroupUpdateModalOpen] = useState<boolean>(false);
  const handleGroupNameUpdate = (newName: string) => {
    setGroupName(newName);
  };

  // 그룹 상세 정보 조회
  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        if (!groupId) {
          navigate("/nogroup");
          return;
        }
        const data = await getGroupDetails(groupId);
        setGroupName(data.name);
        setGroupCapacity(data.capacity);
      } catch (error) {
        console.error("그룹 상세 정보 조회 중 오류:", error);
      }
    };
    fetchGroupDetails();
  }, [groupId, navigate, getGroupDetails]);

  // 그룹 멤버 관리
  const [groupUsers, setGroupUsers] = useState<GroupUser[]>([]);
  const activeMemberCount = groupUsers.filter(user => user.status).length;

  useEffect(() => {
    const fetchMembers = async () => {
      if (!groupId) return;
      try {
        const groupData = await getGroupMembers(groupId);
        let updatedGroupUsers: GroupUser[] = groupData.users.map((user) => ({
          id: user.id,
          name: user.name,
          image: user.image || profileImage,
          status: false,
          role: user.role
        }));

        let projectData: GetProjectListResponse;
        try {
          projectData = await getProjects(groupId);
        } catch (error) {
          console.log(error);
          projectData = [];
        }

        updatedGroupUsers = updatedGroupUsers.map((groupUser) => {
          const projectUser = projectData
            .flatMap((projectItem) => projectItem.users)
            .find((user) => user.id === groupUser.id);
          return projectUser
            ? { ...groupUser, status: projectUser.status }
            : groupUser;
        });

        // 정렬 적용: role 우선순위에 따라 정렬
        const rolePriority: Record<string, number> = {
          OWNER: 1,
          MANAGER: 2,
          MEMBER: 3,
        };

        updatedGroupUsers.sort((a, b) => {
          return (rolePriority[a.role] || 999) - (rolePriority[b.role] || 999);
        });

        setGroupUsers(updatedGroupUsers);
      } catch (error) {
        console.error("그룹 멤버 조회 중 오류:", error);
      }
    };
    fetchMembers();
  }, [groupId, getGroupMembers, getProjects]);

  // 로그인한 유저의 그룹 내 역할 확인
  const userRole = groupUsers.find(user => user.id === userProfile?.id)?.role;

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      logout();
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  // ★ 그룹 삭제 로직
  const handleDeleteGroup = async () => {
    if (!groupId) return;
    if (!window.confirm("정말 그룹을 삭제하시겠습니까? 이 작업은 복구할 수 없습니다.")) return;
    try {
      const success = await deleteGroup(groupId);
      console.log("deleteGroup 결과:", success);
      if (success) {
        toast.success("그룹이 삭제되었습니다.");
        // 삭제 후 최신 그룹 목록을 가져와 첫 번째 그룹으로 리다이렉트, 없으면 /nogroup
        const groupsResponse = await getGroups();
        if (groupsResponse.groups && groupsResponse.groups.length > 0) {
          window.location.href = `/projectlist/${groupsResponse.groups[0].id}`;
        } else {
          window.location.href = `/nogroup`;

        }
      }
    } catch (error) {
      toast.error("그룹 삭제 중 오류가 발생했습니다.");
      console.error("그룹 삭제 에러:", error);
    }
  };

  return (
    <div className="relative">
      <Toaster />
      {/* 토글 버튼 (네비게이션 바가 닫힌 상태) */}
      {!isProfileNavOpen && (
        <button
          onMouseEnter={handleButtonMouseEnter}
          onMouseLeave={handleButtonMouseLeave}
          onClick={handleToggleClick}
          className="p-2 fixed top-5 left-[150px]"
        >
          {isSmallNavOpen ? (
            <ChevronDoubleRightIcon className="text-[#4D4650] w-7 h-7" strokeWidth={2} />
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
        {/* 닫기 버튼 */}
        {isProfileNavOpen && (
          <button
            onClick={handleCloseClick}
            className="p-2 absolute top-4 right-2 z-50"
          >
            <ChevronDoubleLeftIcon className="text-[#4D4650] w-6 h-6" strokeWidth={2} />
          </button>
        )}

        {/* 프로필 영역 */}
        <div className="p-4">
          <div className="grid grid-cols-4 gap-1 items-center">
            <div className="relative w-[45px] h-[45px] rounded-full bg-white flex items-center justify-center">
              <img
                src={userProfile?.image || profileImage}
                alt="ProfileImage"
                className="w-full h-full rounded-full"
              />
            </div>
            <div className="col-span-3 relative" ref={dropdownRef}>
              <div className="flex items-center">
                <span
                  onClick={handleDropdownToggle}
                  className="font-bold text-[#4D4650] cursor-pointer max-w-[120px] truncate overflow-hidden text-ellipsis"
                >
                  {userProfile?.name}
                </span>
                <div className="relative">
                  <button onClick={handleDropdownToggle} className="ml-1">
                    {isDropdownOpen ? (
                      <ChevronUpIcon className="w-4 h-4 text-[#4D4650]" strokeWidth={2} />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4 text-[#4D4650]" strokeWidth={2} />
                    )}
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-28 bg-white text-xs rounded-lg shadow-md overflow-hidden z-10">
                      {/* <button
                        onClick={handleNavigateToMypage}
                        className="block px-2 py-2 w-full text-left text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <UserIcon className="w-4 h-4 mr-2" />
                        마이페이지
                      </button> */}
                      <button
                        onClick={handleLogout}
                        className="block px-2 py-2 w-full text-left text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <ArrowLeftOnRectangleIcon className="w-4 h-4 mr-2" />
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-600 max-w-[150px] truncate overflow-hidden text-ellipsis">
                {userProfile?.email}
              </p>
            </div>
          </div>
        </div>

        <hr className="border-1 mx-2" />
        {groupId && (
          <div>
            {/* 그룹 이름 영역 */}
            <div className="flex items-center mx-5 mt-5 mb-2">
              <span
                className="text-xl cursor-pointer font-semibold text-[#4D4650] inline-flex items-center"
                onClick={() => {
                  if (userRole === "OWNER") {
                    toggle("isGroupInfoOpen");
                  }
                }}
              >
                {groupName}
                {userRole === "OWNER" && (
                  toggleStates.isGroupInfoOpen ? (
                    <ChevronUpIcon className="w-4 h-4 text-[#4D4650] ml-1" strokeWidth={3} />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-[#4D4650] ml-1" strokeWidth={3} />
                  )
                )}
              </span>
            </div>
            {toggleStates.isGroupInfoOpen && (
              <div className="px-10 mb-2 text-[#4D4650]">
                {userRole === "OWNER" && (
                  <>
                    <div
                      className="p-2 cursor-pointer hover:font-bold"
                      onClick={() => setIsGroupUpdateModalOpen(true)}
                    >
                      이름 변경
                    </div>
                    <div
                      className="p-2 cursor-pointer text-red-500 hover:font-bold"
                      onClick={handleDeleteGroup}
                    >
                      그룹 삭제
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 멤버 목록 영역 */}
            <div>
              <div
                className="text-xl mx-5 mt-5 mb-2 cursor-pointer flex items-center"
                onClick={() => toggle("isMemberOpen")}
              >
                {toggleStates.isMemberOpen ? (
                  <ChevronUpIcon className="w-3 h-3 text-[#4D4650] mr-1" strokeWidth={3} />
                ) : (
                  <ChevronDownIcon className="w-3 h-3 text-[#4D4650] mr-1" strokeWidth={3} />
                )}
                <div className="flex items-center justify-between flex-1 text-[#4D4650]">
                  <span className="text-base font-semibold">
                    멤버 ({activeMemberCount}/{groupUsers.length})
                  </span>
                  {(userRole === "OWNER" || userRole === "MANAGER") && (
                    <Cog6ToothIcon
                      className="w-4 h-4 text-[#4D4650] cursor-pointer"
                      strokeWidth={2}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/rolechange/${groupId}`);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {toggleStates.isMemberOpen && (
              <div
                className="ml-10 mb-2 overflow-y-auto"
                style={{
                  height: isProfileNavOpen ? "calc(100vh - 250px)" : "calc(100vh - 450px)",
                }}
              >
                <ul>
                  {groupUsers.map((groupUser) => (
                    <li key={groupUser.id} className="flex items-center my-2 mr-2">
                      <div className="flex items-center">
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
                        <span className="ml-4 text-[#4D4650] whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                          {groupUser.name}
                        </span>
                      </div>
                      {groupUser.role === "OWNER" && (
                        <span className="ml-2 px-2 py-0.5 text-[10px] font-medium text-white bg-blue-500 rounded-lg">
                          OWNER
                        </span>
                      )}
                      {groupUser.role === "MANAGER" && (
                        <span className="ml-2 px-2 py-0.5 text-[10px] font-medium text-white bg-green-500 rounded-lg">
                          MANAGER
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 그룹 이름 수정 모달 렌더링 */}
      {groupId && (
        <GroupUpdateNameModal
          isOpen={isGroupUpdateModalOpen}
          onClose={() => setIsGroupUpdateModalOpen(false)}
          groupId={groupId}
          currentName={groupName}
          onUpdate={handleGroupNameUpdate}
        />
      )}

      {/* MyPageModal 렌더링 */}

      {/* {activeModal === 'delete' && (
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
      )} */}
    </div>
  );
};

export default ProfileNavigationBar;
