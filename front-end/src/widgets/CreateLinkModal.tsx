import React, { useEffect, useState, useRef } from 'react';
import Modal from 'react-modal';
import {
  XMarkIcon,
  LinkIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/solid';
import { GroupInviteLinkResponse } from '../shared/types/groupApiResponse';

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

  // --- 초대 링크 상태 ---
  const [inviteLink, setInviteLink] = useState('');
  const [timeLeftSec, setTimeLeftSec] = useState(0); // 남은 초
  const [isExpired, setIsExpired] = useState(false);

  // --- 로딩/에러 상태 ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 모달 열릴 때 / 닫힐 때 처리
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // 모달 닫힘 시 상태 초기화
  const handleClose = () => {
    setInviteLink('');
    setTimeLeftSec(0);
    setIsExpired(false);
    setError('');
    onClose();
  };

  // ★임시(목업) 초대 링크 생성★ (15분 만료: 900초)
  const createInvitationLinkMock = async (): Promise<GroupInviteLinkResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          invite_link: `https://example.com/invite/mock-123`,
          expires_at: '', // 목업이므로 사용 안 함
        });
      }, 500);
    });
  };

  // 초대 링크 생성 핸들러
  const handleCreateInvitationLink = async () => {
    setIsLoading(true);
    setError('');
    setIsExpired(false);

    try {
      // 실제 API 호출 시:
      // const data = await realCreateInvitationLink(groupId);

      // 목업
      const data = await createInvitationLinkMock();
      setInviteLink(data.invite_link);
      setTimeLeftSec(900); // 15분
    } catch (err) {
      console.error('초대 링크 생성 에러:', err);
      setError('초대 링크를 생성할 수 없습니다. (목업)');
    } finally {
      setIsLoading(false);
    }
  };

  // 카운트다운 (매 초마다 timeLeftSec 감소)
  useEffect(() => {
    if (!inviteLink) return; // 링크가 없으면 카운트다운 X
    if (isExpired) return;   // 이미 만료되었으면 X

    if (timeLeftSec <= 0) {
      setIsExpired(true);
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeftSec((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [inviteLink, timeLeftSec, isExpired]);

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

        <h2 className="text-2xl font-semibold text-gray-800 mb-2">초대 링크 생성</h2>

        {/* 링크가 없으면 => 생성 버튼 */}
        {!inviteLink ? (
          <div className="text-center text-gray-700">
            <p className="mb-4">
              아직 초대 링크가 없습니다. <br /> 아래 버튼을 클릭하여 초대 링크를 생성하세요.
            </p>
            <button
              onClick={handleCreateInvitationLink}
              disabled={isLoading}
              className="px-4 py-2 bg-[#5C8290] text-white rounded-md hover:bg-[#4a6d77] disabled:opacity-50 transition-colors"
            >
              {isLoading ? '생성 중...' : '초대 링크 생성'}
            </button>
          </div>
        ) : (
          // 링크가 있는 경우
          <div className="text-center w-full">
            <div className="text-gray-800 mb-2 flex items-center justify-center gap-2">
              <span className="text-blue-600 font-semibold break-all">{inviteLink}</span>

              {/* Heroicons 아이콘으로 링크 복사 */}
              <button
                onClick={handleCopyToClipboard}
                disabled={!inviteLink || isExpired}
                className="flex items-center justify-center disabled:opacity-50"
              >
                <ClipboardDocumentIcon className="w-6 h-6 text-gray-400 hover:text-gray-500" />
              </button>
            </div>

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
        )}

        {/* 에러 메시지 */}
        {error && <p className="text-red-500 mt-4">{error}</p>}

        {/* 하단 닫기 버튼 */}
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
