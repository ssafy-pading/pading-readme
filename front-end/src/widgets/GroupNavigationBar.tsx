import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png'
import groupCreateIcon from '../assets/group_create_icon.svg'

interface Group {
    id: number;
    name: string;
};

const GroupNavigationBar: React.FC = () => {

  // 그룹 이름이 버튼 크기를 넘어갈 때 한글이면 3글자 이후 ···, 영어면 5글자 이후 ···
  const truncateName = (name: string): string => {
    const isKorean: boolean = /[\u3131-\uD79D]/ug.test(name);
    if (isKorean) {
      return name.length > 3 ? `${name.slice(0,3)}···` : name;
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
        <button className="main-container w-12 h-12 relative mx-auto my-0 flex items-center justify-center">
          <img src={groupCreateIcon} alt="group create icon" />
        </button>
      </div>
    </nav>
  );
};

export default GroupNavigationBar;
