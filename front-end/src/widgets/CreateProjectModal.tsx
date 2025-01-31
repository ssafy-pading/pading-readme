import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import Select, { SingleValue, MultiValue, ActionMeta } from "react-select";
import cross from "../assets/cross.svg";
import cpu from "/src/assets/cpu.svg";
import memory from "/src/assets/memory.svg";
import disk from "/src/assets/disk.svg";
import { CreateProjectResponse } from "../shared/types/projectApiResponse";
import useProjectAxios from "../shared/apis/useProjectAxios";

/** 
 * 작동방식 
 * 
 * 1. 모달이 동작이 되면 useEffect에서 option에 필요한 정보들을 api로 호출(언어, os, 성능, 멤버 등)
 * - 해당 호출 후 useEffect에서 각 select별 option 에 담아주기
 * 2. 생성하기를 누를 때 handleSubmit() 함수 호출, 해당 함수에서 api로 프로젝트 생성하기 호출
 * - api로 프로젝트 생성 정보를 전달한다면 새로운 프로젝트에 대한 정보(프로젝트 id 등등..)를 받을 수 있음
 * - 여기서 새로운 프로젝트를 부모로 전달해야 하는데, 부모에서 사용하기에는 정보가 부족함. 
 * -- 이 때문에 새로운 프로젝트에 해당 정보들을 넣는 것도 필요해보임
 */

/** 
 * ProjectListPage에서 사용법 
 * 
 * 1. 기본적으로 다른 모달과 동일
 * 2. props에 groupId와 onProjectCreate 콜백함수가 필요
 * 3. 달리 처리해야 할 것은 콜백함수에서 새로운 Project 객체 정보가 날아오는걸 받아서 기존 프로젝트 그룹에 넣어줘야 함
 */

/** 
 * props: 
 * groupId: 프로젝트 생성시 필요한 파라미터
 * onProjectCreate: 프로젝트 생성시 새로운 프로젝트의 정보를 담아 부모로 전송
 * isOpen: 모달 열림/닫힘 여부
 * onClose: 모달 닫기 동작
 */
interface ProjectCreateModalProps {
  groupId: string;
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
// api에서는 4개의 정보만 보냄, ProjectListPage에서 멤버 정보와 속성명이나 개수가 차이가 있으니 체크 바람
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
  groupId,
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

  // 모달 활성화 시, 필요
  const [languageSelectOptions, setLanguageOptions] = useState<LanguageOption[]>([]);
  const [osSelectOptions, setOsOptions] = useState<OsOption[]>([]);
  const [specSelectOptions, setSpecOptions] = useState<SpecOption[]>([]);
  const [memberSelectOptions, setMemberOptions] = useState<MemberOption[]>([]);

  // 로딩상태
  // const [isLoading, setIsLoading] = useState(true);

  // api호출기
  const projectApi = useProjectAxios();

  // 1. api 호출하여 각 options에 담아주기
  useEffect(() => {
    const loadData = () => {
      // setIsLoading(true);
      // 여기에 api로 데이터 불러오기를 합니다 


      // 현재는 데이터가 없으므로 임시 데이터 사용
      // 언어, os, 사양, member 담아주기
      setLanguageOptions(
        languageOptions.map((lang) => ({
          value: lang.os_code,
          label: lang.os_name,
      })));

      setOsOptions(
        osOptions.map((os) => ({
          value: os.os_code,
          label: os.os_name,
        }))
      );
      
      // react-select에 이미지가 안들어가서 jsx element로 넣었습니다.... 
      setSpecOptions(
        specOptions.map((spec) => ({
          value: spec.code,
          label:(
              <>
                  {spec.code} {" "}
                  <img src={cpu} alt="CPU" className="inline-block"/> {spec.cpu_core} vCPU{" "}
                  <img src={memory} alt="RAM" className="inline-block"/> {spec.ram}{" "}
                  <img src={disk} alt="Disk" className="inline-block"/> {spec.disk}
              </>
          )
        }))
      );

      setMemberOptions(
        memberData.map((member) => ({
          value: member.email,
          label: `${member.name} (${member.email})`,
          image: member.image,
        }))
      );
    }

    loadData();
  }, [])


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
    // XSS, SQL injection 간단 체크 예시(더 강화해야 함)
    const invalidPatterns = [/<\/?script>/i, /select\s+\*\s+from/i];
    for (const pattern of invalidPatterns) {
      if (pattern.test(projectName)) {
        alert("입력값에 허용되지 않는 패턴이 포함되어 있습니다.");
        return false;
      }
    }

    return true;
  };

  // 2. 폼 제출 시 함수
  // api 사용시 async 붙여주세요!
  const handleSubmit = async() => {
  // const handleSubmit = () => {
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
    alert("프로젝트 생성 완료");

    // API 호출 로직 (createProject) - 백엔드 미완성으로 주석 처리
      try{
        const newProject:CreateProjectResponse = await projectApi.createProject(groupId, formData);
        console.log(newProject);

        // 완료 후 모달 닫기
        onClose();
        
      }catch(error){
        console.error(error);
        alert("작업 중 오류가 발생했습니다.");
      };

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
