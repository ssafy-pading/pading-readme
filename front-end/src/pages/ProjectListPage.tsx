import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// 컴포넌트 import
import { GetProjectListResponse } from '../shared/types/projectApiResponse';
import ProjectCard from '../widgets/ProjectCard';
import GroupNavigationBar from '../widgets/GroupNavigationBar';
import ProfileNavigationBar from '../widgets/ProfileNavigationBar';
import DeleteConfirmModal from '../widgets/DeleteConfirmModal';
// import ExitConfirmModal from '../widgets/ExitConfirmModal';
import ProjectCreateModal from '../widgets/CreateProjectModal';
import { NavigationProvider, useNavigation } from '../context/navigationContext';

// API 호출을 위한 커스텀 훅
import useGroupAxios from '../shared/apis/useGroupAxios';
import useProjectAxios from '../shared/apis/useProjectAxios';
import { GetGroupMembersResponse } from '../shared/types/groupApiResponse';

// 이미지 import
import InviteLink from '../widgets/CreateLinkComponents';
import { useUser } from '../context/userContext';
import { FaPlus } from 'react-icons/fa';

// 타입 정의
export type Project = GetProjectListResponse['projects'][number];

const ProjectListPage: React.FC = () => {
  const { userProfile } = useUser();
  const navigate = useNavigate();
  const { getGroupMembers, getGroupDetails } = useGroupAxios();
  const { getProjects, deleteProject } = useProjectAxios();
  
  // ───── 네비게이션 액션을 위한 상태 확인 ─────
  const { isProfileNavOpen } = useNavigation();

  // url 파라미터에서 groupId 사용
  const groupIdParams = useParams<({ groupId: string | undefined })>().groupId;
  const groupId: number | undefined = groupIdParams !== undefined ? Number(groupIdParams) : undefined 

  // ───── 유저 역할 가져오기 ─────
  const [ userRole, setUserRole ] = useState<string>("")

  useEffect(() => {
    const fetchAndSetUserRole = async () => {
      if (!groupId || !userProfile) return; // groupId와 userProfile이 없으면 아무것도 하지 않음
      
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
  

  // 그룹 이름, 프로젝트 리스트
  const [groupName, setGroupName] = useState<string>('');
  const [projectList, setProjectList] = useState<Project[]>([]); 

  // ───── 그룹 정보 가져오기 ─────
  useEffect(() => {
      const fetchGroupDetails = async () => {
        try {
          if (!groupId) {
            console.log("groupId가 없습니다.")
            // navigate("/nogroup") // 그룹 id가 없으면 nogroup 페이지로 이동
            return
          }
          const data = await getGroupDetails(groupId);
          setGroupName(data.name);
          
        } catch (error) {
          console.error('그룹 상세 정보 조회 중 오류:', error);
        }
      };
  
      fetchGroupDetails();
    }, [groupId, getGroupDetails ]);

  // // ───── 프로젝트 목록 가져오기 ─────
  // useEffect(() => {
  //   const fetchProjects = async () => {
  //     if (!groupId) {
  //       return
  //     }
  //     try {
  //       const projectData: GetProjectListResponse  = await getProjects(groupId);
  //       setProjectList(projectData.projects);

  //     } catch (err) {
  //       console.error('프로젝트 목록을 불러오는 데 실패했습니다:', err);
  //     }
  //   };
  //   fetchProjects();
  // }, [groupId, getProjects, setProjectList]);

  useEffect(() => {
    const sampleProjects: Project[] = [
      {
        id: 1,
        os_id: 'ubuntu_20_04_lts',
        language_id: 'javascript',
        performance_id: 'medium',
        name: 'Sample Project 1',
        container_id: 'container_1',
        status: 'active',
        users: [] // 혹은 필요한 경우 더미 사용자 데이터를 추가
      },
      {
        id: 2,
        os_id: 'ubuntu_20_04_lts',
        language_id: 'python',
        performance_id: 'medium',
        name: 'Sample Project 2',
        container_id: 'container_2',
        status: 'active',
        users: []
      },
      {
        id: 3,
        os_id: 'ubuntu_20_04_lts',
        language_id: 'java',
        performance_id: 'medium',
        name: 'Sample Project 3',
        container_id: 'container_3',
        status: 'inactive',
        users: []
      },
    ];
    setProjectList(sampleProjects);
  }, []);


  /* ============================================
    모달 관리
   ============================================ */
  // 모달 상태 관리
  const [modalState, setModalState] = useState({
    create: false,
    delete: false,
    link: false
  });
  
  // 모달 열기
  const openModal = (type: 'create' | 'delete' | 'link') => {
    setModalState((prev) => ({ ...prev, [type]: true }));
  };
  
  // 모달 닫기
  const closeModal = (type: 'create' | 'delete' | 'link') => {
    setModalState((prev) => ({ ...prev, [type]: false }));
  };
  
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

  // ───── 액션 처리 ─────
  // DELETE
  const handleDelete = async () => {
    if (!selectedDeleteProject || !groupId) return;

    try {
      await deleteProject(groupId, selectedDeleteProject.id);
      setProjectList((prev) => prev.filter((p) => p.id !== selectedDeleteProject.id));
      closeDeleteConfirmModal();
      alert('프로젝트가 성공적으로 삭제되었습니다.');
    } catch (err) {
      console.error('프로젝트 삭제 실패:', err);
      alert('프로젝트 삭제에 실패했습니다.');
    }
  };

  return (
    <div className={`transition-all duration-1000 ${isProfileNavOpen ? 'ml-64' : 'ml-0'}`}>
      {/* 프로젝트 목록 */}
      <div className="relative pl-8 pr-12 pb-6 overflow-y-auto max-h-screen transition-all duration-1000 ml-32 z-0">
        <div className='flex justify-between items-center relative mt-20 mb-3'>
          <p className="text-2xl text-[#4D4650] font-semibold mr-4">
            {groupName}
          </p>

          {/* Heroicons를 사용한 초대 링크 만들기 버튼 */}
          {/* OWNER, MANAGER 만 초대 링크 생성 가능 */}
          {(userRole === 'OWNER' || userRole === 'MANAGER') && (
            // <button
            //   className="inline-flex items-center px-4 py-2 bg-[#5C8290] text-white 
            //   rounded border border-[#ccc] shadow-md 
            //   hover: hover:shadow-lg 
            //   transition-transform transform hover:scale-105
            //   focus:outline-none focus:ring-2 focus:ring-blue-300
            //   mt-20 mb-5"
            //   onClick={() => openModal('link')}
            // >
            //   <LinkIcon className="w-5 h-5 mr-2" />
            //   <span>초대 링크 생성</span>
            // </button>
            // {/* CreateLinkComponents */}
              <InviteLink
              groupId={groupId!}
            />
          )}
        </div>
        <hr className="mb-10" />

        <div className="grid gap-16 grid-cols-[repeat(auto-fill,_350px)]">
          {/* OWNER, MANAGER만 프로젝트 생성 버튼 표시 */}
          {(userRole === 'OWNER' || userRole === 'MANAGER') && (
            <button
              className="w-full h-[200px] bg-[#e4e8e8] rounded-lg border border-[#d0d0d7] flex items-center justify-center relative group shadow-md transform transition-transform duration-300 hover:scale-110 p-5"
              onClick={() => openModal('create')}
            >
              <div className="main-container w-16 h-16 rounded relative mx-auto bg-[#5c8290] flex items-center justify-center transform transition-transform duration-200 hover:scale-110 "
              >
                <FaPlus className="w-8 h-8 text-white"/>
                
              </div>
            </button>
          )}

          {/* 실제 프로젝트 리스트 */}
          {projectList.map((project) => (
            <ProjectCard
              key={project.id}
              groupId={groupId!}
              project={project}
              userRole={userRole}
              // Delete 로직
              onDelete={openDeleteConfirmModal}
            />
          ))}
        </div>
      </div>

      {/* ProjectCreateModal */}
      <ProjectCreateModal
        groupId={groupId!}
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

      {/* Exit Confirm Modal
      <ExitConfirmModal
        isOpen={modalState.exit}
        onClose={closeExitConfirmModal}
        onConfirm={handleExit}
        projectName={selectedExitProject ? selectedExitProject.name : ''}
      /> */}

      {/* CreateLinkModal */}
      {/* <CreateLinkModal
        isOpen={modalState.link}
        onClose={() => closeModal('link')}
        groupId={groupId}
      /> */}
      

      {/* 네비게이션 바 */}
      <div className='relative z-50'>
      <ProfileNavigationBar />
      <GroupNavigationBar />

      </div>

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
