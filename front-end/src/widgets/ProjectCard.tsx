import React from 'react';
import { Project } from '../pages/ProjectListPage';
import MenuDot from '../assets/menu-dots.png';

interface ProjectCardProps {
  project: Project; // Project 타입을 받아올 수 있도록 정의
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { name, language_id, os_id, performance_id, users } = project;

  return (
    <div className="main-container w-[400px] h-[250px] rounded-[12px] bg-[#fff] border-solid border border-[#d0d0d7] shadow-md rounded-lg relative mx-auto my-10 p-5">
      {/* 프로젝트 제목 */}
      <div className="flex justify-between">
        <p className="font-['Inter'] text-[20px] font-semibold leading-[16px] text-[#68687b] relative my-auto">
            {name}
        </p>
        <button className='hover:bg-gray-300 p-1 rounded-full'>
            <img
                src={MenuDot}
                alt="Menu Dot Icon"
                className="w-[20px] h-[20px] object-contain"
            />
        </button>

      </div>

      {/* 프로젝트 세부 정보 */}
      <p className="font-['Inter'] text-[16px] font-semibold leading-[16px] text-[#858595] relative mx-auto mt-5">
        {language_id} | {performance_id} | {os_id}
      </p>

      {/* 참여자 목록 */}
      <div className="flex justify-end mt-16">
        <p className="text-sm text-gray-600">
          참여중인 멤버 : {users.filter((user) => user.status).length}/{users.length}
        </p>
      </div>
      
      {/* 입장하기 */}
      <button className="main-container w-[360px] h-[42px] font-['Inter'] text-[16px] font-medium leading-[16px] text-[#6893e8] rounded-[8px] relative mx-auto my-3 bg-[#fff] rounded-[8px] border-solid border border-[#6893e8] hover:bg-[#6893e8] hover:text-white">
        <span className="flex justify-center">
            입장하기
        </span>
      </button>
    

    </div>
  );
};

export default ProjectCard;
