// *-----이 컴포넌트를 사용하는 부모 div에 relative가 있어야 함! ------*

import React, { useEffect, useState } from 'react';
import { FaRegCopy } from "react-icons/fa6";
// import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Toaster, toast } from 'react-hot-toast';
import useGroupAxios from '../../../../shared/apis/useGroupAxios';

interface InviteLinkProps {
  groupId: number;
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
      console.log(data);
      const { code, expirationTime } = data;
        console.log(expirationTime);
      setInviteLink(`${window.location.origin}/invite/${groupId}/${code}`);
      setTimeLeftSec(expirationTime);
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
      console.log(data);
      const { code, expirationTime } = data;
      setInviteLink(`${window.location.origin}/invite/${groupId}/${code}`);
      setTimeLeftSec(expirationTime);
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
      // alert('초대 링크가 클립보드에 복사되었습니다.');
      toast.success("초대 링크가 클립보드에 복사되었습니다.");
      // toast("초대 링크가 클립보드에 복사되었습니다.");
    } catch (err) {
      toast.error('복사 실패: ' + err);
    }
  };

  return (
    <div className="flex items-center max-w-xl rounded-lg">
      {/* <ToastContainer /> */}
      <Toaster />
      <div className="flex-1 text-gray-700 truncate pt-2">
        {inviteLink ? (
          <>
            <span className="text-xs text-blue-500 font-medium cursor-pointer" onClick={handleCopyToClipboard}>{inviteLink}</span>
            <span className="ml-2 text-red-500 text-xs">
                {isExpired ? '만료됨' : ` ${formatTime(timeLeftSec)}`}
            </span>
          </>
        ) : (
          <span className="text-xs text-gray-400">초대 링크를 생성해 주세요</span>
        )}
      </div>

      {inviteLink ? (
        <button
          onClick={isExpired ? handleCreateInvitationLink : handleCopyToClipboard}
          className={`flex items-center gap-2 text-xs rounded-md hover:scale-105 ${
            isExpired
              ? 'bg-[#5C8290] hover:bg-[#3F6673] text-white px-3 py-2 ml-3'
              : 'hover:bg-gray-300 text-gray-700 mt-2 ml-1 p-2'
          } transition-all`}
        >
          {isExpired ? '초대 링크 재발급' : ''}
          {!isExpired && <FaRegCopy />}
        </button>
      ) : (
        <button
          onClick={fetchExistingLink}
          disabled={isLoading}
          className="ml-3 mt-2 px-2.5 py-1.5 bg-[#5C8290] hover:bg-[#3F6673] hover:scale-105 text-xs text-white rounded-md transition-all"
        >
          {isLoading ? '생성 중...' : '초대 링크 생성'}
        </button>
      )}
    </div>
  );
};

export default InviteLink;
