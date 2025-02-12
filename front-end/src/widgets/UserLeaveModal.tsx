import React from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import useMypageAxios from "../shared/apis/useMypageAxios";

// 토스트
import { Toaster, toast } from 'react-hot-toast';

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToMypage: () => void;
}

const LeaveModal: React.FC<LeaveModalProps> = ({
  isOpen,
  onClose,
  onSwitchToMypage,
}) => {
  const navigate = useNavigate();
  const { deleteAccount } = useMypageAxios();
  const onConfirmLeave = async () => {
    try{
      toast.success('탈퇴되었습니다.')
      // 여기에 탈퇴 로직
      deleteAccount();
      // 로그인 페이지로
      navigate('/');

    }catch(error){
      console.log(error);
    }
  }


  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="회원 탈퇴"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      className="bg-white rounded-xl py-6 px-8 shadow-lg relative w-[320px]"
    >
      <div className="text-center">
      <Toaster />
        {/* 상단 텍스트 */}
        <h2 className="text-lg font-semibold mb-2">탈퇴하시겠습니까?</h2>
        <p className="text-sm text-gray-500 mb-6">
          삭제된 계정은 복구되지 않습니다.
        </p>

        {/* 버튼 */}
        <div className="mt-[100px]">
          <button
            className="mt-3 py-2 bg-gray-200 text-gray-700 w-[100%] block rounded-lg text-sm hover:bg-gray-300"
            onClick={onSwitchToMypage}
          >
            취소
          </button>
          <button
            className="mt-3 py-2 bg-[#5C8290] text-white w-[100%] block rounded-lg text-sm hover:bg-red-600"
            onClick={onConfirmLeave}
          >
            탈퇴
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LeaveModal;
