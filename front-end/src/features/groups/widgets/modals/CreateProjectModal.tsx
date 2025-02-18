import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import Select, { SingleValue, MultiValue } from "react-select";
import cpu from "/src/assets/cpu.svg";
import memory from "/src/assets/memory.svg";
import disk from "/src/assets/disk.svg";
import { RxCross2 } from "react-icons/rx";

// 토스트
import { Toaster, toast } from "react-hot-toast";

import useProjectAxios from "../../../../shared/apis/useProjectAxios";
import { CreateProjectResponse, ProjectListItem } from "../../../../shared/types/projectApiResponse";

// 로딩 화면
import TranslucentSpinner from "../../../projects/projectpage/widgets/spinners/TranslucentSpinner"

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
  onProjectCreate: (projectItem: ProjectListItem) => void;
}

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
  name: string;  // 이름
  email: string; // 이메일
  image: string; // 프로필 이미지 URL
};

const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({
  groupId,
  isOpen,
  onClose,
  onProjectCreate,
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
  const [isCreating, setIsCreating] = useState(false);

  // 1. api 호출하여 각 options에 담아주기
  useEffect(() => {
    const loadData = async () => {
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
            name: member.name,
            email: member.email,
            image: member.image,
          }))
        );
      }catch(error){
        console.error("project create error", error);
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

    // 만약 이미 제출 중이면 추가 동작하지 않음
    if (isCreating) return;

    // 폼 유효성 실패시 return
    if (!validateForm()) return;

    // 제출 전 로딩로직 시작
    setIsCreating(true);

    // 전송할 데이터(백엔드 API Body 예시)
    const formData = {
      name:projectName,
      language: selectedLanguage?.value,
      os: selectedOs?.value,
      performanceId: selectedPerformance?.value,
      userIds: selectedMembers.map((member) => member.value),
    };

    // API 호출 로직 (createProject)
      try{
        const newProject:CreateProjectResponse = await createProject(groupId, formData);

        // 기존 작성된 폼 초기화
        setProjectName("");
        setSelectedLanguage(null);
        setSelectedOs(null);
        setSelectedPerformance(null);
        setSelectedMembers([]);

        if(newProject){
          toast.success("프로젝트 생성 완료");

          // 선택한 멤버를 변환
          const transformedUsers = selectedMembers.map((member) => ({
            id: member.value,
            name: member.name,
            image: member.image,
            email: member.email,
            status: false,
          }));


          // 상위 컴포넌트에 전달할 최종 객체
          const projectListItem: ProjectListItem = {
            project: newProject,
            users: transformedUsers,
            callStatus: "inactive",
          };

          // 상위 컴포넌트에 새로운 프로젝트 정보를 전달합니다.
          onProjectCreate(projectListItem);

          // 완료 후 모달 닫기
          onClose();
        }
        
      }catch(error){
        console.error(error);
        toast.error("작업 중 오류가 발생했습니다.");
      } finally {
        setIsCreating(false);
      }


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
      {/* 로딩 오버레이 (생성 중일 때) */}
      {isCreating && (
        <TranslucentSpinner />
      )}

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
          className="w-full border border-gray-300 rounded px-2.5 py-2 text-gray-700 text-[12.8px] focus:outline-none focus:ring-2 focus:ring-[#5C8290] mb-1"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <label className="block text-xs font-light text-gray-400 mb-4">
        영어 소문자, 숫자, 특수문자 `-`만 사용 가능 (20자 이내)</label>

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
