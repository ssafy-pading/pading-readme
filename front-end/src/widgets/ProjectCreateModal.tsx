// ProjectCreateModal.tsx

import React, { useState } from "react";
import Modal from "react-modal";
import Select, { SingleValue, MultiValue, ActionMeta } from "react-select";
import cross from "../assets/cross.svg";
import cpu from "/src/assets/cpu.svg";
import memory from "/src/assets/memory.svg";
import disk from "/src/assets/disk.svg";

/** 
 * props 예시:
 * isOpen: 모달 열림/닫힘 여부
 * onClose: 모달 닫기 동작
 */
interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 백엔드(혹은 외부)에서 가져올 데이터 예시 (실제 구현시 삭제바람)
const languageOptions = [
  { os_code: "java", os_name: "자바" },
  { os_code: "python", os_name: "파이썬" },
  { os_code: "javascript", os_name: "자바스크립트" },
  { os_code: "csharp", os_name: "C#" },
];

const osOptions = [
  { os_code: "ubuntu_20_04_lts", os_name: "우분투 20.04 LTS" },
  { os_code: "ubuntu_18_04_lts", os_name: "우분투 18.04 LTS" },
  { os_code: "ubuntu_16_04_lts", os_name: "우분투 16.04 LTS" },
];

const specOptions = [
  { code: "micro", cpu_core: 0.5, ram: "1GB", disk: "1GB" },
  { code: "small", cpu_core: 2, ram: "2GB", disk: "2GB" },
  { code: "medium", cpu_core: 4, ram: "4GB", disk: "4GB" },
  { code: "large", cpu_core: 8, ram: "8GB", disk: "8GB" },
];

// 구성원 검색/추가용 데이터
interface MemberData {
  name: string;
  image: string;
  email: string;
  role: string;
}

const memberData: MemberData[] = [
  {
    name: "강싸피",
    image: "https://lh3.googleusercontent.com/a/ACg8ocKyyZu4cMoD66g_cvM3uoxDqWQQunckuUMW1-x4zKbF=s96-c",
    email: "kangssafy@example.com",
    role: "Member",
  },
  {
    name: "박싸피",
    image: "https://img.freepik.com/premium-vector/black-silhouette-default-profile-avatar_664995-354.jpg",
    email: "ssafypark@example.com",
    role: "Member",
  },
  {
    name: "이싸피",
    image: "https://secure.gravatar.com/avatar/adb423cb0bee73bb6033eabf7deb7b164b187a53f20a043768a5345de2eaa37a?s=80&d=identicon",
    email: "leeeeeessafy@example.com",
    role: "Member",
  },
  {
    name: "신싸피",
    image: "https://secure.gravatar.com/avatar/1a08e265bcf0ba7e141433e38be1aa16e7bcb4934a8273e49a9d65425332518d?s=80&d=identicon",
    email: "godssafy@example.com",
    role: "Member",
  },
];

// react-select 에 사용할 Option 타입
type LanguageOption = {
  value: string; // os_code
  label: string; // os_name
};

type OsOption = {
  value: string; // os_code
  label: string; // os_name
};

type SpecOption = {
  value: string; // code
  label: JSX.Element;
};

type MemberOption = {
  value: string; // email
  label: string; // 이름 + (email) 등의 표현
  image: string; // 프로필 사진
};

// 모달 루트 설정
Modal.setAppElement("#root");

const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({
  isOpen,
  onClose,
}) => {
  // 폼 입력값 state
  const [projectName, setProjectName] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption | null>(
    null
  );
  const [selectedOs, setSelectedOs] = useState<OsOption | null>(null);
  const [selectedSpec, setSelectedSpec] = useState<SpecOption | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<MemberOption[]>([]);

  // react-select용 옵션 변환
  const languageSelectOptions: LanguageOption[] = languageOptions.map((lang) => ({
    value: lang.os_code,
    label: lang.os_name,
  }));

  const osSelectOptions: OsOption[] = osOptions.map((os) => ({
    value: os.os_code,
    label: os.os_name,
  }));

  const specSelectOptions = specOptions.map((spec) => ({
    value: spec.code,
    label:(
        <>
            <img src={cpu} alt="CPU" className="inline-block"/> {spec.cpu_core} vCPU{" "}
            <img src={memory} alt="RAM" className="inline-block"/> {spec.ram}{" "}
            <img src={disk} alt="Disk" className="inline-block"/> {spec.disk}
        </>
    )
  }));

  // 구성원 data → react-select 옵션
  const memberSelectOptions: MemberOption[] = memberData.map((member) => ({
    value: member.email,
    label: `${member.name} (${member.email})`,
    image: member.image,
  }));

  // 구성원 옵션 변경 처리
  const handleMemberChange = (
    newValue: MultiValue<MemberOption>,
    // actionMeta: ActionMeta<MemberOption>
  ) => {
    setSelectedMembers(newValue as MemberOption[]);
  };

  // 폼 유효성 검사 (간단 예시)
  const validateForm = () => {
    if (!projectName.trim()) {
      alert("프로젝트 이름을 입력하세요.");
      return false;
    }
    if (!selectedLanguage) {
      alert("언어를 선택하세요.");
      return false;
    }
    if (!selectedOs) {
      alert("OS를 선택하세요.");
      return false;
    }
    if (!selectedSpec) {
      alert("성능(사양)을 선택하세요.");
      return false;
    }
    // XSS, SQL injection 간단 체크 예시(실무에선 더 강화해야 함)
    const invalidPatterns = [/<\/?script>/i, /select\s+\*\s+from/i];
    for (const pattern of invalidPatterns) {
      if (pattern.test(projectName)) {
        alert("입력값에 허용되지 않는 패턴이 포함되어 있습니다.");
        return false;
      }
    }

    return true;
  };

  // 폼 제출 시
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // 전송할 데이터(백엔드 API Body 예시)
    const formData = {
      projectName,
      language: selectedLanguage?.value,
      os: selectedOs?.value,
      spec: selectedSpec?.value,
      members: selectedMembers.map((member) => ({
        email: member.value,
      })),
    };

    console.log("보낼 폼 데이터:", formData);
    alert(formData);

    // 실제 API 호출 로직 (axios 등) - 백엔드 미완성으로 주석 처리
    // axios.post("/api/project/create", formData)
    //   .then(response => {
    //     console.log(response.data);
    //   })
    //   .catch(error => {
    //     console.error(error);
    //   });

    // 완료 후 모달 닫기
    onClose();
  };


  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="프로젝트 생성하기"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      className="bg-white rounded-xl py-5 px-4 shadow-lg relative w-[600px] max-h-[90vh] overflow-auto"
    >
      {/* 헤더 영역 */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold">프로젝트 생성하기</h2>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-300"
          onClick={onClose}
        >
          <img src={cross} alt="close" className="w-5 h-5" />
        </button>
      </div>

      {/* 내용 영역 */}
      <div>
        {/* 프로젝트 이름 */}
        <label className="block text-gray-700 mb-1">프로젝트 이름</label>
        <input
          type="text"
          placeholder="프로젝트 이름을 입력하세요"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#5C8290] mb-4"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />

        {/* 언어 */}
        <label className="block text-gray-700 mb-1">언어</label>
        <Select
          options={languageSelectOptions}
          value={selectedLanguage}
          onChange={(value: SingleValue<LanguageOption>) =>
            setSelectedLanguage(value)
          }
          placeholder="언어를 선택하세요"
          className="mb-4"
        />

        {/* OS */}
        <label className="block text-gray-700 mb-1">OS</label>
        <Select
          options={osSelectOptions}
          value={selectedOs}
          onChange={(value: SingleValue<OsOption>) => setSelectedOs(value)}
          placeholder="OS를 선택하세요"
          className="mb-4"
        />

        {/* 성능(사양) */}
        <label className="block text-gray-700 mb-1">성능</label>
        <Select
          options={specSelectOptions}
          value={selectedSpec}
          onChange={(value: SingleValue<SpecOption>) => setSelectedSpec(value)}
          placeholder="OS를 선택하세요"
          className="mb-4"
        />

        

        {/* 구성원 추가 */}
        <label className="block text-gray-700 mb-1">구성원 추가</label>
        <Select
          options={memberSelectOptions}
          isMulti
          value={selectedMembers}
          onChange={handleMemberChange}
          placeholder="구성원을 검색하세요"
          className="mb-4"
          // react-select에서 기본 제공되는 filtering으로
          // 검색어가 name/email에 포함되면 필터링됩니다.
          // 더 정교한 검색이 필요하면 filterOption props를 따로 설정하세요.
        />
        
        {/* 추가하기 버튼 */}
        <button
          className="bg-[#5C8290] text-white py-3 px-6 rounded-xl w-full text-lg"
          onClick={handleSubmit}
        >
          추가하기
        </button>
      </div>
    </Modal>
  );
};

export default ProjectCreateModal;
