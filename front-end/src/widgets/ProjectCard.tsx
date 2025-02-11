// src/widgets/ProjectCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectListItem } from '../shared/types/projectApiResponse';
import { RxDotsHorizontal } from "react-icons/rx";
import {
  PencilSquareIcon,
  TrashIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

interface ProjectCardProps {
  groupId: number;
  project: ProjectListItem; // 전체 item: { project: {...}, users: [...] }
  userRole: string;
  onDelete: (project: ProjectListItem) => void; // Delete 로직 콜백
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  groupId,
  project,
  userRole,
  onDelete,
}) => {
  // project prop에서 실제 프로젝트 데이터와 사용자 목록(users)을 분해합니다.
  const { project: projectData, users } = project;
  const { id, name, projectImage, performance } = projectData;
  const navigate = useNavigate();

  // 드롭다운 관련 상태/로직
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEnterProject = () => {
    navigate(`/project/${groupId}/${id}`);
  };

  return (
    <div className="w-full h-[200px] bg-white border border-[#d0d0d7] shadow-md rounded-lg p-4 relative transform transition-transform duration-300 hover:scale-105 z-10">
      {/* 프로젝트 제목 및 드롭다운 버튼 */}
      <div className="flex justify-between items-center">
        <p className="font-inter text-base font-semibold text-[#68687b]">{name}</p>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="hover:bg-gray-300 p-1 rounded-full focus:outline-none"
          >
            <RxDotsHorizontal className="w-5 h-5 text-[#68687b]" />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-20 transition ease-out duration-100">
              <ul className="py-1" role="menu">
                {userRole === 'OWNER' || userRole === 'MANAGER' ? (
                  <>
                    {/* EDIT 버튼 */}
                    <li role="none">
                      <button
                        className="w-full flex items-center text-left px-4 py-2 text-xs text-gray-500 hover:bg-gray-100"
                        onClick={() => {
                          console.log('Edit clicked');
                          setIsDropdownOpen(false);
                        }}
                        role="menuitem"
                      >
                        <PencilSquareIcon className="w-4 h-4 mr-2 text-gray-500" />
                        Edit
                      </button>
                    </li>
                    {/* DELETE 버튼 */}
                    <li role="none">
                      <button
                        className="w-full flex items-center text-left px-4 py-2 text-xs text-[#EF4444] hover:bg-red-500 hover:text-white group"
                        onClick={() => {
                          onDelete(project);
                          setIsDropdownOpen(false);
                        }}
                        role="menuitem"
                      >
                        <TrashIcon className="w-4 h-4 mr-2 text-[#EF4444] group-hover:text-white transition-colors duration-200" />
                        Delete
                      </button>
                    </li>
                  </>
                ) : (
                  // MEMBER의 경우 EXIT 버튼
                  <li role="none">
                    <button
                      className="w-full flex items-center text-left px-4 py-2 text-xs text-gray-500 hover:bg-gray-100"
                      onClick={() => {
                        setIsDropdownOpen(false);
                      }}
                      role="menuitem"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2 text-gray-500" />
                      Exit
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 프로젝트 세부 정보 */}
      <p className="font-inter text-sm font-semibold text-[#858595] mt-5">
        {projectImage.language} | {performance.cpuDescription} | {performance.memory}
      </p>

      {/* 참여자 목록 */}
      <div className="flex justify-end mt-8">
        <p className="text-xs text-[#858595] font-semibold">
          참여중인 멤버 : {users.filter((user) => user.status).length}/{users.length}
        </p>
      </div>

      {/* 입장하기 버튼 */}
      <button
        onClick={handleEnterProject}
        className="w-full h-10 font-inter text-base font-medium text-[#6893e8] rounded-lg bg-white border border-[#6893e8] hover:bg-[#6893e8] hover:text-white mt-3"
      >
        <span className="flex justify-center font-semibold">입장하기</span>
      </button>
    </div>
  );
};

export default ProjectCard;
