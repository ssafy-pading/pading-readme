// src/pages/ProjectListPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// API
import { GetProjectMemberStatusResponse, ProjectListItem } from '../shared/types/projectApiResponse';
import useGroupAxios from '../shared/apis/useGroupAxios';
import useProjectAxios from '../shared/apis/useProjectAxios';

// 컴포넌트 import
import GroupNavigationBar from '../features/navigationbar/components/GroupNavigationBar';
import ProfileNavigationBar from '../features/navigationbar/components/ProfileNavigationBar';
import ProjectCreateModal from '../features/groups/widgets/modals/CreateProjectModal';
import DeleteConfirmModal from '../features/groups/widgets/modals/DeleteConfirmModal';
import ProjectCard from '../features/groups/widgets/components/ProjectCard';
import InviteLink from '../features/groups/widgets/components/CreateLinkComponents';
import { FaPlus } from 'react-icons/fa';

// css
import "../shared/widgets/ScrollBar.css";

// 토스트
import { Toaster, toast } from 'react-hot-toast';

// Redux 관련 import
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../app/redux/store';
import { fetchUserInfo } from '../app/redux/user';
import { NavigationProvider, useNavigation } from '../context/navigationContext';

// 반투명 로딩
import TranslucentSpinner from '../features/projects/projectpage/widgets/spinners/TranslucentSpinner';

// 웹소켓
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { CallSocketProvider } from '../features/projects/projectpage/components/CallSocket';

// 타입 정의
export type Project = ProjectListItem['project'];

interface GroupMember {
  id: number;
  name: string;
  image: string;
  email: string;
  role: string;
  status: string;
}

const ProjectListPage: React.FC = () => {
  // Redux를 통해 유저 정보 가져오기
  const dispatch = useDispatch<AppDispatch>();
  const userProfile = useSelector((state: RootState) => state.user.user);
  const userStatus = useSelector((state: RootState) => state.user.status);

  // 로딩상태 관리
  const [isDeleting, setIsDeleting] = useState(false);


  // 유저 정보가 없으면 컴포넌트 마운트 시 fetchUserInfo 디스패치
  useEffect(() => {
    if (!userProfile && userStatus === "idle") {
      dispatch(fetchUserInfo());
    }
  }, [dispatch, userProfile, userStatus]);

  const navigate = useNavigate();
  const { getGroupMembers, getGroupDetails } = useGroupAxios();
  const { getProjects, deleteProject, getProjectMemberStatus } = useProjectAxios();
  const { isProfileNavOpen } = useNavigation();

  // URL 파라미터에서 groupId 사용
  const groupIdParams = useParams<{ groupId?: string }>().groupId;
  const groupId: number | undefined = groupIdParams ? Number(groupIdParams) : undefined;

  // ───── 상태관리 ─────
  const [userRole, setUserRole] = useState<string>("");  // 유저 역할
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]); // 그룹 멤버
  const [groupName, setGroupName] = useState<string>(''); // 그룹 이름
  const [projectList, setProjectList] = useState<ProjectListItem[]>([]); // 프로젝트 목록록
  const [onlineProjectMembers, setOnlineProjectMembers] = useState<{ [projectId: number]: GetProjectMemberStatusResponse }>({});
  const [projectCall, setProjectCall] = useState<Record<number, string>>({});

  // ───── 유저 역할, 그룹 멤버 가져오기 ─────
  useEffect(() => {
    const fetchAndSetUserRole = async () => {
      if (!groupId || !userProfile) return;
      try {
        const groupData = await getGroupMembers(groupId);
        setGroupMembers(groupData.users); // 그룹 전체 멤버 저장
        const user = groupData.users.find((member: { id: number; role: string }) => member.id === userProfile.id);
        if (user) {
          setUserRole(user.role);
        }
      } catch (error:any) {
        console.error("그룹 멤버 조회 중 오류:", error);
      }
    };
    fetchAndSetUserRole();
  }, [groupId, userProfile, getGroupMembers]);

  
  // ───── 그룹 상세 정보 가져오기 ─────
  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!groupId) {
        navigate("/nogroup");
        return;
      }
      try {
        const data = await getGroupDetails(groupId);
        setGroupName(data.name);
      } catch (error) {
        console.error('그룹 상세 정보 조회 중 오류:', error);
      }
    };
    fetchGroupDetails();
  }, [groupId, navigate, getGroupDetails]);

  // ───── 프로젝트 목록 가져오기 ─────
  useEffect(() => {
    const fetchProjects = async () => {
      if (!groupId) {
        console.warn('groupId가 없으므로 프로젝트를 불러올 수 없습니다.');
        return;
      }
      try {
        // getProjects 함수는 ProjectListItem[] 형태의 데이터를 반환한다고 가정합니다.
        const data = await getProjects(groupId);
        setProjectList(data);
        const callStatusMap: Record<number, string> = {};
        data.forEach((projectItem: ProjectListItem) => {
          callStatusMap[projectItem.project.id] = projectItem.callStatus; // "active" 또는 "inactive"
        });
        setProjectCall(callStatusMap);
      } catch (err) {
        console.error('프로젝트 목록을 불러오는 데 실패했습니다:', err);
      }
    };
    fetchProjects();
  }, [groupId, getProjects]);

  // ───── 온라인 멤버 상태 관리 ─────
  // 각 프로젝트 별로 온라인 멤버의 userId 배열을 저장하는 상태 객체
  // 프로젝트 리스트가 업데이트될 때마다 각 프로젝트에 대해 getProjectMemberStatus API 호출
  useEffect(() => {
    if (!groupId || projectList.length === 0) return;
  
    const fetchOnlineStatuses = async () => {
      const onlineStatusMap: { [projectId: number]: GetProjectMemberStatusResponse } = {};
      for (const projectItem of projectList) {
        const currentProjectId = projectItem.project.id;
        try {
          // 여기서 getProjectMemberStatus는 단순 배열을 반환합니다.
          const onlineMembers = await getProjectMemberStatus(String(groupId), String(currentProjectId));
          onlineStatusMap[currentProjectId] = onlineMembers;
        } catch (error: any) {
          console.error(`프로젝트 ${currentProjectId} 온라인 상태 조회 실패:`, error.response?.data || error);
          onlineStatusMap[currentProjectId] = [];
        }
      }
      setOnlineProjectMembers(onlineStatusMap);
    };
  
    fetchOnlineStatuses();
  }, [groupId, projectList, getProjectMemberStatus]);
  

  // ───── 웹소켓 연결: 실시간 업데이트 (예: 멤버 입장 이벤트 등) ─────
  useEffect(() => {
    if (!groupId || !userProfile?.id) return;

    const socket = new SockJS(`${import.meta.env.VITE_APP_API_BASE_URL}/ws`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        userId: userProfile.id.toString(),
        groupId: groupId.toString(),
      },
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(`/sub/project-status/groups/${groupId}`, async (messageData) => {
          try {
            const data = JSON.parse(messageData.body);
            // data 예시: { projectId: "1", status: "member" }
            if (data.status === "member") {
              const projectId = Number(data.projectId);
              // API 호출: 해당 프로젝트의 온라인 멤버 상태 업데이트
              const onlineMembers = await getProjectMemberStatus(String(groupId), String(projectId));
              setOnlineProjectMembers((prev) => ({
                ...prev,
                [projectId]: onlineMembers,
              }));
            } else if (data.status === "active") {
              setProjectCall((prev) => ({...prev, [data.projectId]: "active"}));
            } else if (data.status === "inactive") {
              setProjectCall((prev) => ({...prev, [data.projectId]: "inactive"}));
            }
          } catch (error) {
            console.error("프로젝트 멤버 상태 업데이트 중 오류:", error);
          }
        });
        
      },
      onStompError: (frame) => {
        console.error("STOMP Error:", frame);
      },
    });

    stompClient.activate();
    return () => {
      stompClient.deactivate();
    };
  }, [groupId, userProfile?.id, getProjectMemberStatus]);



  /* ============================================
    모달 관리
   ============================================ */
  const [modalState, setModalState] = useState({
    create: false,
    delete: false,
    link: false
  });

  // 모달 열기/닫기 함수
  const openModal = (type: 'create' | 'link') => {
    setModalState((prev) => ({ ...prev, [type]: true }));
  };

  const closeModal = (type: 'create' | 'link') => {
    setModalState((prev) => ({ ...prev, [type]: false }));
  };

  // DELETE 관련 상태 및 함수
  // 타입 변경: ProjectListItem로 수정
  const [selectedDeleteProject, setSelectedDeleteProject] = useState<ProjectListItem | null>(null);
  const openDeleteConfirmModal = (project: ProjectListItem) => {
    setSelectedDeleteProject(project);
    // Delete 모달을 열려면 modalState.delete를 true로 설정하면 됩니다.
    setModalState((prev) => ({ ...prev, delete: true }));
  };
  const closeDeleteConfirmModal = () => {
    setSelectedDeleteProject(null);
    setModalState((prev) => ({ ...prev, delete: false }));
  };

  const handleDelete = async () => {
    // 이미 로딩중이면 안되게 막기
    if (isDeleting) return;

    if (!selectedDeleteProject || !groupId) return;

    // 로딩동안 막기
    setIsDeleting(true);

    try {
      await deleteProject(groupId, selectedDeleteProject.project.id);
      setProjectList((prev) =>
        prev.filter((item) => item.project.id !== selectedDeleteProject.project.id)
      );
      closeDeleteConfirmModal();
      toast.success('프로젝트가 성공적으로 삭제되었습니다.');
    } catch (err) {
      console.error('프로젝트 삭제 실패:', err);
      toast.error('프로젝트 삭제에 실패했습니다.');
    }
    finally{
      // 로딩후 로딩창 닫기
      setIsDeleting(false);
    }
  };

  // 모달에서 전달받은 새 프로젝트 정보를 기존 리스트에 추가
  const handleProjectCreate = (newProjectItem: ProjectListItem) => {
    setProjectList((prev) => [newProjectItem, ...prev]);
  };

  return (
    
    <div className={`transition-all duration-1000 ${isProfileNavOpen ? 'ml-64' : 'ml-0'}`}>
      {/* 로딩 오버레이 (생성 중일 때) */}
      {isDeleting && (
        <TranslucentSpinner />
      )}
      <Toaster />
      {/* 프로젝트 목록 영역 */}
      <div className="scroll relative pl-6 pr-10 pb-6 overflow-y-auto max-h-screen transition-all duration-1000 ml-32 z-0">
        <div className="flex justify-between items-center relative mt-20 mb-3">
          <p className="text-2xl text-[#4D4650] font-semibold mr-4">{groupName}</p>
          {(userRole === 'OWNER' || userRole === 'MANAGER') && (
            <InviteLink groupId={groupId!} />
          )}
        </div>
        <hr className="mb-10" />
        <div className="grid gap-12 grid-cols-[repeat(auto-fill,_300px)]">
          {(userRole === 'OWNER' || userRole === 'MANAGER') && (
            <button
              className="w-full h-[200px] bg-[#e4e8e8] rounded-lg border border-[#d0d0d7] flex items-center justify-center relative group shadow-md transform transition-transform duration-300 hover:scale-105 p-5"
              onClick={() => openModal('create')}
            >
              <div className="main-container w-16 h-16 rounded relative mx-auto bg-[#5c8290] flex items-center justify-center transform transition-transform duration-200">
                <FaPlus className="w-8 h-8 text-white" />
              </div>
            </button>
          )}

          {/* 실제 프로젝트 리스트 */}
          {projectList.map((item) => (
            <CallSocketProvider groupId={groupId!} projectId={item.project.id}>
              <ProjectCard
                key={item.project.id}
                groupId={groupId!}
                project={item} // 전체 item (project와 users 모두 포함)
                userRole={userRole}
                onDelete={openDeleteConfirmModal}
                onlineMembers={onlineProjectMembers[item.project.id] || []}
                hasCall={projectCall[item.project.id]}
              />
            </CallSocketProvider>
          ))}
        </div>
      </div>

      {/* ProjectCreateModal */}
      {(userRole === "OWNER" || userRole === "MANAGER") && (
        <ProjectCreateModal
          groupId={groupId!}
          isOpen={modalState.create}
          onClose={() => closeModal('create')}
          onProjectCreate={handleProjectCreate}
        />
      )}

      {/* DeleteConfirmModal */}
      <DeleteConfirmModal
        isOpen={modalState.delete}
        onClose={closeDeleteConfirmModal}
        onConfirm={handleDelete}
        projectName={selectedDeleteProject ? selectedDeleteProject.project.name : ''}
      />

      {/* 네비게이션 바 */}
      <div className="relative z-50">
        <ProfileNavigationBar />
        <GroupNavigationBar />
      </div>
    </div>
  );
};

const WrappedProjectListPage: React.FC = () => {
  return (
    <NavigationProvider>
      <ProjectListPage />
    </NavigationProvider>
  );
};

export default WrappedProjectListPage;
