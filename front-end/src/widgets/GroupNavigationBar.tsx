import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GroupCreateModal from './CreateGroupModal';
import GroupJoinModal from './JoinGroupModal';

import useGroupAxios from '../shared/apis/useGroupAxios';
import { GetGroupListResponse } from '../shared/types/groupApiResponse';

import logo from '../assets/logo.png';
import groupCreateIcon from '../assets/group_create_icon.svg';

// Group 타입 정의
type Group = GetGroupListResponse['groups'][number];

const GroupNavigationBar: React.FC = () => {
  // 모달 상태 관리
  const [activeModal, setActiveModal] = useState<'create' | 'join' | null>(null);

  // 그룹 목록 상태 관리
  const [groups, setGroups] = useState<Group[]>([]);

  // useGroupAxios 훅 사용하여 getGroups 메서드 가져오기
  const { getGroups } = useGroupAxios();

  // useNavigate 훅 사용하여 페이지 이동
  const navigate = useNavigate();

  // 모달 열기/닫기 함수
  const openCreateModal = () => setActiveModal('create');
  const openJoinModal = () => setActiveModal('join');
  const closeModal = () => setActiveModal(null);

  // 그룹 이름이 버튼 크기를 넘어갈 때 한글이면 3글자 이후 ···, 영어면 5글자 이후 ···
  const truncateName = (name: string): string => {
    const isKorean: boolean = /[\u3131-\uD79D]/ug.test(name);
    if (isKorean) {
      return name.length > 3 ? `${name.slice(0, 3)}···` : name;
    }
    return name.length > 5 ? `${name.slice(0, 5)}···` : name;
  };

  // 임시 데이터 - 실제 데이터 사용시 삭제 예정
  const mockGroups: Group[] = [
    { id: 1, name: 'C202', capacity: 10 },
    { id: 2, name: '광주2반', capacity: 8 },
    { id: 3, name: '알고리즘 스터디', capacity: 5 },
    { id: 4, name: '해커톤', capacity: 12 },
  ];

  // 그룹 목록 불러오기 (useGroupAxios의 getGroups 사용)
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        // // 실제 데이터 사용시 사용할 코드
        // const response = await getGroups();
        // setGroups(response.groups);

        // // 그룹 목록이 비어 있을 경우 NoGroupPage로 리디렉션
        // if (response.groups.length === 0) {
        //   navigate('/nogroup'); // NoGroupPage 경로로 이동
        // }

        // 임시데이터 사용 -> 실제 데이터 사용시 삭제
        setGroups(mockGroups);

        // 그룹 목록이 비어 있을 경우 NoGroupPage로 리디렉션
        if (mockGroups.length === 0) {
          navigate('/nogroup'); // NoGroupPage 경로로 이동
        }
      } catch (err) {
        console.error('그룹 목록을 불러오는 데 실패했습니다.', err);
      }
    };

    fetchGroups();
  }, [navigate]); // 실제 데이터 시 getGroups 추가

  // 그룹 클릭 시 상세 페이지로 이동하는 함수
  const handleGroupClick = (groupId: number) => {
    if (groupId) {
      navigate(`/projectlist/${groupId}`);
    }
  };

  return (
    // 그룹 네비게이션 바
    <nav className="fixed top-0 left-0 w-[80px] h-full bg-[#93B0BA] p-4 flex flex-col">
      {/* 프로젝트 로고 */}
      <div className="flex items-center justify-center mb-4">
        <img src={logo} alt="logo" className="w-12 h-12" />
      </div>

      {/* 그룹 조회 버튼 */}
      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {groups.map((group) => (
            <li key={group.id}>
              <button
                className="w-12 h-12 bg-[#E4E9E9] hover:bg-[#7996A0] rounded flex items-center justify-center"
                onClick={() => handleGroupClick(group.id)} // 클릭 시 상세 페이지로 이동
              >
                <span className="inline-block overflow-hidden whitespace-nowrap max-w-full text-sm text-black text-center font-bold">
                  {truncateName(group.name)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 그룹 추가 버튼 */}
      <div className="mt-auto">
        <button
          onClick={openCreateModal}
          className="main-container w-12 h-12 relative mx-auto my-0 flex items-center justify-center transform transition-transform duration-200 hover:scale-110"
        >
          <img src={groupCreateIcon} alt="group create icon" />
        </button>
      </div>

      {/* 모달 컨테이너 */}
      {/* react-modal 포털을 활용하므로 별도의 오버레이 `div`를 제거 */}
      {activeModal === 'create' && (
        <GroupCreateModal
          isOpen={true}
          onClose={closeModal}
          onSwitchToJoin={openJoinModal}
          // groupId={/* 현재 그룹 ID를 전달할 수 있다면 전달 */}
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
