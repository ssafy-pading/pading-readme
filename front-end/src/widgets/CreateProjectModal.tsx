import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import Select, { SingleValue, MultiValue } from "react-select";
import cpu from "/src/assets/cpu.svg";
import memory from "/src/assets/memory.svg";
import disk from "/src/assets/disk.svg";
import { CreateProjectResponse } from "../shared/types/projectApiResponse";
import useProjectAxios from "../shared/apis/useProjectAxios";
import { RxCross2 } from "react-icons/rx";

// 토스트
import { Toaster, toast } from 'react-hot-toast';

// 모달 루트 설정
Modal.setAppElement("#root");

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
  groupId: number;
  isOpen: boolean;
  onClose: () => void;
}

// // 백엔드(혹은 외부)에서 가져올 데이터 예시 (실제 구현시 삭제바람)
// const languageOptions = [
//   { os_code: "java", os_name: "자바" },
//   { os_code: "python", os_name: "파이썬" },
//   { os_code: "javascript", os_name: "자바스크립트" },
//   { os_code: "csharp", os_name: "C#" },
// ];

// const osOptions = [
//   { os_code: "ubuntu_20_04_lts", os_name: "우분투 20.04 LTS" },
//   { os_code: "ubuntu_18_04_lts", os_name: "우분투 18.04 LTS" },
//   { os_code: "ubuntu_16_04_lts", os_name: "우분투 16.04 LTS" },
// ];

// const performanceOptions = [
//   { code: "micro", cpu_core: 0.5, ram: "1GB", disk: "1GB" },
//   { code: "small", cpu_core: 2, ram: "2GB", disk: "2GB" },
//   { code: "medium", cpu_core: 4, ram: "4GB", disk: "4GB" },
//   { code: "large", cpu_core: 8, ram: "8GB", disk: "8GB" },
// ];

// // 구성원 검색/추가용 데이터
// // api에서는 4개의 정보만 보냄, ProjectListPage에서 멤버 정보와 속성명이나 개수가 차이가 있으니 체크 바람
// interface MemberData {
//   name: string;
//   image: string;
//   email: string;
//   role: string;
// }

// const memberData: MemberData[] = [
//   {
//     name: "강싸피",
//     image: "https://lh3.googleusercontent.com/a/ACg8ocKyyZu4cMoD66g_cvM3uoxDqWQQunckuUMW1-x4zKbF=s96-c",
//     email: "kangssafy@example.com",
//     role: "Member",
//   },
//   {
//     name: "박싸피",
//     image: "https://img.freepik.com/premium-vector/black-silhouette-default-profile-avatar_664995-354.jpg",
//     email: "ssafypark@example.com",
//     role: "Member",
//   },
//   {
//     name: "이싸피",
//     image: "https://secure.gravatar.com/avatar/adb423cb0bee73bb6033eabf7deb7b164b187a53f20a043768a5345de2eaa37a?s=80&d=identicon",
//     email: "leeeeeessafy@example.com",
//     role: "Member",
//   },
//   {
//     name: "신싸피",
//     image: "https://secure.gravatar.com/avatar/1a08e265bcf0ba7e141433e38be1aa16e7bcb4934a8273e49a9d65425332518d?s=80&d=identicon",
//     email: "godssafy@example.com",
//     role: "Member",
//   },
// ];

// react-select 에 사용할 Option 타입
type LanguageOption = {
  value: string; // os_code
  label: string; // os_name
};

type OsOption = {
  value: string; // os_code
  label: string; // os_name
};

type PerformanceOption = {
  value: number; // code
  label: JSX.Element;
};

type MemberOption = {
  value: number; // id
  label: string; // 이름 + (email) 등의 표현
  image: string; // 프로필 사진
};

const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({
  groupId,
  isOpen,
  onClose,
}) => {
  const { getLanguages, getOSList, getPerformanceList, getProjectsMemberList, createProject } = useProjectAxios();

  // 폼 입력값 state
  const [projectName, setProjectName] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption | null>(
    null
  );
  const [selectedOs, setSelectedOs] = useState<OsOption | null>(null);
  const [selectedPerformance, setSelectedPerformance] = useState<PerformanceOption | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<MemberOption[]>([]);

  // 모달 활성화 시, 필요
  const [languageSelectOptions, setLanguageOptions] = useState<LanguageOption[]>([]);
  const [osSelectOptions, setOsOptions] = useState<OsOption[]>([]);
  const [performanceSelectOptions, setPerformanceOptions] = useState<PerformanceOption[]>([]);
  const [memberSelectOptions, setMemberOptions] = useState<MemberOption[]>([]);

  // 로딩상태
  const [isLoading, setIsLoading] = useState(true);

  // 1. api 호출하여 각 options에 담아주기
  useEffect(() => {
    const loadData = async () => {
      // setIsLoading(true);
      // 여기에 api로 데이터 불러오기를 합니다 
      try{
        const memberList = await getProjectsMemberList(groupId);
        const languages = await getLanguages();
        const performanceList = await getPerformanceList();
        // 언어, os, 사양, member 담아주기
        setLanguageOptions(
          languages.map((lang) => ({
            value: lang.language,
            label: lang.language,
        })));
        // react-select에 이미지가 안들어가서 jsx element로 넣었습니다.... 
        setPerformanceOptions(
          performanceList.map((performance) => ({
            value: performance.id,
            label:(
              <>
                  <img src={cpu} alt="CPU" className="inline-block"/> {performance.cpu}{" "}
                  <img src={memory} alt="RAM" className="inline-block"/> {performance.memory}{" "}
                  <img src={disk} alt="Disk" className="inline-block"/> {performance.storage}
              </>
            )
          }))
        );
  
        setMemberOptions(
          memberList.map((member) => ({
            value: member.id,
            label: `${member.name} (${member.email})`,
            image: member.image,
          }))
        );
        console.log(memberList)
      }catch(error){
        console.log("프로젝트 생성 초기값 불러오기 에러");
        console.log(error);
      }

    }

    loadData();
  }, [])


  // 언어 변경 시 OS 목록을 새로 불러오는 함수
  const handleLanguageChange = async (value: SingleValue<LanguageOption>) => {
    setSelectedLanguage(value);

    if (value) {
      try {
        // API 호출하여 해당 언어에 맞는 OS 목록 가져오기
        const osList = await getOSList(value.value); // API 예시 호출
        const newOsOptions = osList.map((os: { os:string }) => ({
          value: os.os,
          label: os.os,
        }));

        setOsOptions(newOsOptions);
      } catch (error) {
        console.error("OS 목록을 불러오는데 실패했습니다.", error);
        toast.error("OS 목록을 가져오는데 실패했습니다.");
      }
    } else {
      setOsOptions([]); // 언어 선택이 해제되면 OS 목록도 초기화
    }
  };


  // 구성원 옵션 변경 처리
  const handleMemberChange = (
    newValue: MultiValue<MemberOption>,
    // actionMeta: ActionMeta<MemberOption>
  ) => {
    setSelectedMembers(newValue as MemberOption[]);
  };

  // 폼 유효성 검사 (간단 예시)
  const validateForm = () => {
    const projectNamePattern = /^[a-z0-9-]+$/; // 소문자, 숫자, '-'만 허용
  
    if (!projectName.trim()) {
      toast.error("프로젝트 이름을 입력하세요.");
      return false;
    }
    if (projectName.length > 20) {
      toast.error("프로젝트 이름은 최대 20글자까지 입력할 수 있습니다.");
      return false;
    }
    if (projectName.startsWith('-')) {
      toast.error("프로젝트 이름은 '-'로 시작할 수 없습니다.");
      return false;
    }
    if (!projectNamePattern.test(projectName)) {
      toast.error("프로젝트 이름은 영어 소문자, 숫자, '-'만 사용할 수 있습니다.");
      return false;
    }
    if (!selectedLanguage) {
      toast.error("언어를 선택하세요.");
      return false;
    }
    if (!selectedOs) {
      toast.error("OS를 선택하세요.");
      return false;
    }
    if (!selectedPerformance) {
      toast.error("성능(사양)을 선택하세요.");
      return false;
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
      name:projectName,
      language: selectedLanguage?.value,
      os: selectedOs?.value,
      performanceId: selectedPerformance?.value,
      userIds: selectedMembers.map((member) => member.value),
    };

    console.log("보낼 폼 데이터:", formData);

    // API 호출 로직 (createProject)
      try{
        const newProject:CreateProjectResponse = await createProject(groupId, formData);
        console.log(newProject);

        // 기존 작성된 폼 초기화
        setProjectName("");
        setSelectedLanguage(null);
        setSelectedOs(null);
        setSelectedPerformance(null);
        setSelectedMembers([]);

        toast.success("프로젝트 생성 완료");
        // 완료 후 모달 닫기
        onClose();
        
      }catch(error){
        console.error(error);
        toast.error("작업 중 오류가 발생했습니다.");
      };

  };


  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Create Project"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      className="bg-white rounded-xl pt-5 pb-4 px-4 shadow-lg relative w-[550px] max-h-[90vh]"
      shouldCloseOnOverlayClick={true}
      shouldReturnFocusAfterClose={false}
    >
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-5">
        <Toaster />
        <h2 className="text-lg font-bold">프로젝트 생성하기</h2>
        <button
          className="flex items-center justify-center rounded-full hover:bg-gray-300 p-1"
          onClick={onClose}
        >
          <RxCross2 className="w-6 h-6"/>
        </button>
      </div>

      {/* 내용 */}
      <div>
        {/* 프로젝트 이름 */}
        <label className="block text-sm font-semibold text-gray-700 mb-2">프로젝트 이름</label>
        <input
          type="text"
          placeholder="프로젝트 이름을 입력하세요"
          className="w-full border border-gray-300 rounded px-2.5 py-2 text-gray-700 text-[12.8px] focus:outline-none focus:ring-2 focus:ring-[#5C8290] mb-4"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />

        {/* 언어 선택 */}
        <label className="block text-sm font-semibold text-gray-700 mb-2">언어 선택</label>
        <Select
          options={languageSelectOptions}
          value={selectedLanguage}
          onChange={handleLanguageChange}
          placeholder="언어를 선택하세요"
          className="mb-4"
          styles={{
            control: (base, state) => ({
              ...base,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: '0.25rem',
              padding: '0.12rem 0.20rem',
              fontSize: '0.8rem',
              color: '#4A5568',
              outline: 'none',
              boxShadow: 'none',
              backgroundColor: '#ffffff', // 기본 배경색
              borderColor: state.isFocused ? '#5C8290' : '#d1d5db',
              borderWidth: '1px',
              '&:focus-within': {
                boxShadow: 'none',
                borderColor: '#5C8290',
                borderWidth: '3px',
                outline: 'none',
              },
              '&:hover': {
                borderColor: '#5C8290',
                boxShadow: 'none',
                borderWidth: '1px',
              },
            }),

            menu: (base) => ({
              ...base,
              backgroundColor: '#ffffff',
              maxHeight: '150px',
              overflowY: 'auto',
            }),

            option: (base, state) => ({
              ...base,
              fontSize: '0.8rem',
              padding: '0.5rem 1rem',
              backgroundColor: state.isSelected
                ? '#5C8290' // 선택된 항목의 배경색 (진한 회색)
                : state.isFocused
                ? '#e0e0e0' // 호버된 항목의 배경색 (연한 회색)
                : '#f7f7f7', // 기본 항목의 배경색 (회색)
              color: state.isSelected
                ? '#ffffff' // 선택된 항목의 텍스트 색상
                : '#4A5568', // 기본 항목의 텍스트 색상
              // 선택된 항목에는 hover 효과 적용 안됨
              '&:hover': {
                backgroundColor: state.isSelected ? '#5C8290' : '#e0e0e0', // 선택된 항목은 호버 효과가 적용되지 않음
                borderColor: 'transparent',
                boxShadow: 'none',
              },
            }),
          }}
        />



        {/* OS 선택 */}
        <label className="block text-sm font-semibold text-gray-700 mb-2">OS</label>
        <Select
          options={osSelectOptions}
          value={selectedOs}
          onChange={(value: SingleValue<OsOption>) => setSelectedOs(value)}
          placeholder="OS를 선택하세요"
          className="mb-4"
          styles={{
            control: (base, state) => ({
              ...base,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: '0.25rem',
              padding: '0.12rem 0.20rem',
              fontSize: '0.8rem',
              color: '#4A5568',
              outline: 'none',
              boxShadow: 'none',
              backgroundColor: '#ffffff', // 기본 배경색
              borderColor: state.isFocused ? '#5C8290' : '#d1d5db',
              borderWidth: '1px',
              '&:focus-within': {
                boxShadow: 'none',
                borderColor: '#5C8290',
                borderWidth: '3px',
                outline: 'none',
              },
              '&:hover': {
                borderColor: '#5C8290',
                boxShadow: 'none',
                borderWidth: '1px',
              },
            }),

            menu: (base) => ({
              ...base,
              backgroundColor: '#ffffff',
              maxHeight: '150px',
              overflowY: 'auto',
            }),

            option: (base, state) => ({
              ...base,
              fontSize: '0.8rem',
              padding: '0.5rem 1rem',
              backgroundColor: state.isSelected
                ? '#5C8290' // 선택된 항목의 배경색 (진한 회색)
                : state.isFocused
                ? '#e0e0e0' // 호버된 항목의 배경색 (연한 회색)
                : '#f7f7f7', // 기본 항목의 배경색 (회색)
              color: state.isSelected
                ? '#ffffff' // 선택된 항목의 텍스트 색상
                : '#4A5568', // 기본 항목의 텍스트 색상
              // 선택된 항목에는 hover 효과 적용 안됨
              '&:hover': {
                backgroundColor: state.isSelected ? '#5C8290' : '#e0e0e0', // 선택된 항목은 호버 효과가 적용되지 않음
                borderColor: 'transparent',
                boxShadow: 'none',
              },
            }),
          }}
        />


        {/* 성능(사양) */}
        <label className="block text-sm font-semibold text-gray-700 mb-2">성능</label>
        <Select
          options={performanceSelectOptions}
          value={selectedPerformance}
          onChange={(value: SingleValue<PerformanceOption>) => setSelectedPerformance(value)}
          placeholder="OS를 선택하세요"
          className="mb-4"
          styles={{
            control: (base, state) => ({
              ...base,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: '0.25rem',
              padding: '0.12rem 0.20rem',
              fontSize: '0.8rem',
              color: '#4A5568',
              outline: 'none',
              boxShadow: 'none',
              backgroundColor: '#ffffff', // 기본 배경색
              borderColor: state.isFocused ? '#5C8290' : '#d1d5db',
              borderWidth: '1px',
              '&:focus-within': {
                boxShadow: 'none',
                borderColor: '#5C8290',
                borderWidth: '3px',
                outline: 'none',
              },
              '&:hover': {
                borderColor: '#5C8290',
                boxShadow: 'none',
                borderWidth: '1px',
              },
            }),

            menu: (base) => ({
              ...base,
              backgroundColor: '#ffffff',
              maxHeight: '150px',
              overflowY: 'auto',
            }),

            option: (base, state) => ({
              ...base,
              fontSize: '0.8rem',
              padding: '0.5rem 1rem',
              backgroundColor: state.isSelected
                ? '#5C8290' // 선택된 항목의 배경색 (진한 회색)
                : state.isFocused
                ? '#e0e0e0' // 호버된 항목의 배경색 (연한 회색)
                : '#f7f7f7', // 기본 항목의 배경색 (회색)
              color: state.isSelected
                ? '#ffffff' // 선택된 항목의 텍스트 색상
                : '#4A5568', // 기본 항목의 텍스트 색상
              // 선택된 항목에는 hover 효과 적용 안됨
              '&:hover': {
                backgroundColor: state.isSelected ? '#5C8290' : '#e0e0e0', // 선택된 항목은 호버 효과가 적용되지 않음
                borderColor: 'transparent',
                boxShadow: 'none',
              },
            }),
          }}
        />

        

        {/* 구성원 추가 */}
        <label className="block text-sm font-semibold text-gray-700 mb-1">구성원 추가</label>
        <Select
          options={memberSelectOptions}
          isMulti
          value={selectedMembers}
          onChange={handleMemberChange}
          placeholder="구성원을 검색하세요"
          className="mb-4"
          styles={{
            control: (base, state) => ({
              ...base,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: '0.25rem',
              padding: '0.12rem 0.20rem',
              fontSize: '0.8rem',
              color: '#4A5568',
              outline: 'none',
              boxShadow: 'none',
              backgroundColor: '#ffffff', // 기본 배경색
              borderColor: state.isFocused ? '#5C8290' : '#d1d5db',
              borderWidth: '1px',
              '&:focus-within': {
                boxShadow: 'none',
                borderColor: '#5C8290',
                borderWidth: '3px',
                outline: 'none',
              },
              '&:hover': {
                borderColor: '#5C8290',
                boxShadow: 'none',
                borderWidth: '1px',
              },
            }),

            menu: (base) => ({
              ...base,
              backgroundColor: '#ffffff',
              maxHeight: '150px',
              overflowY: 'auto',
            }),

            option: (base, state) => ({
              ...base,
              fontSize: '0.8rem',
              padding: '0.5rem 1rem',
              backgroundColor: state.isSelected
                ? '#5C8290' // 선택된 항목의 배경색 (진한 회색)
                : state.isFocused
                ? '#e0e0e0' // 호버된 항목의 배경색 (연한 회색)
                : '#f7f7f7', // 기본 항목의 배경색 (회색)
              color: state.isSelected
                ? '#ffffff' // 선택된 항목의 텍스트 색상
                : '#4A5568', // 기본 항목의 텍스트 색상
              // 선택된 항목에는 hover 효과 적용 안됨
              '&:hover': {
                backgroundColor: state.isSelected ? '#5C8290' : '#e0e0e0', // 선택된 항목은 호버 효과가 적용되지 않음
                borderColor: 'transparent',
                boxShadow: 'none',
              },
            }),
          }}
        />
        
        {/* 추가하기 버튼 */}
        <button
          className="py-3 w-full rounded-xl text-sm text-white font-semibold bg-[#5C8290]"
          onClick={handleSubmit}
        >
          생성하기
        </button>
      </div>
    </Modal>
  );
};

export default ProjectCreateModal;
