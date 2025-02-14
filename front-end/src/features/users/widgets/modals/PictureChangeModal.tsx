import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import Modal from "react-modal";

// 토스트
import { Toaster, toast } from 'react-hot-toast';

// 모달 속성 타입 정의
interface PictureChangeModalProps {
  isOpen: boolean; // 모달 열림 여부
  onClose: () => void; // 모달 닫기 콜백 함수
  onSwitchToMypage: () => void; // 마이페이지로 이동 콜백 함수
}

const PictureModal: React.FC<PictureChangeModalProps> = ({
  isOpen,
  onClose,
  onSwitchToMypage,
}) => {
  // 드롭박스를 통해 추가된 파일 상태 관리
  const [file, setFile] = useState<File | null>(null);

  // React Dropzone 설정
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      // 첫 번째 파일만 상태에 저장
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    },
  });

  // 파일 삭제 및 초기화
  const removeFile = (): void => {
    setFile(null);
  };

  // 프로필 사진 변경 확인
  const onConfirmChange = (): void => {
    toast.success("프로필 사진이 변경되었습니다.");
    // 여기에 파일 업로드 처리 로직 추가


    // 전역에서 관리하는 유저정보와 연동 필요( 프로필 사진 변경시, 페이지 로드 없이 프로필 경로 변경 예정)


    // 새로고침이 되기 전까지 사용할 프로필 사진 임시 url
    // if (file) {
    //    // URL.createObjectURL(file)는 JavaScript에서 제공하는 API로, 파일 객체 또는 Blob 객체에 대한 임시 URL을 생성합니다.
    //    // **파일 객체(예: File 또는 Blob)**는 브라우저의 메모리 내에 저장된 데이터
    //   const newProfileImage = URL.createObjectURL(file); // 파일의 URL 생성
    //   onProfileUpdate(newProfileImage); // 콜백 호출로 부모 컴포넌트에 전달
    //   onSwitchToMypage(); // 마이페이지로 이동
    // }

    // const imageUrl = URL.createObjectURL(file);
    // 사용 후 URL 해제
    // URL.revokeObjectURL(imageUrl);
    onSwitchToMypage(); // 마이페이지로 이동
  };

  return (
    <Modal
      isOpen={isOpen} // 모달 열림 여부
      onRequestClose={onClose} // 모달 닫기 이벤트
      contentLabel="프로필 사진 변경"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      className="bg-white rounded-xl py-6 px-8 shadow-lg relative w-[320px]"
    >
      <div className="text-center">
      <Toaster />
        {/* 상단 텍스트 */}
        <div>
          <h2 className="text-lg font-semibold mb-2">프로필 사진 변경</h2>
          <p className="text-sm text-gray-500 mb-6">이미지를 드래그하거나 클릭하여 추가하세요.</p>
        </div>

        {/* 이미지 드래그 앤 드롭 박스 또는 미리보기 */}
        {file ? (
          <div className="relative w-full h-48 rounded-lg flex items-center justify-center bg-gray-500">
            {/* 동그란 프로필 사진만 보여주기 */}
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-300">
              <img
                src={URL.createObjectURL(file)}
                alt="프로필 사진 미리보기"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              className="absolute top-2 right-2 bg-red-500 text-white text-sm px-2 py-1 rounded hover:bg-red-600"
              onClick={removeFile}
            >
              취소
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()} // 드롭존 이벤트 연결
            className={`border-2 border-dashed rounded-lg p-4 cursor-pointer transition-all h-48 flex items-center justify-center ${
              isDragActive ? "border-[#4B7189] bg-gray-100" : "border-gray-300"
            }`}
          >
            <input {...getInputProps()} /> {/* 파일 입력 필드 */}
            <p className="text-sm text-gray-500">
              {isDragActive ? "이미지를 여기에 드롭하세요." : "이미지를 드래그하거나 클릭하여 추가하세요."}
            </p>
          </div>
        )}

        {/* 버튼 */}
        <div className="mt-6">
          <button
            className="py-2 bg-[#5C8290] text-white w-full block rounded-lg text-sm hover:bg-[#4B7189]"
            onClick={onConfirmChange}
          >
            변경
          </button>
          <button
            className="mt-3 py-2 bg-gray-200 text-gray-700 w-full block rounded-lg text-sm hover:bg-gray-300"
            onClick={onSwitchToMypage}
          >
            취소
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PictureModal;