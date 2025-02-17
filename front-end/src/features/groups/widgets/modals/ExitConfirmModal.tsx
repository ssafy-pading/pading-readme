// src/widgets/ExitConfirmModal.tsx
import React, { useEffect, useRef } from 'react';
import Modal from 'react-modal';
import { XMarkIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

interface ExitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
}

Modal.setAppElement('#root');

const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  projectName,
}) => {
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
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Exit Confirmation"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-lg relative focus:outline-none"
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
        <ExclamationCircleIcon className="w-12 h-12 text-red-500 mb-4" />

        {/* 본문 */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">프로젝트 나가기</h2>
        <p className="text-center text-gray-700">
          <strong className="text-[#EF4444]\">{projectName}</strong> 프로젝트에서 나가시겠습니까?
          
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
            나가기
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ExitConfirmModal;
