import React, { useEffect, useRef } from 'react';
import Modal from 'react-modal';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
}

// Modal 접근성 설정
Modal.setAppElement('#root');

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  projectName }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      if (modalRef.current) modalRef.current.focus();
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Confirm Deletion"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" // 트랜지션 클래스 제거
      className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-lg relative focus:outline-none" // 트랜스폼 및 트랜지션 클래스 제거
      shouldCloseOnOverlayClick={true}
    >
      <div
        className="w-full flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        tabIndex={-1}
      >
        {/* 헤더 */}
        <div className="w-full flex justify-end">
          <button
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200"
            onClick={onClose}
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* 아이콘 */}
        <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mb-4" />

        {/* 본문 */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">프로젝트 삭제</h2>
        <p className="text-center text-gray-700">
          <strong className="text-[#EF4444]">"{projectName}"</strong> 프로젝트를 삭제하시겠습니까?
          <br />
          삭제하시면 다시 복구시킬 수 없습니다.
        </p>

        {/* 버튼 */}
        <div className="mt-6 flex justify-end space-x-4 w-full">
          <button
            onClick={onClose}
            className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center justify-center px-4 py-2 bg-[#EF4444] text-white rounded-md hover:bg-red-600 transition-colors duration-200"
          >
            삭제하기
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
