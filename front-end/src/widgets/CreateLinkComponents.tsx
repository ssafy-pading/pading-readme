// *-----이 컴포넌트를 사용하는 부모 div에 relative가 있어야 함! ------*

import React, { useEffect, useState } from 'react';
import { FaRegCopy } from "react-icons/fa6";
import useGroupAxios from '../shared/apis/useGroupAxios';

interface InviteLinkProps {
  groupId: string;
}

const InviteLink: React.FC<InviteLinkProps> = ({ groupId }) => {
  const { getInvitationLink, createInvitationLink } = useGroupAxios();

  const [inviteLink, setInviteLink] = useState('');
  const [timeLeftSec, setTimeLeftSec] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 기존 초대 링크 확인
  const fetchExistingLink = async () => {
    try {
      const data = await getInvitationLink(groupId);
      const { invite_link, expires_at } = data;
        console.log(expires_at);
      setInviteLink(`${window.location.origin}/invite/${groupId}/${invite_link}`);
      setTimeLeftSec(expires_at);
      setIsExpired(false);
    } catch (err: any) {
      if (err.status === 404) {
        console.log('초대 링크 없음, 새로 생성 필요');
        handleCreateInvitationLink();
      } else {
        console.error('초대 링크 확인 오류:', err);
      }
    }
  };

//   useEffect(() => {
//     fetchExistingLink();
//   }, [groupId]);

  // 초대 링크 생성
  const handleCreateInvitationLink = async () => {
    setIsLoading(true);
    try {
      const data = await createInvitationLink(groupId);
      const { invite_link, expires_at } = data;
      setInviteLink(`${window.location.origin}/invite/${groupId}/${invite_link}`);
      setTimeLeftSec(expires_at);
      setIsExpired(false);
    } catch (err) {
      console.error('초대 링크 생성 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 남은 시간 카운트다운
  useEffect(() => {
    if (!inviteLink || timeLeftSec <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeftSec(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [inviteLink, timeLeftSec]);

    // 시간 출력 포맷
    // 남은 시간을 "MM:SS" 형식으로 변환
    const formatTime = (sec: number) => {
        const minutes = Math.floor(sec / 60);
        const seconds = sec % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

  // 클립보드 복사
  const handleCopyToClipboard = async () => {
    if (!inviteLink || isExpired) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      alert('초대 링크가 클립보드에 복사되었습니다.');
    } catch (err) {
      alert('복사 실패: ' + err);
    }
  };

  return (
    <div className="absolute bottom-0 right-0 flex items-center w-full max-w-xl mb-1 border border-gray-300 rounded-lg pl-3 pr-1 py-1">
      <div className="flex-1 text-gray-700 truncate">
        {inviteLink ? (
          <>
            <span className="text-blue-600 font-medium cursor-pointer" onClick={handleCopyToClipboard}>{inviteLink}</span>
            <span className="ml-2 text-red-500 text-sm">
                {isExpired ? '만료됨' : ` ${formatTime(timeLeftSec)}`}
            </span>
          </>
        ) : (
          <span className="text-gray-400">초대 링크를 생성해 주세요</span>
        )}
      </div>

      {inviteLink ? (
        <button
          onClick={isExpired ? handleCreateInvitationLink : handleCopyToClipboard}
          className={`ml-3 flex items-center gap-2 px-4 py-2 rounded-md hover:scale-105 ${
            isExpired
              ? 'bg-[#5C8290] hover:bg-[#3F6673] text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          } transition-all`}
        >
          {isExpired ? '초대 링크 재발급' : '초대 링크 복사'}
          {!isExpired && <FaRegCopy />}
        </button>
      ) : (
        <button
          onClick={fetchExistingLink}
          disabled={isLoading}
          className="ml-3 px-4 py-2 bg-[#5C8290] hover:bg-[#3F6673] hover:scale-105 text-white rounded-md transition-all"
        >
          {isLoading ? '생성 중...' : '초대 링크 생성'}
        </button>
      )}
    </div>
  );
};

export default InviteLink;
