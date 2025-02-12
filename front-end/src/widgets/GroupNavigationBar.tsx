// GroupNavigationBar.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from 'react-modal';
import GroupCreateModal from './CreateGroupModal';
import GroupJoinModal from './JoinGroupModal';
import useGroupAxios from '../shared/apis/useGroupAxios';
import { GetGroupListResponse } from '../shared/types/groupApiResponse';
import logo from '../assets/logo.png';
import { FaPlus } from "react-icons/fa";

import { useSelector, useDispatch } from 'react-redux';
import { fetchUserInfo } from '../app/redux/user';
import type { RootState, AppDispatch } from '../app/redux/store'

Modal.setAppElement('#root');

// 그룹 데이터 타입 정의
type Group = GetGroupListResponse['groups'][number];

// 현재 위치 타입 정의
type LocationType = {
  pathname: string;
  search: string;     
  hash: string;       
  state: unknown; 
  key: string;  
};

const GroupNavigationBar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, status } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!user && status === 'idle') {
      dispatch(fetchUserInfo());
    }
  }, [dispatch, user, status]);
  
  // 모달 상태 관리 ('create' | 'join' | null)
  const [activeModal, setActiveModal] = useState<'create' | 'join' | null>(null);
  const location: LocationType = useLocation();
  const navigate = useNavigate();
  const isNoGroupPage: boolean = location.pathname === "/nogroup";

  // 현재 URL에서 선택된 그룹 ID 추출 (예: /projectlist/2)
  let nowGroupId: number | null = null;
  const pathParts = location.pathname.split('/');
  if (pathParts[1] === 'projectlist' && pathParts[2]) {
    nowGroupId = parseInt(pathParts[2], 10);
  }

  // 그룹 목록 상태 관리
  const [groups, setGroups] = useState<Group[]>([]);
  const { getGroups } = useGroupAxios();

  // 그룹 목록을 불러오는 함수 (메모이제이션)
  const fetchGroups = useCallback(async () => {
    try {
      const response = await getGroups();
      setGroups(response.groups);
      if (response.groups.length === 0) {
        navigate('/nogroup')

      }
    } catch (err) {
      console.error('그룹 목록을 불러오는 데 실패했습니다.', err);
    }
  }, [getGroups, navigate]);

  // 컴포넌트 마운트 시 그룹 목록 불러오기
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // 모달 열기/닫기 핸들러
  const openCreateModal = () => setActiveModal('create');
  const openJoinModal = () => setActiveModal('join');
  const closeModal = () => setActiveModal(null);

  // 그룹 클릭 시 해당 그룹 상세 페이지로 이동
  const handleGroupClick = (groupId: number) => {
    window.location.href = `/projectlist/${groupId}`;
  };

  const handleLogoClick = async () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const groupsResponse = await getGroups();
        if (groupsResponse.groups && groupsResponse.groups.length > 0) {
          // 로그인 상태이며 그룹이 하나 이상 있을 경우, 첫 번째 그룹 페이지로 리다이렉트 (전체 페이지 새로고침)
          window.location.href = `/projectlist/${groupsResponse.groups[0].id}`;
        } else {
          // 로그인 상태이나 그룹이 없는 경우, 그룹이 없는 페이지로 이동
          window.location.href = "/nogroup";
        }
      } catch (error) {
        console.error("그룹 목록 조회 중 오류:", error);
        // 에러 발생 시 홈으로 이동
        navigate('/');
      }
    } else {
      // 로그인 정보가 없으면 루트('/')로 이동
      navigate('/');
    }
  };

  // 그룹 이름 길이 제한 함수
  const truncateName = (name: string): string => {
    const isKorean: boolean = /[\u3131-\uD79D]/ug.test(name);
    return isKorean
      ? name.length > 3 ? `${name.slice(0, 3)}···` : name
      : name.length > 5 ? `${name.slice(0, 5)}···` : name;
  };

  return (
    <nav className="fixed top-0 left-0 w-[80px] h-full bg-[#93B0BA] p-4 flex flex-col">
      {/* 프로젝트 로고 (홈 이동) */}
      <div className="flex items-center justify-center mb-4">
        <button onClick={() => handleLogoClick()} className="focus:outline-none">
          <img src={logo} alt="logo" className="w-12 h-12" />
        </button>
      </div>

      {/* 그룹 목록 */}
      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {groups.map((group) => (
            <li key={group.id}>
              <button
                className={`w-12 h-12 rounded flex items-center justify-center transition-all duration-300 ${
                  group.id === nowGroupId 
                    ? 'bg-[#5C8290] text-white'
                    : 'bg-[#E4E9E9] hover:bg-[#A0B4BA] active:bg-[#7996A0] text-[#4D4650] shadow-md'
                }`}
                onClick={() => handleGroupClick(group.id)}
              >
                <span className="inline-block overflow-hidden whitespace-nowrap max-w-full text-sm text-center font-bold">
                  {truncateName(group.name)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 하단 버튼 및 안내 텍스트 */}
      <div className="relative mt-auto">
        <button
          onClick={openCreateModal}
          className="main-container w-12 h-12 rounded relative mx-auto bg-[#5c8290] flex items-center justify-center transform transition-transform duration-200 hover:scale-110"
        >
          <FaPlus className="w-6 h-6 text-white"/>
        </button>
        {isNoGroupPage && (
          <div className="absolute left-8 bottom-8 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 120 60"
              className="w-28 h-16 transform scale-x-[-1] scale-y-[-1]"
            >
              <path
                d="M0,80 C80,80 100,0 100,0"
                stroke="black"
                strokeWidth="4"
                fill="none"
              />
              <path
                d="M100,0 L70,20 M100,0 L110,35"
                stroke="black"
                strokeWidth="4"
                fill="none"
              />
            </svg>
            <span className="ml-2 text-black font-bold text-lg">
              Create or join a group!
            </span>
          </div>
        )}
      </div>

      {/* 모달 컴포넌트 (그룹 생성 및 그룹 참가) */}
      <GroupCreateModal
        isOpen={activeModal === 'create'}
        onClose={closeModal}
        onSwitchToJoin={openJoinModal}
        onGroupCreated={fetchGroups}
      />
      <GroupJoinModal
        isOpen={activeModal === 'join'}
        onClose={closeModal}
        onSwitchToCreate={openCreateModal}
      />
    </nav>
  );
};

export default GroupNavigationBar;
