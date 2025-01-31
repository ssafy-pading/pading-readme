import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// 컴포넌트 import
import { GetProjectListResponse } from '../shared/types/projectApiResponse';
import ProjectCard from '../widgets/ProjectCard';
import GroupNavigationBar from '../widgets/GroupNavigationBar';
import ProfileNavigationBar from '../widgets/ProfileNavigationBar';
import DeleteConfirmModal from '../widgets/DeleteConfirmModal';
import ExitConfirmModal from '../widgets/ExitConfirmModal';
import ProjectCreateModal from '../widgets/CreateProjectModal';
import CreateLinkModal from '../widgets/CreateLinkModal';
import { NavigationProvider, useNavigation } from '../context/navigationContext';

// API 호출을 위한 커스텀 훅
import useGroupAxios from '../shared/apis/useGroupAxios';
import useProjectAxios from '../shared/apis/useProjectAxios';

// 이미지 import
import group_create_icon from '../assets/group_create_icon.svg';
import { LinkIcon } from '@heroicons/react/24/outline';

// 타입 정의
export type Project = GetProjectListResponse['projects'][number];

interface RouteParams {
  groupId: string;
}

const ProjectListPage: React.FC = () => {

  // ───── 유저 역할 가져오기 ─────
  const userRole = 'OWNER'; // 추후에 실제 로그인 로직에 따라 가져와야 함
  const groupId = '1'; // 추후에 URL 파라미터로 받아와야 함

  // ───── API 훅 가져오기 ─────
  const { getGroupDetails } = useGroupAxios();
  const { getProjects, deleteProject, exitProject } = useProjectAxios(); 

  // ───── URL 파라미터 ─────
  // const { groupId } = useParams<RouteParams>(); // 추후에 사용
  const [groupName, setGroupName] = useState<string>('');

  const [projectList, setProjectList] = useState<Project[]>([]); 

  // ───── 네비게이션 (사이드바) ─────
  const { isProfileNavOpen, isHover } = useNavigation(); 

  // ───── 그룹 정보 가져오기 ─────
  // useEffect(() => {
  //   const fetchGroupDetails = async () => {
  //     if (!groupId) return;
  //     try {
  //       const groupDetails = await getGroupDetails(groupId);
  //       setGroupName(groupDetails.name as string);
  //     } catch (err) {
  //       console.error('그룹 정보를 가져오는 데 실패했습니다:', err);
  //     }
  //   };
  //   fetchGroupDetails();
  // }, [groupId, getGroupDetails]);

  // ───── 프로젝트 목록 가져오기 ─────
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // const projectData = await getProjects(groupId);
        // setProjectList(projectData.projects);

        // 임시 목업 데이터
        const mockProjects: Project[] = [
          {
            id: 1,
            os_id: 'ubuntu_20_04_lts',
            language_id: 'java',
            performance_id: 'medium',
            name: 'Project Alpha',
            container_id: 'container_123',
            status: 'active',
            users: [
              {
                user_id: 101,
                name: 'John Doe',
                email: 'johndoe@example.com',
                role: 'OWNER',
                profile_image: 'https://example.com/images/johndoe.png',
                status: true,
              },
            ],
          },
          {
            id: 2,
            os_id: 'windows_10',
            language_id: 'python',
            performance_id: 'large',
            name: 'Project Beta',
            container_id: 'container_456',
            status: 'inactive',
            users: [
              {
                user_id: 102,
                name: 'Jane Smith',
                email: 'janesmith@example.com',
                role: 'MANAGER',
                profile_image: 'https://example.com/images/janesmith.png',
                status: false,
              },
            ],
          },
          {
            id: 3,
            os_id: 'macos',
            language_id: 'javascript',
            performance_id: 'high',
            name: 'Project Gamma',
            container_id: 'container_789',
            status: 'active',
            users: [
              {
                user_id: 103,
                name: 'Alice Brown',
                email: 'alicebrown@example.com',
                role: 'MEMBER',
                profile_image: 'https://example.com/images/alicebrown.png',
                status: true,
              },
            ],
          },
        ];
        setProjectList(mockProjects);
      } catch (err) {
        console.error('프로젝트 목록을 불러오는 데 실패했습니다:', err);
      }
    };
    fetchProjects();
  }, [groupId, setProjectList]);


  // 모달 상태 관리
  const [modalState, setModalState] = useState({
    create: false,
    delete: false,
    exit: false,
    link: false
  });
  
  // 모달 열기
  const openModal = (type: 'create' | 'delete' | 'exit' | 'link') => {
    setModalState((prev) => ({ ...prev, [type]: true }));
  };
  
  // 모달 닫기
  const closeModal = (type: 'create' | 'delete' | 'exit' | 'link') => {
    setModalState((prev) => ({ ...prev, [type]: false }));
  };
  
  // ───── 모달 로직 ─────
  // DELETE 선택한 프로젝트
  const [selectedDeleteProject, setSelectedDeleteProject] = useState<Project | null>(null);
  
  // DELETE 모달 열기
  const openDeleteConfirmModal = (project: Project) => {
    setSelectedDeleteProject(project);
    openModal('delete');
  };
  
  // DELETE 모달 닫기
  const closeDeleteConfirmModal = () => {
    setSelectedDeleteProject(null);
    closeModal('delete');
  };
  
  // EXIT 선택한 프로젝트
  const [selectedExitProject, setSelectedExitProject] = useState<Project | null>(null);
  
  // EXIT 모달 열기
  const openExitConfirmModal = (project: Project) => {
    setSelectedExitProject(project);
    openModal('exit');
  };
  
  // EXIT 모달 닫기
  const closeExitConfirmModal = () => {
    setSelectedExitProject(null);
    closeModal('exit');
  };

  // ───── 액션 처리 ─────
  // DELETE
  const handleDelete = async () => {
    if (!selectedDeleteProject || !groupId) return;

    try {
      await deleteProject(groupId, selectedDeleteProject.id.toString());
      setProjectList((prev) => prev.filter((p) => p.id !== selectedDeleteProject.id));
      closeDeleteConfirmModal();
      alert('프로젝트가 성공적으로 삭제되었습니다.');
    } catch (err) {
      console.error('프로젝트 삭제 실패:', err);
      alert('프로젝트 삭제에 실패했습니다.');
    }
  };

  // EXIT
  const handleExit = async () => {
    if (!selectedExitProject || !groupId) return;

    try {
      await exitProject(groupId, selectedExitProject.id.toString());
      alert('프로젝트에서 나갔습니다.');
      closeExitConfirmModal();
    } catch (err) {
      console.error('프로젝트 나가기 실패:', err);
      alert('프로젝트 나가기에 실패했습니다.');
    }
  };


  return (
    <div
      className={`transition-all duration-1000 ${
        (isProfileNavOpen || isHover)
          ? 'ml-64' // 완전 열림 또는 호버 시
          : 'ml-0'  // 닫힘
      }`}
    >
      {/* 네비게이션 바 */}
      <ProfileNavigationBar />
      <GroupNavigationBar />

      {/* 프로젝트 목록 */}
      <div className="pl-8 pr-12 pb-6 overflow-y-auto max-h-screen transition-all duration-1000 ml-32">
        <div className='flex justify-between items-center'>
          <p className="text-3xl text-[#4D4650] font-semibold mt-20 mb-10">
            {/* API 연결 시 삭제 및 수정 */}
            그룹 이름: {groupName}
          </p>

          {/* Heroicons를 사용한 초대 링크 만들기 버튼 */}
          {/* OWNER, MANAGER 만 초대 링크 생성 가능 */}
          {(userRole === 'OWNER' || userRole === 'MANAGER') && (
            <button
              className="inline-flex items-center px-4 py-2 bg-[#5C8290] text-white 
              rounded border border-[#ccc] shadow-md 
              hover: hover:shadow-lg 
              transition-transform transform hover:scale-105
              focus:outline-none focus:ring-2 focus:ring-blue-300
              mt-20 mb-5"
              onClick={() => openModal('link')}
            >
              <LinkIcon className="w-5 h-5 mr-2" />
              <span>초대 링크 생성</span>
            </button>
          )}
        </div>
        <hr className="mb-10" />

        <div className="grid gap-16 grid-cols-[repeat(auto-fill,_minmax(325px,_1fr))]">
          {/* OWNER, MANAGER만 프로젝트 생성 버튼 표시 */}
          {(userRole === 'OWNER' || userRole === 'MANAGER') && (
            <button
              className="w-full h-[216px] bg-[#e4e8e8] rounded-lg border border-[#d0d0d7] flex items-center justify-center relative group shadow-md transform transition-transform duration-300 hover:scale-110 p-5"
              onClick={() => openModal('create')}
            >
              <img src={group_create_icon} alt="group create icon" />
            </button>
          )}

          {/* 실제 프로젝트 리스트 */}
          {projectList.map((project) => (
            <ProjectCard
              key={project.id}
              groupId={groupId}
              project={project}
              userRole={userRole}
              // Delete 로직
              onDelete={openDeleteConfirmModal}
              // Exit 로직
              onExit={openExitConfirmModal}
            />
          ))}
        </div>
      </div>

      {/* ProjectCreateModal */}
      <ProjectCreateModal
        groupId={groupId}
        isOpen={modalState.create}
        onClose={() => closeModal('create')}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={modalState.delete}
        onClose={closeDeleteConfirmModal}
        onConfirm={handleDelete}
        projectName={selectedDeleteProject ? selectedDeleteProject.name : ''}
      />

      {/* Exit Confirm Modal */}
      <ExitConfirmModal
        isOpen={modalState.exit}
        onClose={closeExitConfirmModal}
        onConfirm={handleExit}
        projectName={selectedExitProject ? selectedExitProject.name : ''}
      />
      <CreateLinkModal
        isOpen={modalState.link}
        onClose={() => closeModal('link')}
        groupId={groupId}
      />
    </div>
  );
};

// 네비게이션 토글 상태를 공유하는 컴포넌트로 감싸기
const WrappedProjectListPage: React.FC = () => {
  return (
    <NavigationProvider>
      <ProjectListPage />
    </NavigationProvider>
  );
};

export default WrappedProjectListPage;
