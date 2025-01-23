import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ProjectCard from '../widgets/ProjectCard';
import GroupNavigationBar from '../widgets/GroupNavigationBar';
import ProfileNavigationBar from '../widgets/ProfileNavigationBar';
import { NavigationProvider, useNavigation } from '../context/navigationContext';

export interface User {
  user_id: number;
  name: string;
  email: string;
  role: string;
  profile_image: string;
  status: boolean;
}

export interface Project {
  id: number;
  os_id: string;
  language_id: string;
  performance_id: string;
  name: string;
  container_id: string;
  status: string;
  users: User[];
}

const ProjectListPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>(); // URL에서 groupId 추출

  // 서버에서 가져온 데이터 기반 프로젝트 목록
  const [projects] = useState<Project[]>([
    {
      "id": 1,
      "os_id": "ubuntu_20_04_lts",
      "language_id": "java",
      "performance_id": "medium",
      "name": "Project Alpha",
      "container_id": "container_123",
      "status": "active",
      "users": [
          {
              "user_id": 101,
              "name": "John Doe",
              "email": "johndoe@example.com",
              "role": "OWNER",
              "profile_image": "https://example.com/images/johndoe.png",
              "status": true
          },
          {
              "user_id": 102,
              "name": "Jane Smith",
              "email": "janesmith@example.com",
              "role": "MANAGER",
              "profile_image": "https://example.com/images/janesmith.png",
              "status": false
          }
      ]
  },
  {
      "id": 2,
      "os_id": "windows_10",
      "language_id": "python",
      "performance_id": "large",
      "name": "Project Beta",
      "container_id": "container_456",
      "status": "inactive",
      "users": [
          {
              "user_id": 103,
              "name": "Bob Johnson",
              "email": "bobjohnson@example.com",
              "role": "MEMBER",
              "profile_image": "https://example.com/images/bobjohnson.png",
              "status": true
          },
          {
              "user_id": 104,
              "name": "Alice Brown",
              "email": "alicebrown@example.com",
              "role": "MANAGER",
              "profile_image": "https://example.com/images/alicebrown.png",
              "status": false
          }
      ]
  },
  {
      "id": 3,
      "os_id": "windows_10",
      "language_id": "python",
      "performance_id": "large",
      "name": "Project Beta",
      "container_id": "container_456",
      "status": "inactive",
      "users": [
          {
              "user_id": 103,
              "name": "Bob Johnson",
              "email": "bobjohnson@example.com",
              "role": "MEMBER",
              "profile_image": "https://example.com/images/bobjohnson.png",
              "status": true
          },
          {
              "user_id": 104,
              "name": "Alice Brown",
              "email": "alicebrown@example.com",
              "role": "MANAGER",
              "profile_image": "https://example.com/images/alicebrown.png",
              "status": false
          }
      ]
  },
  {
      "id": 4,
      "os_id": "windows_10",
      "language_id": "python",
      "performance_id": "large",
      "name": "Project Beta",
      "container_id": "container_456",
      "status": "inactive",
      "users": [
          {
              "user_id": 103,
              "name": "Bob Johnson",
              "email": "bobjohnson@example.com",
              "role": "MEMBER",
              "profile_image": "https://example.com/images/bobjohnson.png",
              "status": true
          },
          {
              "user_id": 104,
              "name": "Alice Brown",
              "email": "alicebrown@example.com",
              "role": "MANAGER",
              "profile_image": "https://example.com/images/alicebrown.png",
              "status": false
          }
      ]
  },
  {
      "id": 5,
      "os_id": "windows_10",
      "language_id": "python",
      "performance_id": "large",
      "name": "Project Beta",
      "container_id": "container_456",
      "status": "inactive",
      "users": [
          {
              "user_id": 103,
              "name": "Bob Johnson",
              "email": "bobjohnson@example.com",
              "role": "MEMBER",
              "profile_image": "https://example.com/images/bobjohnson.png",
              "status": true
          },
          {
              "user_id": 104,
              "name": "Alice Brown",
              "email": "alicebrown@example.com",
              "role": "MANAGER",
              "profile_image": "https://example.com/images/alicebrown.png",
              "status": false
          }
      ]
  }
  ]);

  const { isProfileNavOpen } = useNavigation(); // 네비게이션 상태 가져오기

  return (
    <div className={`transition-all duration-1000 ${isProfileNavOpen ? 'ml-64' : 'ml-0'}`}>
  <ProfileNavigationBar />
  <GroupNavigationBar />
  {projects.length > 0 ? (
     <div className="overflow-y-auto px-5 sm:px-10 lg:px-20 max-h-screen">
     <div
       className="grid gap-6 grid-cols-[repeat(auto-fit,_minmax(425px,_1fr))] place-items-center ml-[80px]"
     >
       {projects.map((project) => (
         <ProjectCard key={project.id} project={project} />
       ))}
     </div>
   </div>
  
  ) : (
    <p>No projects available.</p>
  )}
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
