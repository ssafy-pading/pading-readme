// src/pages/ProjectListPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// 컴포넌트 import
import { GetProjectListResponse, ProjectListItem } from '../shared/types/projectApiResponse';
import ProjectCard from '../widgets/ProjectCard';
import GroupNavigationBar from '../widgets/GroupNavigationBar';
import ProfileNavigationBar from '../widgets/ProfileNavigationBar';
import DeleteConfirmModal from '../widgets/DeleteConfirmModal';
import ProjectCreateModal from '../widgets/CreateProjectModal';
import { NavigationProvider, useNavigation } from '../context/navigationContext';
import useGroupAxios from '../shared/apis/useGroupAxios';
import useProjectAxios from '../shared/apis/useProjectAxios';
import InviteLink from '../widgets/CreateLinkComponents';
import { FaPlus } from 'react-icons/fa';

// 토스트
import { Toaster, toast } from 'react-hot-toast';

// Redux 관련 import
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../app/redux/store';
import { fetchUserInfo } from '../app/redux/user';

// 타입 정의
export type Project = ProjectListItem['project'];

const ProjectListPage: React.FC = () => {
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
  const { getGroupMembers, getGroupDetails } = useGroupAxios();
  const { getProjects, deleteProject } = useProjectAxios();
  const { isProfileNavOpen } = useNavigation();

  // URL 파라미터에서 groupId 사용
  const groupIdParams = useParams<{ groupId?: string }>().groupId;
  const groupId: number | undefined = groupIdParams ? Number(groupIdParams) : undefined;

  // ───── 유저 역할 가져오기 ─────
  const [userRole, setUserRole] = useState<string>("");
  useEffect(() => {
    const fetchAndSetUserRole = async () => {
      if (!groupId || !userProfile) return;
      try {
        const groupData = await getGroupMembers(groupId);
        const user = groupData.users.find((member: { id: number; role: string }) => member.id === userProfile.id);
        if (user) {
          setUserRole(user.role);
        }
      } catch (error) {
        console.error("그룹 멤버 조회 중 오류:", error);
      }
    };
    fetchAndSetUserRole();
  }, [groupId, userProfile, getGroupMembers]);

  // ───── 그룹 이름, 프로젝트 리스트 상태 ─────
  const [groupName, setGroupName] = useState<string>('');
  const [projectList, setProjectList] = useState<ProjectListItem[]>([]);

  // ───── 그룹 정보 가져오기 ─────
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
      } catch (err) {
        console.error('프로젝트 목록을 불러오는 데 실패했습니다:', err);
      }
    };
    fetchProjects();
  }, [groupId, getProjects]);

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
    if (!selectedDeleteProject || !groupId) return;
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
  };

  return (
    <div className={`transition-all duration-1000 ${isProfileNavOpen ? 'ml-64' : 'ml-0'}`}>
      <Toaster />
      {/* 프로젝트 목록 영역 */}
      <div className="relative pl-8 pr-12 pb-6 overflow-y-auto max-h-screen transition-all duration-1000 ml-32 z-0">
        <div className="flex justify-between items-center relative mt-20 mb-3">
          <p className="text-2xl text-[#4D4650] font-semibold mr-4">{groupName}</p>
          {(userRole === 'OWNER' || userRole === 'MANAGER') && (
            <InviteLink groupId={groupId!} />
          )}
        </div>
        <hr className="mb-10" />
        <div className="grid gap-16 grid-cols-[repeat(auto-fill,_350px)]">
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
            <ProjectCard
              key={item.project.id}
              groupId={groupId!}
              project={item} // 전체 item (project와 users 모두 포함)
              userRole={userRole}
              onDelete={openDeleteConfirmModal}
            />
          ))}
        </div>
      </div>

      {/* ProjectCreateModal */}
      {(userRole === "OWNER" || userRole === "MANAGER") && (
        <ProjectCreateModal
          groupId={groupId!}
          isOpen={modalState.create}
          onClose={() => closeModal('create')}
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
