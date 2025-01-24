// src/widgets/ProjectCard.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Project } from '../pages/ProjectListPage';
import MenuDot from '../assets/menu-dots.png';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'; // Heroicons v2 경로로 변경

interface ProjectCardProps {
  project: Project;
  onDelete: (project: Project) => void; // 상위 컴포넌트의 Delete 함수
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  const { name, language_id, os_id, performance_id, users } = project;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full bg-white border border-[#d0d0d7] shadow-md rounded-lg p-5 relative transform transition-transform duration-300 hover:scale-110 z-10">
      {/* 프로젝트 제목 및 드롭다운 버튼 */}
      <div className="flex justify-between items-center">
        <p className="font-inter text-lg font-semibold text-[#68687b]">
          {name}
        </p>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className='hover:bg-gray-300 p-1 rounded-full focus:outline-none'
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
          >
            <img
              src={MenuDot}
              alt="Menu Dot Icon"
              className="w-5 h-5 object-contain"
            />
          </button>
          {/* 드롭다운 메뉴 */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20 transition ease-out duration-100">
              <ul className="py-1" role="menu">
                <li role="none">
                  <button
                    className="w-full flex items-center text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      // Edit 액션 처리
                      console.log('Edit clicked');
                      setIsDropdownOpen(false);
                    }}
                    role="menuitem"
                  >
                    <PencilSquareIcon className="w-5 h-5 mr-2 text-gray-500" />
                    Edit
                  </button>
                </li>
                <li role="none">
                  <button
                    className="w-full flex items-center text-left px-4 py-2 text-sm text-[#EF4444] hover:bg-red-500 hover:text-white group"
                    onClick={() => onDelete(project)} // 상위 컴포넌트의 Delete 함수 호출
                    role="menuitem"
                  >
                    <TrashIcon className="w-5 h-5 mr-2 text-[#EF4444] group-hover:text-white transition-colors duration-200" />
                    Delete
                  </button>
                </li>
                {/* 추가 옵션 필요 시 여기에 추가 */}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 프로젝트 세부 정보 */}
      <p className="font-inter text-base font-semibold text-[#858595] mt-5">
        {language_id} | {performance_id} | {os_id}
      </p>

      {/* 참여자 목록 */}
      <div className="flex justify-end mt-8">
        <p className="text-sm text-gray-600">
          참여중인 멤버 : {users.filter((user) => user.status).length}/{users.length}
        </p>
      </div>
      
      {/* 입장하기 버튼 */}
      <button className="w-full h-10 font-inter text-base font-medium text-[#6893e8] rounded-lg bg-white border border-[#6893e8] hover:bg-[#6893e8] hover:text-white mt-3">
        <span className="flex justify-center">
          입장하기
        </span>
      </button>
    </div>
  );
};

export default ProjectCard;
