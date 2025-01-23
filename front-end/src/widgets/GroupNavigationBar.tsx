import React, { useState } from 'react';
import logo from '../assets/logo.png';
import groupCreateIcon from '../assets/group_create_icon.svg';
import GroupCreateModal from './GroupCreateModal';
import GroupJoinModal from './GroupJoinModal';

interface Group {
  id: number;
  name: string;
}

const GroupNavigationBar: React.FC = () => {
  // 모달 상태 관리
  const [activeModal, setActiveModal] = useState<'create' | 'join' | null>(null);

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

  return (
    // 그룹 네비게이션 바
    <nav className="fixed top-0 left-0 w-[80px] h-full bg-[#93B0BA] p-4 flex flex-col">
      {/* 프로젝트 로고 */}
      <div className="flex items-center justify-center mb-4">
        <img src={logo} alt="logo" className="w-12 h-12" />
      </div>

      {/* 그룹 조회 버튼 */}
      <div className="flex-1 overflow-y-auto">
        {/* <ul className="space-y-2">
          {groups.map((group) => (
            <li key={group.id}>
               <button className="w-12 h-12 bg-[#E4E9E9] hover:bg-[#7996A0] rounded flex items-center justify-center">
                <span className="inline-block overflow-hidden whitespace-nowrap max-w-full text-sm text-black text-center font-bold">
                  {truncateName(group.name)}
                </span>
              </button>
            </li>
          ))}
        </ul> */}
      </div>

      {/* 그룹 추가 버튼 */}
      <div className="mt-auto">
        <button
          onClick={openCreateModal}
          className="main-container w-12 h-12 relative mx-auto my-0 flex items-center justify-center"
        >
          <img src={groupCreateIcon} alt="group create icon" />
        </button>
      </div>

      {/* 모달 컨테이너 */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="relative w-[500px] h-[300px] bg-white rounded-xl shadow-lg">
            {activeModal === 'create' && (
              <GroupCreateModal
                isOpen={true}
                onClose={closeModal}
                onSwitchToJoin={() => setActiveModal('join')}
              />
            )}
            {activeModal === 'join' && (
              <GroupJoinModal
                isOpen={true}
                onClose={closeModal}
                onSwitchToCreate={() => setActiveModal('create')}
              />
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default GroupNavigationBar;
