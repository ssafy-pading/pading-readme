import React, { useEffect, useState, useRef } from 'react';
import Modal from 'react-modal';
import {
  XMarkIcon,
  LinkIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/solid';
import { GroupInviteLinkResponse } from '../shared/types/groupApiResponse';
import useGroupAxios from '../shared/apis/useGroupAxios';

Modal.setAppElement('#root');

interface CreateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId?: string;
}

const CreateLinkModal: React.FC<CreateLinkModalProps> = ({
  isOpen,
  onClose,
  groupId,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // ✅ API 훅에서 함수 가져오기
  const { getInvitationLink, createInvitationLink } = useGroupAxios();

  // 초대 링크 관련 상태
  const [inviteLink, setInviteLink] = useState('');
  const [timeLeftSec, setTimeLeftSec] = useState(0);
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  // 로딩/에러 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 모달이 열릴 때, 기존 초대 링크 확인
  useEffect(() => {
    if (!isOpen || !groupId) return;

    const fetchExistingLink = async () => {
      try {
        const data: GroupInviteLinkResponse = await getInvitationLink(groupId);
        console.log(data);
        const { code, expirationTime } = data;

        setInviteLink(`${window.location.origin}/${groupId}/${code}`);
        setTimeLeftSec(expirationTime);
        setExpirationDate(new Date(Date.now() + (expirationTime * 1000)));
        console.log(expirationDate);
      } catch (err: any) {
        if (err.status === 404) {
          console.log('초대 링크가 존재하지 않습니다.');
        } else {
          console.error('초대 링크 확인 에러:', err);
          setError('초대 링크를 불러올 수 없습니다.');
        }
      }
    };

    fetchExistingLink();
  }, [isOpen, groupId]);

  // 초대 링크 생성
  const handleCreateInvitationLink = async () => {
    if (!groupId) return;

    setIsLoading(true);
    setError('');
    setIsExpired(false);

    try {
      const data: GroupInviteLinkResponse = await createInvitationLink(groupId);
      const { code, expirationTime } = data;

      setInviteLink(`${window.location.origin}/${groupId}/${code}`);
      setTimeLeftSec(expirationTime);
      setExpirationDate(new Date(Date.now() + (expirationTime * 1000)));
    } catch (err) {
      console.error('초대 링크 생성 에러:', err);
      setError('초대 링크를 생성할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 남은 시간 카운트다운
useEffect(() => {
  // 초대 링크가 없으면 카운트다운을 시작하지 않음.
  if (!inviteLink) return;
  
  // 남은 시간이 0 이하이면 만료 처리
  if (timeLeftSec <= 0) {
    setIsExpired(true);
    return;
  }

  const timerId = setInterval(() => {
    setTimeLeftSec((prev) => {
      if (prev <= 1) {
        clearInterval(timerId);
        setIsExpired(true);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timerId);
}, [inviteLink, timeLeftSec]);

  // 남은 시간 포맷 (분:초)
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}분 ${s.toString().padStart(2, '0')}초`;
  };

  // 클립보드 복사
  const handleCopyToClipboard = async () => {
    if (!inviteLink || isExpired) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      alert('클립보드에 복사되었습니다!');
    } catch (err) {
      alert('복사 실패: ' + err);
    }
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    setInviteLink('');
    setTimeLeftSec(0);
    setExpirationDate(null);
    setIsExpired(false);
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="Create Invitation Link"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-lg relative focus:outline-none"
      shouldCloseOnOverlayClick={true}
      closeTimeoutMS={0}
    >
      <div
        className="w-full flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        tabIndex={-1}
      >
        {/* 닫기 버튼 */}
        <div className="w-full flex justify-end">
          <button
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* 중앙 아이콘 */}
        <LinkIcon className="w-12 h-12 text-blue-500 mb-4" />

        <h2 className="text-2xl font-semibold text-gray-800 mb-2">초대 링크</h2>

        {/* 초대 링크 존재 시 */}
        {inviteLink ? (
          <div className="text-center w-full">
            <div className="text-gray-800 mb-2 flex items-center justify-center gap-2">
              <span className="text-blue-600 font-semibold break-all">
                {inviteLink}
              </span>
              <button
                onClick={handleCopyToClipboard}
                disabled={!inviteLink || isExpired}
                className="flex items-center justify-center disabled:opacity-50"
              >
                <ClipboardDocumentIcon className="w-6 h-6 text-gray-400 hover:text-gray-500" />
              </button>
            </div>
            {expirationDate && (
              <p className="text-gray-800 mb-2">
                만료 시각:{' '}
                <span className="text-green-600 font-medium">
                  {expirationDate.toLocaleString()}
                </span>
              </p>
            )}
            <p className="text-gray-800 mb-2">
              {isExpired ? (
                <span className="text-red-500">만료되었습니다.</span>
              ) : (
                <>
                  남은 시간:{' '}
                  <span className="text-green-600 font-medium">
                    {formatTime(timeLeftSec)}
                  </span>
                </>
              )}
            </p>
          </div>
        ) : (
          <div className="text-center text-gray-700">
            <p className="mb-4">아직 초대 링크가 없습니다. 생성하세요.</p>
            <button
              onClick={handleCreateInvitationLink}
              disabled={isLoading}
              className="px-4 py-2 bg-[#5C8290] text-white rounded-md hover:bg-[#4a6d77] disabled:opacity-50 transition-colors"
            >
              {isLoading ? '생성 중...' : '초대 링크 생성'}
            </button>
          </div>
        )}

        {error && <p className="text-red-500 mt-4">{error}</p>}

        <div className="mt-6 flex justify-end w-full">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateLinkModal;
