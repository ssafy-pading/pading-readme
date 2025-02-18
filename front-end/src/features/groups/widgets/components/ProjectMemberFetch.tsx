import React, { useState, useEffect } from 'react';
import useProjectAxios from '../../../../shared/apis/useProjectAxios'
import { GetProjectMemberStatusResponse } from '../../../../shared/types/projectApiResponse';

interface ProjectMemberStatusProps {
  groupId: number;
  projectId: number;
}

const ProjectMemberStatus: React.FC<ProjectMemberStatusProps> = ({ groupId, projectId }) => {
  const { getProjectMemberStatus } = useProjectAxios();
  // API 응답의 data는 number[] (멤버 userId 배열)라고 가정합니다.
  const [memberStatus, setMemberStatus] = useState<number[]>([]);

  useEffect(() => {
    if (!groupId || !projectId) return;

    const fetchMemberStatus = async () => {
      try {
        const response: GetProjectMemberStatusResponse = await getProjectMemberStatus(groupId, projectId);
        if (response.success) {
          setMemberStatus(response.data);
        } else {
          console.error("API 에러:", response.error);
        }
      } catch (error) {
        console.error("프로젝트 멤버 상태 조회 실패:", error);
      }
    };

    fetchMemberStatus();
    
  }, [groupId, projectId, getProjectMemberStatus]);

  return (
    <div>
      <p>참여 중인 멤버: {memberStatus.length}</p>
      <ul>
        {memberStatus.map((userId) => (
          <li key={userId}>User ID: {userId}</li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectMemberStatus;
