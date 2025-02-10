import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 모달 컴포넌트 불러오기
import GroupCreateModal from './CreateGroupModal';
import GroupJoinModal from './JoinGroupModal';

// 훅 불러오기
import useGroupAxios from '../shared/apis/useGroupAxios';
import { GetGroupListResponse } from '../shared/types/groupApiResponse';

// 이미지 불러오기
import logo from '../assets/logo.png';
import groupCreateIcon from '../assets/group_create_icon.svg';

// 그룹 데이터 타입 정의
type Group = GetGroupListResponse['groups'][number];

const GroupNavigationBar: React.FC = () => {
  // 모달 상태 관리 ('create' | 'join' | null)
  const [activeModal, setActiveModal] = useState<'create' | 'join' | null>(null);

  // 그룹 목록 상태 관리
  const [groups, setGroups] = useState<Group[]>([]);

  // useGroupAxios 훅에서 getGroups 메서드 가져오기
  const { getGroups } = useGroupAxios();

  // useNavigate 훅 사용하여 페이지 이동 관리
  const navigate = useNavigate();

  // 모달 열기/닫기 핸들러
  const openCreateModal = () => setActiveModal('create');
  const openJoinModal = () => setActiveModal('join');
  const closeModal = () => setActiveModal(null);

  // 그룹 이름 길이 제한 함수
  // - 한글: 3글자 초과 시 '···' 추가
  // - 영어: 5글자 초과 시 '···' 추가
  const truncateName = (name: string): string => {
    const isKorean: boolean = /[\u3131-\uD79D]/ug.test(name);
    return isKorean
      ? name.length > 3 ? `${name.slice(0, 3)}···` : name
      : name.length > 5 ? `${name.slice(0, 5)}···` : name;
  };

  // 그룹 목록
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await getGroups();
        setGroups(response.groups);

        // no group 페이지가 없음
        // if (response.groups.length === 0) {
        //   navigate('/nogroup'); 
        // }
      } catch (err) {
        console.error('그룹 목록을 불러오는 데 실패했습니다.', err);
      }
    };

    fetchGroups();
  }, []);

  // 그룹 클릭 시 해당 그룹 상세 페이지로 이동
  const handleGroupClick = (groupId: number) => {
    if (groupId) {
      navigate(`/projectlist/${groupId}`);
    }
  };

  return (
    // 그룹 네비게이션 바
    <nav className="fixed top-0 left-0 w-[80px] h-full bg-[#93B0BA] p-4 flex flex-col">
      
      {/* 프로젝트 로고 (클릭 시 홈으로 이동) */}
      <div className="flex items-center justify-center mb-4">
        <button onClick={() => navigate('/')} className="focus:outline-none">
          <img src={logo} alt="logo" className="w-12 h-12" />
        </button>
      </div>

      {/* 그룹 목록 (버튼 형태) */}
      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {groups.map((group) => (
            <li key={group.id}>
              <button
                className="w-12 h-12 bg-[#E4E9E9] hover:bg-[#7996A0] rounded flex items-center justify-center"
                onClick={() => handleGroupClick(group.id)}
              >
                <span className="inline-block overflow-hidden whitespace-nowrap max-w-full text-sm text-black text-center font-bold">
                  {truncateName(group.name)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 그룹 추가 버튼 (클릭 시 모달 오픈) */}
      <div className="mt-auto">
        <button
          onClick={openCreateModal}
          className="main-container w-12 h-12 relative mx-auto my-0 flex items-center justify-center transform transition-transform duration-200 hover:scale-110"
        >
          <img src={groupCreateIcon} alt="group create icon" />
        </button>
      </div>

      {/* 모달 컨테이너 */}
      {/* react-modal 포털을 활용하므로 별도의 오버레이 `div`는 제거 */}
      {activeModal === 'create' && (
        <GroupCreateModal
          isOpen={true}
          onClose={closeModal}
          onSwitchToJoin={openJoinModal}
        />
      )}
      {activeModal === 'join' && (
        <GroupJoinModal
          isOpen={true}
          onClose={closeModal}
          onSwitchToCreate={openCreateModal}
        />
      )}
    </nav>
  );
};

export default GroupNavigationBar;
